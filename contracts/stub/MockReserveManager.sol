// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ReserveManager.sol";

contract MockReserveManager is ReserveManager {
    uint private _blockTimestamp;

    constructor(
        address _owner,
        IComptroller _comptroller,
        IBurner _usdcBurner,
        address _wethAddress,
        address _usdcAddress
    ) ReserveManager(_owner, _comptroller, _usdcBurner, _wethAddress, _usdcAddress) {}

    function setBlockTimestamp(uint timestamp) external {
        _blockTimestamp = timestamp;
    }

    function getBlockTimestamp() public override view returns (uint) {
        return _blockTimestamp;
    }
}
