// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

contract MockCEth {
    address private _admin;
    string private _symbol;
    uint private _totalReserves;

    constructor(address admin_) {
        _admin = admin_;
        _symbol = "crETH";
    }

    function admin() external view returns (address) {
        return _admin;
    }

    function symbol() external view returns (string memory) {
        return _symbol;
    }

    function totalReserves() external view returns (uint) {
        return _totalReserves;
    }

    function setTotalReserves(uint totalReserves_) external {
        _totalReserves = totalReserves_;
    }

    function reduceReserves(uint amount) external {
        _totalReserves = _totalReserves - amount;
    }
}
