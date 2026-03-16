import { expect } from "chai";
import { ethers } from "hardhat";

const ORDER_HANDLER_ABI = [
  "function executeOrder(bytes32 key, (address[] tokens, address[] providers, bytes[] data) oracleParams) external"
];
const WITHDRAWAL_HANDLER_ABI = [
  "function executeWithdrawal(bytes32 key, (address[] tokens, address[] providers, bytes[] data) oracleParams) external"
];
const ROUTER_ABI = [
  "function pluginTransfer(address token, address account, address receiver, uint256 amount) external"
];

describe("Access Control Probe", function () {
  this.timeout(180_000);

  it("OrderHandler.executeOrder blocks unauthorized callers", async function () {
    const orderHandlerAddress = process.env.GMX_ORDER_HANDLER_ADDRESS;
    expect(orderHandlerAddress, "GMX_ORDER_HANDLER_ADDRESS missing").to.be.a("string").and.not.empty;

    const [probeSigner] = await ethers.getSigners();
    const orderHandler = await ethers.getContractAt(ORDER_HANDLER_ABI, orderHandlerAddress!, probeSigner);

    await expect(
      (orderHandler as any).executeOrder(
        ethers.ZeroHash,
        { tokens: [], providers: [], data: [] }
      )
    ).to.be.reverted;
  });

  it("WithdrawalHandler.executeWithdrawal blocks unauthorized callers", async function () {
    const withdrawalHandlerAddress = process.env.GMX_WITHDRAWAL_HANDLER_ADDRESS;
    expect(withdrawalHandlerAddress, "GMX_WITHDRAWAL_HANDLER_ADDRESS missing").to.be.a("string").and.not.empty;

    const [probeSigner] = await ethers.getSigners();
    const withdrawalHandler = await ethers.getContractAt(WITHDRAWAL_HANDLER_ABI, withdrawalHandlerAddress!, probeSigner);

    await expect(
      (withdrawalHandler as any).executeWithdrawal(
        ethers.ZeroHash,
        { tokens: [], providers: [], data: [] }
      )
    ).to.be.reverted;
  });

  it("Router.pluginTransfer blocks unauthorized callers when router address is provided", async function () {
    const routerAddress = (process.env.GMX_ROUTER_ADDRESS || "").trim();
    if (!routerAddress) {
      this.skip();
    }

    const [probeSigner] = await ethers.getSigners();
    const probeAddress = await probeSigner.getAddress();
    const router = await ethers.getContractAt(ROUTER_ABI, routerAddress, probeSigner);

    await expect(
      (router as any).pluginTransfer(
        "0x0000000000000000000000000000000000000001",
        probeAddress,
        probeAddress,
        1n
      )
    ).to.be.reverted;
  });
});
