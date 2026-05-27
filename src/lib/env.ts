import { z } from 'zod';

const serverEnvSchema = z.object({
  DATABASE_URL: z.url().optional(),
});

const clientEnvSchema = z.object({
  VITE_SUPABASE_ANON_KEY: z.string().min(1),
  VITE_SUPABASE_URL: z.url(),
});

export const serverEnv = serverEnvSchema.parse(process.env);

export const clientEnv = clientEnvSchema.parse({
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
});
