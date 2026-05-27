import { createFileRoute, Link, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected')({
  component: ProtectedLayout,
});

const navItems = [
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'Recipes', to: '/recipes' },
  { label: 'Pantry', to: '/pantry' },
  { label: 'Grocery Lists', to: '/grocery-lists' },
] as const;

function ProtectedLayout() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-950">
      <header className="border-stone-200 border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <Link className="font-bold text-xl tracking-tight" to="/dashboard">
            Recipe Pantry Manager
          </Link>
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
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
