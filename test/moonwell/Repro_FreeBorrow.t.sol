// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "./MoonwellHandler.t.sol";

contract Repro_FreeBorrow is Test {
    MoonwellHandler public handler;
    IOracle public oracle = IOracle(ORACLE);
    IComptroller public comptroller = IComptroller(COMPTROLLER);

    function setUp() public {
        vm.createSelectFork("http://127.0.0.1:8545", 18_500_000);
        handler = new MoonwellHandler();

        uint256 numMarkets = handler.marketsLength();
        uint256 numUsers = handler.usersLength();

        // Mirror invariant-test funding setup so sameBlockAttack has real balances.
        for (uint256 u = 0; u < numUsers; u++) {
            address user = handler.getUser(u);
            for (uint256 m = 0; m < numMarkets; m++) {
                address mktAddr = handler.getMarket(m);
                address underlying;
                try IMToken(mktAddr).underlying() returns (address ul) {
                    underlying = ul;
                } catch {
                    continue;
                }

                uint8 dec = IERC20(underlying).decimals();
                deal(underlying, user, 1_000_000 * (10 ** dec));

                vm.prank(user);
                IERC20(underlying).approve(mktAddr, type(uint256).max);
            }
        }
    }

    function test_reproduce_freeBorrow() public {
        // Exact shrunk sequence from gated invariant run.
        handler.sameBlockAttack(6953, 2364, 1, 1);
        handler.sameBlockAttack(
            19381948871043748481273809885211430219245162533169574260167223144453527639345, 1, 21926, 12
        );

        _dumpAllUsersState();

        handler.invariant_netValueDelta();
    }

    function _dumpAllUsersState() internal {
        uint256 numUsers = handler.usersLength();
        uint256 numMarkets = handler.marketsLength();

        for (uint256 u = 0; u < numUsers; u++) {
            address user = handler.getUser(u);

            uint256 totalCollUsd = 0;
            uint256 totalBorUsd = 0;

            console.log("========================================");
            console.log("USER", user);

            for (uint256 j = 0; j < numMarkets; j++) {
                address mAddr = handler.getMarket(j);
                IMToken m = IMToken(mAddr);

                uint256 price = oracle.getUnderlyingPrice(address(m));
                uint8 dec = IERC20(m.underlying()).decimals();
                uint256 mBal = m.balanceOf(user);
                uint256 exRate = m.exchangeRateCurrent();
                uint256 rawUnderlying = (mBal * exRate) / 1e18;
                uint256 borrowBal = m.borrowBalanceCurrent(user);
                uint256 collUsd = (rawUnderlying * price) / 1e18;
                uint256 borUsd = (borrowBal * price) / 1e18;

                totalCollUsd += collUsd;
                totalBorUsd += borUsd;

                if (rawUnderlying > 0 || borrowBal > 0) {
                    console.log("Market", j);
                    console.log("  market:       ", mAddr);
                    console.log("  decimals:     ", dec);
                    console.log("  price:        ", price);
                    console.log("  mBal:         ", mBal);
                    console.log("  exRate:       ", exRate);
                    console.log("  rawUnderlying:", rawUnderlying);
                    console.log("  borrowBal:    ", borrowBal);
                    console.log("  collUSD:      ", collUsd);
                    console.log("  borrowUSD:    ", borUsd);
                }
            }

            (, uint256 liquidity, uint256 shortfall) = comptroller.getAccountLiquidity(user);
            console.log("  TOTAL collUSD:", totalCollUsd);
            console.log("  TOTAL borUSD: ", totalBorUsd);
            console.log("  FINAL LIQ:    ", liquidity);
            console.log("  FINAL SHORT:  ", shortfall);
        }
    }
}
