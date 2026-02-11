import { canonicalize, getSignMessage } from '@/lib/signature';
import type { InvoicePayload } from '@/lib/validation';

describe('canonicalize', () => {
  const basePayload: InvoicePayload = {
    to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    amount: '500',
    chain: 'base',
  };

  it('produces deterministic output for same input', () => {
    const a = canonicalize(basePayload);
    const b = canonicalize(basePayload);
    expect(a).toBe(b);
  });

  it('produces identical output regardless of object key order', () => {
    const payload1: InvoicePayload = {
      to: basePayload.to,
      amount: '500',
      chain: 'base',
      memo: 'test',
      label: 'Alice',
    };
    // Create with different key insertion order
    const payload2 = {} as InvoicePayload;
    payload2.label = 'Alice';
    payload2.chain = 'base';
    payload2.memo = 'test';
    payload2.to = basePayload.to;
    payload2.amount = '500';

    expect(canonicalize(payload1)).toBe(canonicalize(payload2));
  });

  it('omits undefined optional fields', () => {
    const result = canonicalize(basePayload);
    const parsed = JSON.parse(result);
    expect(Object.keys(parsed)).toEqual(['to', 'amount', 'chain']);
  });

  it('includes optional fields when present', () => {
    const payload: InvoicePayload = {
      ...basePayload,
      memo: 'test memo',
      label: 'Bob',
      expiresAt: 1700000000,
      nonce: 'abc12345',
    };
    const result = canonicalize(payload);
    const parsed = JSON.parse(result);
    expect(parsed.memo).toBe('test memo');
    expect(parsed.label).toBe('Bob');
    expect(parsed.expiresAt).toBe('1700000000');
    expect(parsed.nonce).toBe('abc12345');
  });

  it('trims memo whitespace', () => {
    const payload: InvoicePayload = {
      ...basePayload,
      memo: '  trimmed memo  ',
    };
    const result = canonicalize(payload);
    const parsed = JSON.parse(result);
    expect(parsed.memo).toBe('trimmed memo');
  });

  it('trims label whitespace', () => {
    const payload: InvoicePayload = {
      ...basePayload,
      label: '  Alice  ',
    };
    const result = canonicalize(payload);
    const parsed = JSON.parse(result);
    expect(parsed.label).toBe('Alice');
  });

  it('does not include issuer or sig in canonical form', () => {
    const payload: InvoicePayload = {
      ...basePayload,
      issuer: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      sig: '0xdeadbeef',
    };
    const result = canonicalize(payload);
    const parsed = JSON.parse(result);
    expect(parsed.issuer).toBeUndefined();
    expect(parsed.sig).toBeUndefined();
  });

  it('maintains fixed key order: to, amount, chain, memo, label, expiresAt, nonce', () => {
    const payload: InvoicePayload = {
      ...basePayload,
      memo: 'memo',
      label: 'label',
      expiresAt: 123,
      nonce: 'nonce',
    };
    const result = canonicalize(payload);
    const keys = Object.keys(JSON.parse(result));
    expect(keys).toEqual(['to', 'amount', 'chain', 'memo', 'label', 'expiresAt', 'nonce']);
  });
});

describe('getSignMessage', () => {
  it('prefixes with "Instant Invoice:"', () => {
    const payload: InvoicePayload = {
      to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      amount: '100',
      chain: 'base',
    };
    const message = getSignMessage(payload);
    expect(message.startsWith('Instant Invoice:\n')).toBe(true);
  });

  it('contains the canonical JSON', () => {
    const payload: InvoicePayload = {
      to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      amount: '100',
      chain: 'base',
    };
    const message = getSignMessage(payload);
    const canonical = canonicalize(payload);
    expect(message).toBe(`Instant Invoice:\n${canonical}`);
  });
});
