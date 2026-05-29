import type { EmailOtpType } from '@supabase/supabase-js';
import { createServerFn } from '@tanstack/react-start';
import { getRequestUrl } from '@tanstack/react-start/server';
import { z } from 'zod';

import { createSupabaseServerClient } from '../supabase/server';
import {
  authCredentialsSchema,
  emailConfirmationSchema,
  signupCredentialsSchema,
} from './schemas';
import { getCurrentUser } from './server';

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
  .inputValidator(signupCredentialsSchema)
  .handler(async ({ data }) => {
    const supabase = createSupabaseServerClient();
    const requestUrl = getRequestUrl({ xForwardedHost: true });

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      options: {
        emailRedirectTo: new URL('/confirm', requestUrl).toString(),
      },
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

export const confirmEmail = createServerFn({ method: 'POST' })
  .inputValidator(emailConfirmationSchema)
  .handler(async ({ data }) => {
    if (!data.token_hash || !data.type) {
      throw new Error('Confirmation link is missing required information.');
    }

    const supabase = createSupabaseServerClient();

    const { data: authData, error } = await supabase.auth.verifyOtp({
      token_hash: data.token_hash,
      type: data.type as EmailOtpType,
    });

    if (error) {
      throw new Error(getSafeAuthError(error));
    }

    return { hasSession: Boolean(authData.session) };
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
