
<img src="https://github.com/user-attachments/assets/bc9812da-3609-46a3-b226-31d30c73d64d" alt="optionism" width="100"/>


# Disclaimer
you can find info about the commands in their respective folders﻿.

# Optionism / Ethglobals Superhack2024

This project is a decentralized options trading platform that allows users to write and subscribe to options contracts based on the price movements of various assets, similar to traditional finance (TradFi) options. This target two kind of user + 1:
- The writer ( Who publish the option )
- The buyer ( Who buy a share of the option contract )
- Gelato al Pistacchio ( The one that injects data and resoloves the option ) 

Writers can create call or put options, selecting a strike price and other parameters, while buyers can subscribe by paying a premium. Upon expiration, a Gelato Web3 function automatically resolves the contract by pulling price data from Pyth (off-chain) via the Hermes REST API. The outcome is determined based on the direction of the option (call or put) and the final price of the asset. Only cash settlements are made, as the platform deals solely with derivatives and not the underlying assets themselves. This is helpful if you have no easy access to options in the real world.

Thanks to Pyth Network, Optionism can access pulled data from a wide range of categories:
crypto, equities, commodities, forex, rates, metals in the most accurate way.

# How it's made?

The core of Optionism is its smart contract, where all key operations take place. Publishers can write options by depositing collateral to cover potential losses, and buyers can subscribe to them directly on-chain by paying the Premium Cost. When a share is purchased it mints a 1155 token to the buyer allowing shares for secondary trades.

However, to automate the process, the platform leverages the Gelato Network's Web3 functions to constantly monitor and handle options that have just expired on contract and need for a price update. Gelato pulls off-chain price data from Pyth Network API, processes it, and sends the valid input to the gelatoCallback() function within the smart contract. This function then updates the Pyth's prices on-chain, resolving the option by comparing the current price with the previously established strike price.
If strike price isnt met the stake is returned to the writer, otherwise the gains are calculated by the ratio and made claimable to the subscribers.

The application is built using Next.js. Additionally, a dedicated Subgraph is integrated to facilitate seamless data retrieval.

What could i do as an addition:

Locking big amount of money for a long period of time isnt' worth it. If i had more time i would have integrated a way to invest these money into some protocol to extract value from long term options.

# Deployments 
Optionism is deployed on Sepolia Base and Sepolia Mode:
## Contracts
Base: [Blockscout to 0xe149D0ca2b81e6C5537bDAE3f9B3D7dD50132b07](https://base-sepolia.blockscout.com/address/0xe149D0ca2b81e6C5537bDAE3f9B3D7dD50132b07?tab=contract)

Mode: [Blockscout to 0x33614C3Db5Ae8a24708A837351D8E1ce33DFCEc0](https://sepolia.explorer.mode.network/address/0x33614C3Db5Ae8a24708A837351D8E1ce33DFCEc0)

## Goldsky
Subgraph deployed on Goldsky [here](https://api.goldsky.com/api/public/project_clzf3hstqye4x01x8hbgnch6n/subgraphs/optionism/v0.0.1/gn)

## Gelato al cioccolato
An istance on base Sepolia of rwa-drone is deployed on Gelato [here](https://app.gelato.network/functions/task/0xe58d21d606ed7cb9461183287acee3666614ed1847bc785317e2b8a4e40e301d:84532)
Unfortunatly Mode testnet isn't supported by Gelato, but this can be deployed on the mainnet which is supported



