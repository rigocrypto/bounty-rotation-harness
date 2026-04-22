/**
 * Seed a deterministic sample SQLite DB for the dashboard:sample command.
 * Produces a self-contained DB with representative run history.
 * Idempotent: safe to re-run, always produces the same output.
 *
 * Usage: node scripts/seedSampleDb.mjs [outPath]
 * Default outPath: examples/sample-data/sample-results.db
 */
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const outPath = process.argv[2] || "examples/sample-data/sample-results.db";
fs.mkdirSync(path.dirname(outPath), { recursive: true });

// Remove existing file for idempotency
if (fs.existsSync(outPath)) fs.unlinkSync(outPath);

const db = new Database(outPath);

db.exec(`
  CREATE TABLE runs (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp           REAL    NOT NULL,
    chain               TEXT    NOT NULL,
    block               INTEGER NOT NULL,
    passing             INTEGER NOT NULL DEFAULT 0,
    pending             INTEGER NOT NULL DEFAULT 0,
    failing             INTEGER NOT NULL DEFAULT 0,
    proof_count         INTEGER NOT NULL DEFAULT 0,
    duration_ms         INTEGER NOT NULL DEFAULT 0,
    unexplained_pending INTEGER NOT NULL DEFAULT 0,
    security_score      INTEGER NOT NULL DEFAULT 100,
    log_path            TEXT,
    notes               TEXT,
    run_uid             TEXT
  )
`);

// Deterministic fixed seed data — 54 rows representing ~6 weeks of daily runs
// Scores trend from 100 → 95 → 80 → 55 as findings accumulate
const insert = db.prepare(`
  INSERT INTO runs
    (timestamp, chain, block, passing, pending, failing, proof_count, duration_ms, unexplained_pending, security_score, log_path, notes, run_uid)
  VALUES
    (@timestamp, @chain, @block, @passing, @pending, @failing, @proof_count, @duration_ms, @unexplained_pending, @security_score, @log_path, @notes, @run_uid)
`);

// Base time: 2025-01-01 00:00:00 UTC (fixed, deterministic)
const BASE_MS = 1735689600000;
const DAY_MS  = 86400000;

