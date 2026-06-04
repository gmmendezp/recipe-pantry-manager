import { useState } from 'react';

import { Button, LinkButton } from '../../../components/ui/button';
import { FormError } from '../../../components/ui/form-error';
import {
  createEmptyRecipeFormValues,
  type RecipeFormValues,
} from '../recipes.schema';
import { useRecipeForm } from '../use-recipe-form';
import { RecipeBasicsFields } from './recipe-basics-fields';
import { RecipeIngredientsFields } from './recipe-ingredients-fields';
import { RecipeStepsFields } from './recipe-steps-fields';

type RecipeFormProps = {
  cancelTo: '/recipes' | '/recipes/$recipeId';
  cancelParams?: { recipeId: string };
  defaultValues?: RecipeFormValues;
  onSubmit: (values: RecipeFormValues) => Promise<void>;
};

export function RecipeForm({
  cancelParams,
  cancelTo,
  defaultValues = createEmptyRecipeFormValues(),
  onSubmit,
}: RecipeFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useRecipeForm({
    defaultValues,
    onSubmit,
    setSubmitError,
  });

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
      <RecipeBasicsFields form={form} />
      <RecipeIngredientsFields form={form} />
      <RecipeStepsFields form={form} />

      {submitError ? <FormError>{submitError}</FormError> : null}

      <div className="flex flex-wrap gap-3">
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          )}
        </form.Subscribe>
        {cancelTo === '/recipes/$recipeId' && cancelParams ? (
          <LinkButton params={cancelParams} to={cancelTo} variant="secondary">
            Cancel
          </LinkButton>
        ) : (
          <LinkButton to="/recipes" variant="secondary">
            Cancel
          </LinkButton>
        )}
      </div>
    </form>
  );
}
