import { createServerFn } from '@tanstack/react-start';

import { getCurrentUser } from './server';

export const getCurrentUserForRoute = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = await getCurrentUser();

    if (!user) {
      return null;
    }

    return {
      email: user.email ?? null,
      id: user.id,
    };
  },
);
