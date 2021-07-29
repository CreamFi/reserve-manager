// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./MockToken.sol";
import "./MockCToken.sol";
import "./MockCEth.sol";
import "../interfaces/ICTokenAdmin.sol";
import "../interfaces/ICToken.sol";

contract MockCTokenAdmin is ICTokenAdmin {
    function extractReserves(address cToken, uint reduceAmount) external override {
        // Pretend to extract reserves.
        if (compareStrings(ICToken(cToken).symbol(), "crETH")) {
            payable(msg.sender).transfer(reduceAmount);
            MockCEth(cToken).reduceReserves(reduceAmount);
        } else {
            address underlying = ICToken(cToken).underlying();
            MockToken(underlying).mint(msg.sender, reduceAmount);
            MockCToken(cToken).reduceReserves(reduceAmount);
        }
    }

    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    receive() external payable {}
}
