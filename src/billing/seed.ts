import { openBillingDb } from "./db";
import { runBillingMigrations } from "./migrate";

function nowIso(): string {
  return new Date().toISOString();
}

export function seedBillingData(): void {
  runBillingMigrations();

  const db = openBillingDb();
  try {
    const ts = nowIso();

    db.prepare(
      `INSERT OR IGNORE INTO billing_accounts (
        client_id, org_name, email, stripe_customer_id, stripe_subscription_id, stripe_price_id,
        plan, billing_status, current_period_start, current_period_end, cancel_at_period_end,
        last_invoice_id, last_payment_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      "example",
      "Example Protocol",
      "security@example.com",
      "cus_example_123",
      "sub_example_123",
      process.env.STRIPE_GROWTH_PRICE_ID || "price_growth_example",
      "growth",
      "active",
      ts,
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      0,
      "in_example_123",
      ts,
      ts,
      ts
    );

    db.prepare(
      `INSERT OR IGNORE INTO stripe_events (stripe_event_id, event_type, billing_account_id, payload_summary, processed_at)
       VALUES (?, ?, (SELECT id FROM billing_accounts WHERE client_id = ?), ?, ?)`
    ).run("evt_seed_001", "invoice.paid", "example", JSON.stringify({ seeded: true }), ts);

    console.log("[billing:seed] seeded billing data");
  } finally {
    db.close();
  }
}

if (require.main === module) {
  seedBillingData();
}
