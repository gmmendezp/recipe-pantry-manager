import { Link } from '@tanstack/react-router';
import { useState } from 'react';

import { CardPage } from '#/components/layout/card-page';
import { Button } from '#/components/ui/button';
import { FormError } from '#/components/ui/form-error';
import { getAuthErrorMessage } from '#/lib/auth/errors';
import { loginWithDemoAccount, loginWithPassword } from '#/lib/auth/functions';

type LoginMethod = 'demo' | 'password';

type LoginPageProps = {
  isDemoAccountAvailable: boolean;
  onLoginSuccess: () => Promise<unknown>;
};

export function LoginPage({
  isDemoAccountAvailable,
  onLoginSuccess,
}: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [submittingMethod, setSubmittingMethod] = useState<LoginMethod | null>(
    null,
  );

  async function logIn(method: LoginMethod, login: () => Promise<unknown>) {
    setError(null);
    setSubmittingMethod(method);

    try {
      await login();
      await onLoginSuccess();
    } catch (loginError) {
      setError(
        getAuthErrorMessage(loginError, 'Unable to log in. Please try again.'),
      );
    } finally {
      setSubmittingMethod(null);
    }
  }

  async function handleSubmit(
    event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    await logIn('password', () =>
      loginWithPassword({ data: { email, password } }),
    );
  }

  async function handleDemoLogin() {
    await logIn('demo', () => loginWithDemoAccount());
  }

  return (
    <CardPage>
      <div className="space-y-3">
        <p className="font-medium text-accent text-sm uppercase tracking-[0.25em]">
          Welcome back
        </p>
        <h1 className="font-bold text-4xl tracking-tight">Log in</h1>
        <p className="text-muted">
          Enter your email and password to continue planning recipes, pantry
          items, and grocery lists.
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
            autoComplete="current-password"
            className="w-full rounded-xl border border-border bg-paper px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-soft"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </label>
        {error ? <FormError>{error}</FormError> : null}
        <Button disabled={submittingMethod !== null} fullWidth type="submit">
          {submittingMethod === 'password' ? 'Logging in...' : 'Log in'}
        </Button>
        {isDemoAccountAvailable ? (
          <Button
            disabled={submittingMethod !== null}
            fullWidth
            onClick={handleDemoLogin}
            type="button"
          >
            {submittingMethod === 'demo' ? 'Logging in...' : 'Try demo account'}
          </Button>
        ) : null}
      </form>
      <div className="flex items-center justify-between gap-4 text-sm">
        <Link className="font-semibold text-primary" to="/signup">
          Create account
        </Link>
        <Link className="text-muted" to="/">
          Back home
        </Link>
      </div>
    </CardPage>
  );
}
