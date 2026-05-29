import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/recipes/')({
  component: RecipesPage,
});

function RecipesPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        description="Manual recipe creation will be built here first, before URL import."
        title="Recipes"
      />
      <section className="rounded-3xl border border-border border-dashed bg-paper p-8 text-center">
        <h2 className="font-semibold text-2xl">No recipes yet</h2>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Soon this page will list saved recipes and provide the manual recipe
          creation form.
        </p>
      </section>
    </div>
  );
}

function PageHeader({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <header className="space-y-3">
      <p className="font-medium text-accent text-sm uppercase tracking-[0.25em]">
        Recipe collection
      </p>
      <h1 className="font-bold text-4xl tracking-tight">{title}</h1>
      <p className="max-w-2xl text-muted">{description}</p>
    </header>
  );
}
