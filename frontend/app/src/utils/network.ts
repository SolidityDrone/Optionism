import { baseSepolia, mode } from 'viem/chains'
import { Chain, hardhat, sepolia } from 'viem/chains'

let chains: [Chain, ...Chain[]] = [baseSepolia, mode]

if (process.env.NODE_ENV !== 'production') {
  chains.push(sepolia, hardhat)
}

export const ETH_CHAINS = chains

export const NETWORK_COLORS = {
  mode: {
    color: 'yellow',
    bgVariant: 'bg-sky-600',
  },
  baseSepolia: {
    color: 'blue',
    bgVariant: 'bg-blue-600',
  },
}

export function GetNetworkColor(chain?: string, type: 'color' | 'bgVariant' = 'color') {
  chain = chain?.toLowerCase()
  if (chain?.includes('mode')) return NETWORK_COLORS.mode[type]
  if (chain?.includes('basesepolia')) return NETWORK_COLORS.baseSepolia[type]

  return NETWORK_COLORS.baseSepolia[type]
}
