// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IOptionism {

    struct Option {
        address writer;
        uint256 optionExpiry;
        uint256 premiumUsdcPrice;
        uint256 strikePrice;
        uint256 buyExpiry;
        uint256 shares;
        uint256 maxiumPayoutPerShare;
        uint256 sharesEmitted;
        bytes32 assetID;
        bool    isCallOption;
        bool    isActive;
        bool    hasToPay;
    }

    event OptionCreated(
        address indexed writer,
        uint optionId,
        uint optionExpiry,
        uint premiumUsdcPrice,
        uint strikePrice,
        uint buyExpiry,
        uint shares,
        uint maximumPayoutPerShare
    );

    event OptionSubscribed(
        address indexed buyer,
        uint optionId,
        uint purchasedShares,
        uint totalPaid
    );

    event OptionClaim(
        address indexed buyer,
        uint optionId
    );

    event OptionResolved(
        uint optionId,
        uint finalPrice
    );
    // errors

    error NotGelato();
}