import { z } from 'zod';

const MAX_CATEGORY_LENGTH = 60;
const MAX_GROCERY_ITEMS = 300;
const MAX_ITEM_NAME_LENGTH = 150;
const MAX_QUANTITY_LENGTH = 50;
const MAX_RECIPES = 25;
const MAX_TITLE_LENGTH = 150;
const MAX_UNIT_LENGTH = 30;

export const generateGroceryListInputSchema = z.object({
  recipeIds: z
    .array(z.uuid())
    .min(1, 'Select at least one recipe.')
    .max(MAX_RECIPES, `Select no more than ${MAX_RECIPES} recipes.`),
  title: z
    .string()
    .trim()
    .max(
      MAX_TITLE_LENGTH,
      `Grocery list title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
    )
    .optional(),
});

export const reviewedGroceryListItemInputSchema = z.object({
  category: z.string().trim().max(MAX_CATEGORY_LENGTH).nullable(),
  name: z
    .string()
    .trim()
    .min(1, 'Grocery item name is required.')
    .max(
      MAX_ITEM_NAME_LENGTH,
      `Grocery item name must be ${MAX_ITEM_NAME_LENGTH} characters or fewer.`,
    ),
  pantryItemId: z.uuid().nullable(),
  quantity: z.string().trim().max(MAX_QUANTITY_LENGTH).nullable(),
  sourceRecipeIds: z.array(z.uuid()).min(1).max(MAX_RECIPES),
  unit: z.string().trim().max(MAX_UNIT_LENGTH).nullable(),
});

export const generateReviewedGroceryListInputSchema = z.object({
  items: z
    .array(reviewedGroceryListItemInputSchema)
    .min(1, 'Review at least one grocery item.')
    .max(
      MAX_GROCERY_ITEMS,
      `Review no more than ${MAX_GROCERY_ITEMS} grocery items.`,
    ),
  title: z
    .string()
    .trim()
    .max(
      MAX_TITLE_LENGTH,
      `Grocery list title must be ${MAX_TITLE_LENGTH} characters or fewer.`,
    )
    .optional(),
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
