export type ClientTier = "ci" | "regression" | "bounty_pro";

export type ClientConfig = {
  id: string;
  displayName: string;
  protocol: string;
  chains: string[];
  scheduleCron: string;
  env: Record<string, string>;
  alerts: {
    slackWebhookEnv?: string;
    emailTo?: string[];
  };
  auth: {
    dashboardTokenEnv?: string;
  };
  tiers: ClientTier;
};
