import { useForm } from '@tanstack/react-form';

import type { RecipeFormValues } from '../recipes.schema';

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
        await onSubmit(value);
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
