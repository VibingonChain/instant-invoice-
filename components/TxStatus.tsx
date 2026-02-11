'use client';

import { CopyButton } from './CopyButton';

type TxState =
  | { status: 'idle' }
  | { status: 'pending' }
  | { status: 'confirming'; hash: string; explorerUrl: string }
  | { status: 'confirmed'; hash: string; explorerUrl: string }
  | { status: 'rejected' }
  | { status: 'error'; message: string };

interface TxStatusProps {
  state: TxState;
  onRetry?: () => void;
}

function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

export function TxStatus({ state, onRetry }: TxStatusProps) {
  switch (state.status) {
    case 'idle':
      return null;

    case 'pending':
      return (
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Spinner />
          Confirm in wallet...
        </div>
      );

    case 'confirming':
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Spinner />
            Transaction submitted...
          </div>
          <a
            href={`${state.explorerUrl}/tx/${state.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand-green hover:underline"
          >
            View on explorer
          </a>
        </div>
      );

    case 'confirmed':
      return (
        <div className="space-y-3 rounded-lg border border-green-700 bg-green-900/20 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-green-400">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Payment confirmed!
          </div>
          <div className="flex items-center gap-2">
            <code className="text-xs text-gray-400">{truncateHash(state.hash)}</code>
            <CopyButton text={state.hash} label="Copy tx hash" />
          </div>
          <a
            href={`${state.explorerUrl}/tx/${state.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm text-brand-green hover:underline"
          >
            View on explorer
          </a>
        </div>
      );

    case 'rejected':
      return (
        <div className="space-y-2">
          <p className="text-sm text-red-400">Transaction rejected</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm text-brand-green hover:underline"
            >
              Try Again
            </button>
          )}
        </div>
      );

    case 'error':
      return (
        <div className="space-y-2">
          <p className="text-sm text-red-400">Transaction failed: {state.message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm text-brand-green hover:underline"
            >
              Try Again
            </button>
          )}
        </div>
      );
  }
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
