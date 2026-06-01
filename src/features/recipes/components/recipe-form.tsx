import { useForm } from '@tanstack/react-form';
import { useState } from 'react';

import { Button, LinkButton } from '../../../components/ui/button';
import { TextAreaField, TextField } from '../../../components/ui/fields';
import { FormError } from '../../../components/ui/form-error';
import { Panel } from '../../../components/ui/panel';
import {
  createEmptyIngredient,
  createEmptyRecipeFormValues,
  createEmptyStep,
  type RecipeFormValues,
} from '../recipes.schema';

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

  const form = useForm({
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

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
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

      <form.Subscribe selector={(state) => state.values.ingredients}>
        {(ingredients) => (
          <Panel className="space-y-4">
            <SectionHeader
              actionLabel="Add ingredient"
              onAction={() => {
                form.pushFieldValue('ingredients', createEmptyIngredient());
              }}
              title="Ingredients"
            />

            <div className="hidden grid-cols-[1fr_8rem_8rem_1fr_6rem] gap-4 border-border border-b pb-2 font-semibold text-muted text-sm md:grid">
              <span>Name</span>
              <span>Qty</span>
              <span>Unit</span>
              <span>Category</span>
              <span className="sr-only">Actions</span>
            </div>

            <div>
              {ingredients.map((ingredient, index) => (
                <div
                  className="grid gap-4 border-border border-t py-4 first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[1fr_8rem_8rem_1fr_6rem]"
                  key={ingredient.clientId}
                >
                  <form.Field
                    name={`ingredients[${index}].name`}
                    validators={{
                      onChange: ({ value }) =>
                        value.trim()
                          ? undefined
                          : 'Ingredient name is required.',
                    }}
                  >
                    {(field) => (
                      <TextField
                        errors={field.state.meta.errors}
                        label="Name"
                        labelClassName="md:sr-only"
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        required
                        value={field.state.value}
                      />
                    )}
                  </form.Field>
                  <form.Field name={`ingredients[${index}].quantity`}>
                    {(field) => (
                      <TextField
                        label="Quantity"
                        labelClassName="md:sr-only"
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        value={field.state.value}
                      />
                    )}
                  </form.Field>
                  <form.Field name={`ingredients[${index}].unit`}>
                    {(field) => (
                      <TextField
                        label="Unit"
                        labelClassName="md:sr-only"
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        value={field.state.value}
                      />
                    )}
                  </form.Field>
                  <form.Field name={`ingredients[${index}].category`}>
                    {(field) => (
                      <TextField
                        label="Category"
                        labelClassName="md:sr-only"
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        value={field.state.value}
                      />
                    )}
                  </form.Field>
                  <div className="flex items-end">
                    <Button
                      disabled={ingredients.length === 1}
                      onClick={() => {
                        void form.removeFieldValue('ingredients', index);
                      }}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </form.Subscribe>

      <form.Subscribe selector={(state) => state.values.steps}>
        {(steps) => (
          <Panel className="space-y-4">
            <SectionHeader
              actionLabel="Add step"
              onAction={() => {
                form.pushFieldValue('steps', createEmptyStep());
              }}
              title="Instructions"
            />

            <div>
              {steps.map((step, index) => (
                <div
                  className="grid gap-4 border-border border-t py-4 first:border-t-0 first:pt-0 last:pb-0 md:grid-cols-[auto_1fr_auto]"
                  key={step.clientId}
                >
                  <div className="pt-9 font-bold text-muted text-sm">
                    {index + 1}
                  </div>
                  <form.Field
                    name={`steps[${index}].instruction`}
                    validators={{
                      onChange: ({ value }) =>
                        value.trim() ? undefined : 'Instruction is required.',
                    }}
                  >
                    {(field) => (
                      <TextAreaField
                        errors={field.state.meta.errors}
                        label="Instruction"
                        name={field.name}
                        onBlur={field.handleBlur}
                        onChange={field.handleChange}
                        required
                        value={field.state.value}
                      />
                    )}
                  </form.Field>
                  <div className="flex items-end">
                    <Button
                      disabled={steps.length === 1}
                      onClick={() => {
                        void form.removeFieldValue('steps', index);
                      }}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        )}
      </form.Subscribe>

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

function SectionHeader({
  actionLabel,
  onAction,
  title,
}: {
  actionLabel: string;
  onAction: () => void;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h2 className="font-semibold text-2xl">{title}</h2>
      <Button
        className="text-primary hover:border-primary"
        onClick={onAction}
        size="sm"
        type="button"
        variant="secondary"
      >
        {actionLabel}
      </Button>
    </div>
  );
}

function validateOptionalPositiveInteger(value: string) {
  if (!value) return undefined;

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1)
    return 'Enter a positive whole number.';
}
