import { z } from 'zod';

import { optionalTextSchema } from '#/lib/validation/schemas';

export const pantryItemInputSchema = z.object({
  category: optionalTextSchema,
  name: z.string().trim().min(1, 'Pantry item name is required.'),
  notes: optionalTextSchema,
  quantity: optionalTextSchema,
  unit: optionalTextSchema,
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
