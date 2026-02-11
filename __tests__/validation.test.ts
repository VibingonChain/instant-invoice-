import { validateAddress, validateAmount, validateChain, validatePayload } from '@/lib/validation';

describe('validateAddress', () => {
  it('accepts a valid checksummed address', () => {
    expect(validateAddress('0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913')).toBe(
      '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
    );
  });

  it('accepts a lowercase address and returns checksummed', () => {
    const lower = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913';
    const result = validateAddress(lower);
    expect(result).toBeTruthy();
    expect(result).toMatch(/^0x[0-9a-fA-F]{40}$/);
  });

  it('rejects an address with wrong length', () => {
    expect(validateAddress('0x1234')).toBeNull();
  });

  it('rejects an address with bad characters', () => {
    expect(validateAddress('0xZZZZ89fCD6eDb6E08f4c7C32D4f71b54bdA02913')).toBeNull();
  });

  it('rejects an empty string', () => {
    expect(validateAddress('')).toBeNull();
  });
});

describe('validateAmount', () => {
  it('accepts "500"', () => {
    expect(validateAmount('500')).toBe(true);
  });

  it('accepts "0.5"', () => {
    expect(validateAmount('0.5')).toBe(true);
  });

  it('accepts "100.123456" (6 decimals)', () => {
    expect(validateAmount('100.123456')).toBe(true);
  });

  it('rejects "500,00" (comma)', () => {
    expect(validateAmount('500,00')).toBe(false);
  });

  it('rejects "1e3" (scientific notation)', () => {
    expect(validateAmount('1e3')).toBe(false);
  });

  it('rejects "-5" (negative)', () => {
    expect(validateAmount('-5')).toBe(false);
  });

  it('rejects "0" (zero)', () => {
    expect(validateAmount('0')).toBe(false);
  });

  it('rejects " 500" (leading space)', () => {
    expect(validateAmount(' 500')).toBe(false);
  });

  it('rejects "500 " (trailing space)', () => {
    expect(validateAmount('500 ')).toBe(false);
  });

  it('rejects "0.1234567" (7 decimals)', () => {
    expect(validateAmount('0.1234567')).toBe(false);
  });

  it('rejects "" (empty)', () => {
    expect(validateAmount('')).toBe(false);
  });

  it('rejects "abc"', () => {
    expect(validateAmount('abc')).toBe(false);
  });
});

describe('validateChain', () => {
  it('accepts "base"', () => {
    expect(validateChain('base')).toBe(true);
  });

  it('accepts "arbitrum"', () => {
    expect(validateChain('arbitrum')).toBe(true);
  });

  it('accepts "ethereum"', () => {
    expect(validateChain('ethereum')).toBe(true);
  });

  it('rejects "solana"', () => {
    expect(validateChain('solana')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(validateChain('')).toBe(false);
  });
});

describe('validatePayload', () => {
  const validPayload = {
    to: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    amount: '100',
    chain: 'base',
  };

  it('accepts a valid minimal payload', () => {
    expect(validatePayload(validPayload)).toBe(true);
  });

  it('accepts a payload with all optional fields', () => {
    expect(
      validatePayload({
        ...validPayload,
        memo: 'Test memo',
        label: 'Alice',
        expiresAt: 1700000000,
        nonce: 'abc12345',
        issuer: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        sig: '0xdeadbeef',
      })
    ).toBe(true);
  });

  it('rejects null', () => {
    expect(validatePayload(null)).toBe(false);
  });

  it('rejects missing required field "to"', () => {
    expect(validatePayload({ amount: '100', chain: 'base' })).toBe(false);
  });

  it('rejects missing required field "amount"', () => {
    expect(validatePayload({ to: validPayload.to, chain: 'base' })).toBe(false);
  });

  it('rejects missing required field "chain"', () => {
    expect(validatePayload({ to: validPayload.to, amount: '100' })).toBe(false);
  });

  it('rejects memo exceeding 120 chars', () => {
    expect(
      validatePayload({ ...validPayload, memo: 'x'.repeat(121) })
    ).toBe(false);
  });

  it('rejects label exceeding 24 chars', () => {
    expect(
      validatePayload({ ...validPayload, label: 'x'.repeat(25) })
    ).toBe(false);
  });

  it('rejects invalid issuer address', () => {
    expect(
      validatePayload({ ...validPayload, issuer: 'not-an-address' })
    ).toBe(false);
  });
});
