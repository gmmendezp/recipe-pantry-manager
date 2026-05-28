import { describe, expect, it } from 'vitest';

import {
  getLoginRedirect,
  getLoginRedirectOrDefault,
  loginRedirects,
} from '../../../../src/lib/auth/redirects';

describe('login redirect helpers', () => {
  it.each(loginRedirects)('allows %s', (redirect) => {
    expect(getLoginRedirect(redirect)).toBe(redirect);
  });

  it.each([
    '/unknown',
    'https://example.com',
    '//example.com',
    null,
    undefined,
  ])('rejects %s', (value) => {
    expect(getLoginRedirect(value)).toBeUndefined();
  });

  it('returns valid redirects from the defaulting helper', () => {
    expect(getLoginRedirectOrDefault('/recipes')).toBe('/recipes');
  });

  it('defaults invalid redirects to the dashboard', () => {
    expect(getLoginRedirectOrDefault('/unknown')).toBe('/dashboard');
  });
});
