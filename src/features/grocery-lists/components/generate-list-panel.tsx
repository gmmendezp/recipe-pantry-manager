import { useState } from 'react';
import { FilterBar, FilterSelect } from '#/components/ui/filter-bar';
import { Button, LinkButton } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/empty-state';
import { FormError } from '../../../components/ui/form-error';
import { Panel } from '../../../components/ui/panel';
import { useFilteredList } from '../../../hooks/use-filtered-list';
import { getAuthErrorMessage } from '../../../lib/auth/errors';
import { formatCount } from '../../../lib/format';
import {
  matchesRecipeTimeFilter,
  type RecipeTimeFilter,
  recipeTimeFilterOptions,
} from '../../recipes/recipe-filters';
import type { RecipeListItem } from '../../recipes/recipes.schema';
import { generateGroceryList } from '../grocery-lists.functions';

type GenerateListPanelProps = {
  onGenerated: (groceryListId: string) => Promise<void> | void;
  recipes: RecipeListItem[];
};

export function GenerateListPanel({
  onGenerated,
  recipes,
}: GenerateListPanelProps) {
  const [recipeSearchQuery, setRecipeSearchQuery] = useState('');
  const [recipeTimeFilter, setRecipeTimeFilter] =
    useState<RecipeTimeFilter>('all');
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const filteredRecipes = useFilteredList(recipes, {
    filters: [(recipe) => matchesRecipeTimeFilter(recipe, recipeTimeFilter)],
    searchFields: (recipe) => [recipe.title, recipe.description],
    searchQuery: recipeSearchQuery,
  });

  function toggleRecipe(recipeId: string) {
    setSelectedRecipeIds((current) =>
      current.includes(recipeId)
        ? current.filter((id) => id !== recipeId)
        : [...current, recipeId],
    );
  }

  async function handleSubmit(
    event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const list = await generateGroceryList({
        data: { recipeIds: selectedRecipeIds, title },
      });
      await onGenerated(list.id);
    } catch (generationError) {
      setError(
        getAuthErrorMessage(
          generationError,
          'Unable to generate grocery list. Please try again.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Panel>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <h2 className="font-semibold text-2xl">Generate a list</h2>
          <p className="mt-2 text-muted">
            Pick one or more saved recipes. Pantry matches are moved into a
            separate section on the generated list.
          </p>
        </div>

        <label className="block space-y-2">
          <span className="font-medium text-foreground text-sm">
            List title
          </span>
          <input
            className="w-full rounded-xl border border-border bg-paper px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-soft"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Optional"
            value={title}
          />
        </label>

        {recipes.length > 0 ? (
          <div className="space-y-4">
            <FilterBar
              onSearchChange={setRecipeSearchQuery}
              searchLabel="Search recipes"
              searchPlaceholder="Search by title or description"
              searchValue={recipeSearchQuery}
              variant="secondary"
            >
              <FilterSelect
                label="Time"
                onChange={setRecipeTimeFilter}
                options={recipeTimeFilterOptions}
                value={recipeTimeFilter}
              />
            </FilterBar>

            {filteredRecipes.length > 0 ? (
              <>
                <div className="flex flex-col gap-2 text-muted text-sm sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    {formatCount(selectedRecipeIds.length, 'recipe')} selected
                  </p>
                  <p>
                    {formatCount(filteredRecipes.length, 'matching recipe')}
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {filteredRecipes.map((recipe) => (
                    <label
                      className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background/40 p-4 transition hover:border-primary"
                      key={recipe.id}
                    >
                      <input
                        checked={selectedRecipeIds.includes(recipe.id)}
                        className="mt-1 h-4 w-4 accent-primary"
                        onChange={() => toggleRecipe(recipe.id)}
                        type="checkbox"
                      />
                      <span>
                        <span className="block font-semibold">
                          {recipe.title}
                        </span>
                        <span className="mt-1 block text-muted text-sm">
                          {recipe.description || 'No description'}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <EmptyState title="No recipes match your filters">
                Try a different search or time filter.
              </EmptyState>
            )}
          </div>
        ) : (
          <EmptyState
            action={<LinkButton to="/recipes/new">Create recipe</LinkButton>}
            title="No recipes available"
          >
            Add a recipe before generating a grocery list.
          </EmptyState>
        )}

        {error ? <FormError>{error}</FormError> : null}

        <Button
          disabled={
            isSubmitting ||
            recipes.length === 0 ||
            selectedRecipeIds.length === 0
          }
          type="submit"
        >
          {isSubmitting ? 'Generating...' : 'Generate grocery list'}
        </Button>
      </form>
    </Panel>
  );
}
