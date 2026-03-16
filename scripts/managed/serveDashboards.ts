import fs from "fs";
import path from "path";
import { timingSafeEqual } from "crypto";

import express, { type Request, type Response, type NextFunction } from "express";

import { getClientConfig, listClientConfigs } from "../../config/clients";

const app = express();
const PORT = Number(process.env.MANAGED_PORT || 8787);

function getToken(req: Request): string | undefined {
  const auth = req.header("authorization") || "";
  if (!auth.toLowerCase().startsWith("bearer ")) return undefined;
  return auth.slice("Bearer ".length).trim();
}

function latestRunDir(clientId: string): string | undefined {
  const base = path.join(process.cwd(), "outputs", "managed", clientId);
  if (!fs.existsSync(base)) return undefined;

  const days = fs
    .readdirSync(base)
    .map((name) => path.join(base, name))
    .filter((p) => fs.statSync(p).isDirectory())
    .sort()
    .reverse();

  for (const dayDir of days) {
    const runs = fs
      .readdirSync(dayDir)
      .map((name) => path.join(dayDir, name))
      .filter((p) => fs.statSync(p).isDirectory())
      .sort()
      .reverse();

    if (runs.length > 0) return runs[0];
  }

  return undefined;
}

function safeTokenCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

function requireTokenForClient(clientId: string, token: string | undefined): boolean {
  const cfg = getClientConfig(clientId);
  const envName = cfg.auth.dashboardTokenEnv;
  if (!envName) return false;
  const expected = process.env[envName];
  if (!expected || !token) return false;
  return safeTokenCompare(token, expected);
}

function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = getToken(req);
  const match = req.path.match(/^\/client\/([^/]+)/);

  if (match) {
    const clientId = match[1];
    if (!requireTokenForClient(clientId, token)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    next();
    return;
  }

  if (req.path === "/clients") {
    const ok = token !== undefined && listClientConfigs().some((cfg) => {
      const envName = cfg.auth.dashboardTokenEnv;
      const expected = envName ? process.env[envName] : undefined;
      return Boolean(expected && safeTokenCompare(token, expected));
    });

    if (!ok) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
  }

  next();
}

app.use(authMiddleware);

app.get("/clients", (_req, res) => {
  const clients = listClientConfigs().map((cfg) => ({
    id: cfg.id,
    displayName: cfg.displayName,
    protocol: cfg.protocol,
    tier: cfg.tiers,
    latestRun: latestRunDir(cfg.id)
  }));
  res.json(clients);
});

app.get("/client/:id/runs", (req, res) => {
  const clientId = req.params.id;
  const base = path.join(process.cwd(), "outputs", "managed", clientId);
  if (!fs.existsSync(base)) {
    res.json([]);
    return;
  }

  const runs: string[] = [];
  for (const day of fs.readdirSync(base).sort().reverse()) {
    const dayDir = path.join(base, day);
    if (!fs.statSync(dayDir).isDirectory()) continue;
    for (const runId of fs.readdirSync(dayDir).sort().reverse()) {
      const runDir = path.join(dayDir, runId);
      if (fs.statSync(runDir).isDirectory()) {
        runs.push(path.relative(process.cwd(), runDir));
      }
    }
  }

  res.json(runs);
});

app.get("/client/:id/latest", (req, res) => {
  const clientId = req.params.id;
  const runDir = latestRunDir(clientId);
  if (!runDir) {
    res.status(404).json({ error: "No runs found" });
    return;
  }

  const dashboardPath = path.join(runDir, "dashboard.html");
  if (!fs.existsSync(dashboardPath)) {
    res.status(404).json({ error: "Dashboard not found" });
    return;
  }

  res.sendFile(dashboardPath);
});

app.get("/client/:id/latest/summary", (req, res) => {
  const clientId = req.params.id;
  const runDir = latestRunDir(clientId);
  if (!runDir) {
    res.status(404).json({ error: "No runs found" });
    return;
  }

  const summaryPath = path.join(runDir, "run-summary.json");
  if (!fs.existsSync(summaryPath)) {
    res.status(404).json({ error: "Summary not found" });
    return;
  }

  res.sendFile(summaryPath);
});

app.listen(PORT, () => {
  console.log(`[managed:serve] listening on :${PORT}`);
});
