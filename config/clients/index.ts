// ⚠️  Real client configs (non-example) must NOT be committed.
// .gitignore enforces: config/clients/*.config.ts  !config/clients/example.config.ts

import fs from "fs";
import path from "path";

import { ClientConfig } from "./types";

const CONFIG_DIR = __dirname;

function loadConfig(configPath: string): ClientConfig {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const loaded = require(configPath) as { default?: ClientConfig } | ClientConfig;
  const config = (loaded as { default?: ClientConfig }).default ?? (loaded as ClientConfig);

  if (!config || typeof config !== "object" || !config.id) {
    throw new Error(`Invalid client config at ${configPath}`);
  }

  return config;
}

export function getClientConfig(clientId: string): ClientConfig {
  const configPath = path.join(CONFIG_DIR, `${clientId}.config.ts`);
  if (!fs.existsSync(configPath)) {
    throw new Error(`Client config not found: ${clientId}`);
  }
  return loadConfig(configPath);
}

export function listClientConfigs(): ClientConfig[] {
  return fs
    .readdirSync(CONFIG_DIR)
    .filter((name) => name.endsWith(".config.ts"))
    .map((name) => loadConfig(path.join(CONFIG_DIR, name)));
}
