import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';

import { createSupabaseServerClient } from '../supabase/server';
import { getCurrentUser } from './server';

const authCredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

function getSafeAuthError(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? 'Please check your email and password.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

export const loginWithPassword = createServerFn({ method: 'POST' })
  .inputValidator(authCredentialsSchema)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw new Error(getSafeAuthError(error));
    }

    return {
      user: {
        email: authData.user.email ?? null,
        id: authData.user.id,
      },
    };
  });

export const signupWithPassword = createServerFn({ method: 'POST' })
  .inputValidator(authCredentialsSchema)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw new Error(getSafeAuthError(error));
    }

    return {
      hasSession: Boolean(authData.session),
      user: authData.user
        ? {
            email: authData.user.email ?? null,
            id: authData.user.id,
          }
        : null,
    };
  });

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(getSafeAuthError(error));
  }
});

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
