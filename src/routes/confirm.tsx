import { createFileRoute, Link, redirect } from '@tanstack/react-router';

import { confirmEmail } from '../lib/auth/functions';

type ConfirmSearch = {
  token_hash?: string;
  type?: string;
};

export const Route = createFileRoute('/confirm')({
  beforeLoad: async ({ search }) => {
    let hasSession = false;

    try {
      const result = await confirmEmail({ data: search });
      hasSession = result.hasSession;
    } catch (error) {
      return {
        confirmationError:
          error instanceof Error
            ? error.message
            : 'Unable to confirm your email address.',
      };
    }

    throw redirect({
      search: hasSession ? { confirmed: true } : undefined,
      to: hasSession ? '/dashboard' : '/login',
    });
  },
  component: ConfirmEmailPage,
  validateSearch: (search): ConfirmSearch => ({
    token_hash:
      typeof search.token_hash === 'string' ? search.token_hash : undefined,
    type: typeof search.type === 'string' ? search.type : undefined,
  }),
});

function ConfirmEmailPage() {
  const { confirmationError } = Route.useRouteContext();

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <section className="mx-auto flex max-w-md flex-col gap-8 rounded-3xl border border-border bg-paper p-8 shadow-sm">
        <div className="space-y-3">
          <p className="font-medium text-red-700 text-sm uppercase tracking-[0.25em]">
            Confirmation failed
          </p>
          <h1 className="font-bold text-4xl tracking-tight">
            We could not confirm that link
          </h1>
          <p className="text-muted">
            The confirmation link may be expired, already used, or missing the
            details Supabase needs to verify your account.
          </p>
        </div>
        <p className="whitespace-pre-line rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
          {confirmationError}
        </p>
        <div className="flex items-center justify-between gap-4 text-sm">
          <Link className="font-semibold text-primary" to="/signup">
            Create account
          </Link>
          <Link className="text-muted" to="/login">
            Go to login
          </Link>
        </div>
      </section>
    </main>
  );
}
