# Whitechain Bridge - Phase 1 Recon Worksheet
Fill this in as you read source. Every blank is a test input.

---

## 0. Environment Pin

| Key | Value |
|-----|-------|
| Repo path | c:\\Users\\servi\\gmx-audit\\whitechain-bridge |
| Repo commit | a9b7a82 |
| Fork chain | Whitechain / source chain |
| Fork RPC | https://rpc.whitechain.io |
| Fork block | candidate: 42485577 (latest finalized seen during recon) |

---

## 1. Deployed Contract Map

| Contract | Proxy address | Impl address | Admin/Upgrader | Verified? |
|----------|--------------|--------------|----------------|-----------|
| Bridge | 0x94C9d55F064980ED1faf0ABB42f3548700619039 | 0xD09D5Dec00E48A148Ab2Bf74a5c6f82325D39d41 | EIP-1967 admin slot = 0x0 | yes (code+slot reads) |
| Mapper | | | | |
| Other | | | | |

Source-matches-deployed check:
- [ ] Compile local source, compare creation bytecode hash to `eth_getCode` at impl address
- [ ] Note any drift: _______________

---

## 2. `receiveTokens` - Entry Point Analysis

### Function signature (exact, from source)
```solidity
function receiveTokens(
    ReceiveTokensParams calldata receiveTokensParams
) external
```

### Modifiers / access control on `receiveTokens`
- [x] `onlyOwner` / role: `onlyRole(RELAYER_ROLE)`
- [ ] `whenNotPaused`: ___
- [x] Other: `nonReentrant`, `nonZeroBytes32(fromAddress)`, `nonZeroBytes32(toAddress)`, `nonZeroUint256(amount)`

### Execution flow (step by step - fill as you read)
1. Load mapping via `_getMapInfo(mapId)` and require `isAllowed == true`.
2. Require `depositType == None` (withdraw-only path).
3. Enforce daily limit via `_checkAndUpdateDailyLimit(tokenAddress, relayer, amount)`.
4. Execute withdraw path: coin unlock or token mint/transfer depending on `withdrawType`.
5. Emit `Withdrawal` event.

### Where is the hash constructed?
File: `ether/contracts/main/modules/bridge/Bridge.sol`  Line: ~626

```solidity
hash = keccak256(
    abi.encodePacked(
        _msgSender(),
        bridgeTokensParams.bridgeParams.toAddress,
        mapInfo.targetTokenAddress,
        gasAmount,
        bridgeTokensParams.bridgeParams.amount,
        mapInfo.originChainId,
        mapInfo.targetChainId,
        bridgeTokensParams.ECDSAParams.deadline,
        bridgeTokensParams.ECDSAParams.salt
    )
);
```

### What fields are included in the hash?

| Field | Included? | Type hashed (bytes32/address/uint) |
|-------|-----------|-----------------------------------|
| `token` address | Yes | `bytes32` (`targetTokenAddress`) |
| `amount` | Yes | `uint256` |
| `recipient` | Yes | `bytes32` (`toAddress`) |
| `txHash` / source tx id | No | - |
| `nonce` | No | - |
| `sourceChainId` | Yes | `uint256` (`originChainId`) |
| `targetChainId` / `block.chainid` | Yes / No | `targetChainId` included, runtime `block.chainid` not included |
| bridge contract address | No | - |
| direction discriminator | No explicit field | - |
| function selector | No | - |
| domain separator | No | - |

### Hash construction method
- [x] `keccak256(abi.encodePacked(...))`
- [ ] `keccak256(abi.encode(...))`
- [ ] EIP-712 typed struct hash
- [ ] Custom / other: ___

**`abi.encodePacked` collision risk** (fill if applicable):
Are any two adjacent fields variable-length or the same type?
e.g. `encodePacked(addr1, addr2)` where attacker controls both: no dynamic fields observed; fields are fixed-size.

### Where is `usedHashes` marked?
File: `ether/contracts/main/modules/bridge/Bridge.sol`  Line: ~200

```solidity
usedHashes[_hash] = true;
```

**Timing relative to external calls / transfers:**
- [x] Marked BEFORE transfer (safe)
- [ ] Marked AFTER transfer (re-entrancy / front-run risk)
- [ ] Marked AFTER external call (specify): ___

### Exact key stored in `usedHashes`
```solidity
// paste: usedHashes[???] = true;
```

Is the key the same as the signed hash? ___
If different, what is missing from the stored key vs the signed hash? same key (`_hash`) as signature verification input.

---

## 3. Signature Validation

### Signer recovery method
- [x] `ECDSA.recover(hash, sig)`
- [ ] `ecrecover(hash, v, r, s)` directly
- [ ] Other: ___

### What hash is passed to recover?
```solidity
bytes32 _messageHash = _ECDSAParams.hash.toEthSignedMessageHash();
signer = _messageHash.recover(v, r, s);
```

### Is the hash pre-hashed with `"\x19Ethereum Signed Message:\n32"`?
- [x] Yes (personal_sign compatible)
- [ ] No (raw hash - unusual)
- [ ] EIP-712 typed data hash

### Domain separator
Not used in this Ether bridge path.

Fields in domain separator:
- [ ] `name`
- [ ] `version`
- [ ] `chainId`
- [ ] `verifyingContract`

**If any field is missing from the domain separator, document here:**
Missing: ___
Missing: name/version/verifyingContract-based domain separation; no EIP-712 domain.

### Is domain separator static (computed once, stored) or dynamic?
- [ ] Static (computed in constructor / initializer, stored in immutable/variable)
- [ ] Dynamic (recomputed on every call using `block.chainid`)
- [x] Unclear: not applicable; no DOMAIN_SEPARATOR used.

