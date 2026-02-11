import { verifyMessage } from 'viem';
import type { InvoicePayload } from './validation';

export function canonicalize(p: InvoicePayload): string {
  const obj: Record<string, string> = {
    to: p.to,
    amount: p.amount,
    chain: p.chain,
  };
  if (p.memo) obj.memo = p.memo.trim();
  if (p.label) obj.label = p.label.trim();
  if (p.expiresAt) obj.expiresAt = String(p.expiresAt);
  if (p.nonce) obj.nonce = p.nonce;
  return JSON.stringify(obj);
}

export function getSignMessage(payload: InvoicePayload): string {
  return `Instant Invoice:\n${canonicalize(payload)}`;
}

export async function verifyInvoiceSignature(
  payload: InvoicePayload
): Promise<boolean> {
  if (!payload.issuer || !payload.sig) return false;

  try {
    const message = getSignMessage(payload);
    return await verifyMessage({
      address: payload.issuer as `0x${string}`,
      message,
      signature: payload.sig as `0x${string}`,
    });
  } catch {
    return false;
  }
}
