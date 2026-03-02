import { pool } from "./db";
import { log } from "./vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runAppMigrations(): Promise<void> {
  try {
    log("Running application migrations...");

    const migrationsDir = path.join(__dirname, "migrations");

    if (!fs.existsSync(migrationsDir)) {
      log("No migrations directory found, skipping");
      return;
    }

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
      try {
        await pool.query(sql);
        log(`Migration applied: ${file}`);
      } catch (err: any) {
        // IF NOT EXISTS clauses prevent duplicate errors; log and continue
        if (err.code === "42701") {
          log(`Migration skipped (already applied): ${file}`);
        } else {
          console.error(`Migration failed: ${file}`, err.message);
        }
      }
    }

    log("Migrations complete");
  } catch (err) {
    console.error("Migration runner error:", err);
  }
}
