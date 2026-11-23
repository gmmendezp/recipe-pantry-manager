import { describe, expect, it } from 'vitest';

import {
  importRecipeInputSchema,
  recipeDetailToFormValues,
  recipeInputSchema,
} from '#/features/recipes/recipes.schema';

function createRecipeInput(overrides: Record<string, unknown> = {}) {
  return {
    cookTime: '',
    description: '',
    imageUrl: '',
    ingredients: [
      {
        category: '',
        name: 'Tomato',
        quantity: '',
        rawText: '',
        unit: '',
      },
    ],
    prepTime: '',
    servings: '',
    sourceUrl: '',
    steps: [{ instruction: 'Cook.' }],
    title: 'Tomato Soup',
    ...overrides,
  };
}

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

  it('accepts absolute HTTP and HTTPS recipe URLs', () => {
    const result = recipeInputSchema.parse(
      createRecipeInput({
        imageUrl: '  https://images.example.com/recipe.webp  ',
        sourceUrl: 'http://example.com/recipe',
      }),
    );

    expect(result.imageUrl).toBe('https://images.example.com/recipe.webp');
    expect(result.sourceUrl).toBe('http://example.com/recipe');
  });

  it.each([
    'not a URL',
    '/relative/recipe',
    'javascript:alert(1)',
    'data:image/png;base64,image-data',
    'file:///etc/passwd',
    'https://user:password@example.com/recipe',
  ])('rejects unsafe or invalid recipe URLs: %s', (url) => {
    expect(() =>
      recipeInputSchema.parse(createRecipeInput({ imageUrl: url })),
    ).toThrow('Enter a valid HTTP or HTTPS URL.');

    expect(() =>
      recipeInputSchema.parse(createRecipeInput({ sourceUrl: url })),
    ).toThrow('Enter a valid HTTP or HTTPS URL.');
  });

  it('accepts recipe values at the configured limits', () => {
    const imageUrlPrefix = 'https://images.example.com/';
    const result = recipeInputSchema.parse(
      createRecipeInput({
        description: 'd'.repeat(3000),
        imageUrl: `${imageUrlPrefix}${'i'.repeat(2048 - imageUrlPrefix.length)}`,
        ingredients: Array.from({ length: 50 }, () => ({
          category: 'c'.repeat(60),
          name: 'n'.repeat(150),
          quantity: 'q'.repeat(50),
          rawText: 'r'.repeat(300),
          unit: 'u'.repeat(30),
        })),
        steps: Array.from({ length: 50 }, () => ({
          instruction: 's'.repeat(1500),
        })),
        title: 't'.repeat(150),
      }),
    );

    expect(result.ingredients).toHaveLength(50);
    expect(result.steps).toHaveLength(50);
  });

  it.each([
    ['title', createRecipeInput({ title: 't'.repeat(151) })],
    ['description', createRecipeInput({ description: 'd'.repeat(3001) })],
    [
      'ingredient name',
      createRecipeInput({
        ingredients: [
          {
            category: '',
            name: 'n'.repeat(151),
            quantity: '',
            rawText: '',
            unit: '',
          },
        ],
      }),
    ],
    [
      'step instruction',
      createRecipeInput({
        steps: [{ instruction: 's'.repeat(1501) }],
      }),
    ],
    [
      'URL',
      createRecipeInput({
        sourceUrl: `https://example.com/${'u'.repeat(2049)}`,
      }),
    ],
  ])('rejects an oversized %s', (_, input) => {
    expect(() => recipeInputSchema.parse(input)).toThrow();
  });

  it('rejects too many ingredients or steps', () => {
    const ingredient = {
      category: '',
      name: 'Tomato',
      quantity: '',
      rawText: '',
      unit: '',
    };

    expect(() =>
      recipeInputSchema.parse(
        createRecipeInput({ ingredients: Array(51).fill(ingredient) }),
      ),
    ).toThrow('Add no more than 50 ingredients.');
    expect(() =>
      recipeInputSchema.parse(
        createRecipeInput({
          steps: Array.from({ length: 51 }, () => ({ instruction: 'Cook.' })),
        }),
      ),
    ).toThrow('Add no more than 50 steps.');
  });
});

describe('importRecipeInputSchema', () => {
  it('accepts trimmed HTTP and HTTPS URLs', () => {
    expect(
      importRecipeInputSchema.parse({ url: '  https://example.com/recipe  ' }),
    ).toEqual({ url: 'https://example.com/recipe' });
    expect(
      importRecipeInputSchema.parse({ url: 'http://example.com/recipe' }),
    ).toEqual({ url: 'http://example.com/recipe' });
  });

  it.each([
    'not a URL',
    '/relative/recipe',
    'javascript:alert(1)',
    'file:///etc/passwd',
    'https://user:password@example.com/recipe',
  ])('rejects unsafe or invalid import URLs: %s', (url) => {
    expect(() => importRecipeInputSchema.parse({ url })).toThrow(
      'Enter a valid recipe URL.',
    );
  });

  it('rejects import URLs longer than 2048 characters', () => {
    expect(() =>
      importRecipeInputSchema.parse({
        url: `https://example.com/${'u'.repeat(2049)}`,
      }),
    ).toThrow('URL must be 2048 characters or fewer.');
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
