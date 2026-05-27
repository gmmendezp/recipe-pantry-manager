import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { serverEnv } from '../env';
import * as schema from './schema';

if (!serverEnv.DATABASE_URL) {
  throw new Error('DATABASE_URL is required for database access.');
}

const client = postgres(serverEnv.DATABASE_URL, { prepare: false });

export const db = drizzle(client, { schema });
