import { TanStackDevtools } from '@tanstack/react-devtools';
import { createRootRoute, HeadContent, Scripts } from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

import { CardPage } from '#/components/layout/card-page';
import { LinkButton } from '#/components/ui/button';
import { getCurrentUserForRoute } from '#/lib/auth/functions';
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
      {
        name: 'description',
        content:
          'Full-stack application for saving and importing recipes, managing pantry items, and generating pantry-aware grocery lists.',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:url',
        content: 'https://recipes.gmmendezp.dev/',
      },
      {
        property: 'og:title',
        content: 'Recipe Pantry Manager',
      },
      {
        property: 'og:description',
        content:
          'Save and import recipes, manage pantry items, and generate grocery lists based on ingredients already on hand.',
      },
      {
        property: 'og:image',
        content: 'https://recipes.gmmendezp.dev/og-image.webp',
      },
      {
        property: 'og:image:type',
        content: 'image/webp',
      },
      {
        property: 'og:image:width',
        content: '712',
      },
      {
        property: 'og:image:height',
        content: '400',
      },
      {
        property: 'og:image:alt',
        content: 'Recipe Pantry Manager application',
      },
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Recipe Pantry Manager',
      },
      {
        name: 'twitter:description',
        content:
          'Save and import recipes, manage pantry items, and generate pantry-aware grocery lists.',
      },
      {
        name: 'twitter:image',
        content: 'https://recipes.gmmendezp.dev/og-image.webp',
      },
      {
        name: 'twitter:image:alt',
        content: 'Recipe Pantry Manager application',
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
      {
        rel: 'canonical',
        href: 'https://recipes.gmmendezp.dev/',
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
