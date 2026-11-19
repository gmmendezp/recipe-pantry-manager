import { z } from 'zod';

const clientEnvSchema = z.object({
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_SUPABASE_URL: z.url(),
});

export const clientEnv = clientEnvSchema.parse({
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
});
