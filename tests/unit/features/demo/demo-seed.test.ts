import { describe, expect, it } from 'vitest';

import {
  demoGroceryList,
  demoPantryItems,
  demoRecipes,
} from '#/features/demo/demo-seed.server';
import { mergeGroceryListItems } from '#/features/grocery-lists/generate-grocery-list';

describe('demo seed data', () => {
  it('contains the canonical pantry and recipe selection', () => {
    expect(demoPantryItems).toHaveLength(14);
    expect(demoRecipes).toHaveLength(5);

    for (const pantryItem of demoPantryItems) {
      expect(pantryItem.name).toBeTruthy();
    }

    for (const { recipe, tags } of demoRecipes) {
      expect(recipe.title).toBeTruthy();
      expect(recipe.ingredients.length).toBeGreaterThan(0);
      expect(recipe.steps.length).toBeGreaterThan(0);
      expect(tags.length).toBeGreaterThan(0);
    }
  });

  it('uses unique stable recipe keys', () => {
    const recipeKeys = demoRecipes.map((recipe) => recipe.key);

    expect(new Set(recipeKeys).size).toBe(recipeKeys.length);
  });

  it('references existing recipes from the grocery list', () => {
    const recipeKeys = new Set(demoRecipes.map((recipe) => recipe.key));

    for (const sourceRecipeKey of demoGroceryList.sourceRecipeKeys) {
      expect(recipeKeys.has(sourceRecipeKey)).toBe(true);
    }
  });

  it('generates both pantry and shopping sections', () => {
    const selectedRecipeKeys = new Set<string>(
      demoGroceryList.sourceRecipeKeys,
    );
    const ingredients = demoRecipes
      .filter((recipe) => selectedRecipeKeys.has(recipe.key))
      .flatMap(({ key, recipe }) =>
        recipe.ingredients.map((ingredient) => ({
          ...ingredient,
          recipeId: key,
        })),
      );
    const groceryItems = Array.from(
      mergeGroceryListItems(
        ingredients,
        demoPantryItems.map((item) => ({ ...item, id: item.name })),
      ).values(),
    );

    expect(groceryItems.some((item) => item.pantryMatch)).toBe(true);
    expect(groceryItems.some((item) => !item.pantryMatch)).toBe(true);

    for (const checkedItemName of demoGroceryList.checkedItemNames) {
      expect(groceryItems.some((item) => item.name === checkedItemName)).toBe(
        true,
      );
    }
  });

  it('does not contain temporary form identifiers', () => {
    expect(JSON.stringify({ demoPantryItems, demoRecipes })).not.toContain(
      'clientId',
    );
  });
});
