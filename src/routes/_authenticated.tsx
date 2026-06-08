import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouterState,
} from '@tanstack/react-router';
import { LoaderCircle, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { getAuthErrorMessage } from '#/lib/auth/errors';
import { getCurrentUserForRoute, logout } from '#/lib/auth/functions';
import { getLoginRedirectOrDefault } from '#/lib/auth/redirects';

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

function normalizePath(path: string) {
  return path !== '/' && path.endsWith('/') ? path.slice(0, -1) : path;
}

function AuthenticatedLayout() {
  const navigate = Route.useNavigate();
  const routerState = useRouterState({
    select: (state) => ({
      pathname: state.location.pathname,
      status: state.status,
    }),
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  useEffect(() => {
    if (
      pendingPath &&
      routerState.status === 'idle' &&
      normalizePath(routerState.pathname) === normalizePath(pendingPath)
    ) {
      setPendingPath(null);
    }
  }, [pendingPath, routerState.pathname, routerState.status]);

  function handleNavigationClick(path: string) {
    if (normalizePath(path) === normalizePath(routerState.pathname)) {
      setPendingPath(null);
    } else {
      setPendingPath(path);
    }
  }

  async function handleLogout() {
    setLogoutError(null);
    setIsLoggingOut(true);

    try {
      await logout();
      setPendingPath(null);
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-border border-b bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center justify-between gap-4">
            <Link
              className="font-bold text-xl tracking-tight"
              onClick={() => handleNavigationClick('/dashboard')}
              to="/dashboard"
            >
              Recipe Pantry Manager
            </Link>
            <button
              aria-controls="authenticated-navigation"
              aria-expanded={isMenuOpen}
              aria-label={
                isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
              }
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition hover:border-foreground hover:text-foreground md:hidden"
              onClick={() => setIsMenuOpen((current) => !current)}
              type="button"
            >
              {isMenuOpen ? (
                <X aria-hidden="true" className="h-5 w-5" />
              ) : (
                <Menu aria-hidden="true" className="h-5 w-5" />
              )}
            </button>
          </div>
          <div
            className={`${isMenuOpen ? 'flex' : 'hidden'} mt-4 flex-col gap-3 md:mt-0 md:flex md:items-end`}
            id="authenticated-navigation"
          >
            <nav className="flex flex-col gap-2 md:flex-row md:flex-wrap">
              {navItems.map((item) => (
                <Link
                  activeProps={{
                    className: 'bg-primary text-paper',
                  }}
                  className={`inline-flex items-center justify-between gap-2 rounded-full px-4 py-2 font-medium text-muted text-sm transition hover:bg-primary-soft hover:text-primary-hover ${pendingPath === item.to ? 'pointer-events-none opacity-70' : ''}`}
                  key={item.to}
                  onClick={() => handleNavigationClick(item.to)}
                  to={item.to}
                >
                  <span>{item.label}</span>
                  {pendingPath === item.to ? (
                    <LoaderCircle
                      aria-hidden="true"
                      className="h-3.5 w-3.5 animate-spin"
                    />
                  ) : null}
                </Link>
              ))}
              <button
                className="rounded-full border border-border px-4 py-2 font-medium text-muted text-sm transition hover:border-foreground disabled:cursor-not-allowed disabled:border-border disabled:text-muted/60 cursor-pointer"
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
