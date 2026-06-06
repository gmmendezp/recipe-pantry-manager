import { describe, expect, it } from 'vitest';

import { mergeGroceryListItems } from '../../../../src/features/grocery-lists/generate-grocery-list';

describe('mergeGroceryListItems', () => {
  it('merges ingredients by normalized name, unit, category, and pantry status', () => {
    const items = toItems(
      mergeGroceryListItems(
        [
          ingredient({ name: 'Tomatoes', quantity: '2', recipeId: 'recipe-1' }),
          ingredient({ name: ' tomato ', quantity: '3', recipeId: 'recipe-2' }),
        ],
        [],
      ),
    );

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      name: 'Tomatoes',
      pantryMatch: false,
      quantity: '5',
      sourceRecipeIds: ['recipe-1', 'recipe-2'],
    });
  });

  it('keeps ingredients separate when units or categories differ', () => {
    const items = toItems(
      mergeGroceryListItems(
        [
          ingredient({ category: 'Produce', name: 'Tomato', unit: 'cups' }),
          ingredient({ category: 'Canned', name: 'Tomato', unit: 'cups' }),
          ingredient({ category: 'Produce', name: 'Tomato', unit: 'cans' }),
        ],
        [],
      ),
    );

    expect(items).toHaveLength(3);
  });

  it('marks pantry matches and includes pantry amount details', () => {
    const items = toItems(
      mergeGroceryListItems(
        [ingredient({ name: 'Tomatoes', quantity: '2', unit: 'cups' })],
        [{ name: 'tomato', quantity: '1', unit: 'can' }],
      ),
    );

    expect(items[0]).toMatchObject({
      pantryMatch: true,
      pantryQuantity: '1',
      pantryUnit: 'can',
      quantity: '2',
      unit: 'cups',
    });
  });

  it('uses the first pantry item when normalized pantry names duplicate', () => {
    const items = toItems(
      mergeGroceryListItems(
        [ingredient({ name: 'Tomato' })],
        [
          { name: 'Tomatoes', quantity: '2', unit: 'cans' },
          { name: 'tomato', quantity: '5', unit: 'cups' },
        ],
      ),
    );

    expect(items[0]).toMatchObject({
      pantryQuantity: '2',
      pantryUnit: 'cans',
    });
  });

  it('does not merge pantry-covered and non-pantry ingredients together', () => {
    const items = toItems(
      mergeGroceryListItems(
        [
          ingredient({ name: 'Tomato', quantity: '1', recipeId: 'recipe-1' }),
          ingredient({ name: 'Onion', quantity: '1', recipeId: 'recipe-2' }),
        ],
        [{ name: 'Tomato', quantity: null, unit: null }],
      ),
    );

    expect(items).toHaveLength(2);
    expect(items.map((item) => item.pantryMatch)).toEqual([true, false]);
  });

  it('keeps duplicate non-numeric quantities unique', () => {
    const items = toItems(
      mergeGroceryListItems(
        [
          ingredient({ name: 'Salt', quantity: 'pinch' }),
          ingredient({ name: 'salt', quantity: 'to taste' }),
          ingredient({ name: 'salt', quantity: 'pinch' }),
        ],
        [],
      ),
    );

    expect(items[0]?.quantity).toBe('pinch, to taste');
  });

  it('keeps the current quantity when the next quantity is missing', () => {
    const items = toItems(
      mergeGroceryListItems(
        [
          ingredient({ name: 'Salt', quantity: '1' }),
          ingredient({ name: 'salt', quantity: null }),
        ],
        [],
      ),
    );

    expect(items[0]?.quantity).toBe('1');
  });
});

function ingredient(
  overrides: Partial<Parameters<typeof mergeGroceryListItems>[0][number]> = {},
): Parameters<typeof mergeGroceryListItems>[0][number] {
  return {
    category: null,
    name: 'Tomato',
    quantity: '1',
    recipeId: 'recipe-1',
    unit: null,
    ...overrides,
  };
}

function toItems(items: ReturnType<typeof mergeGroceryListItems>) {
  return Array.from(items.values()).map((item) => ({
    ...item,
    sourceRecipeIds: Array.from(item.sourceRecipeIds),
  }));
}
