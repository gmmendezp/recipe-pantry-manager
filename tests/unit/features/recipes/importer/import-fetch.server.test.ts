import { describe, expect, it } from 'vitest';

import { validateImportUrl } from '../../../../../src/features/recipes/importer/import-fetch.server';

describe('validateImportUrl', () => {
  it('allows normal http and https URLs', () => {
    expect(validateImportUrl('https://example.com/recipe').toString()).toBe(
      'https://example.com/recipe',
    );
    expect(validateImportUrl('http://example.com/recipe').toString()).toBe(
      'http://example.com/recipe',
    );
  });

  it('rejects invalid URLs', () => {
    expect(() => validateImportUrl('not a url')).toThrow(
      'Enter a valid recipe URL.',
    );
  });

  it('rejects non-http protocols', () => {
    expect(() => validateImportUrl('file:///etc/passwd')).toThrow(
      'Recipe imports only support http and https URLs.',
    );
  });

  it('rejects localhost URLs', () => {
    expect(() => validateImportUrl('http://localhost:3000')).toThrow(
      'Recipe imports cannot fetch local or IP address URLs.',
    );
    expect(() => validateImportUrl('http://api.localhost:3000')).toThrow(
      'Recipe imports cannot fetch local or IP address URLs.',
    );
  });

  it('rejects IP address URLs', () => {
    expect(() => validateImportUrl('http://127.0.0.1')).toThrow(
      'Recipe imports cannot fetch local or IP address URLs.',
    );
    expect(() => validateImportUrl('http://[::1]')).toThrow(
      'Recipe imports cannot fetch local or IP address URLs.',
    );
  });
});
