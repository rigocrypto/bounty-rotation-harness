export type BillingPlan = "growth" | "regression_pro" | "enterprise" | "custom";

export type BillingStatus =
  | "lead"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "suspended"
  | "incomplete";

export type BillingAccount = {
  id: number;
  clientId: string;
  orgName?: string;
  email?: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  plan: BillingPlan;
  billingStatus: BillingStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  lastInvoiceId?: string;
  lastPaymentAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type BillingAccessDecision = {
  allowed: boolean;
  readOnly: boolean;
  reason: string;
  status?: BillingStatus;
};

export type Entitlements = {
  maxClients: number;
  scanFrequency: "nightly" | "twice_daily" | "custom";
  retentionDays: number;
  dashboardAccess: boolean;
  alertsEnabled: boolean;
  weeklyDigest: boolean;
  customInvariants: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
};
export type BillingPlan = "growth" | "regression_pro" | "enterprise" | "custom";

export type BillingStatus =
  | "lead"
  | "trialing"
  | "active"
  | "past_due"
  | "canceled"
  | "suspended"
  | "incomplete";

export type BillingAccount = {
  id: number;
  clientId: string;
  orgName?: string;
  email?: string;
  stripeCustomerId: string;
  stripeSubscriptionId?: string;
  stripePriceId?: string;
  plan: BillingPlan;
  billingStatus: BillingStatus;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
  lastInvoiceId?: string;
  lastPaymentAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProvisioningAction = "enabled" | "disabled" | "plan_changed" | "manual_override";

export type Entitlements = {
  maxClients: number;
  scanFrequency: "nightly" | "twice_daily" | "custom";
  retentionDays: number;
  dashboardAccess: boolean;
  alertsEnabled: boolean;
  weeklyDigest: boolean;
  customInvariants: boolean;
  prioritySupport: boolean;
  whiteLabel: boolean;
};

export type BillingAccessDecision = {
  allowed: boolean;
  mode: "active" | "read_only" | "blocked";
  reason: string;
};
