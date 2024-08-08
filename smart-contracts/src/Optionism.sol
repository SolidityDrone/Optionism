// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import './interfaces/IOptionism.sol';
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";
import "@openzeppelin/token/ERC1155/ERC1155.sol";
import "@openzeppelin/token/ERC20/IERC20.sol";

contract Optionism is IOptionism, ERC1155 {

    receive() external payable {}

    mapping(uint256 => IOptionism.Option) public options;
    mapping(uint => uint) public results;
    // Storage variables

    IPyth public pyth;  
    
    uint256[] public optionsArray;
    uint internal counter;
    address internal gelatoAddress;
    IERC20 public usdc;


    constructor(address _gelatoAddress, address _pyth, address _mockUsdc)ERC1155(""){
        pyth = IPyth(_pyth); 
        usdc = IERC20(_mockUsdc);
        gelatoAddress = _gelatoAddress;
    }

    modifier onlyGelato(){
        if (msg.sender != gelatoAddress)
        revert NotGelato();
        _;
    }

    function createOption(
        bool isCallOption,
        uint256 premiumUsdcPrice,
        uint256 strikePrice,
        uint256 buyExpiry,
        uint256 optionExpiry,
        bytes32 assetID,
        uint256 shares,
        uint256 maximumPayoutPerShare
    ) public {  
        ++counter;
        require(buyExpiry < optionExpiry && buyExpiry > block.timestamp);

        usdc.transferFrom(msg.sender, address(this), shares*maximumPayoutPerShare);

        options[counter] = Option(
            msg.sender,
            optionExpiry, 
            premiumUsdcPrice, 
            strikePrice, 
            buyExpiry, 
            shares, 
            maximumPayoutPerShare, 
            0, 
            assetID, 
            isCallOption, 
            false,
            false
        );
        emit OptionCreated(msg.sender, counter, isCallOption, optionExpiry, premiumUsdcPrice, strikePrice, buyExpiry, shares, maximumPayoutPerShare, assetID);
    }

    function buyOption(
        uint id,
        uint amountOfShares
    ) public {
        Option memory option = options[id];
        uint remainingShares = option.shares - option.sharesEmitted;
        uint finalAmountOfShares = amountOfShares;
        if (amountOfShares > remainingShares){
            finalAmountOfShares = remainingShares;
        }
        _mint(msg.sender, id, amountOfShares, "");
        uint amountToPay = finalAmountOfShares * option.premiumUsdcPrice;
        usdc.transferFrom(msg.sender, address(this), amountToPay);
        if (option.sharesEmitted == 0){
            optionsArray.push(id);
        }
        options[id].isActive = true;
        options[id].sharesEmitted = finalAmountOfShares;
        emit OptionSubscribed(msg.sender, id, finalAmountOfShares, amountToPay);
    }

    function deleteOption(uint256 id) public {
        // to do
    }

    function claimOptionWin(uint256 id) public {
        Option memory option = options[id];
        bool isCall = option.isCallOption;
        require(option.hasToPay, "");
        uint finalGainPerShare;
        isCall ? finalGainPerShare = (results[id] - option.strikePrice) : (option.strikePrice - results[id]);
        finalGainPerShare > option.maxiumPayoutPerShare ? finalGainPerShare = option.maxiumPayoutPerShare : finalGainPerShare;
        uint claimableUsdc = balanceOf(msg.sender, id) * finalGainPerShare;

        usdc.transfer(msg.sender, claimableUsdc);
        _burn(msg.sender, id, balanceOf(msg.sender, id));
        emit OptionClaim(msg.sender, id);
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
            Option memory currOption = options[optionsArray[i]];
            if (currOption.isActive){
                expiries[j] = currOption.optionExpiry;
                priceIds[j] = currOption.assetID;
                optionIDs[j] = optionsArray[i];
            }
            j++;
        }
        return (optionIDs, expiries, priceIds);
    }
 

    function gelatoCallBack(uint[] memory optionIds, bytes[] memory pythUpdate) external /* onlyGelato() */ {
    // Arrays to store decoded data
    uint updateFee = pyth.getUpdateFee(pythUpdate);
    pyth.updatePriceFeeds{ value: updateFee }(pythUpdate);
    

    Option memory op;
    bool toPay;

    PythStructs.Price memory price;
    for (uint i = 0; i < optionIds.length; i++) {
    
        op = options[optionIds[i]];
        

    try pyth.getPrice(op.assetID) returns (PythStructs.Price memory _price) {
        // If getPrice succeeds, use the returned price
        price = _price;
    } catch {
        // If getPrice reverts, use getPriceUnsafe
        price = pyth.getPriceUnsafe(op.assetID);
    }
        results[optionIds[i]] = uint64(price.price);
        if (op.isCallOption){
            uint64(price.price) > op.strikePrice ? toPay = true : false;
        } else{
            uint64(price.price) < op.strikePrice ? toPay = true : false;
        }
        options[optionIds[i]].hasToPay = toPay;
        if (!toPay){
            uint writersReturn = op.shares * op.maxiumPayoutPerShare;
            usdc.transfer(op.writer, writersReturn);
        } 
        
        emit OptionResolved(optionIds[i], uint(uint64(price.price)), toPay);
    }
    }  
}
    
    

