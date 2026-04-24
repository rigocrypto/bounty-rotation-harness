# Whitechain Bridge - Findings Candidates
One entry per candidate. Kill dead ones immediately; promote live ones.

Status labels: `LIVE` | `DEAD` | `NEEDS_POC` | `REPORTED`

---

## Template (copy for each new candidate)

```
### [FC-N] Title
- **Status:** LIVE / DEAD / NEEDS_POC
- **Hypothesis:** H1 / H2 / H3 / H4 / H5 / H6 / H7
- **Externally reachable:** Yes / No / Unclear
- **Preconditions:** (e.g. attacker needs BRIDGE_AMT tokens, valid sig not required)
- **Accepted invalid state:** (what wrong thing happens)
- **Economic impact:** (who loses what)
- **Deterministic:** Yes / No
- **Likely severity:** Critical / High / Medium / Low / Info
- **Evidence:** (grep result / line number / test output)
- **Still alive:** Yes / No - killed by: ___
- **Notes:**
```

---

## Active Candidates

### [FC-1] Cross-Contract Signature Replay Surface
- **Status:** LIVE
- **Hypothesis:** H1 / H2
- **Externally reachable:** Unclear
- **Preconditions:** Same signer key has `RELAYER_ROLE` in multiple Bridge deployments and mapping tuple matches signed fields.
- **Accepted invalid state:** Signature produced for one Bridge instance is accepted on another Bridge instance.
- **Economic impact:** Unauthorized bridging execution across deployments with shared relayer trust assumptions.
- **Deterministic:** Yes, if dual-deployment preconditions hold.
- **Likely severity:** Medium (potentially High depending on deployment topology and key reuse).
- **Evidence:** `_validateECDSA` hash omits `address(this)` in `ether/contracts/main/modules/bridge/Bridge.sol`.
- **Still alive:** Yes
- **Notes:** Needs PoC with two bridge instances and shared signer role.

### [FC-2] Token Withdraw Uses Contract Balance Without Internal Liquidity Ledger
- **Status:** LIVE
- **Hypothesis:** H5
- **Externally reachable:** No (role-gated)
- **Preconditions:** Caller controls `MULTISIG_ROLE` or compromised multisig path.
- **Accepted invalid state:** Withdraw amount is based on available token balance, not accounting buckets.
- **Economic impact:** Operational risk / governance misuse rather than external exploit.
- **Deterministic:** Yes
- **Likely severity:** Low (governance trust model).
- **Evidence:** `withdrawTokenLiquidity` directly executes transfer in `Bridge.sol`.
- **Still alive:** Yes
- **Notes:** Not an external attacker path in current ACL model.

---

## Dead Candidates

### [FC-D1] `receiveTokens` Signature Replay via `usedHashes`
- **Status:** DEAD
- **Hypothesis:** H1
- **Externally reachable:** No
- **Preconditions:** N/A
- **Accepted invalid state:** N/A
- **Economic impact:** N/A
- **Deterministic:** N/A
- **Likely severity:** N/A
- **Evidence:** `receiveTokens` accepts `ReceiveTokensParams` only and performs no signature or usedHashes check; replay model is role + daily-limit constrained.
- **Still alive:** No - killed by source review
- **Notes:** Prior scaffold assumption was incorrect.

### [FC-D2] EIP-712 DOMAIN_SEPARATOR Misconfiguration
- **Status:** DEAD
- **Hypothesis:** H3
- **Externally reachable:** No
- **Preconditions:** N/A
- **Accepted invalid state:** N/A
- **Economic impact:** N/A
- **Deterministic:** N/A
- **Likely severity:** N/A
- **Evidence:** Ether bridge path uses personal-sign hash via `toEthSignedMessageHash`, no DOMAIN_SEPARATOR path in `Bridge.sol`.
- **Still alive:** No - killed by source review
- **Notes:** Remove DOMAIN_SEPARATOR-based tests for this module.

### [FC-D3] `abi.encodePacked` Variable-Length Collision in Signed Payload
- **Status:** DEAD
- **Hypothesis:** H1
- **Externally reachable:** N/A
- **Preconditions:** N/A
- **Accepted invalid state:** N/A
- **Economic impact:** N/A
- **Deterministic:** N/A
- **Likely severity:** N/A
- **Evidence:** `_validateECDSA` packs fixed-size fields only (address/bytes32/uint), no adjacent dynamic types.
- **Still alive:** No - killed by source review
- **Notes:** Keep watching for future schema changes.

---

## Reported

_(move here after submission)_

---

## Kill Criteria

A candidate is **DEAD** when any of the following is confirmed:

| Hypothesis | Kill condition |
|-----------|---------------|
| H1 replay | All relevant fields confirmed in hash AND usedHashes key matches signed hash |
| H2 cross-ctx sig | All function entry points use distinct type hashes or contexts |
| H3 domain sep | Domain separator confirmed chain-specific and dynamic |
| H4 daily limit | Limit keyed on input token + direction + epoch, not mapped output |
| H5 withdraw auth | Withdraw gated by role; accounting uses internal variable not balanceOf |
| H6 bytes32 cast | No bytes32->address path exists in signature/hash code |
| H7 UUPS | initialize has initializer modifier; _authorizeUpgrade checks owner; no empty reinitializer |
