import { createFileRoute } from '@tanstack/react-router';

import { PageHeader } from '../../../components/layout/page-header';

export const Route = createFileRoute('/_authenticated/grocery-lists/')({
  component: GroceryListsPage,
});

function GroceryListsPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        description="Generated grocery lists will compare selected recipe ingredients against pantry items and split them into shopping sections."
        eyebrow="Shopping workflow"
        title="Grocery Lists"
      />
      <section className="grid gap-4 md:grid-cols-2">
        <ListSection title="Need to Buy" />
        <ListSection title="Already in Pantry" />
      </section>
    </div>
  );
}

function ListSection({ title }: { title: string }) {
  return (
    <section className="rounded-2xl border border-border border-dashed bg-paper p-8">
      <h2 className="font-semibold text-2xl">{title}</h2>
      <p className="mt-3 text-muted">
        Generated grocery list items will appear here.
      </p>
    </section>
  );
}
