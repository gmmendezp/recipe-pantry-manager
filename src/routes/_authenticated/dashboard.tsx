import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/dashboard')({
  component: DashboardPage,
});

const stats = [
  { label: 'Saved recipes', value: '0' },
  { label: 'Pantry items', value: '0' },
  { label: 'Grocery lists', value: '0' },
] as const;

function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="rounded-3xl bg-emerald-800 p-8 text-white">
        <p className="font-medium text-emerald-100 text-sm uppercase tracking-[0.25em]">
          Dashboard
        </p>
        <h1 className="mt-4 max-w-2xl font-bold text-4xl tracking-tight">
          Build your recipe-to-grocery workflow here.
        </h1>
        <p className="mt-4 max-w-2xl text-emerald-50">
          The next phases will connect these cards to Supabase data. For now,
          the app shell is ready for recipes, pantry items, and grocery lists.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm"
            key={stat.label}
          >
            <p className="text-stone-500 text-sm">{stat.label}</p>
            <p className="mt-2 font-bold text-3xl">{stat.value}</p>
          </div>
        ))}
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        <QuickAction
          description="Create and manage meals you want to cook."
          label="Recipes"
          to="/recipes"
        />
        <QuickAction
          description="Track ingredients you already have at home."
          label="Pantry"
          to="/pantry"
        />
        <QuickAction
          description="Generate shopping lists from selected recipes."
          label="Grocery Lists"
          to="/grocery-lists"
        />
      </section>
    </div>
  );
}

function QuickAction({
  description,
  label,
  to,
}: {
  description: string;
  label: string;
  to: '/recipes' | '/pantry' | '/grocery-lists';
}) {
  return (
    <Link
      className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
      to={to}
    >
      <h2 className="font-semibold text-xl">{label}</h2>
      <p className="mt-2 text-stone-600">{description}</p>
    </Link>
  );
}
