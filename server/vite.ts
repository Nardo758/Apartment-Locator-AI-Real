import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer, createLogger } from "vite";

const getServerDir = (): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.url) {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch {}
  return process.cwd();
};

const __dirname = getServerDir();

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: any) {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
      },
    },
  });

  app.use(vite.middlewares);
  app.use("/{*path}", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = resolveIndexHtmlPath();

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = await vite.transformIndexHtml(url, template);

      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

const DIST_DIRS = ["dist/public", "dist/client", "dist"];

function buildRootCandidates(): string[] {
  const roots = [
    process.cwd(),
    __dirname,
    path.dirname(process.argv[1] || ""),
  ].filter(Boolean);

  const candidates = new Set<string>();
  roots.forEach((root) => {
    for (let depth = 0; depth <= 2; depth += 1) {
      const base = path.resolve(root, ...Array(depth).fill(".."));
      candidates.add(base);
    }
  });

  return Array.from(candidates);
}

function resolveIndexHtmlPath() {
  const roots = buildRootCandidates();
  const candidates = roots.map((root) => path.resolve(root, "index.html"));

  const existing = candidates.find((candidate) => fs.existsSync(candidate));
  if (!existing) {
    const searched = candidates.join(", ");
    throw new Error(`Could not find index.html. Looked in: ${searched}`);
  }

  return existing;
}

function resolveDistPath() {
  const roots = buildRootCandidates();
  const candidates = roots.flatMap((root) =>
    DIST_DIRS.map((dir) => path.resolve(root, dir)),
  );
  const uniqueCandidates = Array.from(new Set(candidates));

  const existing = uniqueCandidates.find((candidate) =>
    fs.existsSync(path.resolve(candidate, "index.html")),
  );
  if (!existing) {
    const searched = uniqueCandidates.join(", ");
    throw new Error(
      `Could not find the build directory. Looked in: ${searched}`,
    );
  }

  return existing;
}

export function serveStatic(app: Express) {
  const distPath = resolveDistPath();

  app.use(express.static(distPath));

  app.use("/{*path}", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
