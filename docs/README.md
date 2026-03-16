# GMX Audit Execution Entry

Use only two docs for current execution state:

1. `docs/README.md` (this file): single entrypoint
2. `docs/PHASE4.md`: Phase 4 gates, commands, and latest run evidence

## Current Gate Status

- Gate A (`executeWithdrawal: payout <= fair share`): `PENDING` on Avalanche fork
- Gate B (`executeOrder` critical path): not run in this pass
- Gate C (one Oracle source diff): completed (local Arb/Ava snapshots are identical)
- Gate D (Slither reentrancy/delegatecall pass): completed (triaged; follow-up review required)

## Evidence Files

- `outputs/slither-gmx-synthetics.json`
- `outputs/oracle-store-arb.sol`
- `outputs/oracle-store-ava.sol`
- `outputs/findings.md`
- `outputs/chain_diff.md`

Open `docs/PHASE4.md` to continue execution.