const RESET_INTERVAL_MS = 12 * 60 * 60 * 1000; //12H
const LOGIN_GRACE_PERIOD_MS = 4 * 60 * 60 * 1000; //4H

export type DemoResetDecision =
  | 'reset'
  | 'skipped-recent-login'
  | 'skipped-recent-reset';

type DemoResetPolicyInput = {
  lastLoginAt: Date | null;
  lastResetAt: Date | null;
  now: Date;
};

export function getDemoResetDecision({
  lastLoginAt,
  lastResetAt,
  now,
}: DemoResetPolicyInput): DemoResetDecision {
  if (
    lastResetAt &&
    now.getTime() - lastResetAt.getTime() < RESET_INTERVAL_MS
  ) {
    return 'skipped-recent-reset';
  }

  if (
    lastLoginAt &&
    now.getTime() - lastLoginAt.getTime() < LOGIN_GRACE_PERIOD_MS
  ) {
    return 'skipped-recent-login';
  }

  return 'reset';
}
