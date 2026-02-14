import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from "http";
import { seedAdminUser } from "./seed-admin";

// ============================================
// Environment Variable Validation
// ============================================
const isProduction = process.env.NODE_ENV === "production";

function validateEnv(): void {
  const required: string[] = ["DATABASE_URL", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  // Warn about production-critical vars
  if (isProduction) {
    const productionRequired = [
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "FRONTEND_URL",
    ];
    const productionMissing = productionRequired.filter(
      (key) => !process.env[key]
    );
    if (productionMissing.length > 0) {
      console.warn(
        `[WARNING] Missing production environment variables: ${productionMissing.join(", ")}. Some features may not work correctly.`
      );
    }
  }
}

validateEnv();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ============================================
// CORS Configuration
// ============================================
app.use(
  cors({
    origin: isProduction
      ? process.env.FRONTEND_URL
      : ["http://localhost:5000", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ============================================
// Rate Limiting
// ============================================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 attempts per window
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many payment requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: { error: "Rate limit exceeded, please slow down" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limits
app.use("/api/auth/", authLimiter);
app.use("/api/payments/", paymentLimiter);
app.use("/api/", apiLimiter);

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
  await seedAdminUser();
  await registerRoutes(app);

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const status = (err as { status?: number }).status || (err as { statusCode?: number }).statusCode || 500;
    const message = (err as { message?: string }).message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  const server = createServer(app);

  const isDev = app.get("env") === "development" && process.env.NODE_ENV !== "production";
  const forceVite = process.env.FORCE_VITE === "true";

  if (forceVite) {
    await setupVite(app, server);
  } else {
    try {
      serveStatic(app);
      log("Serving static build assets");
    } catch (error) {
      if (isDev) {
        log(`Static build not found, falling back to Vite: ${(error as Error).message}`);
        await setupVite(app, server);
      } else {
        throw error;
      }
    }
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
