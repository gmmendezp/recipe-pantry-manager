import { createBrowserClient } from '@supabase/ssr';

import { clientEnv } from '../env';

export const supabase = createBrowserClient(
  clientEnv.VITE_SUPABASE_URL,
  clientEnv.VITE_SUPABASE_ANON_KEY,
);
