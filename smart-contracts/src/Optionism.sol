// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import './interfaces/IOptionism.sol';
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
 

contract Optonism is IOptionism {
    
    mapping(uint256 => Option) public options;
    mapping(uint => bool) public exhaustedArrays;

    // Storage variables
    address contractAddress = 0xA2aa501b19aff244D90cc15a4Cf739D2725B5729; // pyth address
    IPyth pyth = IPyth(contractAddress);    
    address public usdcAddress = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913; // sepolia
    uint256[] public activeOptions;


    

    constructor(){}


    function createOption(
        bool isCallOption,
        uint256 premiumUsdcPrice,
        uint256 strikePrice,
        uint256 buyExpiry,
        uint256 optionExpiry,
        uint256 assetID,
        uint256 shares,
        uint256 maximumPayoutPerShare
    ) public {
      
    }

    function buyOption(
        uint id,
        uint amountOfShares
    ) public {

    }

    function deleteOption(uint256 id) public {

    }

    function claimOption(uint256 id) public {
    
    }
    
    function getArrayChunk(uint startIndex, uint endIndex) public view returns(uint[] memory optionIDs, uint[] memory expiries, bytes32[] memory priceIds) {
        if (endIndex > optionsArray.length - 1) {
            endIndex = optionsArray.length - 1;
        }
        uint length = endIndex - startIndex;
        uint j;
        expiries = new uint[](length);
        priceIds = new bytes32[](length);
        optionIDs = new uint[](length);
        for (uint i = startIndex; i < endIndex; i++) {
            if (optionsArray[i].isActive){
                expiries[j] = optionsArray[i].optionExpiry;
                priceIds[j] = optionsArray[i].assetID;
            }
            j++;
        }
        return (optionIDs, expiries, priceIds);
    }

    function gelatoCallBack(bytes[] memory gelato) external {

    }
    
}
