import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { CardPage } from '../components/layout/card-page';
import { LinkButton } from '../components/ui/button';
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
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
    ],
  }),
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
});

function NotFoundPage() {
  const { user } = Route.useRouteContext();

  return (
    <CardPage>
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
        <LinkButton to={user ? '/dashboard' : '/'}>
          {user ? 'Go to dashboard' : 'Go home'}
        </LinkButton>
        {user ? (
          <LinkButton to="/" variant="secondary">
            Go home
          </LinkButton>
        ) : (
          <>
            <LinkButton to="/login" variant="secondary">
              Log in
            </LinkButton>
            <LinkButton to="/signup" variant="secondary">
              Create account
            </LinkButton>
          </>
        )}
      </div>
    </CardPage>
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
