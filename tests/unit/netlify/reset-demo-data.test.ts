import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('#/features/demo/demo-reset.server', () => ({
  resetDemoDataIfDue: vi.fn(),
}));

import { resetDemoDataIfDue } from '#/features/demo/demo-reset.server';
import resetDemoData from '../../../netlify/functions/reset-demo-data';

const mockResetDemoDataIfDue = vi.mocked(resetDemoDataIfDue);

afterEach(() => {
  vi.restoreAllMocks();
});

describe('reset-demo-data scheduled function', () => {
  it('runs the reset check and logs its result', async () => {
    const log = vi.spyOn(console, 'info').mockImplementation(() => {});
    mockResetDemoDataIfDue.mockResolvedValue({
      status: 'skipped-recent-login',
    });

    await resetDemoData();

    expect(mockResetDemoDataIfDue).toHaveBeenCalledOnce();
    expect(log).toHaveBeenCalledWith(
      'Demo data reset check completed: skipped-recent-login',
    );
  });

  it('allows reset failures to surface', async () => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    mockResetDemoDataIfDue.mockRejectedValue(new Error('Reset failed.'));

    await expect(resetDemoData()).rejects.toThrow('Reset failed.');
  });
});
