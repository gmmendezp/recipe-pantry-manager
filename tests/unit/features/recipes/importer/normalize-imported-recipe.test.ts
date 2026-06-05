import { describe, expect, it } from 'vitest';

import { recipeObjectToFormValues } from '../../../../../src/features/recipes/importer/normalize-imported-recipe';

describe('recipeObjectToFormValues', () => {
  it('normalizes Schema.org recipe data into form values', () => {
    const values = recipeObjectToFormValues(
      {
        '@type': 'Recipe',
        cookTime: 'PT1H30M',
        description: 'A simple soup &amp; bread dinner.',
        image: [{ url: 'https://example.com/soup.jpg' }],
        name: 'Soup &amp; Bread',
        prepTime: 'PT15M',
        recipeIngredient: ['2 cups broth', '½ tsp salt'],
        recipeInstructions: [
          { '@type': 'HowToStep', text: 'Warm the broth.' },
          { '@type': 'HowToStep', name: 'Season to taste.' },
        ],
        recipeYield: '4 servings',
      },
      'https://example.com/recipe',
    );

    expect(values).toMatchObject({
      cookTime: '90',
      description: 'A simple soup & bread dinner.',
      imageUrl: 'https://example.com/soup.jpg',
      prepTime: '15',
      servings: '4',
      sourceUrl: 'https://example.com/recipe',
      title: 'Soup & Bread',
    });
    expect(values.ingredients).toHaveLength(2);
    expect(values.ingredients[0]).toMatchObject({
      name: 'broth',
      quantity: '2',
      rawText: '2 cups broth',
      unit: 'cups',
    });
    expect(values.ingredients[1]).toMatchObject({
      name: 'salt',
      quantity: '1/2',
      rawText: '½ tsp salt',
      unit: 'tsp',
    });
    expect(values.steps).toEqual([
      expect.objectContaining({ instruction: 'Warm the broth.' }),
      expect.objectContaining({ instruction: 'Season to taste.' }),
    ]);
  });

  it('flattens HowToSection instructions', () => {
    const values = recipeObjectToFormValues(
      {
        '@type': 'Recipe',
        name: 'Soup',
        recipeIngredient: ['broth'],
        recipeInstructions: [
          {
            '@type': 'HowToSection',
            itemListElement: [
              { '@type': 'HowToStep', text: 'Chop vegetables.' },
              { '@type': 'HowToStep', text: 'Simmer soup.' },
            ],
          },
        ],
      },
      'https://example.com/recipe',
    );

    expect(values.steps).toEqual([
      expect.objectContaining({ instruction: 'Chop vegetables.' }),
      expect.objectContaining({ instruction: 'Simmer soup.' }),
    ]);
  });

  it('creates an empty step when instructions are missing', () => {
    const values = recipeObjectToFormValues(
      {
        '@type': 'Recipe',
        name: 'Soup',
        recipeIngredient: ['broth'],
      },
      'https://example.com/recipe',
    );

    expect(values.steps).toHaveLength(1);
    expect(values.steps[0]?.instruction).toBe('');
  });

  it('throws when title is missing', () => {
    expect(() =>
      recipeObjectToFormValues(
        { '@type': 'Recipe', recipeIngredient: ['broth'] },
        'https://example.com/recipe',
      ),
    ).toThrow('Imported recipe data is missing a title.');
  });

  it('throws when ingredients are missing', () => {
    expect(() =>
      recipeObjectToFormValues(
        { '@type': 'Recipe', name: 'Soup' },
        'https://example.com/recipe',
      ),
    ).toThrow('Imported recipe data is missing ingredients.');
  });
});
