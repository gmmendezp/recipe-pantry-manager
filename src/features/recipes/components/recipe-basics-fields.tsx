import { useState } from 'react';

import { TextAreaField, TextField } from '#/components/ui/fields';
import { Panel } from '#/components/ui/panel';
import type { RecipeFormApi } from '../form/use-recipe-form';
import { validateRecipeImageFile } from '../images/recipe-image-storage';

type RecipeBasicsFieldsProps = {
  clearPendingImage: () => void;
  form: RecipeFormApi;
  pendingImagePreviewUrl: string | null;
  setPendingImage: (file: File) => void;
};

export function RecipeBasicsFields({
  clearPendingImage,
  form,
  pendingImagePreviewUrl,
  setPendingImage,
}: RecipeBasicsFieldsProps) {
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  return (
    <Panel>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <form.Field
            name="title"
            validators={{
              onChange: ({ value }) =>
                value.trim() ? undefined : 'Recipe title is required.',
            }}
          >
            {(field) => (
              <TextField
                errors={field.state.meta.errors}
                label="Title"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                required
                value={field.state.value}
              />
            )}
          </form.Field>
        </div>

        <div className="md:col-span-2">
          <form.Field name="description">
            {(field) => (
              <TextAreaField
                label="Description"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                value={field.state.value}
              />
            )}
          </form.Field>
        </div>

        <div className="md:col-span-2">
          <form.Field name="imageUrl">
            {(field) => (
              <div className="space-y-4 rounded-2xl border border-border bg-paper/60 p-4">
                <div className="space-y-1">
                  <p className="font-medium text-foreground text-sm">
                    Recipe image
                  </p>
                  <p className="text-muted text-sm">
                    Paste an image URL or upload one from your device. Both set
                    the same recipe image.
                  </p>
                </div>

                {pendingImagePreviewUrl || field.state.value ? (
                  <div className="space-y-3">
                    <img
                      alt="Recipe preview"
                      className="h-48 w-full rounded-2xl border border-border object-cover md:w-96"
                      src={pendingImagePreviewUrl ?? field.state.value}
                    />
                    <button
                      className="font-semibold text-primary text-sm hover:text-primary-hover cursor-pointer"
                      onClick={() => {
                        clearPendingImage();
                        field.handleChange('');
                        setImageUploadError(null);
                      }}
                      type="button"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-border border-dashed bg-background text-muted text-sm md:w-96">
                    No image selected
                  </div>
                )}

                <TextField
                  label="Image URL"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={(value) => {
                    clearPendingImage();
                    field.handleChange(value);
                  }}
                  placeholder="https://example.com/recipe-image.jpg"
                  type="url"
                  value={field.state.value}
                />

                <div className="flex items-center gap-3 text-muted text-sm">
                  <span className="h-px flex-1 bg-border" />
                  <span>or</span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <label className="block space-y-2">
                  <span className="font-medium text-foreground text-sm">
                    Upload from device
                  </span>
                  <input
                    accept="image/jpeg,image/png,image/webp"
                    className="w-full rounded-xl border border-border bg-paper px-4 py-3 text-sm outline-none transition file:mr-4 file:rounded-full file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-paper focus:border-primary focus:ring-2 focus:ring-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
                    onChange={async (event) => {
                      const file = event.target.files?.[0];

                      if (!file) return;

                      setImageUploadError(null);

                      try {
                        validateRecipeImageFile(file);
                        setPendingImage(file);
                      } catch (error) {
                        setImageUploadError(
                          error instanceof Error
                            ? error.message
                            : 'Unable to upload recipe image.',
                        );
                      } finally {
                        event.target.value = '';
                      }
                    }}
                    type="file"
                  />
                </label>

                <p className="text-muted text-sm">
                  Uploading replaces the image URL with the uploaded file URL.
                  JPG, PNG, or WebP. Max 5MB.
                </p>

                {imageUploadError ? (
                  <p className="text-red-700 text-sm">{imageUploadError}</p>
                ) : null}
              </div>
            )}
          </form.Field>
        </div>

        <div className="md:col-span-2">
          <form.Field name="sourceUrl">
            {(field) => (
              <TextField
                label="Source URL"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                placeholder="https://example.com/recipe"
                type="url"
                value={field.state.value}
              />
            )}
          </form.Field>
        </div>

        <form.Field
          name="prepTime"
          validators={{
            onChange: ({ value }) => validateOptionalPositiveInteger(value),
          }}
        >
          {(field) => (
            <TextField
              errors={field.state.meta.errors}
              label="Prep time"
              min="1"
              name={field.name}
              onBlur={field.handleBlur}
              onChange={field.handleChange}
              placeholder="Minutes"
              type="number"
              value={field.state.value}
            />
          )}
        </form.Field>

        <form.Field
          name="cookTime"
          validators={{
            onChange: ({ value }) => validateOptionalPositiveInteger(value),
          }}
        >
          {(field) => (
            <TextField
              errors={field.state.meta.errors}
              label="Cook time"
              min="1"
              name={field.name}
              onBlur={field.handleBlur}
              onChange={field.handleChange}
              placeholder="Minutes"
              type="number"
              value={field.state.value}
            />
          )}
        </form.Field>

        <form.Field
          name="servings"
          validators={{
            onChange: ({ value }) => validateOptionalPositiveInteger(value),
          }}
        >
          {(field) => (
            <TextField
              errors={field.state.meta.errors}
              label="Servings"
              min="1"
              name={field.name}
              onBlur={field.handleBlur}
              onChange={field.handleChange}
              placeholder="Servings"
              type="number"
              value={field.state.value}
            />
          )}
        </form.Field>
      </div>
    </Panel>
  );
}

function validateOptionalPositiveInteger(value: string) {
  if (!value) return undefined;

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1)
    return 'Enter a positive whole number.';
}
