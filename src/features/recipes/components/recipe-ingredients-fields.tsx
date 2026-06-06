import { Button } from '../../../components/ui/button';
import { TextField } from '../../../components/ui/fields';
import { Panel } from '../../../components/ui/panel';
import type { RecipeFormApi } from '../form/use-recipe-form';
import { createEmptyIngredient } from '../recipes.schema';
import { RecipeFormSectionHeader } from './recipe-form-section-header';

type RecipeIngredientsFieldsProps = {
  form: RecipeFormApi;
};

export function RecipeIngredientsFields({
  form,
}: RecipeIngredientsFieldsProps) {
  return (
    <form.Subscribe selector={(state) => state.values.ingredients}>
      {(ingredients) => (
        <Panel className="space-y-4">
          <RecipeFormSectionHeader
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
                      value.trim() ? undefined : 'Ingredient name is required.',
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
  );
}
