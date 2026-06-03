import { describe, expect, it } from 'vitest';

import { normalizeIngredientName } from '../../../../src/lib/normalization/ingredients';

describe('normalizeIngredientName', () => {
  it('normalizes casing and whitespace', () => {
    expect(normalizeIngredientName('  Cherry   Tomatoes ')).toBe(
      'cherry tomato',
    );
  });

  it('handles basic plural endings', () => {
    expect(normalizeIngredientName('berries')).toBe('berry');
    expect(normalizeIngredientName('boxes')).toBe('box');
    expect(normalizeIngredientName('onions')).toBe('onion');
  });
});
