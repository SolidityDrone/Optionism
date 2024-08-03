export const optionismAbi =[
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "bytes[]",
				"name": "gelato",
				"type": "bytes[]"
			}
		],
		"name": "gelatoCallBack",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "startIndex",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "endIndex",
				"type": "uint256"
			}
		],
		"name": "getArrayChunk",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "optionIDs",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256[]",
				"name": "expiries",
				"type": "uint256[]"
			},
			{
				"internalType": "bytes32[]",
				"name": "priceIds",
				"type": "bytes32[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "options",
		"outputs": [
			{
				"internalType": "address",
				"name": "writer",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "optionExpiry",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "premiumUsdcPrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "strikePrice",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "buyExpiry",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "shares",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "maxiumPayoutPerShare",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "sharesEmitted",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "sharesPrice",
				"type": "uint256"
			},
			{
				"internalType": "bytes32",
				"name": "assetID",
				"type": "bytes32"
			},
			{
				"internalType": "bool",
				"name": "isCallOption",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "isActive",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "optionsArray",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "p",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
];