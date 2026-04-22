import fs from "fs";
import path from "path";

import { openBillingDb } from "./db";

function loadSchema(): string {
  const schemaPath = path.resolve(process.cwd(), "schemas", "billing.schema.sql");
  return fs.readFileSync(schemaPath, "utf8");
}

export function runBillingMigrations(): void {
  const db = openBillingDb();
  try {
    const schema = loadSchema();
    db.exec(schema);
    console.log("[billing:migrate] migration complete");
  } finally {
    db.close();
  }
}

if (require.main === module) {
  runBillingMigrations();
}
