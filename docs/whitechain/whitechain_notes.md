# Whitechain Notes

## Environment
- workspace_repo_path: c:\Users\servi\gmx-audit
- workspace_repo_commit: 5489d46
- workspace_branch: main
- whitechain_source_path: c:\Users\servi\gmx-audit\whitechain-bridge
- whitechain_source_commit: a9b7a82
- whitechain_source_branch: main (tag v3.0.0)
- fork_chain: Whitechain
- fork_rpc: https://rpc.whitechain.io (confirmed from docs.whitechain.io wallet configuration)
- fork_block: 42485577 (used in successful fork-bound run)

## Deployments
- bridge_proxy: 0x94C9d55F064980ED1faf0ABB42f3548700619039 (from tx 0x296315884ee9ab14b27cd94b7cc01a8e85c356fcea7873a92d2d42fb5070653b in block 42483436)
- bridge_impl: 0xD09D5Dec00E48A148Ab2Bf74a5c6f82325D39d41 (EIP-1967 implementation slot)
- mapper_proxy: pending
- mapper_impl: pending
- admin_or_upgrader: EIP-1967 admin slot is zero (likely UUPS without separate proxy admin)

## Candidate Inputs
- token_a_whitechain_usdc: 0xF97B9Bf62916f1EB42Dd906a7254603e7b9FC4a7 (from whitechain-bridge `ether/test/utils/GlobalConfig.ts`)
- token_b_whitechain_wwbt: 0xb044a2a1e3C3deb17e3602bF088811d9bDc762EA (from whitechain-bridge `ether/test/utils/GlobalConfig.ts`)
- whitechain_chain_id: 1875 (from whitechain-bridge `ether/hardhat.config.ts` and docs.whitechain.io)

## Recon Status
- Source located in `ether/contracts/main/modules/bridge/Bridge.sol` and `ether/contracts/main/modules/mapper/Mapper.sol`.
- `receiveTokens` is role-gated (`RELAYER_ROLE`) and does not take a signature parameter.
- Signature verification exists only in `bridgeTokens` via `_validateECDSA`.
- `usedHashes` is checked and written only in `bridgeTokens` path (`usedHashes[_hash] = true`).
- Daily limits are enforced in `receiveTokens` by `(tokenAddress, relayer)` and a rolling 24h window.

## Leads
- LIVE: Potential cross-contract signature replay because `_validateECDSA` hash does not include `address(this)`.
- LIVE: `abi.encodePacked` used for hash generation; currently all fields are fixed-size, so no immediate packed-collision primitive found.
- DEAD: Prior scaffold assumption that `receiveTokens` accepted signature and wrote `usedHashes`.
- DEAD: Assumption of exposed `DOMAIN_SEPARATOR` and EIP-712 typed signature path.

## Dead Ends
- No direct per-message replay protection in `receiveTokens`; replay resistance there is limit-based + trusted relayer model, not hash-based.

## Next Actions
1. Resolve deployed `WHITECHAIN_BRIDGE_ADDRESS` and `WHITECHAIN_MAPPER_ADDRESS` (not published in repo/docs; likely from explorer-verified contracts or scope maintainer).
2. Set env vars and run fork-bound suite: `WHITECHAIN_BRIDGE_PROXY`, `WHITECHAIN_TOKEN_A`, `WHITECHAIN_FORK_BLOCK`, `WHITECHAIN_FORK_RPC`.
3. Refactor `test/whitechain/WhitechainBridgeAdversarial.t.sol` interfaces to struct-based `IBridge` API.
4. Convert replay tests from `receiveTokens` to `bridgeTokens` hash/signature semantics.
5. Add focused cross-contract replay PoC thesis around missing `address(this)` in signed payload.
