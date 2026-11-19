import { createFileRoute } from '@tanstack/react-router';

import { LoginPage } from '#/features/auth/components/login-page';
import { getDemoAccountAvailability } from '#/lib/auth/functions';
import { getLoginRedirect, type LoginRedirect } from '#/lib/auth/redirects';

export const Route = createFileRoute('/login')({
  component: LoginRoute,
  loader: () => getDemoAccountAvailability(),
  validateSearch: (search): { redirect?: LoginRedirect } => {
    const redirect = getLoginRedirect(search.redirect);

    return redirect ? { redirect } : {};
  },
});

function LoginRoute() {
  const isDemoAccountAvailable = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const { redirect = '/dashboard' } = Route.useSearch();

  return (
    <LoginPage
      isDemoAccountAvailable={isDemoAccountAvailable}
      onLoginSuccess={() => navigate({ to: redirect })}
    />
  );
}
