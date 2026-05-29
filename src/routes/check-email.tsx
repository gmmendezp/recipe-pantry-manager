import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/check-email')({
  component: CheckEmailPage,
});

function CheckEmailPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16 text-stone-950">
      <section className="mx-auto flex max-w-md flex-col gap-8 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="space-y-3">
          <p className="font-medium text-emerald-700 text-sm uppercase tracking-[0.25em]">
            Confirm your email
          </p>
          <h1 className="font-bold text-4xl tracking-tight">
            Check your inbox
          </h1>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800 text-sm">
          We sent a confirmation link to the email address you used to sign up.
          Open that link to finish creating your account.
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <Link className="font-semibold text-emerald-700" to="/login">
            Go to login
          </Link>
          <Link className="text-stone-500" to="/signup">
            Use another email
          </Link>
        </div>
      </section>
    </main>
  );
}
