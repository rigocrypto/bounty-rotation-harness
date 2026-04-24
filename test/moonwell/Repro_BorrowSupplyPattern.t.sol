// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol";

interface IComptroller {
    function getAccountLiquidity(address account) external view returns (uint256, uint256, uint256);
}

interface IMToken {
    function mint(uint256 mintAmount) external returns (uint256);
    function borrow(uint256 borrowAmount) external returns (uint256);
    function accrueInterest() external returns (uint256);
    function balanceOf(address owner) external view returns (uint256);
    function borrowBalanceStored(address account) external view returns (uint256);
    function exchangeRateStored() external view returns (uint256);
    function underlying() external view returns (address);
}

interface IERC20 {
    function approve(address spender, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Repro_BorrowSupplyPattern is Test {
    // Base mainnet addresses (block 18,500,000)
    address constant COMPTROLLER = 0xfBb21d0380beE3312B33c4353c8936a0F13EF26C;
    IMToken constant mUSDC = IMToken(0xEdc817A28E8B93B03976FBd4a3dDBc9f7D176c22);

    address user;
    uint256 initialBalance;

    function setUp() public {
        vm.createSelectFork("base", 18_500_000);
        user = makeAddr("attacker");

        // Fund user with underlying (USDC)
        address usdc = mUSDC.underlying();
        initialBalance = 1_000_000 * 1e6; // 1M USDC
        deal(usdc, user, initialBalance);

        // Approve mUSDC to spend USDC
        vm.prank(user);
        IERC20(usdc).approve(address(mUSDC), type(uint256).max);
    }

    function logAccountState(string memory label) internal view {
        uint256 mBalance = mUSDC.balanceOf(user);
        uint256 borrowStored = mUSDC.borrowBalanceStored(user);
        uint256 exRateStored = mUSDC.exchangeRateStored();

        uint256 underlyingValue = (mBalance * exRateStored) / 1e18;
        uint256 netValue = underlyingValue > borrowStored ? underlyingValue - borrowStored : 0;

        console.log("========== STATE LOG ==========");
        console.log("Block: %d, Timestamp: %d", block.number, block.timestamp);
        console.log("mToken balance: %d", mBalance);
        console.log("Underlying value: %d", underlyingValue / 1e6);
        console.log("Borrow stored: %d", borrowStored / 1e6);
        console.log("Net value: %d", netValue / 1e6);
        console.log("==============================");
    }

    function test_reproduce_borrow_supply_netvalue() public {
        console.log("\n\n===== DETERMINISTIC BORROW/SUPPLY PATTERN =====\n");

        vm.startPrank(user);

        logAccountState("INITIAL");

        // Step 1: Supply 500k
        console.log("\n>>> STEP 1: supply() 500k USDC");
        uint256 supplyAmount = 500_000 * 1e6;
        uint256 mintResult = mUSDC.mint(supplyAmount);
        require(mintResult == 0, "mint failed");
        logAccountState("AFTER SUPPLY");

        // Step 2: Borrow 200k
        console.log("\n>>> STEP 2: borrow() 200k USDC");
        uint256 borrowAmount = 200_000 * 1e6;
        uint256 borrowResult = mUSDC.borrow(borrowAmount);
        require(borrowResult == 0, string(abi.encodeWithSignature("borrow failed: {}", borrowResult)));
        logAccountState("AFTER FIRST BORROW");

        // Step 3: Accrue + advance time
        console.log("\n>>> STEP 3: advance 100 blocks + 3600 sec + accrue");
        vm.roll(block.number + 100);
        vm.warp(block.timestamp + 3600);
        mUSDC.accrueInterest();
        logAccountState("AFTER ACCRUE");

        // Step 4: Borrow again
        console.log("\n>>> STEP 4: borrow() 50k USDC more");
        uint256 borrow2Amount = 50_000 * 1e6;
        uint256 borrow2Result = mUSDC.borrow(borrow2Amount);
        if (borrow2Result != 0) {
            console.log("WARNING: second borrow code %d (might be liquidity constrained)", borrow2Result);
        }
        logAccountState("AFTER SECOND BORROW");

        vm.stopPrank();

        // Final check
        console.log("\n\n===== FINAL ANALYSIS =====");
        uint256 finalMBalance = mUSDC.balanceOf(user);
        uint256 finalBorrowStored = mUSDC.borrowBalanceStored(user);
        uint256 finalExRate = mUSDC.exchangeRateStored();
        uint256 finalUnderlying = (finalMBalance * finalExRate) / 1e18;
        uint256 netExtracted = finalUnderlying > finalBorrowStored ? finalUnderlying - finalBorrowStored : 0;

        uint256 walletBalance = IERC20(mUSDC.underlying()).balanceOf(user) / 1e6;

        console.log("Wallet USDC:            %d", walletBalance);
        console.log("mToken underlying:      %d", finalUnderlying / 1e6);
        console.log("Borrow stored:          %d", finalBorrowStored / 1e6);
        console.log("Net position (U - B):   %d", netExtracted / 1e6);
        console.log("");
        console.log("Expected net: ~250k (500k supplied - 250k borrowed)");
        console.log("Actual net:   %d", netExtracted / 1e6);
        console.log("");

        if (netExtracted > 10_000 * 1e18) {
            console.log("[CRITICAL] EXTRACTION > 10K USD - REAL BUG");
        } else {
            console.log("[PASS] EXTRACTION <= 10K USD - NORMAL");
        }
    }
}
