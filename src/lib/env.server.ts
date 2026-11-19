import { z } from 'zod';

const serverEnvSchema = z.object({
  DATABASE_URL: z.url().optional(),
  DEMO_EMAIL: z.email().optional(),
  DEMO_PASSWORD: z.string().min(8).optional(),
});

export const serverEnv = serverEnvSchema.parse(process.env);
