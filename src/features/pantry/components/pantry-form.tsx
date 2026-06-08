import { useForm } from '@tanstack/react-form';
import { useState } from 'react';

import { Button, LinkButton } from '#/components/ui/button';
import { TextAreaField, TextField } from '#/components/ui/fields';
import { FormError } from '#/components/ui/form-error';
import { Panel } from '#/components/ui/panel';
import {
  createEmptyPantryFormValues,
  type PantryFormValues,
} from '../pantry.schema';

type PantryFormProps = {
  cancelParams?: { pantryItemId: string };
  cancelTo: '/pantry' | '/pantry/$pantryItemId';
  defaultValues?: PantryFormValues;
  onSubmit: (values: PantryFormValues) => Promise<void>;
};

export function PantryForm({
  cancelParams,
  cancelTo,
  defaultValues = createEmptyPantryFormValues(),
  onSubmit,
}: PantryFormProps) {
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
            : 'Unable to save pantry item. Please try again.',
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
              name="name"
              validators={{
                onChange: ({ value }) =>
                  value.trim() ? undefined : 'Pantry item name is required.',
              }}
            >
              {(field) => (
                <TextField
                  errors={field.state.meta.errors}
                  label="Name"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  required
                  value={field.state.value}
                />
              )}
            </form.Field>
          </div>

          <form.Field name="quantity">
            {(field) => (
              <TextField
                label="Quantity"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                placeholder="Optional"
                value={field.state.value}
              />
            )}
          </form.Field>

          <form.Field name="unit">
            {(field) => (
              <TextField
                label="Unit"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                placeholder="cups, cans, lb"
                value={field.state.value}
              />
            )}
          </form.Field>

          <div className="md:col-span-2">
            <form.Field name="category">
              {(field) => (
                <TextField
                  label="Category"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  placeholder="Produce, pantry, dairy"
                  value={field.state.value}
                />
              )}
            </form.Field>
          </div>

          <div className="md:col-span-2">
            <form.Field name="notes">
              {(field) => (
                <TextAreaField
                  label="Notes"
                  name={field.name}
                  onBlur={field.handleBlur}
                  onChange={field.handleChange}
                  value={field.state.value}
                />
              )}
            </form.Field>
          </div>
        </div>
      </Panel>

      {submitError ? <FormError>{submitError}</FormError> : null}

      <div className="flex flex-wrap gap-3">
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          )}
        </form.Subscribe>
        {cancelTo === '/pantry/$pantryItemId' && cancelParams ? (
          <LinkButton params={cancelParams} to={cancelTo} variant="secondary">
            Cancel
          </LinkButton>
        ) : (
          <LinkButton to="/pantry" variant="secondary">
            Cancel
          </LinkButton>
        )}
      </div>
    </form>
  );
}
