import { MissingResource } from '../../../components/ui/missing-resource';

export function MissingRecipe() {
  return (
    <MissingResource
      backLabel="Back to recipes"
      message="This recipe may have been deleted or belongs to another account."
      title="Recipe not found"
      to="/recipes"
    />
  );
}
