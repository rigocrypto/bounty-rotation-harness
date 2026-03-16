import cron from "node-cron";

import { getClientConfig, listClientConfigs } from "../../config/clients";
import { executeClientRun } from "./runClient";

type SchedulerArgs = {
  clientSelector: string;
  priceUsd?: string;
};

function parseArgs(argv: string[]): SchedulerArgs {
  const get = (flag: string): string | undefined => {
    const idx = argv.indexOf(flag);
    return idx !== -1 ? argv[idx + 1] : undefined;
  };

  return {
    clientSelector: get("--client") || "all",
    priceUsd: get("--price")
  };
}

const runningClients = new Set<string>();

async function scheduleClient(clientId: string, priceUsd?: string): Promise<void> {
  const config = getClientConfig(clientId);
  if (!cron.validate(config.scheduleCron)) {
    throw new Error(`Invalid cron expression for ${clientId}: ${config.scheduleCron}`);
  }

  cron.schedule(config.scheduleCron, async () => {
    if (runningClients.has(clientId)) {
      console.warn(`[managed:scheduler] Skipping ${clientId} — previous run still active`);
      return;
    }
    runningClients.add(clientId);
    try {
      await executeClientRun({
        clientId,
        once: true,
        priceUsd,
        packageLimit: 5
      });
      console.log(`[managed:scheduler] completed run for ${clientId}`);
    } catch (error) {
      console.error(`[managed:scheduler] failed run for ${clientId}: ${(error as Error).message}`);
    } finally {
      runningClients.delete(clientId);
    }
  });

  console.log(`[managed:scheduler] scheduled ${clientId} with cron "${config.scheduleCron}"`);
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2));
  const targets =
    args.clientSelector === "all"
      ? listClientConfigs().map((cfg) => cfg.id)
      : [args.clientSelector];

  for (const clientId of targets) {
    await scheduleClient(clientId, args.priceUsd);
  }

  console.log("[managed:scheduler] waiting for scheduled runs...");
}

main().catch((error) => {
  console.error((error as Error).message);
  process.exit(1);
});
