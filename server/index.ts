import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import { seedAdminUser } from "./seed-admin";
import { runMigrations } from 'stripe-replit-sync';
import { getStripeSync } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";

const isProduction = process.env.NODE_ENV === "production";

if (process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE) {
  const port = process.env.PGPORT || '5432';
  process.env.DATABASE_URL = `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${port}/${process.env.PGDATABASE}`;
}

function validateEnv() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required but not set");
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required but not set");
  }
  if (isProduction) {
    if (!process.env.STRIPE_SECRET_KEY) {
      log("WARNING: STRIPE_SECRET_KEY not set in production");
    }
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      log("WARNING: STRIPE_WEBHOOK_SECRET not set in production");
    }
    if (!process.env.FRONTEND_URL) {
      log("WARNING: FRONTEND_URL not set in production - Stripe redirects may fail");
    }
  }
}

validateEnv();

const app = express();
app.set('trust proxy', 1);

app.use(cors({
  origin: isProduction
    ? process.env.FRONTEND_URL || `https://${process.env.REPLIT_DOMAINS?.split(',')[0]}`
    : true,
  credentials: true,
}));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later" },
});

app.use("/api/auth/", authLimiter);
app.use("/api/payments/", paymentLimiter);
app.use("/api/", apiLimiter);

function getDbUrl(): string | undefined {
  if (process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE) {
    const port = process.env.PGPORT || '5432';
    return `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${process.env.PGHOST}:${port}/${process.env.PGDATABASE}`;
  }
  return process.env.DATABASE_URL;
}

async function initStripe() {
  const databaseUrl = getDbUrl();
  if (!databaseUrl) {
    log('DATABASE_URL not set, skipping Stripe init');
    return;
  }

  try {
    log('Initializing Stripe schema...');
    await runMigrations({ databaseUrl });
    log('Stripe schema ready');

    const stripeSync = await getStripeSync();

    const firstDomain = process.env.REPLIT_DOMAINS?.split(',')[0];
    if (firstDomain) {
      log('Setting up managed webhook...');
      const webhookBaseUrl = `https://${firstDomain}`;
      const webhook = await stripeSync.findOrCreateManagedWebhook(
        `${webhookBaseUrl}/api/stripe/webhook`
      );
      log(`Webhook configured: ${webhook.url}`);
    }

    stripeSync.syncBackfill()
      .then(() => log('Stripe data synced'))
      .catch((err: any) => console.error('Error syncing Stripe data:', err));
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
  }
}

app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }

    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;

      if (!Buffer.isBuffer(req.body)) {
        console.error('STRIPE WEBHOOK ERROR: req.body is not a Buffer');
        return res.status(500).json({ error: 'Webhook processing error' });
      }

      await WebhookHandlers.processWebhook(req.body as Buffer, sig);
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('Webhook error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await initStripe();
  await seedAdminUser();
  await registerRoutes(app);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status = (err as { status?: number }).status || (err as { statusCode?: number }).statusCode || 500;
    const message = (err as { message?: string }).message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  const server = createServer(app);

  const isDev = app.get("env") === "development" && !isProduction;
  const forceVite = process.env.FORCE_VITE === "true";

  if (isDev || forceVite) {
    await setupVite(app, server);
  } else {
    try {
      serveStatic(app);
      log("Serving static build assets");
    } catch (error) {
      log(`Static build not found, falling back to Vite: ${(error as Error).message}`);
      await setupVite(app, server);
    }
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
