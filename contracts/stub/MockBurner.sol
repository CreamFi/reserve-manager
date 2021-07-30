// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../interfaces/IBurner.sol";

contract MockBurner is IBurner {
    bool private _burnFailed;

    function burn(address coin) external override returns (bool) {
        if (_burnFailed) {
            return false;
        }

        // Pull money from msg.sender.
        uint amount = IERC20(coin).balanceOf(msg.sender);
        IERC20(coin).transferFrom(msg.sender, address(this), amount);
        return true;
    }

    function setBurnFailed(bool _failed) external {
        _burnFailed = _failed;
    }
}
