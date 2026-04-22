import Stripe from "stripe";

import { openBillingDb } from "./db";
import { BillingAccount, BillingAccessDecision, BillingPlan, BillingStatus, Entitlements } from "./types";

type BillingRow = {
  id: number;
  client_id: string;
  org_name: string | null;
  email: string | null;
  stripe_customer_id: string;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  plan: BillingPlan;
  billing_status: BillingStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: number;
  last_invoice_id: string | null;
  last_payment_at: string | null;
  created_at: string;
  updated_at: string;
};

function mapRow(row: BillingRow | undefined): BillingAccount | null {
  if (!row) return null;
  return {
    id: row.id,
    clientId: row.client_id,
    orgName: row.org_name || undefined,
    email: row.email || undefined,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id || undefined,
    stripePriceId: row.stripe_price_id || undefined,
    plan: row.plan,
    billingStatus: row.billing_status,
    currentPeriodStart: row.current_period_start || undefined,
    currentPeriodEnd: row.current_period_end || undefined,
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    lastInvoiceId: row.last_invoice_id || undefined,
    lastPaymentAt: row.last_payment_at || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function getBillingAccount(clientId: string): BillingAccount | null {
  const db = openBillingDb();
  try {
    const row = db.prepare("SELECT * FROM billing_accounts WHERE client_id = ?").get(clientId) as BillingRow | undefined;
    return mapRow(row);
  } finally {
    db.close();
  }
}

export function getBillingAccountByStripeCustomer(stripeCustomerId: string): BillingAccount | null {
  const db = openBillingDb();
  try {
    const row = db
      .prepare("SELECT * FROM billing_accounts WHERE stripe_customer_id = ?")
      .get(stripeCustomerId) as BillingRow | undefined;
    return mapRow(row);
  } finally {
    db.close();
  }
}

export function isManagedAccessAllowed(clientId: string): boolean {
  return getManagedAccessDecision(clientId).allowed;
}

export function getManagedAccessDecision(clientId: string): BillingAccessDecision {
  const account = getBillingAccount(clientId);
  if (!account) {
    return {
      allowed: false,
      readOnly: false,
      reason: "missing_billing_account"
    };
  }

  if (account.billingStatus === "trialing" || account.billingStatus === "active") {
    return {
      allowed: true,
      readOnly: false,
      reason: "active_subscription",
      status: account.billingStatus
    };
  }

  if (account.billingStatus === "canceled" && isWithinReadOnlyWindow(account, 30)) {
    return {
      allowed: false,
      readOnly: true,
      reason: "canceled_read_only_grace",
      status: account.billingStatus
    };
  }

  if (account.billingStatus === "past_due") {
    return {
      allowed: false,
      readOnly: false,
      reason: "past_due",
      status: account.billingStatus
    };
  }

  return {
    allowed: false,
    readOnly: false,
    reason: account.billingStatus,
    status: account.billingStatus
  };
}

export function isWithinReadOnlyWindow(account: BillingAccount, graceDays: number): boolean {
  const periodEnd = account.currentPeriodEnd ? Date.parse(account.currentPeriodEnd) : NaN;
  if (!Number.isFinite(periodEnd)) return false;
  const graceMs = graceDays * 24 * 60 * 60 * 1000;
  return Date.now() <= periodEnd + graceMs;
}

export function getEntitlements(clientId: string): Entitlements {
  const account = getBillingAccount(clientId);
  if (!account) {
    return {
      maxClients: 0,
      scanFrequency: "nightly",
      retentionDays: 0,
      dashboardAccess: false,
      alertsEnabled: false,
      weeklyDigest: false,
      customInvariants: false,
      prioritySupport: false,
      whiteLabel: false
    };
  }

  const baseByPlan: Record<BillingPlan, Entitlements> = {
    growth: {
      maxClients: 1,
      scanFrequency: "nightly",
      retentionDays: 30,
      dashboardAccess: true,
      alertsEnabled: true,
      weeklyDigest: false,
      customInvariants: false,
      prioritySupport: false,
      whiteLabel: false
    },
    regression_pro: {
      maxClients: 3,
      scanFrequency: "twice_daily",
      retentionDays: 90,
      dashboardAccess: true,
      alertsEnabled: true,
      weeklyDigest: true,
      customInvariants: false,
      prioritySupport: false,
      whiteLabel: false
    },
    enterprise: {
      maxClients: 999,
      scanFrequency: "custom",
      retentionDays: 365,
      dashboardAccess: true,
      alertsEnabled: true,
      weeklyDigest: true,
      customInvariants: true,
      prioritySupport: true,
      whiteLabel: true
    },
    custom: {
      maxClients: 999,
      scanFrequency: "custom",
      retentionDays: 365,
      dashboardAccess: true,
      alertsEnabled: true,
      weeklyDigest: true,
      customInvariants: true,
      prioritySupport: true,
      whiteLabel: true
    }
  };

  const base = baseByPlan[account.plan];
  const decision = getManagedAccessDecision(clientId);

  if (!decision.allowed && !decision.readOnly) {
    return {
      ...base,
      dashboardAccess: false,
      alertsEnabled: false
    };
  }

  if (decision.readOnly) {
    return {
      ...base,
      dashboardAccess: true,
      alertsEnabled: false
    };
  }

  return base;
}

function mapStripeStatus(status: Stripe.Subscription.Status): BillingStatus {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "unpaid":
      return "suspended";
    case "canceled":
      return "canceled";
    case "incomplete":
      return "incomplete";
    case "incomplete_expired":
      return "incomplete";
    case "paused":
      return "suspended";
    default:
      return "incomplete";
  }
}

function inferPlanFromPriceId(priceId?: string | null): BillingPlan {
  if (!priceId) return "custom";
  if (priceId === process.env.STRIPE_GROWTH_PRICE_ID) return "growth";
  if (priceId === process.env.STRIPE_REGRESSION_PRO_PRICE_ID) return "regression_pro";
  if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) return "enterprise";
  return "custom";
}

export async function syncFromStripe(stripeCustomerId: string): Promise<void> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    throw new Error("Missing STRIPE_SECRET_KEY for syncFromStripe");
  }

  const stripe = new Stripe(secret);

  const subscriptions = await stripe.subscriptions.list({
    customer: stripeCustomerId,
    limit: 1,
    status: "all"
  });

  const current = subscriptions.data[0];
  if (!current) return;

  const firstItem = current.items.data[0];
  const priceId = firstItem?.price?.id || null;
  const periodStart = firstItem?.current_period_start
    ? new Date(firstItem.current_period_start * 1000).toISOString()
    : null;
  const periodEnd = firstItem?.current_period_end
    ? new Date(firstItem.current_period_end * 1000).toISOString()
    : null;
  const db = openBillingDb();
  try {
    const now = new Date().toISOString();
    db.prepare(
      `UPDATE billing_accounts
       SET stripe_subscription_id = ?,
           stripe_price_id = ?,
           plan = ?,
           billing_status = ?,
           current_period_start = ?,
           current_period_end = ?,
           cancel_at_period_end = ?,
           updated_at = ?
       WHERE stripe_customer_id = ?`
    ).run(
      current.id,
      priceId,
      inferPlanFromPriceId(priceId),
      mapStripeStatus(current.status),
      periodStart,
      periodEnd,
      current.cancel_at_period_end ? 1 : 0,
      now,
      stripeCustomerId
    );
  } finally {
    db.close();
  }
}
