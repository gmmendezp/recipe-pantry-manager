import { TextAreaField, TextField } from '../../../components/ui/fields';
import { Panel } from '../../../components/ui/panel';
import type { RecipeFormApi } from '../use-recipe-form';

type RecipeBasicsFieldsProps = {
  form: RecipeFormApi;
};

export function RecipeBasicsFields({ form }: RecipeBasicsFieldsProps) {
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
              <TextField
                label="Image URL"
                name={field.name}
                onBlur={field.handleBlur}
                onChange={field.handleChange}
                placeholder="https://example.com/recipe-image.jpg"
                type="url"
                value={field.state.value}
              />
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
