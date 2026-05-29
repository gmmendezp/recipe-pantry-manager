import { z } from 'zod';

export const authCredentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export const signupCredentialsSchema = authCredentialsSchema
  .extend({
    confirmPassword: z
      .string()
      .min(8, 'Confirm password must be at least 8 characters.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const emailConfirmationTypeSchema = z.enum([
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
  'email',
]);

export const emailConfirmationSchema = z.object({
  token_hash: z.string().optional(),
  type: emailConfirmationTypeSchema.optional(),
});
