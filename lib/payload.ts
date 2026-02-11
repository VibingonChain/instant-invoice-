import { type InvoicePayload, validatePayload } from './validation';

const MAX_ENCODED_LENGTH = 800;

export function encodePayload(data: InvoicePayload): string | null {
  const clean = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined && v !== '')
  );
  const json = JSON.stringify(clean);
  const bytes = new TextEncoder().encode(json);
  const binary = String.fromCharCode(...bytes);
  const encoded = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  if (encoded.length > MAX_ENCODED_LENGTH) return null;
  return encoded;
}

export function decodePayload(encoded: string): InvoicePayload | null {
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const data = JSON.parse(json);
    return validatePayload(data) ? data : null;
  } catch {
    return null;
  }
}

export type { InvoicePayload };
