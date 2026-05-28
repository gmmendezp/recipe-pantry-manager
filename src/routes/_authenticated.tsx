import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from '@tanstack/react-router';
import { useState } from 'react';

import { getAuthErrorMessage } from '../lib/auth/errors';
import { getCurrentUserForRoute, logout } from '../lib/auth/functions';
import { getLoginRedirectOrDefault } from '../lib/auth/redirects';

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUserForRoute();

    if (!user) {
      throw redirect({
        search: {
          redirect: getLoginRedirectOrDefault(location.pathname),
        },
        to: '/login',
      });
    }
  },
  component: AuthenticatedLayout,
});

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Recipes', to: '/recipes' },
  { label: 'Pantry', to: '/pantry' },
  { label: 'Grocery Lists', to: '/grocery-lists' },
] as const;

function AuthenticatedLayout() {
  const navigate = Route.useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function handleLogout() {
    setLogoutError(null);
    setIsLoggingOut(true);

    try {
      await logout();
      await navigate({ to: '/login' });
    } catch (error) {
      setLogoutError(
        getAuthErrorMessage(error, 'Unable to log out. Please try again.'),
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <header className="border-stone-200 border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <Link className="font-bold text-xl tracking-tight" to="/dashboard">
            Recipe Pantry Manager
          </Link>
          <div className="flex flex-col gap-3 sm:items-end">
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => (
                <Link
                  activeProps={{
                    className: 'bg-emerald-700 text-white',
                  }}
                  className="rounded-full px-4 py-2 font-medium text-sm text-stone-700 transition hover:bg-stone-100"
                  key={item.to}
                  to={item.to}
                >
                  {item.label}
                </Link>
              ))}
              <button
                className="rounded-full border border-stone-300 px-4 py-2 font-medium text-sm text-stone-700 transition hover:border-stone-950 disabled:cursor-not-allowed disabled:border-stone-200 disabled:text-stone-400"
                disabled={isLoggingOut}
                onClick={handleLogout}
                type="button"
              >
                {isLoggingOut ? 'Logging out...' : 'Log out'}
              </button>
            </nav>
            {logoutError ? (
              <p className="text-red-700 text-sm">{logoutError}</p>
            ) : null}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
