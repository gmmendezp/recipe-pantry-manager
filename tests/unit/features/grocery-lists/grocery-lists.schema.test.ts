import { describe, expect, it } from 'vitest';

import {
  generateGroceryListInputSchema,
  groceryListIdSchema,
  groceryListItemIdSchema,
} from '../../../../src/features/grocery-lists/grocery-lists.schema';

const recipeId = '11111111-1111-4111-8111-111111111111';
const groceryListId = '22222222-2222-4222-8222-222222222222';
const groceryListItemId = '33333333-3333-4333-8333-333333333333';

describe('generateGroceryListInputSchema', () => {
  it('accepts recipe IDs and trims an optional title', () => {
    expect(
      generateGroceryListInputSchema.parse({
        recipeIds: [recipeId],
        title: '  Weekend Shopping  ',
      }),
    ).toEqual({ recipeIds: [recipeId], title: 'Weekend Shopping' });
  });

  it('allows a missing title', () => {
    expect(
      generateGroceryListInputSchema.parse({ recipeIds: [recipeId] }),
    ).toEqual({ recipeIds: [recipeId] });
  });

  it('rejects an empty recipe selection', () => {
    expect(() =>
      generateGroceryListInputSchema.parse({ recipeIds: [] }),
    ).toThrow('Select at least one recipe.');
  });

  it('rejects invalid recipe IDs', () => {
    expect(() =>
      generateGroceryListInputSchema.parse({ recipeIds: ['not-a-uuid'] }),
    ).toThrow();
  });
});

describe('groceryListIdSchema', () => {
  it('accepts a valid grocery list ID', () => {
    expect(groceryListIdSchema.parse({ groceryListId })).toEqual({
      groceryListId,
    });
  });

  it('rejects an invalid grocery list ID', () => {
    expect(() =>
      groceryListIdSchema.parse({ groceryListId: 'not-a-uuid' }),
    ).toThrow();
  });
});

describe('groceryListItemIdSchema', () => {
  it('accepts a valid grocery list item ID', () => {
    expect(groceryListItemIdSchema.parse({ groceryListItemId })).toEqual({
      groceryListItemId,
    });
  });

  it('rejects an invalid grocery list item ID', () => {
    expect(() =>
      groceryListItemIdSchema.parse({ groceryListItemId: 'not-a-uuid' }),
    ).toThrow();
  });
});
