import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/login')({
  component: LoginPage,
  validateSearch: (search) => ({
    redirect: sanitizeRedirect(search.redirect),
  }),
});

function sanitizeRedirect(value: unknown) {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//')
  ) {
    return '/dashboard';
  }

  return value;
}

function LoginPage() {
  return (
    <main className="min-h-screen bg-stone-50 px-6 py-16 text-stone-950">
      <section className="mx-auto flex max-w-md flex-col gap-8 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
        <div className="space-y-3">
          <p className="font-medium text-emerald-700 text-sm uppercase tracking-[0.25em]">
            Welcome back
          </p>
          <h1 className="font-bold text-4xl tracking-tight">Log in</h1>
          <p className="text-stone-600">
            Authentication will be connected in the next phase. This page is
            ready for the Supabase login form.
          </p>
        </div>
        <div className="rounded-2xl border border-dashed border-stone-300 p-6 text-stone-500">
          Login form placeholder
        </div>
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
