import { afterEach, describe, expect, it } from 'vitest';

import { merqoBaseUrl } from './merqo-base-url';

const original = process.env.MERQO_BASE_URL;

afterEach(() => {
  if (original === undefined) delete process.env.MERQO_BASE_URL;
  else process.env.MERQO_BASE_URL = original;
});

describe('merqoBaseUrl', () => {
  it('defaults to production merqo', () => {
    delete process.env.MERQO_BASE_URL;
    expect(merqoBaseUrl()).toBe('https://www.merqo.io');
  });

  it('uses MERQO_BASE_URL when set', () => {
    process.env.MERQO_BASE_URL = 'https://merqo.test';
    expect(merqoBaseUrl()).toBe('https://merqo.test');
  });
});
