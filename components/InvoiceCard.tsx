'use client';

import { type InvoicePayload } from '@/lib/validation';
import { CHAINS, type Chain } from '@/lib/chains';
import { CopyButton } from './CopyButton';
import { ChainBadge } from './ChainBadge';
import { QRCode } from './QRCode';

interface InvoiceCardProps {
  payload: InvoicePayload;
  url: string;
  verificationBadge?: React.ReactNode;
  children?: React.ReactNode; // PayButton slot
}

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function InvoiceCard({ payload, url, verificationBadge, children }: InvoiceCardProps) {
  const chainConfig = CHAINS[payload.chain as Chain];
  const isExpired = payload.expiresAt ? Date.now() / 1000 > payload.expiresAt : false;

  return (
    <div className="space-y-4 rounded-xl border border-brand-border bg-brand-card p-6">
      {/* Verification Badge */}
      {verificationBadge && <div>{verificationBadge}</div>}

      {/* Amount */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold">{payload.amount} USDC</p>
          <div className="mt-1">
            <ChainBadge chain={payload.chain} />
          </div>
        </div>
        <CopyButton text={payload.amount} label="Copy" />
      </div>

      {/* Recipient */}
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Recipient</p>
        <div className="flex items-center gap-2">
          <code className="text-sm text-gray-300" title={payload.to}>
            {truncateAddress(payload.to)}
          </code>
          <CopyButton text={payload.to} label="Copy" />
        </div>
      </div>

      {/* USDC Contract */}
      <div className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-gray-500">USDC Contract</p>
        <div className="flex items-center gap-2">
          <code className="text-sm text-gray-300">{truncateAddress(chainConfig.usdc)}</code>
          <a
            href={`${chainConfig.explorer}/address/${chainConfig.usdc}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-brand-green hover:underline"
          >
            View on Explorer
          </a>
        </div>
      </div>

      {/* Memo */}
      {payload.memo && (
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Memo</p>
          <p className="text-sm text-gray-300">{payload.memo}</p>
        </div>
      )}

      {/* QR Code */}
      <div className="flex justify-center py-2">
        <QRCode value={url} size={180} />
      </div>

      {/* Pay Button / Children */}
      {children}

      {/* Expiry */}
      {payload.expiresAt && (
        <p className={`text-center text-xs ${isExpired ? 'text-red-400' : 'text-gray-500'}`}>
          {isExpired
            ? 'This invoice has expired'
            : `Expires: ${new Date(payload.expiresAt * 1000).toLocaleString()}`}
        </p>
      )}
    </div>
  );
}
