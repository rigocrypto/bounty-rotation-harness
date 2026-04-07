// SPDX-License-Identifier: BUSL-1.1
// Vendored stub — sourced from gmx-synthetics/contracts/callback/IGasFeeCallbackReceiver.sol
pragma solidity ^0.8.0;

import "./EventUtils.sol";

interface IGasFeeCallbackReceiver {
    function refundExecutionFee(bytes32 key, EventUtils.EventLogData memory eventData) external payable;
}
