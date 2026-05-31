import { createFileRoute } from '@tanstack/react-router';

import { PageHeader } from '../../../components/layout/page-header';

export const Route = createFileRoute('/_authenticated/pantry/')({
  component: PantryPage,
});

function PantryPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        description="Track ingredients already at home so generated grocery lists can separate what you need from what you have."
        eyebrow="Pantry mode"
        title="Pantry"
      />
      <section className="rounded-2xl border border-border border-dashed bg-paper p-8 text-center">
        <h2 className="font-semibold text-2xl">No pantry items yet</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          The pantry CRUD flow and ingredient normalization helper will plug in
          here.
        </p>
      </section>
    </div>
  );
}
