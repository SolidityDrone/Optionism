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
    mapping(uint => bool) public exhaustedArrays;
    mapping(uint => uint) public results;
    // Storage variables

    IPyth pyth;  
    
    uint256[] public optionsArray;
    uint internal counter;
    address internal gelatoAddress;
    address public usdcAddress; 
    
    IERC20 usdc;

    constructor(address _gelatoAddress)ERC1155(""){
        usdcAddress = 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913; // sepolia
        pyth = IPyth(0xA2aa501b19aff244D90cc15a4Cf739D2725B5729); // pyth address
        usdc = IERC20(usdcAddress);
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
        emit OptionCreated(msg.sender, counter, optionExpiry, premiumUsdcPrice, strikePrice, buyExpiry, shares, maximumPayoutPerShare);
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
        if (option.sharesEmitted > 0){
            optionsArray.push(id);
        }
        options[id].isActive = true;
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

        usdc.transferFrom(address(this), msg.sender, claimableUsdc);

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
 // Function arguments are invalid (e.g., the arguments lengths mismatch)
    error InvalidArgument();
    // Update data is coming from an invalid data source.
    error InvalidUpdateDataSource();
    // Update data is invalid (e.g., deserialization error)
    error InvalidUpdateData();
    // Insufficient fee is paid to the method.
    error InsufficientFee();
    // There is no fresh update, whereas expected fresh updates.
    error NoFreshUpdate();
    // There is no price feed found within the given range or it does not exists.
    error PriceFeedNotFoundWithinRange();
    // Price feed not found or it is not pushed on-chain yet.
    error PriceFeedNotFound();
    // Requested price is stale.
    error StalePrice();
    // Given message is not a valid Wormhole VAA.
    error InvalidWormholeVaa();
    // Governance message is invalid (e.g., deserialization error).
    error InvalidGovernanceMessage();
    // Governance message is not for this contract.
    error InvalidGovernanceTarget();
    // Governance message is coming from an invalid data source.
    error InvalidGovernanceDataSource();
    // Governance message is old.
    error OldGovernanceMessage();


    function gelatoCallBack(uint[] memory optionIds, bytes[] memory pythUpdate) external /* onlyGelato() */ {
        // Arrays to store decoded data
        uint updateFee = pyth.getUpdateFee(pythUpdate);
        pyth.updatePriceFeeds{ value: updateFee }(pythUpdate);
        

        Option memory op;
        bool toPay;
        uint[] memory prices = new uint[](optionIds.length);
       
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
          
            emit OptionResolved(optionIds[i], prices[i], toPay);
        }

    
    }  

}
    
    

