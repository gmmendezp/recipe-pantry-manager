import { createSupabaseServerClient } from '../supabase/server';

export class AuthenticationError extends Error {
  constructor() {
    super('Authentication required.');
    this.name = 'AuthenticationError';
  }
}

export async function getCurrentUser() {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthenticationError();
  }

  return user;
}
