export const CHAINS = {
  base: {
    usdc: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`,
    chainId: 8453,
    explorer: 'https://basescan.org',
    name: 'Base',
  },
  arbitrum: {
    usdc: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as `0x${string}`,
    chainId: 42161,
    explorer: 'https://arbiscan.io',
    name: 'Arbitrum One',
  },
  ethereum: {
    usdc: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' as `0x${string}`,
    chainId: 1,
    explorer: 'https://etherscan.io',
    name: 'Ethereum',
  },
} as const;

export type Chain = keyof typeof CHAINS;
export const VALID_CHAINS = Object.keys(CHAINS) as Chain[];

export const ERC20_TRANSFER_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

export const ERC20_BALANCE_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
] as const;
