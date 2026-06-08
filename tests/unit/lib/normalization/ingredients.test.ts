import { describe, expect, it } from 'vitest';

import { normalizeIngredientShoppingKey } from '#/lib/normalization/ingredients';

describe('normalizeIngredientShoppingKey', () => {
  it('removes prep words used for recipe instructions', () => {
    expect(normalizeIngredientShoppingKey('Tomatoes, diced')).toBe('tomato');
    expect(normalizeIngredientShoppingKey('onions (chopped)')).toBe('onion');
    expect(normalizeIngredientShoppingKey('minced fresh basil')).toBe(
      'fresh basil',
    );
  });

  it('removes leading container words', () => {
    expect(normalizeIngredientShoppingKey('can of chickpeas')).toBe('chickpea');
    expect(normalizeIngredientShoppingKey('1 bag of spinach')).toBe('spinach');
    expect(normalizeIngredientShoppingKey('package of tortillas')).toBe(
      'tortilla',
    );
  });

  it('removes leading measurement words', () => {
    expect(normalizeIngredientShoppingKey('2 tablespoons olive oil')).toBe(
      'olive oil',
    );
    expect(normalizeIngredientShoppingKey('1 tbsp olive oil')).toBe(
      'olive oil',
    );
    expect(normalizeIngredientShoppingKey('pinch of salt')).toBe('salt');
  });

  it('removes leaves from known herb names', () => {
    expect(normalizeIngredientShoppingKey('fresh basil leaves')).toBe(
      'fresh basil',
    );
    expect(normalizeIngredientShoppingKey('cilantro leaves')).toBe('cilantro');
    expect(normalizeIngredientShoppingKey('2 sprigs fresh thyme')).toBe(
      'fresh thyme',
    );
    expect(normalizeIngredientShoppingKey('rosemary sprigs')).toBe('rosemary');
  });

  it('preserves identity modifiers', () => {
    expect(normalizeIngredientShoppingKey('red onion')).not.toBe(
      normalizeIngredientShoppingKey('onion'),
    );
    expect(normalizeIngredientShoppingKey('fresh basil')).not.toBe(
      normalizeIngredientShoppingKey('dried basil'),
    );
    expect(normalizeIngredientShoppingKey('coconut milk')).not.toBe(
      normalizeIngredientShoppingKey('milk'),
    );
    expect(normalizeIngredientShoppingKey('cherry tomato')).not.toBe(
      normalizeIngredientShoppingKey('tomato'),
    );
  });

  it('does not apply synonym matching', () => {
    expect(normalizeIngredientShoppingKey('garbanzo beans')).not.toBe(
      normalizeIngredientShoppingKey('chickpeas'),
    );
    expect(normalizeIngredientShoppingKey('scallions')).not.toBe(
      normalizeIngredientShoppingKey('green onions'),
    );
  });
});
