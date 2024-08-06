import { BigInt } from "@graphprotocol/graph-ts"
import {
  OptionResolved,
  OptionClaim,
  OptionCreated,
  OptionSubscribed,
  TransferSingle
} from "../generated/Optionism/Optionism"
import { Option, User, OptionUnitsMapping } from "../generated/schema";


export function handleTransferSingle(event: TransferSingle): void {
  let oldUser = User.load(event.params.from.toHexString());
  if (oldUser) {
    let optionId = event.params.id.toString();
    if (oldUser.options && oldUser.options!.includes(optionId)) {
      let index = oldUser.options!.indexOf(optionId);
      if (index !== -1) {
        oldUser.options!.splice(index, 1);
        oldUser.save();
      }
    }
    let oldUserMappingId = `${oldUser.id}-${event.params.id.toString()}`;
    let oldUserMapping = OptionUnitsMapping.load(oldUserMappingId);
    if (oldUserMapping){
      oldUserMapping.units = oldUserMapping.units.minus(event.params.value)
      oldUserMapping.save();
    }
  }
  
  let newUser = User.load(event.params.to.toHexString());
  if (!newUser) {
    newUser = new User(event.params.to.toHexString());
    newUser.options = [event.params.id.toString()]; 

    let mappingId = `${newUser.id}-${event.params.id.toString()}`;
    let mapping = OptionUnitsMapping.load(mappingId);
    if (!mapping) {
      mapping = new OptionUnitsMapping(mappingId);
    }
    mapping.user = newUser.id!; // Ensure newUser.id is not null
    mapping.option = event.params.id.toString();
    mapping.units = event.params.value; // Assign units from the Option entity
    mapping.save();

    newUser.save();

  } else  if (newUser && newUser.options) {
    // Add the option to the new user
    newUser.options!.push(event.params.id.toString());
    newUser.save();
    
    // Create or update the OptionUnitsMapping for the new user and option
    let option = Option.load(event.params.id.toString());
    if (option) {
      let mappingId = `${newUser.id}-${option.id}`;
      let mapping = OptionUnitsMapping.load(mappingId);
      if (!mapping) {
        mapping = new OptionUnitsMapping(mappingId);
      }
      mapping.user = newUser.id!; // Ensure newUser.id is not null
      mapping.option = option.id;
      mapping.units = option.shares; // Assign units from the Option entity
      mapping.save();
    }
  }
}

export function handleOptionSubscribed(event: OptionSubscribed): void {
  let option = Option.load(event.params.optionId.toString());
  if (option){
    if (option.premiumCollected && option.sharesLeft){
      option.premiumCollected = (option.premiumCollected!).plus(option.premium);
      option.sharesLeft = option.sharesLeft!.minus(event.params.purchasedShares);
    }
    option.save();
  }
}


export function handleOptionCreated(event: OptionCreated): void {
  let option = Option.load(event.params.optionId.toString());
  if (!option){
    option = new Option(event.params.optionId.toString());
    option.writer = event.params.writer.toHexString();
    option.isCall = event.params.isCall;
    option.premium = event.params.premiumUsdcPrice;
    option.strikePrice = event.params.strikePrice;
    option.expirationDate = event.params.optionExpiry;
    option.shares = event.params.shares;
    option.priceId = event.params.priceId.toHexString();
    option.sharesLeft = event.params.shares;
    option.capPerUnit = event.params.maximumPayoutPerShare;
    option.countervalue = (event.params.maximumPayoutPerShare).times(event.params.shares);
    option.deadlineDate = event.params.buyExpiry;
    option.premiumCollected = BigInt.fromI32(0);
   
    option.save();
  }
}

export function handleOptionResolved(event: OptionResolved): void {
  let option = Option.load(event.params.optionId.toString());
  if (option) {
    if (event.params.finalPrice){
      option.responseValue = event.params.finalPrice;
      option.hasToPay = event.params.hasToPay;
    } 
    option.save();
  }
}

export function handleOptionClaim(event: OptionClaim): void {
  let user = event.params.buyer.toHexString();
  let option = event.params.optionId.toString();
  
  let mappingId = `${user}-${option}`;
  let mapping = OptionUnitsMapping.load(mappingId);
  if (mapping) {
    mapping.errorClaim = true;
    mapping.save();
  }

}
