import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

function getDatabaseUrl(): string {
  if (process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE) {
    const port = process.env.PGPORT || '5432';
    const host = process.env.PGHOST;
    const sslParam = (host !== 'localhost' && host !== '127.0.0.1' && host !== 'helium') ? '?sslmode=require' : '';
    return `postgresql://${process.env.PGUSER}:${process.env.PGPASSWORD}@${host}:${port}/${process.env.PGDATABASE}${sslParam}`;
  }
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const connectionString = getDatabaseUrl();
const isExternalHost = !connectionString.includes('@localhost') && !connectionString.includes('@127.0.0.1') && !connectionString.includes('@helium');

export const pool = new Pool({
  connectionString,
  ssl: isExternalHost ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(pool, { schema });
