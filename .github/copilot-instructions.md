# Project Guidelines

## Scope

- Primary audit workflow lives in `test/gmx-invariants/`, `scripts/`, `config/`, `docs/`, and `outputs/`.
- Treat `lib/` and `moonwell-contracts-v2/lib/` as vendored code unless a task explicitly targets those paths.

## Required Context Before Editing

You MUST:
1) Search existing code before adding new helpers.
2) Read these before edits:
   - `test/gmx-invariants/harness.ts`
   - `package.json` scripts
   - relevant `.env` keys used by the target spec(s)
3) If a helper is missing, implement it in `test/gmx-invariants/harness.ts` first with typed signatures.
4) Do not change existing invariant semantics unless explicitly requested.

## Build And Test

- Baseline quick check: `npm run smoke:all`
- Required after invariant changes: `npm run test:gmx-invariants:full`
- Required for exploit-search changes: `npm run test:gmx-exploit-search:extended`

## Testing Conventions

- Keep outputs deterministic:
  - use `withIterationSnapshot` for fuzz loops
  - keep random inputs reproducible with documented seeds when applicable
- For new tests, add one deterministic test first, then fuzz variants.

## Environment And Forking

- Archive RPC endpoints are required for deterministic fork reads.
- Hardhat historical reads on Arbitrum can fail due to hardfork lookup limits.
- Prefer `readAtForkBlock` from `test/gmx-invariants/harness.ts` for baseline-state reads.
- Use `GMX_ENABLE_REAL_MUTATIONS=true` for exploit-search suites.

## Immunefi Scope Constraints

- No mainnet testing.
- No third-party oracle blame findings.
- Findings require PoC plus economic impact (theft, insolvency, or freeze).

## Reference Docs

- Contributor flow and PR safety: `CONTRIBUTING.md`
- Execution state and current gates: `docs/README.md`, `docs/PHASE4.md`
- Ops and continuous process details: `docs/continuous-security.md`, `docs/ops-runbook.md`
