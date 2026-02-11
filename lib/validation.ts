import { isAddress, getAddress } from 'viem';
import { VALID_CHAINS, type Chain } from './chains';

export function validateAddress(addr: string): string | null {
  if (!isAddress(addr)) return null;
  return getAddress(addr);
}

const AMOUNT_REGEX = /^\d+(\.\d{1,6})?$/;

export function validateAmount(amount: string): boolean {
  if (!AMOUNT_REGEX.test(amount)) return false;
  const num = parseFloat(amount);
  return num > 0 && isFinite(num);
}

export function validateChain(chain: string): chain is Chain {
  return VALID_CHAINS.includes(chain as Chain);
}

export interface InvoicePayload {
  to: string;
  amount: string;
  chain: Chain;
  memo?: string;
  label?: string;
  issuer?: string;
  sig?: string;
  expiresAt?: number;
  nonce?: string;
}

export function validatePayload(data: unknown): data is InvoicePayload {
  if (!data || typeof data !== 'object') return false;
  const d = data as Record<string, unknown>;

  if (typeof d.to !== 'string' || !isAddress(d.to)) return false;
  if (typeof d.amount !== 'string' || !validateAmount(d.amount)) return false;
  if (typeof d.chain !== 'string' || !validateChain(d.chain)) return false;

  if (d.memo !== undefined && (typeof d.memo !== 'string' || d.memo.length > 120))
    return false;
  if (d.label !== undefined && (typeof d.label !== 'string' || d.label.length > 24))
    return false;
  if (
    d.expiresAt !== undefined &&
    (typeof d.expiresAt !== 'number' || d.expiresAt < 0)
  )
    return false;
  if (d.nonce !== undefined && (typeof d.nonce !== 'string' || d.nonce.length > 8))
    return false;
  if (d.issuer !== undefined && (typeof d.issuer !== 'string' || !isAddress(d.issuer)))
    return false;
  if (d.sig !== undefined && typeof d.sig !== 'string') return false;

  return true;
}
