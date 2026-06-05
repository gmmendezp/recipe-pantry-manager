import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { PageHeader } from '../../../components/layout/page-header';
import { LinkButton } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/empty-state';
import { FilterBar, FilterSelect } from '../../../components/ui/filter-bar';
import { type ViewMode, ViewToggle } from '../../../components/ui/view-toggle';
import { RecipeCards } from '../../../features/recipes/components/recipe-cards';
import { RecipeTable } from '../../../features/recipes/components/recipe-table';
import {
  matchesRecipeTimeFilter,
  type RecipeTimeFilter,
  recipeTimeFilterOptions,
} from '../../../features/recipes/recipe-filters';
import { listRecipes } from '../../../features/recipes/recipes.functions';
import { useFilteredList } from '../../../hooks/use-filtered-list';

export const Route = createFileRoute('/_authenticated/recipes/')({
  component: RecipesPage,
  loader: async () => ({
    recipes: await listRecipes(),
  }),
});

function RecipesPage() {
  const { recipes } = Route.useLoaderData();
  const [desktopView, setDesktopView] = useState<ViewMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<RecipeTimeFilter>('all');
  const filteredRecipes = useFilteredList(recipes, {
    filters: [(recipe) => matchesRecipeTimeFilter(recipe, timeFilter)],
    searchFields: (recipe) => [recipe.title, recipe.description],
    searchQuery,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          description="See and add recipes, including ingredients and instructions."
          eyebrow="Recipe collection"
          title="Recipes"
        />
        <div className="flex flex-nowrap gap-3 sm:justify-end">
          <ViewToggle onChange={setDesktopView} value={desktopView} />
          <LinkButton
            className="text-center whitespace-nowrap"
            to="/recipes/new"
          >
            New recipe
          </LinkButton>
        </div>
      </div>

      {recipes.length > 0 ? (
        <FilterBar
          onSearchChange={setSearchQuery}
          searchLabel="Search recipes"
          searchPlaceholder="Search by title or description"
          searchValue={searchQuery}
        >
          <FilterSelect
            label="Time"
            onChange={setTimeFilter}
            options={recipeTimeFilterOptions}
            value={timeFilter}
          />
        </FilterBar>
      ) : null}

      {recipes.length > 0 ? (
        filteredRecipes.length > 0 ? (
          <>
            <div className="md:hidden">
              <RecipeCards recipes={filteredRecipes} />
            </div>
            <div className="hidden md:block">
              {desktopView === 'cards' ? (
                <RecipeCards recipes={filteredRecipes} />
              ) : (
                <RecipeTable recipes={filteredRecipes} />
              )}
            </div>
          </>
        ) : (
          <EmptyState title="No recipes match your filters">
            Try a different search or time filter.
          </EmptyState>
        )
      ) : (
        <EmptyState
          action={<LinkButton to="/recipes/new">Create recipe</LinkButton>}
          title="No recipes yet"
        >
          Create your first recipe with ingredients and instructions, you can
          use it later to generate pantry-aware grocery lists.
        </EmptyState>
      )}
    </div>
  );
}
