import { z } from 'zod';

export const generateGroceryListInputSchema = z.object({
  recipeIds: z.array(z.uuid()).min(1, 'Select at least one recipe.'),
  title: z.string().trim().optional(),
});

export const groceryListIdSchema = z.object({
  groceryListId: z.uuid(),
});

export const groceryListItemIdSchema = z.object({
  groceryListItemId: z.uuid(),
});

export type GenerateGroceryListInput = z.input<
  typeof generateGroceryListInputSchema
>;
export type ParsedGenerateGroceryListInput = z.output<
  typeof generateGroceryListInputSchema
>;

export type GroceryListItem = {
  category: string | null;
  createdAt: string;
  groceryListId: string;
  id: string;
  isChecked: boolean;
  name: string;
  pantryMatch: boolean;
  quantity: string | null;
  sourceRecipeIds: string[];
  unit: string | null;
};

export type GroceryListSummary = {
  createdAt: string;
  id: string;
  itemCount: number;
  title: string;
  updatedAt: string;
};

export type GroceryListDetail = GroceryListSummary & {
  items: GroceryListItem[];
};
