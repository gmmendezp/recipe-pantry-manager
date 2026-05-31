import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';

import { CardPage } from '../components/layout/card-page';
import { Button } from '../components/ui/button';
import { FormError } from '../components/ui/form-error';
import { getAuthErrorMessage } from '../lib/auth/errors';
import { signupWithPassword } from '../lib/auth/functions';

export const Route = createFileRoute('/signup')({ component: SignupPage });

function SignupPage() {
  const navigate = Route.useNavigate();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState('');

  async function handleSubmit(
    event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signupWithPassword({
        data: { confirmPassword, email, password },
      });

      if (result.hasSession) {
        await navigate({ to: '/dashboard' });
        return;
      }

      await navigate({ to: '/check-email' });
    } catch (signupError) {
      setError(
        getAuthErrorMessage(
          signupError,
          'Unable to create your account. Please try again.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CardPage>
      <div className="space-y-3">
        <p className="font-medium text-accent text-sm uppercase tracking-[0.25em]">
          Start cooking smarter
        </p>
        <h1 className="font-bold text-4xl tracking-tight">Create account</h1>
        <p className="text-muted">
          Create an account to start saving recipes, tracking pantry items, and
          building grocery lists.
        </p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <label className="block space-y-2">
          <span className="font-medium text-foreground text-sm">Email</span>
          <input
            autoComplete="email"
            className="w-full rounded-xl border border-border bg-paper px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-soft"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>
        <label className="block space-y-2">
          <span className="font-medium text-foreground text-sm">Password</span>
          <input
            autoComplete="new-password"
            className="w-full rounded-xl border border-border bg-paper px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-soft"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        <label className="block space-y-2">
          <span className="font-medium text-foreground text-sm">
            Confirm Password
          </span>
          <input
            autoComplete="new-password"
            className="w-full rounded-xl border border-border bg-paper px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-soft"
            minLength={8}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            type="password"
            value={confirmPassword}
          />
        </label>
        {error ? <FormError>{error}</FormError> : null}
        <Button disabled={isSubmitting} fullWidth type="submit">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>
      <div className="flex items-center justify-between gap-4 text-sm">
        <Link className="font-semibold text-primary" to="/login">
          Already have an account?
        </Link>
        <Link className="text-muted" to="/">
          Back home
        </Link>
      </div>
    </CardPage>
  );
}
