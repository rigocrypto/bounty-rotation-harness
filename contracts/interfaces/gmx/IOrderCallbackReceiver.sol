// SPDX-License-Identifier: BUSL-1.1
// Vendored stub — sourced from gmx-synthetics/contracts/callback/IOrderCallbackReceiver.sol
// Order.sol import removed; only EventUtils.EventLogData is needed for these signatures.
pragma solidity ^0.8.0;

import "./EventUtils.sol";

interface IOrderCallbackReceiver {
    function afterOrderExecution(
        bytes32 key,
        EventUtils.EventLogData memory orderData,
        EventUtils.EventLogData memory eventData
    ) external;
    function afterOrderCancellation(
        bytes32 key,
        EventUtils.EventLogData memory order,
        EventUtils.EventLogData memory eventData
    ) external;
    function afterOrderFrozen(
        bytes32 key,
        EventUtils.EventLogData memory order,
        EventUtils.EventLogData memory eventData
    ) external;
}
