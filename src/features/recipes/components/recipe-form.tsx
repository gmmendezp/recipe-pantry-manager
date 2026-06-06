import { useEffect, useState } from 'react';

import { Button, LinkButton } from '../../../components/ui/button';
import { FormError } from '../../../components/ui/form-error';
import {
  deleteUploadedRecipeImage,
  uploadRecipeImage,
} from '../recipe-image-upload';
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
  onSubmit: (values: RecipeFormValues) => Promise<unknown>;
  onSuccess?: (result: unknown) => Promise<void>;
};

export function RecipeForm({
  cancelParams,
  cancelTo,
  defaultValues = createEmptyRecipeFormValues(),
  onSubmit,
  onSuccess,
}: RecipeFormProps) {
  const [pendingImage, setPendingImage] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (pendingImage) URL.revokeObjectURL(pendingImage.previewUrl);
    };
  }, [pendingImage]);

  const form = useRecipeForm({
    defaultValues,
    onSubmit: async (values) => {
      if (!pendingImage) {
        const result = await onSubmit(values);
        await onSuccess?.(result);
        return;
      }

      let imageUrl: string | null = null;
      let result: unknown;

      try {
        imageUrl = await uploadRecipeImage(pendingImage.file);
        result = await onSubmit({ ...values, imageUrl });
      } catch (error) {
        if (imageUrl) await deleteUploadedRecipeImage(imageUrl);

        throw error;
      }

      URL.revokeObjectURL(pendingImage.previewUrl);
      setPendingImage(null);
      await onSuccess?.(result);
    },
    setSubmitError,
  });

  function replacePendingImage(file: File) {
    setPendingImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);

      return {
        file,
        previewUrl: URL.createObjectURL(file),
      };
    });
  }

  function clearPendingImage() {
    setPendingImage((current) => {
      if (current) URL.revokeObjectURL(current.previewUrl);

      return null;
    });
  }

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
      <RecipeBasicsFields
        clearPendingImage={clearPendingImage}
        form={form}
        pendingImagePreviewUrl={pendingImage?.previewUrl ?? null}
        setPendingImage={replacePendingImage}
      />
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
