import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

export function getBillingDbPath(): string {
  const configured = process.env.BILLING_DB_PATH || path.join("data", "billing.db");
  return path.resolve(process.cwd(), configured);
}

export function openBillingDb(): Database.Database {
  const dbPath = getBillingDbPath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });

  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  db.pragma("journal_mode = WAL");
  db.pragma("busy_timeout = 5000");
  return db;
}
