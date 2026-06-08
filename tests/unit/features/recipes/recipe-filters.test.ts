import { describe, expect, it } from 'vitest';

import { matchesRecipeTimeFilter } from '#/features/recipes/recipe-filters';
import type { RecipeListItem } from '#/features/recipes/recipes.schema';

describe('matchesRecipeTimeFilter', () => {
  it('matches all recipes for the all filter', () => {
    expect(
      matchesRecipeTimeFilter(createRecipe({ totalTime: null }), 'all'),
    ).toBe(true);
    expect(
      matchesRecipeTimeFilter(createRecipe({ totalTime: 30 }), 'all'),
    ).toBe(true);
    expect(
      matchesRecipeTimeFilter(createRecipe({ totalTime: 60 }), 'all'),
    ).toBe(true);
  });

  it('matches recipes under 30 minutes', () => {
    expect(
      matchesRecipeTimeFilter(createRecipe({ totalTime: 29 }), 'under-30'),
    ).toBe(true);
    expect(
      matchesRecipeTimeFilter(createRecipe({ totalTime: 30 }), 'under-30'),
    ).toBe(false);
  });

  it('matches recipes from 30 to 60 minutes inclusively', () => {
    expect(
      matchesRecipeTimeFilter(createRecipe({ totalTime: 30 }), '30-60'),
    ).toBe(true);
    expect(
      matchesRecipeTimeFilter(createRecipe({ totalTime: 60 }), '30-60'),
    ).toBe(true);
    expect(
      matchesRecipeTimeFilter(createRecipe({ totalTime: 61 }), '30-60'),
    ).toBe(false);
  });

  it('matches recipes over 60 minutes', () => {
    expect(
      matchesRecipeTimeFilter(createRecipe({ totalTime: 61 }), '60-plus'),
    ).toBe(true);
    expect(
      matchesRecipeTimeFilter(createRecipe({ totalTime: 60 }), '60-plus'),
    ).toBe(false);
  });

  it('falls back to prep and cook time when total time is missing', () => {
    expect(
      matchesRecipeTimeFilter(
        createRecipe({ cookTime: 20, prepTime: 10, totalTime: null }),
        '30-60',
      ),
    ).toBe(true);
  });

  it('uses whichever single time value is available', () => {
    expect(
      matchesRecipeTimeFilter(
        createRecipe({ cookTime: null, prepTime: 20, totalTime: null }),
        'under-30',
      ),
    ).toBe(true);
    expect(
      matchesRecipeTimeFilter(
        createRecipe({ cookTime: null, prepTime: 30, totalTime: null }),
        'under-30',
      ),
    ).toBe(false);
    expect(
      matchesRecipeTimeFilter(
        createRecipe({ cookTime: 75, prepTime: null, totalTime: null }),
        '60-plus',
      ),
    ).toBe(true);
    expect(
      matchesRecipeTimeFilter(
        createRecipe({ cookTime: 60, prepTime: null, totalTime: null }),
        '60-plus',
      ),
    ).toBe(false);
  });

  it('does not match time filters when no time is available', () => {
    expect(
      matchesRecipeTimeFilter(createRecipe({ totalTime: null }), 'under-30'),
    ).toBe(false);
  });
});

function createRecipe(overrides: Partial<RecipeListItem> = {}): RecipeListItem {
  return {
    cookTime: null,
    createdAt: '2026-06-06T00:00:00.000Z',
    description: null,
    id: 'recipe-1',
    imageUrl: null,
    prepTime: null,
    servings: null,
    sourceUrl: null,
    title: 'Tomato Soup',
    totalTime: null,
    updatedAt: '2026-06-06T00:00:00.000Z',
    ...overrides,
  };
}
