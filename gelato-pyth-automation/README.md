# Gelato Web3 functions <<-->> Pyth PoC 
## Rwa-Drone 
For Superhack 2024 I Built Rwa Drone, which uses Gelato + Pyth to support Optionism functioning
Gelato Web3 Functions together with Pyth offer the ability to create fine-tuned customized oracles pushing prices on-chain following predefined logic within the Web3 Function and verifying prices on-chain through the Pyth network.

## Deployment
A paused istance of rwa-drone is [here](https://app.gelato.network/functions/task/0xe58d21d606ed7cb9461183287acee3666614ed1847bc785317e2b8a4e40e301d:84532)
I paused that because fetching block per block is quite expensive on the long run. 


# Commands
First you need to run: 

```
npm install
```

Then you can test by running:

```
npx w3f test web3-functions/pyth-rwa-drone/index.ts --logs

```

If you need to deploy you can 

```npx w3f deploy web3-functions/pyth-rwa-drone/index.ts --logs```


