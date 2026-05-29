import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';

import { getAuthErrorMessage } from '../lib/auth/errors';
import { loginWithPassword } from '../lib/auth/functions';
import { getLoginRedirect, type LoginRedirect } from '../lib/auth/redirects';

export const Route = createFileRoute('/login')({
  component: LoginPage,
  validateSearch: (search): { redirect?: LoginRedirect } => {
    const redirect = getLoginRedirect(search.redirect);

    return redirect ? { redirect } : {};
  },
});

function LoginPage() {
  const navigate = Route.useNavigate();
  const { redirect = '/dashboard' } = Route.useSearch();
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
      await loginWithPassword({ data: { email, password } });
      await navigate({ to: redirect });
    } catch (loginError) {
      setError(
        getAuthErrorMessage(loginError, 'Unable to log in. Please try again.'),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16 text-stone-950">
      <section className="mx-auto flex max-w-md flex-col gap-8 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="space-y-3">
          <p className="font-medium text-emerald-700 text-sm uppercase tracking-[0.25em]">
            Welcome back
          </p>
          <h1 className="font-bold text-4xl tracking-tight">Log in</h1>
          <p className="text-stone-600">
            Enter your email and password to continue planning recipes, pantry
            items, and grocery lists.
          </p>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="font-medium text-sm text-stone-700">Email</span>
            <input
              autoComplete="email"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="block space-y-2">
            <span className="font-medium text-sm text-stone-700">Password</span>
            <input
              autoComplete="current-password"
              className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {error ? (
            <p className="whitespace-pre-line rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
              {error}
            </p>
          ) : null}
          <button
            className="w-full rounded-full bg-emerald-700 px-5 py-3 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-stone-300"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? 'Logging in...' : 'Log in'}
          </button>
        </form>
        <div className="flex items-center justify-between gap-4 text-sm">
          <Link className="font-semibold text-emerald-700" to="/signup">
            Create account
          </Link>
          <Link className="text-stone-500" to="/">
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
