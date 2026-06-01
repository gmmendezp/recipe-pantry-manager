import { LinkButton } from '../../../components/ui/button';

export function MissingPantryItem() {
  return (
    <section className="rounded-2xl border border-border bg-paper p-8 text-center shadow-sm">
      <h1 className="font-bold text-3xl tracking-tight">
        Pantry item not found
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-muted">
        This pantry item does not exist or you do not have access to it.
      </p>
      <LinkButton className="mt-6" to="/pantry">
        Back to pantry
      </LinkButton>
    </section>
  );
}
