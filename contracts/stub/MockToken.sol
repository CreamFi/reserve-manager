// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockToken is ERC20("Cream", "CREAM") {
    function mint(address account, uint256 _amount) public {
        _mint(account, _amount);
    }
}
