import { describe, expect, it } from 'vitest';

import { getAuthErrorMessage } from '../../../../src/lib/auth/errors';

describe('getAuthErrorMessage', () => {
  it('returns the fallback message for non-error values', () => {
    expect(getAuthErrorMessage(null, 'Fallback message')).toBe(
      'Fallback message',
    );
  });

  it('returns a plain error message', () => {
    expect(getAuthErrorMessage(new Error('Invalid login credentials'))).toBe(
      'Invalid login credentials',
    );
  });

  it('formats stringified validation issue arrays on separate lines', () => {
    const error = new Error(
      JSON.stringify([
        { path: ['email'], message: 'Invalid email address' },
        {
          path: ['password'],
          message: 'Password must be at least 8 characters.',
        },
      ]),
    );

    expect(getAuthErrorMessage(error)).toBe(
      'Invalid email address\nPassword must be at least 8 characters.',
    );
  });

  it('returns the raw error message when JSON parsing fails', () => {
    expect(getAuthErrorMessage(new Error('[invalid json'))).toBe(
      '[invalid json',
    );
  });
});
