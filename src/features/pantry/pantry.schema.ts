import { z } from 'zod';

import { createOptionalTextSchema } from '#/lib/validation/schemas';

const MAX_CATEGORY_LENGTH = 60;
const MAX_NAME_LENGTH = 150;
const MAX_NOTES_LENGTH = 1000;
const MAX_QUANTITY_LENGTH = 50;
const MAX_UNIT_LENGTH = 30;

export const pantryItemInputSchema = z.object({
  category: createOptionalTextSchema(
    MAX_CATEGORY_LENGTH,
    `Category must be ${MAX_CATEGORY_LENGTH} characters or fewer.`,
  ),
  name: z
    .string()
    .trim()
    .min(1, 'Pantry item name is required.')
    .max(
      MAX_NAME_LENGTH,
      `Pantry item name must be ${MAX_NAME_LENGTH} characters or fewer.`,
    ),
  notes: createOptionalTextSchema(
    MAX_NOTES_LENGTH,
    `Notes must be ${MAX_NOTES_LENGTH} characters or fewer.`,
  ),
  quantity: createOptionalTextSchema(
    MAX_QUANTITY_LENGTH,
    `Quantity must be ${MAX_QUANTITY_LENGTH} characters or fewer.`,
  ),
  unit: createOptionalTextSchema(
    MAX_UNIT_LENGTH,
    `Unit must be ${MAX_UNIT_LENGTH} characters or fewer.`,
  ),
});

export const pantryItemIdSchema = z.object({
  pantryItemId: z.uuid(),
});

export const updatePantryItemInputSchema = pantryItemInputSchema.extend({
  pantryItemId: z.uuid(),
});

export type PantryItemInput = z.input<typeof pantryItemInputSchema>;
export type ParsedPantryItemInput = z.output<typeof pantryItemInputSchema>;

export type PantryFormValues = {
  category: string;
  name: string;
  notes: string;
  quantity: string;
  unit: string;
};

export type PantryListItem = {
  category: string | null;
  createdAt: string;
  id: string;
  name: string;
  notes: string | null;
  quantity: string | null;
  unit: string | null;
  updatedAt: string;
};

export type PantryItemDetail = PantryListItem;

export function createEmptyPantryFormValues(): PantryFormValues {
  return {
    category: '',
    name: '',
    notes: '',
    quantity: '',
    unit: '',
  };
}

export function pantryItemToFormValues(
  pantryItem: PantryItemDetail,
): PantryFormValues {
  return {
    category: pantryItem.category ?? '',
    name: pantryItem.name,
    notes: pantryItem.notes ?? '',
    quantity: pantryItem.quantity ?? '',
    unit: pantryItem.unit ?? '',
  };
}
