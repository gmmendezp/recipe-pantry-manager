import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_protected/pantry/')({
  component: PantryPage,
});

function PantryPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="font-medium text-emerald-700 text-sm uppercase tracking-[0.25em]">
          Pantry mode
        </p>
        <h1 className="font-bold text-4xl tracking-tight">Pantry</h1>
        <p className="max-w-2xl text-stone-600">
          Track ingredients already at home so generated grocery lists can
          separate what you need from what you have.
        </p>
      </header>
      <section className="rounded-3xl border border-dashed border-stone-300 bg-white p-8 text-center">
        <h2 className="font-semibold text-2xl">No pantry items yet</h2>
        <p className="mx-auto mt-3 max-w-xl text-stone-600">
          The pantry CRUD flow and ingredient normalization helper will plug in
          here.
        </p>
      </section>
    </div>
  );
}
