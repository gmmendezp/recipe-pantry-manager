import { createServerFn } from '@tanstack/react-start';

import { getDashboardStatsForUser } from './dashboard.server';

export const getDashboardStats = createServerFn({ method: 'GET' }).handler(
  async () => getDashboardStatsForUser(),
);
