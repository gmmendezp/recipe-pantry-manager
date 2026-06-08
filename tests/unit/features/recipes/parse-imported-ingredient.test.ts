import { describe, expect, it } from 'vitest';

import { parseImportedIngredient } from '#/features/recipes/importer/parse-imported-ingredient';

describe('parseImportedIngredient', () => {
  it('parses simple quantity, unit, and name', () => {
    expect(parseImportedIngredient('2 cups flour')).toMatchObject({
      name: 'Flour',
      quantity: '2',
      rawText: '2 cups flour',
      unit: 'cups',
    });
  });

  it('parses fractional quantities', () => {
    expect(parseImportedIngredient('1/2 tsp salt')).toMatchObject({
      name: 'Salt',
      quantity: '1/2',
      rawText: '1/2 tsp salt',
      unit: 'tsp',
    });
  });

  it('parses mixed-number quantities', () => {
    expect(parseImportedIngredient('1 1/2 cups rice')).toMatchObject({
      name: 'Rice',
      quantity: '1 1/2',
      rawText: '1 1/2 cups rice',
      unit: 'cups',
    });
  });

  it('parses hyphenated mixed-number quantities', () => {
    expect(parseImportedIngredient('1-3/4 cups flour')).toMatchObject({
      name: 'Flour',
      quantity: '1 3/4',
      rawText: '1-3/4 cups flour',
      unit: 'cups',
    });
  });

  it('parses unicode fractions', () => {
    expect(parseImportedIngredient('½ cup butter')).toMatchObject({
      name: 'Butter',
      quantity: '1/2',
      rawText: '½ cup butter',
      unit: 'cup',
    });
  });

  it('parses whole-number unicode fractions', () => {
    expect(parseImportedIngredient('1½ cups flour')).toMatchObject({
      name: 'Flour',
      quantity: '1 1/2',
      rawText: '1½ cups flour',
      unit: 'cups',
    });
  });

  it('parses spaced whole-number unicode fractions', () => {
    expect(parseImportedIngredient('1 ½ cups flour')).toMatchObject({
      name: 'Flour',
      quantity: '1 1/2',
      rawText: '1 ½ cups flour',
      unit: 'cups',
    });
  });

  it('parses quantity ranges', () => {
    expect(parseImportedIngredient('1-2 tbsp olive oil')).toMatchObject({
      name: 'Olive oil',
      quantity: '1-2',
      rawText: '1-2 tbsp olive oil',
      unit: 'tbsp',
    });
  });

  it('keeps unknown units with the ingredient name', () => {
    expect(parseImportedIngredient('2 large eggs')).toMatchObject({
      name: 'Large eggs',
      quantity: '2',
      rawText: '2 large eggs',
      unit: '',
    });
  });

  it('keeps unquantified ingredient text intact', () => {
    expect(parseImportedIngredient('salt to taste')).toMatchObject({
      name: 'Salt to taste',
      quantity: '',
      rawText: 'salt to taste',
      unit: '',
    });
  });
});
