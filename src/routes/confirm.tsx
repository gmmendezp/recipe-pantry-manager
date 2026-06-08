import { createFileRoute, Link, redirect } from '@tanstack/react-router';

import { CardPage } from '#/components/layout/card-page';
import { FormError } from '#/components/ui/form-error';
import { confirmEmail } from '#/lib/auth/functions';

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
    <CardPage>
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
      <FormError>{confirmationError}</FormError>
      <div className="flex items-center justify-between gap-4 text-sm">
        <Link className="font-semibold text-primary" to="/signup">
          Create account
        </Link>
        <Link className="text-muted" to="/login">
          Go to login
        </Link>
      </div>
    </CardPage>
  );
}
