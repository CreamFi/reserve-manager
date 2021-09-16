// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ReserveManager.sol";

contract MockReserveManager is ReserveManager {
    uint private _blockTimestamp;

    constructor(
        address _owner,
        address _manualBurner,
        IComptroller _comptroller,
        address _wethAddress,
        address _usdcAddress
    ) ReserveManager(_owner, _manualBurner, _comptroller, _wethAddress, _usdcAddress) {}

    function setBlockTimestamp(uint timestamp) external {
        _blockTimestamp = timestamp;
    }

    function getBlockTimestamp() public override view returns (uint) {
        return _blockTimestamp;
    }
}