// The dashboard chart shows the most-recent 30 runs (runs.slice(0,30) on DESC query).
// Score variety is therefore placed in the LAST 30 rows (days 24-53).
const SEED_RUNS = [
  // Days 0–23 – early history, all green (score 100); appear in DB but NOT in chart window
  { day:  0, passing: 42, pending: 0, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day:  1, passing: 42, pending: 0, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day:  2, passing: 42, pending: 0, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day:  3, passing: 42, pending: 0, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day:  4, passing: 41, pending: 1, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day:  5, passing: 41, pending: 1, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day:  6, passing: 41, pending: 1, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day:  7, passing: 41, pending: 1, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day:  8, passing: 40, pending: 2, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day:  9, passing: 40, pending: 2, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day: 10, passing: 40, pending: 2, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day: 11, passing: 40, pending: 2, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day: 12, passing: 39, pending: 3, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day: 13, passing: 39, pending: 3, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day: 14, passing: 39, pending: 3, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day: 15, passing: 39, pending: 3, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day: 16, passing: 38, pending: 4, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day: 17, passing: 38, pending: 4, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day: 18, passing: 38, pending: 4, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day: 19, passing: 38, pending: 4, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day: 20, passing: 37, pending: 5, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day: 21, passing: 37, pending: 5, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day: 22, passing: 37, pending: 5, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day: 23, passing: 37, pending: 5, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  // Days 24–30 – score 100 → 95 (first finding surfaces); these ARE in chart window
  { day: 24, passing: 37, pending: 5, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day: 25, passing: 37, pending: 5, failing: 0, proof_count: 0, unexplained_pending: 0, security_score: 100 },
  { day: 26, passing: 36, pending: 5, failing: 1, proof_count: 0, unexplained_pending: 1, security_score: 95  },
  { day: 27, passing: 36, pending: 5, failing: 1, proof_count: 0, unexplained_pending: 1, security_score: 95  },
  { day: 28, passing: 36, pending: 5, failing: 1, proof_count: 0, unexplained_pending: 1, security_score: 95  },
  { day: 29, passing: 35, pending: 5, failing: 1, proof_count: 0, unexplained_pending: 1, security_score: 95  },
  { day: 30, passing: 35, pending: 5, failing: 1, proof_count: 0, unexplained_pending: 1, security_score: 95  },
  // Days 31–37 – score drops to 80 (second finding + first proof)
  { day: 31, passing: 34, pending: 5, failing: 2, proof_count: 1, unexplained_pending: 2, security_score: 80  },
  { day: 32, passing: 34, pending: 5, failing: 2, proof_count: 1, unexplained_pending: 2, security_score: 80  },
  { day: 33, passing: 34, pending: 5, failing: 2, proof_count: 1, unexplained_pending: 2, security_score: 80  },
  { day: 34, passing: 33, pending: 5, failing: 2, proof_count: 1, unexplained_pending: 2, security_score: 80  },
  { day: 35, passing: 33, pending: 5, failing: 2, proof_count: 1, unexplained_pending: 2, security_score: 80  },
  { day: 36, passing: 33, pending: 5, failing: 2, proof_count: 1, unexplained_pending: 2, security_score: 80  },
  { day: 37, passing: 33, pending: 5, failing: 2, proof_count: 1, unexplained_pending: 2, security_score: 80  },
  // Days 38–53 – score 55 (third finding confirmed, stable)
  { day: 38, passing: 33, pending: 5, failing: 3, proof_count: 1, unexplained_pending: 3, security_score: 55  },
  { day: 39, passing: 33, pending: 5, failing: 3, proof_count: 1, unexplained_pending: 3, security_score: 55  },
  { day: 40, passing: 33, pending: 5, failing: 3, proof_count: 1, unexplained_pending: 3, security_score: 55  },
  { day: 41, passing: 33, pending: 5, failing: 3, proof_count: 1, unexplained_pending: 3, security_score: 55  },
  { day: 42, passing: 33, pending: 5, failing: 3, proof_count: 1, unexplained_pending: 3, security_score: 55  },
  { day: 43, passing: 33, pending: 5, failing: 3, proof_count: 1, unexplained_pending: 3, security_score: 55  },
  { day: 44, passing: 33, pending: 5, failing: 3, proof_count: 1, unexplained_pending: 3, security_score: 55  },
  { day: 45, passing: 33, pending: 5, failing: 3, proof_count: 1, unexplained_pending: 3, security_score: 55  },
  { day: 46, passing: 33, pending: 5, failing: 3, proof_count: 1, unexplained_pending: 3, security_score: 55  },
  { day: 47, passing: 33, pending: 5, failing: 3, proof_count: 1, unexplained_pending: 3, security_score: 55  },
  { day: 48, passing: 33, pending: 5, failing: 3, proof_count: 1, unexplained_pending: 3, security_score: 55  },
  { day: 49, passing: 33, pending: 5, failing: 3, proof_count: 1, unexplained_pending: 3, security_score: 55  },
  { day: 50, passing: 33, pending: 5, failing: 3, proof_count: 1, unexplained_pending: 3, security_score: 55  },
  { day: 51, passing: 33, pending: 5, failing: 3, proof_count: 1, unexplained_pending: 3, security_score: 55  },
  { day: 52, passing: 33, pending: 5, failing: 3, proof_count: 1, unexplained_pending: 3, security_score: 55  },
  { day: 53, passing: 33, pending: 5, failing: 3, proof_count: 1, unexplained_pending: 3, security_score: 55  },
];

const insertAll = db.transaction((runs) => {
  for (const r of runs) {
    insert.run({
      timestamp:           BASE_MS + r.day * DAY_MS,
      chain:               "arbitrum",
      block:               200000000 + r.day * 7000,
      passing:             r.passing,
      pending:             r.pending,
      failing:             r.failing,
      proof_count:         r.proof_count,
      duration_ms:         30000 + (r.day % 5) * 2000,
      unexplained_pending: r.unexplained_pending,
      security_score:      r.security_score,
      log_path:            null,
      notes:               null,
      run_uid:             `sample-run-${String(r.day).padStart(3, "0")}`,
    });
  }
});

insertAll(SEED_RUNS);
db.close();

console.log(`[seedSampleDb] wrote ${SEED_RUNS.length} rows → ${outPath}`);
