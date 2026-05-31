import { LinkButton } from '../../../components/ui/button';

export function MissingRecipe() {
  return (
    <section className="rounded-2xl border border-border bg-paper p-8 text-center shadow-sm">
      <h1 className="font-bold text-3xl tracking-tight">Recipe not found</h1>
      <p className="mx-auto mt-3 max-w-xl text-muted">
        This recipe may have been deleted or belongs to another account.
      </p>
      <LinkButton className="mt-6" to="/recipes">
        Back to recipes
      </LinkButton>
    </section>
  );
}
