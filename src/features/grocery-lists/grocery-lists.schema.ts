import { z } from 'zod';

export const generateGroceryListInputSchema = z.object({
  recipeIds: z.array(z.uuid()).min(1, 'Select at least one recipe.'),
  title: z.string().trim().optional(),
});

export const reviewedGroceryListItemInputSchema = z.object({
  category: z.string().trim().nullable(),
  name: z.string().trim().min(1, 'Grocery item name is required.'),
  pantryItemId: z.uuid().nullable(),
  quantity: z.string().trim().nullable(),
  sourceRecipeIds: z.array(z.uuid()).min(1),
  unit: z.string().trim().nullable(),
});

export const generateReviewedGroceryListInputSchema = z.object({
  items: z
    .array(reviewedGroceryListItemInputSchema)
    .min(1, 'Review at least one grocery item.'),
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
export type ParsedGenerateReviewedGroceryListInput = z.output<
  typeof generateReviewedGroceryListInputSchema
>;

export type PantryMatchOption = {
  id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
};

export type GroceryListReviewItem = {
  category: string | null;
  matchedPantryItemId: string | null;
  name: string;
  quantity: string | null;
  reviewId: string;
  sourceRecipeIds: string[];
  unit: string | null;
};

export type GroceryListReview = {
  items: GroceryListReviewItem[];
  pantryOptions: PantryMatchOption[];
};

export type GroceryListItem = {
  category: string | null;
  createdAt: string;
  groceryListId: string;
  id: string;
  isChecked: boolean;
  name: string;
  pantryMatch: boolean;
  pantryQuantity: string | null;
  pantryUnit: string | null;
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
