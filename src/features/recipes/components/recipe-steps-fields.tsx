import { Button } from '../../../components/ui/button';
import { TextAreaField } from '../../../components/ui/fields';
import { Panel } from '../../../components/ui/panel';
import type { RecipeFormApi } from '../form/use-recipe-form';
import { createEmptyStep } from '../recipes.schema';
import { RecipeFormSectionHeader } from './recipe-form-section-header';

type RecipeStepsFieldsProps = {
  form: RecipeFormApi;
};

export function RecipeStepsFields({ form }: RecipeStepsFieldsProps) {
  return (
    <form.Subscribe selector={(state) => state.values.steps}>
      {(steps) => (
        <Panel className="space-y-4">
          <RecipeFormSectionHeader
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
  );
}
