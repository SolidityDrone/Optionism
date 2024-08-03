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
        uint256 sharesPrice;
        uint256 assetID;
        bool    isCallOption;
        bool    isActive;
    }

    // errors here 
}