### Where is the recovered signer compared to the expected signer?
```solidity
require(hasRole(RELAYER_ROLE, signer), "Bridge: Signer must have RELAYER_ROLE");
```

- [ ] `== _signer`
- [x] `hasRole(SIGNER_ROLE, recovered)`
- [ ] Other: ___

---

## 4. Daily Limit

### Daily limit is tracked per:
- [x] `token` address
- [ ] `(token, direction)` tuple
- [ ] `mappedToken` (output token, not input)
- [ ] Global (all tokens share one counter)
- [x] Other: `(tokenAddress(bytes32), relayer)`

### Limit state variables
```solidity
mapping(bytes32 tokenAddress => mapping(address relayer => uint256 limit)) public dailyLimits;
mapping(bytes32 tokenAddress => mapping(address relayer => DailyVolumeTracker)) public dailyVolumes;
```

### How is "today" defined?
```solidity
if (block.timestamp >= tracker.dayStartTimestamp + 1 days) {
    tracker.dayVolume = 0;
    tracker.dayStartTimestamp = block.timestamp;
}
```

- [x] `block.timestamp / 86400` (equivalent rolling 24h window check)
- [ ] Explicit day counter incremented by admin
- [ ] Other: ___

### Limit check location
File: `Bridge.sol` `_checkAndUpdateDailyLimit` in `receiveTokens`

### Limit update location
File: `Bridge.sol` `_checkAndUpdateDailyLimit` (`tracker.dayVolume = newAmount`)

**Is the limit updated before or after transfer?**
- [x] Before (safe)
- [ ] After (potential bypass if transfer fails silently)

### Does the limit apply to:
- [x] `receiveTokens` inbound path
- [ ] `withdrawLiquidity` outbound path
- [ ] Both
- [x] Only one direction: withdraw path via `receiveTokens`

### Bypass surfaces noted during reading
1. ___
2. ___

---

## 5. Withdraw Liquidity

### `withdrawTokenLiquidity` signature
```solidity
function withdrawTokenLiquidity(WithdrawTokenLiquidityParams calldata params) external;
```

### Access control on withdraw
- [ ] `onlyOwner`
- [x] Role-based: `onlyRole(MULTISIG_ROLE)`
- [ ] No access control

### Accounting source of truth for available liquidity
- [x] Uses transfer call directly from contract token balance (`_executeTokenTransfer`)
- [ ] Uses internal tracked variable: ___
- [ ] Other: ___

### Can withdrawal exceed internal accounting?
- [ ] No - capped to tracked variable
- [x] Yes - no explicit internal liquidity ledger for token withdraw; relies on token transfer success.

### `withdrawCoinLiquidity` - same questions
Access control: `onlyRole(MULTISIG_ROLE)`
Accounting: `address(this).balance - gasAccumulated`
Overflow risk: underflow guarded by Solidity 0.8 checks; subtraction reverts if `gasAccumulated > balance`.

---

## 6. Mapper Interactions

### How does Bridge consume Mapper?
```solidity
MapInfo loaded via:
`( ... ) = Mapper.mapInfo(mapId);`
in `_getMapInfo(mapId)`.
```

### What does Mapper return / expose to Bridge?
- `mapInfo(mapId)` returns: chain IDs, deposit/withdraw types, token addresses, useTransfer, isAllowed, isCoin.
- Used in Bridge to determine: deposit vs withdraw behavior, mint/unlock path, token addresses, and validation gates.

### Can mapper output affect limit tracking?
- [x] Yes - limit keyed on withdraw-side `targetTokenAddress` (or zero for coin) in `receiveTokens`.
- [ ] No - limit keyed on input token

### Can mapper output affect hash construction?
- [x] Yes - `mapInfo.targetTokenAddress` included in signed hash.
- [ ] No - input token included in hash

### Can two different input tokens map to the same output?
- [x] Yes (possible by admin configuration unless prevented operationally)
- [ ] No

---

## 7. UUPS / Initializer

### Initializer function name and version
```solidity
function initialize(InitParams calldata initParams) external initializer { ... }
```

### Is `initialize` protected?
- [x] `initializer` modifier (can only run once)
- [ ] `reinitializer(N)` - current N: ___
- [ ] No modifier

### `_authorizeUpgrade` implementation
```solidity
// paste
```

- [ ] `onlyOwner`
- [x] Role check: `onlyRole(MULTISIG_ROLE)`
- [ ] Empty / no check

### Proxy admin
Address: ___
Controlled by: ___
Address: pending deployment metadata
Controlled by: expected multisig / proxy admin (to verify on explorer)

---

## 8. bytes32 / address Conversion Inventory

For each place in source where `bytes32` is cast to `address` or vice versa:

| File | Line | Pattern | Risk |
|------|------|---------|------|
| | | `address(uint160(uint256(b32)))` | upper bits lost |
| | | | |

---

## 9. abi.encodePacked Collision Inventory

For each `abi.encodePacked(...)` call in signature/hash paths:

| File | Line | Adjacent fields | Collision possible? |
|------|------|----------------|-------------------|
| | | | |

Rule: two adjacent `bytes` or `string` or same-type fields where attacker controls both -> collision possible.

---

## 10. Open Questions Before Writing Tests

After completing sections 1-9, list any ambiguities:

1. ___
2. ___
3. ___

---

## 11. Test Conversion Priorities (fill after recon)

Based on findings above, rank the H1-H7 hypotheses:

| Rank | Hypothesis | Reason |
|------|-----------|--------|
| 1 | | |
| 2 | | |
| 3 | | |
