# Audit Rotation Note
Generated at rotate decision to preserve campaign state before context switch.

## INIT Capital Campaign Closed

- Repo: init-capital-contracts
- Repo commit: 5cf101c
- Fork chain: Mantle mainnet
- Fork block: 93945455
- RPC: https://rpc.mantle.xyz
- Test file: init-capital-contracts/tests/InitCoreAdversarial.t.sol
- Final result: 10/10 PASS

### Tests Confirmed Clean

- test_multicall_zeroOutputHook_mustRevertOrRemainHealthy
- test_multicall_midRevertHook_mustNotCommitState
- test_multicall_allMutatedPositions_mustBeHealthChecked
- test_multicall_nestedCallbackMutation_mustBeHealthChecked
- test_multicall_nestedCollateralMutation_mustRevertOrRemainHealthy
- test_multicall_nestedCollateralMutation_mustNotCreateRetainedValueWithHealthyDebt
- test_multicall_crossPoolMutation_allValueMustBeCounted
- test_multicall_crossPoolMutation_mirrorBorrowBDecollA_allValueMustBeCounted
- test_multicall_crossPool_decimalsNormalization_mustNotIncreaseBorrowPower
- test_multicall_nestedCallback_conservationMustHold

### Ruled Out For This Branch

- Multicall deferred-health bypass in tested paths
- Nested callback sweep miss in tested paths
- Partial commit on tested revert shape
- Cross-pool undercount in tested A/B mutation paths
- Decimals normalization inflation in tested pool pair
- Attacker-retained value with healthy debt in tested collateral callback shape
- Conservation drift beyond configured tolerance in tested composed flow

### Open For Later INIT Second Pass

- Proxy, initializer, and upgrade authorization wiring
- Config and oracle parameter path issues
- Liquidation rounding and toxic dust crystallization
- Position ownership and authorization edge cases
- Blast vs Mantle deployment and config drift

## Whitechain Bridge Phase 1 Plan

### Priority Surfaces

1. receiveTokens
2. Signature validation and signer model
3. usedHashes replay protection
4. Daily limit accounting
5. withdrawCoinLiquidity and withdrawTokenLiquidity
6. Mapper and registry consistency
7. UUPS initialize and upgrade authorization

### Highest-EV Hypotheses

- H1 Replay via incomplete hash binding
- H2 Cross-context signature reuse
- H3 Domain separator weakness
- H4 Daily limit bypass
- H5 Withdraw auth and accounting mismatch
- H6 bytes32 to address truncation edge
- H7 UUPS or initializer weakness

### Recon Grep Pack

```bash
grep -RIn "receiveTokens|bridgeTokens|usedHashes|keccak256" . --include="*.sol"
grep -RIn "recover|ECDSA|signature|signer|getSigner" . --include="*.sol"
grep -RIn "dailyLimit|setDailyLimit|limitUsed|limitReset" . --include="*.sol"
grep -RIn "withdrawCoinLiquidity|withdrawTokenLiquidity|withdrawLiquidity" . --include="*.sol"
grep -RIn "initialize|reinitialize|_authorizeUpgrade|upgradeTo|UUPSUpgradeable" . --include="*.sol"
grep -RIn "mapInfo|register|enable|disable|remove|setMap" . --include="*.sol"
grep -RIn "bytes32|address\(" . --include="*.sol"
```

### Whitechain Stop Rule

Continue if early recon or tests show suspicious hash binding, weak signature domain separation, bypassable limits, weak withdraw auth, or weak initialize and upgrade controls.

Rotate again if hash binding, domain separation, limits, withdraw auth and accounting, and UUPS guards all appear correct after focused testing.

### Time Budget

- 4 to 6 focused hours for Phase 1 recon plus first adversarial test pass.
