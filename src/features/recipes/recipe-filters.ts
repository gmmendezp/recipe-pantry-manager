import type { RecipeListItem } from './recipes.schema';

export type RecipeTimeFilter = '30-60' | '60-plus' | 'all' | 'under-30';

export const recipeTimeFilterOptions: Array<{
  label: string;
  value: RecipeTimeFilter;
}> = [
  { label: 'Any time', value: 'all' },
  { label: 'Under 30 min', value: 'under-30' },
  { label: '30-60 min', value: '30-60' },
  { label: '60+ min', value: '60-plus' },
];

function getRecipeTime(recipe: RecipeListItem) {
  if (recipe.totalTime) return recipe.totalTime;
  if (recipe.prepTime && recipe.cookTime)
    return recipe.prepTime + recipe.cookTime;

  return recipe.prepTime ?? recipe.cookTime;
}

export function matchesRecipeTimeFilter(
  recipe: RecipeListItem,
  filter: RecipeTimeFilter,
) {
  if (filter === 'all') return true;

  const time = getRecipeTime(recipe);

  if (!time) return false;
  if (filter === 'under-30') return time < 30;
  if (filter === '30-60') return time >= 30 && time <= 60;

  return time > 60;
}
