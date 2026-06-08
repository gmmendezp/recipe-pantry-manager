import { describe, expect, it } from 'vitest';

import { mergeGroceryListItems } from '#/features/grocery-lists/generate-grocery-list';

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

  it('matches pantry items using shopping cleanup while preserving display name', () => {
    const items = toItems(
      mergeGroceryListItems(
        [ingredient({ name: 'minced fresh basil', quantity: '3' })],
        [{ name: 'fresh basil', quantity: '1', unit: 'bunch' }],
      ),
    );

    expect(items[0]).toMatchObject({
      name: 'minced fresh basil',
      pantryItemId: null,
      pantryMatch: true,
      pantryQuantity: '1',
      pantryUnit: 'bunch',
    });
  });

  it('tracks the matched pantry item id when available', () => {
    const items = toItems(
      mergeGroceryListItems(
        [ingredient({ name: 'minced fresh basil', quantity: '3' })],
        [
          {
            id: 'pantry-1',
            name: 'fresh basil',
            quantity: '1',
            unit: 'bunch',
          },
        ],
      ),
    );

    expect(items[0]).toMatchObject({
      pantryItemId: 'pantry-1',
      pantryMatch: true,
    });
  });

  it('matches pantry items when recipe names include leading measurements', () => {
    const items = toItems(
      mergeGroceryListItems(
        [
          ingredient({ name: '2 tablespoons olive oil', recipeId: 'recipe-1' }),
          ingredient({ name: '2 sprigs fresh thyme', recipeId: 'recipe-2' }),
        ],
        [
          { name: 'olive oil', quantity: null, unit: null },
          { name: 'fresh thyme', quantity: null, unit: null },
        ],
      ),
    );

    expect(items).toHaveLength(2);
    expect(items.every((item) => item.pantryMatch)).toBe(true);
  });

  it('does not match distinct ingredients after shopping cleanup', () => {
    const items = toItems(
      mergeGroceryListItems(
        [
          ingredient({ name: 'red onion', recipeId: 'recipe-1' }),
          ingredient({ name: 'garbanzo beans', recipeId: 'recipe-2' }),
          ingredient({ name: 'scallions', recipeId: 'recipe-3' }),
        ],
        [
          { name: 'onion', quantity: null, unit: null },
          { name: 'chickpeas', quantity: null, unit: null },
          { name: 'green onions', quantity: null, unit: null },
        ],
      ),
    );

    expect(items).toHaveLength(3);
    expect(items.every((item) => !item.pantryMatch)).toBe(true);
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
