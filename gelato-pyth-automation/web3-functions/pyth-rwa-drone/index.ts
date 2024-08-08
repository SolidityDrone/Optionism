import {
  Web3Function,
  Web3FunctionContext,
} from "@gelatonetwork/web3-functions-sdk";
import { Contract, utils, BigNumber, BytesLike } from "ethers";
import { EvmPriceServiceConnection } from "@pythnetwork/pyth-evm-js";
import { optionismAbi } from "./optionismAbi";
import axios from 'axios';

interface IPRICE {
  price: number;
  timestamp: number;
}
Web3Function.onRun(async (context: Web3FunctionContext) => {
  const { userArgs, storage, secrets, multiChainProvider } = context;

  const provider = multiChainProvider.chainId(84532);

  const optionismAddress = (userArgs.optionismAddress as string) ?? "";

  const optionismContract = new Contract(
    optionismAddress,
    optionismAbi,
    provider
  );
    
    // Retrieve and parse the awaiting value from storage
  const storageAwaitingValue = await storage.get("awaiting");
  const parsedAwaitingArray = storageAwaitingValue ? storageAwaitingValue.split(",").map(Number) : [];

  // Call getArrayChunk function on the contract
  const chunk = await optionismContract.getArrayChunk(1, 100);

  // Destructure the response to get the arrays
  const [retrievedOptionIds, retrievedExpiries, retrievedPriceIds] = chunk;

  const chunkExpiriesArray = retrievedExpiries.map((expiry: BigNumber) => expiry.toNumber());
  const chunkPriceIdsArray = retrievedPriceIds.map((id: BytesLike) => utils.hexlify(id));
  const chunkOptionIdsArray = retrievedOptionIds.map((opId: BigNumber) => opId.toNumber());
  
  console.log("Total Items:", chunkExpiriesArray.length);

  // Get the current Unix timestamp in seconds
  const currentUnixTimestamp = Math.floor(Date.now() / 1000);

  // Filter out the items with expiry less than or equal to the current timestamp
  const validExpiriesArray = chunkExpiriesArray.filter((expiry: number) => expiry <= currentUnixTimestamp);
  let validOptionIdsArray = chunkOptionIdsArray.filter(
    (_: any, index: number) => chunkExpiriesArray[index] <= currentUnixTimestamp
  );
  const validPriceIdsArray = chunkPriceIdsArray.filter(
    (_: any, index: number) => chunkExpiriesArray[index] <= currentUnixTimestamp
  );

  console.log("Expired Items Count:", validExpiriesArray.length);

  // Filter out option IDs that are already in the awaiting array
  validOptionIdsArray = validOptionIdsArray.filter((optionId: number) => !parsedAwaitingArray.includes(optionId));

  // Update the awaiting array in storage by removing matched IDs
  const updatedAwaitingArray = parsedAwaitingArray.filter((id: number) => !validOptionIdsArray.includes(id));
  const newStorageAwaitingValue = updatedAwaitingArray.length > 0 ? updatedAwaitingArray.join(",") : "";

  // Save the updated awaiting value back to storage
  await storage.set("awaiting", newStorageAwaitingValue);

  // Logging for debugging
  console.log("Updated Awaiting value:", newStorageAwaitingValue);
  console.log("Filtered Option IDs for processing:", validOptionIdsArray);

const mockPriceId = "0x9695e2b96ea7b3859da9ed25b7a46a920a776e2fdae19a7bcfdf2b219230452d";
const mockArray = new Array(validPriceIdsArray);

console.log(chunkPriceIdsArray);

// Construct the URL with the price IDs
const baseURL = "https://hermes.pyth.network/v2/updates/price/latest"; // latest/ ?
const idsQueryString = validPriceIdsArray.map((id: any) => `ids%5B%5D=${id}`).join("&");
const url = `${baseURL}?${idsQueryString}`;

console.log("Query String:", idsQueryString);
console.log("Final URL:", url);
const response = await axios.get(url);
const priceFeeds = response.data.binary.data;

// Add "0x" to each entry if it doesn't already have it
const formattedPriceFeeds = priceFeeds.map((feed: string) => {
    // Check if the entry starts with "0x", if not, add it
    return feed.startsWith("0x") ? feed : `0x${feed}`;
});

// Now formattedPriceFeeds contains each entry prefixed with "0x"
console.log(formattedPriceFeeds);
  // Step 1: Parse the awaiting value from storage
  const existingAwaitingValue = await storage.get("awaiting");
  const awaitingArray = existingAwaitingValue ? existingAwaitingValue.split(",").map(Number) : [];

  // Step 2: Get the first 10 items in validOptionIdsArray and decode them
  const firstTenExpiredOptionIds = validOptionIdsArray.slice(0, 10).map((id: number) => id.toString());

  // Convert the decoded array to a comma-separated string
  const newAwaitingValue = firstTenExpiredOptionIds.join(",");

  // Determine the updated awaiting value
  let updatedAwaitingValue;

  // If there is an existing value and new value, concatenate with a comma
  if (existingAwaitingValue?.length != 0 && newAwaitingValue) {
  updatedAwaitingValue = `${existingAwaitingValue},${newAwaitingValue}`;

  // If only a new value exists, just use that
  } else if (newAwaitingValue) {
  updatedAwaitingValue = newAwaitingValue;

  // If only existing value exists (new value is empty), use the existing one
  } else {
  updatedAwaitingValue = existingAwaitingValue || "";  // Fallback to empty string if no existing value
  }

  // Save the updated awaiting value to storage
  await storage.set("awaiting", updatedAwaitingValue);

  // Logging for debugging
  console.log("Updated Awaiting value:", updatedAwaitingValue);

  // Step 3: Filter out optionIds that are already in the awaiting array
  const optionIdsToEncode = validOptionIdsArray.filter(
  (optionId: number) => !awaitingArray.includes(optionId)
  ).slice(0, 10); // Limit to 10 items

  // Encode the optionId, priceId, and priceResult
  const encodedItems = optionIdsToEncode.map((optionId: number, index: number) => {
  

  // Encode optionId, priceId, and priceResult
  return utils.defaultAbiCoder.encode(
    ["uint256"],  // uint256 for priceResult
    [optionId]
  );
  });

  console.log(encodedItems.length)
  const callData = optionismContract.interface.encodeFunctionData("gelatoCallBack", [
    optionIdsToEncode,
    formattedPriceFeeds,
  ]);

  if (encodedItems.length != 0) {
    return {
      canExec: true,
      callData: [
        {
          to: optionismAddress,
          data: callData,
        },
      ],
    };
  } else {
    return {
      canExec: false,
      message: `No option is expired`,
    };
  }
});
