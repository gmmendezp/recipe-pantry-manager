import clsx from 'clsx';
import { Button } from '#/components/ui/button';
import { TextAreaField } from '#/components/ui/fields';
import { Panel } from '#/components/ui/panel';
import { SortableList } from '#/components/ui/sortable-list';
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
            <SortableList
              getItemId={(step) => step.clientId}
              items={steps}
              onReorder={(nextSteps) => {
                form.setFieldValue('steps', nextSteps);
              }}
              renderItem={({ DragHandle, index }) => (
                <div
                  className={clsx(
                    'border-border border-t grid gap-x-3 gap-y-4 md:grid-cols-[auto_auto_1fr_auto] pt-4',
                    index > 0 && 'mt-4',
                  )}
                >
                  <DragHandle
                    className="md:pt-1"
                    label={`Reorder step ${index + 1}`}
                  />
                  <div className="flex h-10 items-center font-bold text-muted text-sm">
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
                        labelClassName="sr-only"
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
              )}
            />
          </div>
        </Panel>
      )}
    </form.Subscribe>
  );
}
