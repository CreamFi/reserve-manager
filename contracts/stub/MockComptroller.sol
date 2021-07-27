// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../interfaces/IComptroller.sol";

contract MockComptroller is IComptroller {
    mapping(address => bool) private _isListed;

    function isMarketListed(address cTokenAddress) external override view returns (bool) {
        return _isListed[cTokenAddress];
    }

    function setmarketListed(address cTokenAddress, bool isListed) external {
        _isListed[cTokenAddress] = isListed;
    }
}
