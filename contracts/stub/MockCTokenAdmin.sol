// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../interfaces/ICTokenAdmin.sol";

contract MockCTokenAdmin is ICTokenAdmin {
    function extractReserves(address cToken, uint reduceAmount) external override {
        // do nothing
    }
}
