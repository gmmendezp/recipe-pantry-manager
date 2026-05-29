import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/check-email')({
  component: CheckEmailPage,
});

function CheckEmailPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <section className="mx-auto flex max-w-md flex-col gap-8 rounded-3xl border border-border bg-paper p-8 shadow-sm">
        <div className="space-y-3">
          <p className="font-medium text-accent text-sm uppercase tracking-[0.25em]">
            Confirm your email
          </p>
          <h1 className="font-bold text-4xl tracking-tight">
            Check your inbox
          </h1>
        </div>
        <div className="rounded-2xl border border-border bg-primary-soft px-4 py-3 text-primary-soft-foreground text-sm">
          We sent a confirmation link to the email address you used to sign up.
          Open that link to finish creating your account.
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <Link className="font-semibold text-primary" to="/login">
            Go to login
          </Link>
          <Link className="text-muted" to="/signup">
            Use another email
          </Link>
        </div>
      </section>
    </main>
  );
}
