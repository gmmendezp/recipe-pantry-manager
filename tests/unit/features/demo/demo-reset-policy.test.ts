import { describe, expect, it } from 'vitest';

import { getDemoResetDecision } from '#/features/demo/demo-reset-policy';

const NOW = new Date('2026-11-19T12:00:00.000Z');

function hoursAgo(hours: number) {
  return new Date(NOW.getTime() - hours * 60 * 60 * 1000);
}

describe('getDemoResetDecision', () => {
  it('resets when there is no previous state or login', () => {
    expect(
      getDemoResetDecision({
        lastLoginAt: null,
        lastResetAt: null,
        now: NOW,
      }),
    ).toBe('reset');
  });

  it('skips when the previous reset was less than twelve hours ago', () => {
    expect(
      getDemoResetDecision({
        lastLoginAt: null,
        lastResetAt: hoursAgo(11),
        now: NOW,
      }),
    ).toBe('skipped-recent-reset');
  });

  it('skips when the previous login was less than four hours ago', () => {
    expect(
      getDemoResetDecision({
        lastLoginAt: hoursAgo(3),
        lastResetAt: hoursAgo(13),
        now: NOW,
      }),
    ).toBe('skipped-recent-login');
  });

  it('resets at the exact reset and login boundaries', () => {
    expect(
      getDemoResetDecision({
        lastLoginAt: hoursAgo(4),
        lastResetAt: hoursAgo(12),
        now: NOW,
      }),
    ).toBe('reset');
  });
});
