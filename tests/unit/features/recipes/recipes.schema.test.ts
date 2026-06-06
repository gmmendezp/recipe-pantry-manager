import { describe, expect, it } from 'vitest';

import {
  recipeDetailToFormValues,
  recipeInputSchema,
} from '../../../../src/features/recipes/recipes.schema';

describe('recipeInputSchema', () => {
  it('trims text, converts empty optional fields to null, and parses numeric strings', () => {
    const result = recipeInputSchema.parse({
      cookTime: '20',
      description: '  Weeknight dinner  ',
      imageUrl: '  ',
      ingredients: [
        {
          category: '  Produce  ',
          name: '  Tomato  ',
          quantity: ' 2 ',
          rawText: '',
          unit: ' cups ',
        },
      ],
      prepTime: '10',
      servings: '4',
      sourceUrl: '',
      steps: [{ instruction: '  Simmer until warm.  ' }],
      title: '  Tomato Soup  ',
    });

    expect(result).toMatchObject({
      cookTime: 20,
      description: 'Weeknight dinner',
      imageUrl: null,
      prepTime: 10,
      servings: 4,
      sourceUrl: null,
      title: 'Tomato Soup',
    });
    expect(result.ingredients[0]).toMatchObject({
      category: 'Produce',
      name: 'Tomato',
      quantity: '2',
      rawText: null,
      unit: 'cups',
    });
    expect(result.steps[0]?.instruction).toBe('Simmer until warm.');
  });

  it('rejects a missing recipe title', () => {
    expect(() =>
      recipeInputSchema.parse({
        ingredients: [{ name: 'Tomato' }],
        steps: [{ instruction: 'Cook.' }],
        title: ' ',
      }),
    ).toThrow();
  });

  it('rejects recipes without ingredients or steps', () => {
    expect(() =>
      recipeInputSchema.parse({
        ingredients: [],
        steps: [{ instruction: 'Cook.' }],
        title: 'Tomato Soup',
      }),
    ).toThrow('Add at least one ingredient.');

    expect(() =>
      recipeInputSchema.parse({
        ingredients: [{ name: 'Tomato' }],
        steps: [],
        title: 'Tomato Soup',
      }),
    ).toThrow('Add at least one step.');
  });

  it('rejects non-positive and decimal time values', () => {
    expect(() =>
      recipeInputSchema.parse({
        ingredients: [{ name: 'Tomato' }],
        prepTime: '0',
        steps: [{ instruction: 'Cook.' }],
        title: 'Tomato Soup',
      }),
    ).toThrow();

    expect(() =>
      recipeInputSchema.parse({
        ingredients: [{ name: 'Tomato' }],
        prepTime: '1.5',
        steps: [{ instruction: 'Cook.' }],
        title: 'Tomato Soup',
      }),
    ).toThrow();
  });
});

describe('recipeDetailToFormValues', () => {
  it('converts recipe detail null values into form empty strings', () => {
    const values = recipeDetailToFormValues({
      cookTime: null,
      createdAt: '2026-06-06T00:00:00.000Z',
      description: null,
      id: 'recipe-1',
      imageUrl: null,
      ingredients: [
        {
          category: null,
          id: 'ingredient-1',
          name: 'Tomato',
          quantity: null,
          rawText: null,
          sortOrder: 0,
          unit: null,
        },
      ],
      prepTime: null,
      servings: null,
      sourceUrl: null,
      steps: [{ id: 'step-1', instruction: 'Cook.', stepNumber: 1 }],
      title: 'Tomato Soup',
      totalTime: null,
      updatedAt: '2026-06-06T00:00:00.000Z',
    });

    expect(values).toMatchObject({
      cookTime: '',
      description: '',
      imageUrl: '',
      prepTime: '',
      servings: '',
      sourceUrl: '',
      title: 'Tomato Soup',
    });
    expect(values.ingredients[0]).toMatchObject({
      category: '',
      name: 'Tomato',
      quantity: '',
      rawText: '',
      unit: '',
    });
    expect(values.steps[0]).toMatchObject({ instruction: 'Cook.' });
  });
});
