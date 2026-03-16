import { ClientConfig } from "./types";

const exampleClientConfig: ClientConfig = {
  id: "example",
  displayName: "Example Client",
  protocol: "GMX",
  chains: ["arbitrum", "avalanche"],
  scheduleCron: "0 2 * * *",
  env: {
    ARBITRUM_RPC_URL: "ARBITRUM_RPC_URL",
    AVALANCHE_RPC_URL: "AVALANCHE_RPC_URL"
  },
  alerts: {
    slackWebhookEnv: "EXAMPLE_SLACK_WEBHOOK_URL",
    emailTo: ["security@example.com"]
  },
  auth: {
    dashboardTokenEnv: "EXAMPLE_DASHBOARD_TOKEN"
  },
  tiers: "ci"
};

export default exampleClientConfig;
