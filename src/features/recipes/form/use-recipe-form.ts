import { useForm } from '@tanstack/react-form';

import {
  capitalizeIngredientName,
  type RecipeFormValues,
} from '../recipes.schema';

type UseRecipeFormOptions = {
  defaultValues: RecipeFormValues;
  onSubmit: (values: RecipeFormValues) => Promise<void>;
  setSubmitError: (value: string | null) => void;
};

export function useRecipeForm({
  defaultValues,
  onSubmit,
  setSubmitError,
}: UseRecipeFormOptions) {
  return useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      setSubmitError(null);

      try {
        await onSubmit(normalizeRecipeFormValuesForSubmit(value));
      } catch (error) {
        setSubmitError(
          error instanceof Error
            ? error.message
            : 'Unable to save recipe. Please try again.',
        );
      }
    },
  });
}

export type RecipeFormApi = ReturnType<typeof useRecipeForm>;

function normalizeRecipeFormValuesForSubmit(
  values: RecipeFormValues,
): RecipeFormValues {
  return {
    ...values,
    ingredients: values.ingredients.map((ingredient) => ({
      ...ingredient,
      name: capitalizeIngredientName(ingredient.name),
    })),
  };
}
