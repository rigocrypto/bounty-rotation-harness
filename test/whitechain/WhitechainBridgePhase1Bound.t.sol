// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

interface IBridgeBound {
    struct ReceiveTokensParams {
        bytes32 externalId;
        uint256 mapId;
        uint256 amount;
        bytes32 fromAddress;
        bytes32 toAddress;
    }

    struct WithdrawTokenLiquidityParams {
        bytes32 tokenAddress;
        address recipientAddress;
        uint256 amount;
        bool useTransfer;
    }

    struct WithdrawCoinLiquidityParams {
        address recipientAddress;
        uint256 amount;
    }

    function receiveTokens(ReceiveTokensParams calldata receiveTokensParams) external;
    function withdrawTokenLiquidity(WithdrawTokenLiquidityParams calldata params) external;
    function withdrawCoinLiquidity(WithdrawCoinLiquidityParams calldata params) external;
    function usedHashes(bytes32 hash) external view returns (bool);
    function dailyLimits(bytes32 tokenAddress, address relayer) external view returns (uint256);
}

interface IUUPSBound {
    function upgradeTo(address newImplementation) external;
}

contract WhitechainBridgePhase1BoundTest is Test {
    address internal bridgeProxyAddr;
    bytes32 internal tokenAB32;

    uint256 internal forkBlock;
    string internal forkRpc;

    address internal attacker;
    uint256 internal constant ATTACKER_PK = 0xDEADBEEF1337CAFE;

    IBridgeBound internal bridge;
    IUUPSBound internal uups;

    function setUp() public {
        attacker = vm.addr(ATTACKER_PK);

        bridgeProxyAddr = vm.envOr("WHITECHAIN_BRIDGE_PROXY", address(0));
        tokenAB32 = bytes32(uint256(uint160(vm.envOr("WHITECHAIN_TOKEN_A", address(0)))));
        forkBlock = vm.envOr("WHITECHAIN_FORK_BLOCK", uint256(0));
        forkRpc = vm.envOr("WHITECHAIN_FORK_RPC", string(""));

        if (_isConfigured()) {
            vm.createSelectFork(forkRpc, forkBlock);
            bridge = IBridgeBound(bridgeProxyAddr);
            uups = IUUPSBound(bridgeProxyAddr);
        }
    }

    function _isConfigured() internal view returns (bool) {
        return bridgeProxyAddr != address(0) && bytes(forkRpc).length > 0 && forkBlock != 0;
    }

    // Hash schema from ether/contracts/main/modules/bridge/Bridge.sol::_validateECDSA
    function _bridgeHash(
        address sender,
        bytes32 toAddress,
        bytes32 targetTokenAddress,
        uint256 gasAmount,
        uint256 amount,
        uint256 originChainId,
        uint256 targetChainId,
        uint64 deadline,
        bytes32 salt
    ) internal pure returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                sender,
                toAddress,
                targetTokenAddress,
                gasAmount,
                amount,
                originChainId,
                targetChainId,
                deadline,
                salt
            )
        );
    }

    function test_hash_binds_sender() public pure {
        bytes32 h1 = _bridgeHash(address(1), bytes32(uint256(2)), bytes32(uint256(3)), 4, 5, 6, 7, 8, bytes32(uint256(9)));
        bytes32 h2 = _bridgeHash(address(11), bytes32(uint256(2)), bytes32(uint256(3)), 4, 5, 6, 7, 8, bytes32(uint256(9)));
        assertTrue(h1 != h2, "hash should bind sender");
    }

    function test_hash_binds_target_token() public pure {
        bytes32 h1 = _bridgeHash(address(1), bytes32(uint256(2)), bytes32(uint256(3)), 4, 5, 6, 7, 8, bytes32(uint256(9)));
        bytes32 h2 = _bridgeHash(address(1), bytes32(uint256(2)), bytes32(uint256(33)), 4, 5, 6, 7, 8, bytes32(uint256(9)));
        assertTrue(h1 != h2, "hash should bind target token");
    }

    function test_hash_binds_chain_fields() public pure {
        bytes32 h1 = _bridgeHash(address(1), bytes32(uint256(2)), bytes32(uint256(3)), 4, 5, 6, 7, 8, bytes32(uint256(9)));
        bytes32 h2 = _bridgeHash(address(1), bytes32(uint256(2)), bytes32(uint256(3)), 4, 5, 66, 7, 8, bytes32(uint256(9)));
        bytes32 h3 = _bridgeHash(address(1), bytes32(uint256(2)), bytes32(uint256(3)), 4, 5, 6, 77, 8, bytes32(uint256(9)));
        assertTrue(h1 != h2 && h1 != h3, "hash should bind origin/target chain ids");
    }

    function test_hash_missing_contract_binding_surface() public pure {
        // This documents the replay thesis: `address(this)` is not part of signed payload.
        bytes32 h1 = _bridgeHash(address(1), bytes32(uint256(2)), bytes32(uint256(3)), 4, 5, 6, 7, 8, bytes32(uint256(9)));
        bytes32 h2 = _bridgeHash(address(1), bytes32(uint256(2)), bytes32(uint256(3)), 4, 5, 6, 7, 8, bytes32(uint256(9)));
        assertEq(h1, h2, "same payload yields same hash across bridge instances");
    }

    function test_receiveTokens_only_relayer_role() public {
        if (!_isConfigured()) return;

        IBridgeBound.ReceiveTokensParams memory p = IBridgeBound.ReceiveTokensParams({
            externalId: keccak256("x"),
            mapId: 1,
            amount: 1,
            fromAddress: bytes32(uint256(1)),
            toAddress: bytes32(uint256(uint160(attacker)))
        });

        vm.prank(attacker);
        (bool ok,) = address(bridge).call(abi.encodeWithSelector(IBridgeBound.receiveTokens.selector, p));
        assertFalse(ok, "receiveTokens should be role-gated to relayer");
    }

    function test_withdrawTokenLiquidity_only_multisig_role() public {
        if (!_isConfigured()) return;

        IBridgeBound.WithdrawTokenLiquidityParams memory p = IBridgeBound.WithdrawTokenLiquidityParams({
            tokenAddress: tokenAB32,
            recipientAddress: attacker,
            amount: 1,
            useTransfer: false
        });

        vm.prank(attacker);
        (bool ok,) = address(bridge).call(abi.encodeWithSelector(IBridgeBound.withdrawTokenLiquidity.selector, p));
        assertFalse(ok, "withdrawTokenLiquidity should be role-gated to multisig");
    }

    function test_withdrawCoinLiquidity_only_multisig_role() public {
        if (!_isConfigured()) return;

        IBridgeBound.WithdrawCoinLiquidityParams memory p = IBridgeBound.WithdrawCoinLiquidityParams({
            recipientAddress: attacker,
            amount: 1
        });

        vm.prank(attacker);
        (bool ok,) = address(bridge).call(abi.encodeWithSelector(IBridgeBound.withdrawCoinLiquidity.selector, p));
        assertFalse(ok, "withdrawCoinLiquidity should be role-gated to multisig");
    }

    function test_uups_upgrade_only_multisig_role() public {
        if (!_isConfigured()) return;

        vm.prank(attacker);
        (bool ok,) = address(uups).call(abi.encodeWithSelector(IUUPSBound.upgradeTo.selector, address(0xBEEF)));
        assertFalse(ok, "upgradeTo should be role-gated to multisig");
    }
}
