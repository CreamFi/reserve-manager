// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../interfaces/IBurner.sol";

contract MockBurner is IBurner {
    function burn(address coin) external override returns (bool) {
        // do nothing
    }
}
