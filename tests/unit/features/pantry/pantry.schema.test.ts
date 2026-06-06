import { describe, expect, it } from 'vitest';

import {
  pantryItemInputSchema,
  pantryItemToFormValues,
} from '../../../../src/features/pantry/pantry.schema';

describe('pantryItemInputSchema', () => {
  it('trims text and converts empty optional fields to null', () => {
    const result = pantryItemInputSchema.parse({
      category: '  Produce  ',
      name: '  Tomato  ',
      notes: '  ',
      quantity: ' 2 ',
      unit: ' cans ',
    });

    expect(result).toEqual({
      category: 'Produce',
      name: 'Tomato',
      notes: null,
      quantity: '2',
      unit: 'cans',
    });
  });

  it('rejects an empty pantry item name', () => {
    expect(() =>
      pantryItemInputSchema.parse({
        category: '',
        name: ' ',
        notes: '',
        quantity: '',
        unit: '',
      }),
    ).toThrow('Pantry item name is required.');
  });
});

describe('pantryItemToFormValues', () => {
  it('converts pantry item null values into form empty strings', () => {
    expect(
      pantryItemToFormValues({
        category: null,
        createdAt: '2026-06-06T00:00:00.000Z',
        id: 'pantry-item-1',
        name: 'Tomato',
        notes: null,
        quantity: null,
        unit: null,
        updatedAt: '2026-06-06T00:00:00.000Z',
      }),
    ).toEqual({
      category: '',
      name: 'Tomato',
      notes: '',
      quantity: '',
      unit: '',
    });
  });
});
