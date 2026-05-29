import { createFileRoute, Link } from '@tanstack/react-router';

import { Route as RootRoute } from './__root';

export const Route = createFileRoute('/')({ component: Home });

function Home() {
  const { user } = RootRoute.useRouteContext();

  return (
    <div className="min-h-screen bg-background px-6 py-16 text-foreground">
      <main className="mx-auto flex max-w-4xl flex-col gap-8">
        <p className="font-medium text-accent text-sm uppercase tracking-[0.25em]">
          Recipe Pantry Manager
        </p>
        <section className="space-y-6">
          <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl">
            Plan recipes, track pantry items, and build smarter grocery lists.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-muted">
            Save the meals you want to cook, compare ingredients against what
            you already have, and see exactly what still needs to be bought.
          </p>
        </section>
        <div className="flex flex-wrap gap-3">
          {user ? (
            <Link
              className="rounded-full bg-primary px-5 py-3 font-semibold text-paper transition hover:bg-primary-hover"
              to="/dashboard"
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                className="rounded-full bg-primary px-5 py-3 font-semibold text-paper transition hover:bg-primary-hover"
                to="/signup"
              >
                Create account
              </Link>
              <Link
                className="rounded-full border border-border px-5 py-3 font-semibold transition hover:border-foreground"
                to="/login"
              >
                Log in
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
