import { encodePayload, decodePayload } from '@/lib/payload';
import type { InvoicePayload } from '@/lib/validation';

const VALID_PAYLOAD: InvoicePayload = {
  to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  amount: '500',
  chain: 'base',
};

describe('encodePayload / decodePayload', () => {
  it('round-trips a minimal payload', () => {
    const encoded = encodePayload(VALID_PAYLOAD);
    expect(encoded).toBeTruthy();
    const decoded = decodePayload(encoded!);
    expect(decoded).toEqual(VALID_PAYLOAD);
  });

  it('round-trips a payload with all optional fields', () => {
    const full: InvoicePayload = {
      ...VALID_PAYLOAD,
      memo: 'Logo design — January 2026',
      label: 'Alice',
      expiresAt: 1700000000,
      nonce: 'abcd1234',
    };
    const encoded = encodePayload(full);
    expect(encoded).toBeTruthy();
    const decoded = decodePayload(encoded!);
    expect(decoded).toEqual(full);
  });

  it('survives unicode memo (emoji)', () => {
    const payload: InvoicePayload = {
      ...VALID_PAYLOAD,
      memo: 'Payment 💰🎉',
    };
    const encoded = encodePayload(payload);
    expect(encoded).toBeTruthy();
    const decoded = decodePayload(encoded!);
    expect(decoded?.memo).toBe('Payment 💰🎉');
  });

  it('survives unicode memo (accented chars)', () => {
    const payload: InvoicePayload = {
      ...VALID_PAYLOAD,
      memo: 'Café résumé naïve',
    };
    const encoded = encodePayload(payload);
    const decoded = decodePayload(encoded!);
    expect(decoded?.memo).toBe('Café résumé naïve');
  });

  it('survives unicode memo (CJK characters)', () => {
    const payload: InvoicePayload = {
      ...VALID_PAYLOAD,
      memo: '你好世界',
    };
    const encoded = encodePayload(payload);
    const decoded = decodePayload(encoded!);
    expect(decoded?.memo).toBe('你好世界');
  });

  it('strips empty optional fields before encoding', () => {
    const payload: InvoicePayload = {
      ...VALID_PAYLOAD,
      memo: '',
      label: '',
    };
    const encoded = encodePayload(payload);
    expect(encoded).toBeTruthy();
    const decoded = decodePayload(encoded!);
    // Empty fields should be stripped, so they should be undefined
    expect(decoded?.memo).toBeUndefined();
    expect(decoded?.label).toBeUndefined();
  });

  it('encodes max-length memo (120 chars)', () => {
    const payload: InvoicePayload = {
      ...VALID_PAYLOAD,
      memo: 'x'.repeat(120),
    };
    const encoded = encodePayload(payload);
    expect(encoded).toBeTruthy();
    const decoded = decodePayload(encoded!);
    expect(decoded?.memo).toBe('x'.repeat(120));
  });

  it('rejects payload exceeding 800 chars encoded', () => {
    const payload: InvoicePayload = {
      ...VALID_PAYLOAD,
      memo: 'x'.repeat(120),
      label: 'x'.repeat(24),
      sig: 'x'.repeat(500),
    };
    const result = encodePayload(payload);
    expect(result).toBeNull();
  });

  it('returns null for corrupted base64', () => {
    expect(decodePayload('!!!not-valid-base64!!!')).toBeNull();
  });

  it('returns null for valid base64 that is not valid JSON', () => {
    const encoded = btoa('not json')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    expect(decodePayload(encoded)).toBeNull();
  });

  it('returns null for valid JSON missing required fields', () => {
    const encoded = btoa(JSON.stringify({ amount: '100' }))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    expect(decodePayload(encoded)).toBeNull();
  });

  it('ignores extra unknown fields gracefully', () => {
    const dataWithExtra = {
      ...VALID_PAYLOAD,
      unknownField: 'should be ignored',
    };
    const json = JSON.stringify(dataWithExtra);
    const bytes = new TextEncoder().encode(json);
    const binary = String.fromCharCode(...bytes);
    const encoded = btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const decoded = decodePayload(encoded);
    expect(decoded).toBeTruthy();
    expect(decoded?.to).toBe(VALID_PAYLOAD.to);
    expect(decoded?.amount).toBe(VALID_PAYLOAD.amount);
    expect(decoded?.chain).toBe(VALID_PAYLOAD.chain);
  });
});
