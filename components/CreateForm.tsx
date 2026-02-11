'use client';

import { useState, useCallback } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useWalletClient } from 'wagmi';
import { getAddress } from 'viem';
import { validateAddress, validateAmount, validateChain, type InvoicePayload } from '@/lib/validation';
import { encodePayload } from '@/lib/payload';
import { getSignMessage } from '@/lib/signature';
import { type Chain } from '@/lib/chains';
import { CopyButton } from './CopyButton';
import { QRCode } from './QRCode';

const EXPIRY_OPTIONS = [
  { label: 'Never', value: 0 },
  { label: '1 hour', value: 3600 },
  { label: '24 hours', value: 86400 },
  { label: '7 days', value: 604800 },
];

function generateNonce(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function CreateForm() {
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [chain, setChain] = useState<Chain>('base');
  const [memo, setMemo] = useState('');
  const [label, setLabel] = useState('');
  const [expirySeconds, setExpirySeconds] = useState(0);
  const [signEnabled, setSignEnabled] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { openConnectModal } = useConnectModal();
  const { address: walletAddress, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const addressError = address && !validateAddress(address) ? 'Invalid Ethereum address' : null;
  const amountError = amount && !validateAmount(amount) ? 'Use digits and dots only (max 6 decimals)' : null;

  const canSubmit =
    address &&
    amount &&
    !addressError &&
    !amountError &&
    memo.length <= 120 &&
    label.length <= 24 &&
    (!signEnabled || isConnected);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setGeneratedUrl(null);

      const checksummed = validateAddress(address);
      if (!checksummed) return setError('Invalid address');
      if (!validateAmount(amount)) return setError('Invalid amount');
      if (!validateChain(chain)) return setError('Invalid chain');

      const payload: InvoicePayload = {
        to: checksummed,
        amount,
        chain,
      };

      if (memo.trim()) payload.memo = memo.trim();
      if (label.trim()) payload.label = label.trim();

      if (expirySeconds > 0) {
        payload.expiresAt = Math.floor(Date.now() / 1000) + expirySeconds;
        payload.nonce = generateNonce();
      }

      if (signEnabled && walletClient) {
        setIsSubmitting(true);
        try {
          const message = getSignMessage(payload);
          const sig = await walletClient.signMessage({ message });
          payload.issuer = getAddress(walletClient.account.address);
          payload.sig = sig;
        } catch (err) {
          setIsSubmitting(false);
          setError('Signing was cancelled or failed');
          return;
        }
      }

      const encoded = encodePayload(payload);
      if (!encoded) {
        setIsSubmitting(false);
        setError('Invoice too long — shorten memo');
        return;
      }

      const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://instantinvoice.xyz';
      setGeneratedUrl(`${baseUrl}/i/${encoded}`);
      setIsSubmitting(false);
    },
    [address, amount, chain, memo, label, expirySeconds, signEnabled, walletClient]
  );

  const handleReset = () => {
    setAddress('');
    setAmount('');
    setChain('base');
    setMemo('');
    setLabel('');
    setExpirySeconds(0);
    setSignEnabled(false);
    setGeneratedUrl(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Instant Invoice</h1>
        <p className="mt-2 text-sm text-gray-400">
          Create a shareable USDC invoice link. No accounts, no backend.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Wallet Address */}
        <div>
          <label htmlFor="address" className="mb-1 block text-sm font-medium text-gray-300">
            Recipient Wallet Address *
          </label>
          <input
            id="address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            className="w-full rounded-lg border border-brand-border bg-brand-card px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            aria-describedby={addressError ? 'address-error' : undefined}
            required
          />
          {addressError && (
            <p id="address-error" className="mt-1 text-xs text-red-400">
              {addressError}
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="mb-1 block text-sm font-medium text-gray-300">
            Amount (USDC) *
          </label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-brand-border bg-brand-card px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            aria-describedby={amountError ? 'amount-error' : undefined}
            required
          />
          {amountError && (
            <p id="amount-error" className="mt-1 text-xs text-red-400">
              {amountError}
            </p>
          )}
        </div>

        {/* Chain Toggle */}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-300">Chain *</label>
          <div className="flex gap-2">
            {(['base', 'arbitrum', 'ethereum'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setChain(c)}
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  chain === c
                    ? 'border-brand-green bg-brand-green/10 text-brand-green'
                    : 'border-brand-border bg-brand-card text-gray-400 hover:bg-white/5'
                }`}
                aria-pressed={chain === c}
              >
                {c === 'base' ? 'Base' : c === 'arbitrum' ? 'Arbitrum' : 'Ethereum'}
              </button>
            ))}
          </div>
        </div>

        {/* Memo */}
        <div>
          <label htmlFor="memo" className="mb-1 block text-sm font-medium text-gray-300">
            Memo
          </label>
          <textarea
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="Logo design — January 2026"
            maxLength={120}
            rows={2}
            className="w-full resize-none rounded-lg border border-brand-border bg-brand-card px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
          <p className={`mt-1 text-right text-xs ${memo.length > 120 ? 'text-red-400' : 'text-gray-500'}`}>
            {memo.length}/120
          </p>
        </div>

        {/* Display Label */}
        <div>
          <label htmlFor="label" className="mb-1 block text-sm font-medium text-gray-300">
            Display Name
          </label>
          <input
            id="label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Your name or alias"
            maxLength={24}
            className="w-full rounded-lg border border-brand-border bg-brand-card px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          />
          <p className={`mt-1 text-right text-xs ${label.length > 24 ? 'text-red-400' : 'text-gray-500'}`}>
            {label.length}/24
          </p>
        </div>

        {/* Expires In */}
        <div>
          <label htmlFor="expiry" className="mb-1 block text-sm font-medium text-gray-300">
            Expires In
          </label>
          <select
            id="expiry"
            value={expirySeconds}
            onChange={(e) => setExpirySeconds(Number(e.target.value))}
            className="w-full rounded-lg border border-brand-border bg-brand-card px-4 py-2.5 text-sm text-white focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
          >
            {EXPIRY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sign Invoice Toggle */}
        <div className="flex items-center justify-between rounded-lg border border-brand-border bg-brand-card px-4 py-3">
          <div>
            <p className="text-sm font-medium text-gray-300">Sign Invoice</p>
            <p className="text-xs text-gray-500">Proves you created this invoice</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={signEnabled}
            onClick={() => {
              if (!signEnabled && !isConnected && openConnectModal) {
                openConnectModal();
              }
              setSignEnabled(!signEnabled);
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
              signEnabled ? 'bg-brand-green' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                signEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {signEnabled && !isConnected && (
          <p className="text-xs text-amber-400">Connect your wallet to sign this invoice</p>
        )}

        {error && (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="w-full rounded-lg bg-brand-green px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Signing...' : 'Generate Invoice Link'}
        </button>
      </form>

      {/* Generated Output */}
      {generatedUrl && (
        <div className="space-y-4 rounded-lg border border-brand-border bg-brand-card p-4">
          <h2 className="text-sm font-medium text-gray-300">Your Invoice Link</h2>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={generatedUrl}
              className="flex-1 truncate rounded-lg border border-brand-border bg-brand-dark px-3 py-2 text-xs text-gray-400"
              aria-label="Invoice URL"
            />
            <CopyButton text={generatedUrl} label="Copy" />
          </div>

          <div className="flex justify-center">
            <QRCode value={generatedUrl} size={200} />
          </div>

          <button
            onClick={handleReset}
            className="w-full rounded-lg border border-brand-border px-4 py-2.5 text-sm text-gray-400 transition-colors hover:bg-white/5"
          >
            Create Another
          </button>
        </div>
      )}
    </div>
  );
}
