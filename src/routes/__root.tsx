import { TanStackDevtools } from '@tanstack/react-devtools';
import {
  createRootRoute,
  HeadContent,
  Link,
  Scripts,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { getCurrentUserForRoute } from '../lib/auth/functions';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
  beforeLoad: async () => ({
    user: await getCurrentUserForRoute(),
  }),
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Recipe Pantry Manager',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
});

function NotFoundPage() {
  const { user } = Route.useRouteContext();

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <section className="mx-auto flex max-w-md flex-col gap-8 rounded-3xl border border-border bg-paper p-8 shadow-sm">
        <div className="space-y-3">
          <p className="font-medium text-accent text-sm uppercase tracking-[0.25em]">
            404
          </p>
          <h1 className="font-bold text-4xl tracking-tight">Page not found</h1>
          <p className="text-muted">
            {`This page does not exist or may have been moved. ${
              user
                ? 'Head back to your dashboard to continue planning recipes and grocery lists.'
                : 'Sign in to continue planning recipes and grocery lists.'
            }`}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            className="rounded-full bg-primary px-5 py-3 font-semibold text-paper transition hover:bg-primary-hover"
            to={user ? '/dashboard' : '/'}
          >
            {user ? 'Go to dashboard' : 'Go home'}
          </Link>
          {user ? (
            <Link
              className="rounded-full border border-border px-5 py-3 font-semibold transition hover:border-foreground"
              to="/"
            >
              Go home
            </Link>
          ) : (
            <>
              <Link
                className="rounded-full border border-border px-5 py-3 font-semibold transition hover:border-foreground"
                to="/login"
              >
                Log in
              </Link>
              <Link
                className="rounded-full border border-border px-5 py-3 font-semibold transition hover:border-foreground"
                to="/signup"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
