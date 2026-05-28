import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/grocery-lists/')({
  component: GroceryListsPage,
});

function GroceryListsPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="font-medium text-emerald-700 text-sm uppercase tracking-[0.25em]">
          Shopping workflow
        </p>
        <h1 className="font-bold text-4xl tracking-tight">Grocery Lists</h1>
        <p className="max-w-2xl text-stone-600">
          Generated grocery lists will compare selected recipe ingredients
          against pantry items and split them into shopping sections.
        </p>
      </header>
      <section className="grid gap-4 md:grid-cols-2">
        <ListSection title="Need to Buy" />
        <ListSection title="Already in Pantry" />
      </section>
    </div>
  );
}

function ListSection({ title }: { title: string }) {
  return (
    <section className="rounded-3xl border border-dashed border-stone-300 bg-white p-8">
      <h2 className="font-semibold text-2xl">{title}</h2>
      <p className="mt-3 text-stone-600">
        Generated grocery list items will appear here.
      </p>
    </section>
  );
}
