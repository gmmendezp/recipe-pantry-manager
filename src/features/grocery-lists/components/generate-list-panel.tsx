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
import {
  generateReviewedGroceryList,
  previewGroceryListMatches,
} from '../grocery-lists.functions';
import type { GroceryListReview } from '../grocery-lists.schema';
import { MatchReviewPanel, type ReviewedItem } from './match-review-panel';

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
  const [review, setReview] = useState<GroceryListReview | null>(null);
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

  async function handleReviewSubmit(
    event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const groceryListReview = await previewGroceryListMatches({
        data: { recipeIds: selectedRecipeIds, title },
      });
      setReview(groceryListReview);
    } catch (reviewError) {
      setError(
        getAuthErrorMessage(
          reviewError,
          'Unable to review grocery list matches. Please try again.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCreateSubmit(items: ReviewedItem[]) {
    setError(null);
    setIsSubmitting(true);

    try {
      const list = await generateReviewedGroceryList({
        data: {
          items: items.map((item) => ({
            category: item.category,
            name: item.name,
            pantryItemId: item.pantryItemId,
            quantity: item.quantity,
            sourceRecipeIds: item.sourceRecipeIds,
            unit: item.unit,
          })),
          title,
        },
      });
      await onGenerated(list.id);
    } catch (generationError) {
      setError(
        getAuthErrorMessage(
          generationError,
          'Unable to create grocery list. Please try again.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function goBackToRecipes() {
    setError(null);
    setReview(null);
  }

  if (review) {
    return (
      <MatchReviewPanel
        backLabel="Back to recipes"
        description="These choices apply only to this grocery list. Clear a match to move an ingredient into Need to Buy, or choose a different pantry item for this list."
        error={error}
        initialItems={review.items}
        isSubmitting={isSubmitting}
        onBack={goBackToRecipes}
        onSubmit={handleCreateSubmit}
        pantryOptions={review.pantryOptions}
        pendingLabel="Creating..."
        stepLabel="Step 2 of 2"
        submitLabel="Create grocery list"
        title="Review pantry matches"
      />
    );
  }

  return (
    <Panel>
      <form className="space-y-6" onSubmit={handleReviewSubmit}>
        <div>
          <p className="font-medium text-muted text-sm uppercase tracking-[0.2em]">
            Step 1 of 2
          </p>
          <h2 className="mt-2 font-semibold text-2xl">Choose recipes</h2>
          <p className="mt-2 text-muted">Pick one or more saved recipes.</p>
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
          {isSubmitting ? 'Reviewing...' : 'Review matches'}
        </Button>
      </form>
    </Panel>
  );
}
