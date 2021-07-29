// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../interfaces/ICToken.sol";

contract MockCToken is ICToken {
    address private _admin;
    string private _symbol;
    address private _underlying;
    uint private _totalReserves;

    constructor(address admin_, address underlying_) {
        _admin = admin_;
        _underlying = underlying_;
        _symbol = "crCREAM";
    }

    function admin() external override view returns (address) {
        return _admin;
    }

    function symbol() external override view returns (string memory) {
        return _symbol;
    }

    function underlying() external override view returns (address) {
        return _underlying;
    }

    function totalReserves() external override view returns (uint) {
        return _totalReserves;
    }

    function setTotalReserves(uint totalReserves_) external {
        _totalReserves = totalReserves_;
    }

    function reduceReserves(uint amount) external {
        _totalReserves = _totalReserves - amount;
    }
}
