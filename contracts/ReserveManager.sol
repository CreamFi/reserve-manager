// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IComptroller.sol";
import "./interfaces/ICToken.sol";
import "./interfaces/ICTokenAdmin.sol";

contract ReserveManager is Ownable {
    using SafeERC20 for IERC20;

    uint public constant COOLDOWN_PERIOD = 1 days;
    address public constant ethAddress = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    /**
     * @notice comptroller contract
     */
    IComptroller public immutable comptroller;

    /**
     * @notice the extraction ratio, scaled by 1e18
     */
    uint public ratio = 0.5e18;

    /**
     * @notice cToken admin to extract reserves
     */
    mapping(address => address) public cTokenAdmins;

    /**
     * @notice burner contracts to convert assets into a specific token
     */
    mapping(address => address) public burners;

    struct ReservesSnapshot {
        uint timestamp;
        uint totalReserves;
    }

    /**
     * @notice reserves snapshot that records every reserves update
     */
    mapping(address => ReservesSnapshot) public reservesSnapshot;

    /**
     * @notice Emitted when reserves are dispatched
     */
    event Dispatch(
        address indexed token,
        uint indexed amountIn,
        uint indexed amountOut
    );

    /**
     * @notice Emitted when a cTokenAdmin is updated
     */
    event CTokenAdminUpdated(
        address cToken,
        address oldAdmin,
        address newAdmin
    );

    /**
     * @notice Emitted when a cToken's burner is updated
     */
    event BurnerUpdated(
        address cToken,
        address oldBurner,
        address newBurner
    );

    /**
     * @notice Emitted when the reserves extraction ratio is updated
     */
    event RatioUpdated(
        uint oldRatio,
        uint newRatio
    );

    constructor(
        address _owner,
        IComptroller _comptroller
    ) {
        transferOwnership(_owner);
        comptroller = _comptroller;
    }

    function getBlockTimestamp() public virtual view returns (uint) {
        return block.timestamp;
    }

    function dispatch(address cToken) external {
        require(comptroller.isMarketListed(cToken), "market not listed");

        uint totalReserves = ICToken(cToken).totalReserves();
        ReservesSnapshot memory snapshot = reservesSnapshot[cToken];
        if (snapshot.totalReserves >= totalReserves) {
            address cTokenAdmin = cTokenAdmins[cToken];
            address burner = burners[cToken];
            require(cTokenAdmin != address(0), "cToken admin not set");
            require(burner != address(0), "burner not set");
            require(snapshot.timestamp + COOLDOWN_PERIOD <= getBlockTimestamp(), "still in the cooldown period");

            // Extract reserves through cTokenAdmin.
            uint reduceAmount = (totalReserves - snapshot.totalReserves) * ratio / 1e18;
            ICTokenAdmin(cTokenAdmin).extractReserves(cToken, reduceAmount);

            // Get the cToken underlying.
            address underlying;
            if (compareStrings(ICToken(cToken).symbol(), "crETH")) {
                underlying = ethAddress;
            } else {
                underlying = ICToken(cToken).underlying();
            }

            // TODO: use burner to convert tokens.

            // TODO: fix event for dispatch.
            emit Dispatch(underlying, reduceAmount, 0);
        }

        // Update the reserve snapshot.
        reservesSnapshot[cToken] = ReservesSnapshot({
            timestamp: getBlockTimestamp(),
            totalReserves: totalReserves
        });
    }

    /* Admin functions */

    function setCTokenAdmins(address[] memory cTokens, address[] memory newCTokenAdmins) external onlyOwner {
        require(cTokens.length == newCTokenAdmins.length, "invalid data");

        for (uint i = 0; i < cTokens.length; i++) {
            require(comptroller.isMarketListed(cTokens[i]), "market not listed");
            require(ICToken(cTokens[i]).admin() == newCTokenAdmins[i], "mismatch admin");

            address oldAdmin = cTokenAdmins[cTokens[i]];
            cTokenAdmins[cTokens[i]] = newCTokenAdmins[i];

            emit CTokenAdminUpdated(cTokens[i], oldAdmin, newCTokenAdmins[i]);
        }
    }

    function setBurners(address[] memory tokens, address[] memory newBurners) external onlyOwner {
        require(tokens.length == newBurners.length, "invalid data");

        for (uint i = 0; i < tokens.length; i++) {
            address oldBurner = burners[tokens[i]];
            burners[tokens[i]] = newBurners[i];

            emit BurnerUpdated(tokens[i], oldBurner, newBurners[i]);
        }
    }

    function adjustRatio(uint newRatio) external onlyOwner {
        require(newRatio < 1e18, "invalid ratio");

        uint oldRatio = ratio;
        ratio = newRatio;
        emit RatioUpdated(oldRatio, newRatio);
    }

    /* Internal functions */

    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
}
