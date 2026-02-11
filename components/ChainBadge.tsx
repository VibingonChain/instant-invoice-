'use client';

import { CHAINS, type Chain } from '@/lib/chains';

interface ChainBadgeProps {
  chain: Chain;
}

export function ChainBadge({ chain }: ChainBadgeProps) {
  const config = CHAINS[chain];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-gray-300">
      <span
        className={`h-2 w-2 rounded-full ${chain === 'base' ? 'bg-blue-400' : chain === 'arbitrum' ? 'bg-sky-400' : 'bg-indigo-400'}`}
      />
      {config.name}
    </span>
  );
}
