import { MissingResource } from '#/components/ui/missing-resource';

export function MissingPantryItem() {
  return (
    <MissingResource
      backLabel="Back to pantry"
      message="This pantry item does not exist or you do not have access to it."
      title="Pantry item not found"
      to="/pantry"
    />
  );
}
