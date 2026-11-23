import { z } from 'zod';

import {
  createOptionalTextSchema,
  optionalPositiveIntegerSchema,
} from '#/lib/validation/schemas';

const MAX_CATEGORY_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 3000;
const MAX_INGREDIENTS = 50;
const MAX_INGREDIENT_NAME_LENGTH = 150;
const MAX_INGREDIENT_RAW_TEXT_LENGTH = 300;
const MAX_QUANTITY_LENGTH = 50;
const MAX_RECIPE_TITLE_LENGTH = 150;
const MAX_STEP_INSTRUCTION_LENGTH = 1500;
const MAX_STEPS = 50;
const MAX_UNIT_LENGTH = 30;
const MAX_URL_LENGTH = 2048;

const categorySchema = createOptionalTextSchema(
  MAX_CATEGORY_LENGTH,
  `Category must be ${MAX_CATEGORY_LENGTH} characters or fewer.`,
);
const quantitySchema = createOptionalTextSchema(
  MAX_QUANTITY_LENGTH,
  `Quantity must be ${MAX_QUANTITY_LENGTH} characters or fewer.`,
);
const unitSchema = createOptionalTextSchema(
  MAX_UNIT_LENGTH,
  `Unit must be ${MAX_UNIT_LENGTH} characters or fewer.`,
);

function isHttpUrl(value: string) {
  try {
    const url = new URL(value);

    return (
      ['http:', 'https:'].includes(url.protocol) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

const optionalHttpUrlSchema = z
  .string()
  .trim()
  .max(MAX_URL_LENGTH, `URL must be ${MAX_URL_LENGTH} characters or fewer.`)
  .refine(
    (value) => value === '' || isHttpUrl(value),
    'Enter a valid HTTP or HTTPS URL.',
  )
  .transform((value) => value || null);

export const recipeIngredientInputSchema = z.object({
  category: categorySchema,
  name: z
    .string()
    .trim()
    .min(1, 'Ingredient name is required.')
    .max(
      MAX_INGREDIENT_NAME_LENGTH,
      `Ingredient name must be ${MAX_INGREDIENT_NAME_LENGTH} characters or fewer.`,
    ),
  quantity: quantitySchema,
  rawText: createOptionalTextSchema(
    MAX_INGREDIENT_RAW_TEXT_LENGTH,
    `Ingredient text must be ${MAX_INGREDIENT_RAW_TEXT_LENGTH} characters or fewer.`,
  ),
  unit: unitSchema,
});

export const recipeStepInputSchema = z.object({
  instruction: z
    .string()
    .trim()
    .min(1, 'Instruction is required.')
    .max(
      MAX_STEP_INSTRUCTION_LENGTH,
      `Instruction must be ${MAX_STEP_INSTRUCTION_LENGTH} characters or fewer.`,
    ),
});

export const recipeInputSchema = z.object({
  cookTime: optionalPositiveIntegerSchema,
  description: createOptionalTextSchema(
    MAX_DESCRIPTION_LENGTH,
    `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`,
  ),
  imageUrl: optionalHttpUrlSchema,
  ingredients: z
    .array(recipeIngredientInputSchema)
    .min(1, 'Add at least one ingredient.')
    .max(MAX_INGREDIENTS, `Add no more than ${MAX_INGREDIENTS} ingredients.`),
  prepTime: optionalPositiveIntegerSchema,
  servings: optionalPositiveIntegerSchema,
  sourceUrl: optionalHttpUrlSchema,
  steps: z
    .array(recipeStepInputSchema)
    .min(1, 'Add at least one step.')
    .max(MAX_STEPS, `Add no more than ${MAX_STEPS} steps.`),
  title: z
    .string()
    .trim()
    .min(1, 'Recipe title is required.')
    .max(
      MAX_RECIPE_TITLE_LENGTH,
      `Recipe title must be ${MAX_RECIPE_TITLE_LENGTH} characters or fewer.`,
    ),
});

export const importRecipeInputSchema = z.object({
  url: z
    .string()
    .trim()
    .max(MAX_URL_LENGTH, `URL must be ${MAX_URL_LENGTH} characters or fewer.`)
    .refine(isHttpUrl, 'Enter a valid recipe URL.'),
});

export const recipeIdSchema = z.object({
  recipeId: z.uuid(),
});

export const updateRecipeInputSchema = recipeInputSchema.extend({
  recipeId: z.uuid(),
});

export type RecipeInput = z.input<typeof recipeInputSchema>;
export type ParsedRecipeInput = z.output<typeof recipeInputSchema>;

export type RecipeFormValues = {
  cookTime: string;
  description: string;
  imageUrl: string;
  ingredients: Array<{
    category: string;
    clientId: string;
    name: string;
    quantity: string;
    rawText: string;
    unit: string;
  }>;
  prepTime: string;
  servings: string;
  sourceUrl: string;
  steps: Array<{
    clientId: string;
    instruction: string;
  }>;
  title: string;
};

export type RecipeListItem = {
  cookTime: number | null;
  createdAt: string;
  description: string | null;
  id: string;
  imageUrl: string | null;
  prepTime: number | null;
  servings: number | null;
  sourceUrl: string | null;
  title: string;
  totalTime: number | null;
  updatedAt: string;
};

export type RecipeDetail = RecipeListItem & {
  ingredients: Array<{
    category: string | null;
    id: string;
    name: string;
    quantity: string | null;
    rawText: string | null;
    sortOrder: number;
    unit: string | null;
  }>;
  steps: Array<{
    id: string;
    instruction: string;
    stepNumber: number;
  }>;
};

function createClientId() {
  return globalThis.crypto?.randomUUID() ?? Math.random().toString(36).slice(2);
}

export function createEmptyIngredient(): RecipeFormValues['ingredients'][number] {
  return {
    category: '',
    clientId: createClientId(),
    name: '',
    quantity: '',
    rawText: '',
    unit: '',
  };
}

export function createEmptyStep(): RecipeFormValues['steps'][number] {
  return {
    clientId: createClientId(),
    instruction: '',
  };
}

export function createEmptyRecipeFormValues(): RecipeFormValues {
  return {
    cookTime: '',
    description: '',
    imageUrl: '',
    ingredients: [createEmptyIngredient()],
    prepTime: '',
    servings: '',
    sourceUrl: '',
    steps: [createEmptyStep()],
    title: '',
  };
}

export function capitalizeIngredientName(name: string) {
  const firstVisibleCharacterIndex = name.search(/\S/);

  if (firstVisibleCharacterIndex === -1) return name;

  return `${name.slice(0, firstVisibleCharacterIndex)}${name[firstVisibleCharacterIndex]?.toUpperCase()}${name.slice(firstVisibleCharacterIndex + 1)}`;
}

export function recipeDetailToFormValues(
  recipe: RecipeDetail,
): RecipeFormValues {
  return {
    cookTime: recipe.cookTime?.toString() ?? '',
    description: recipe.description ?? '',
    imageUrl: recipe.imageUrl ?? '',
    ingredients:
      recipe.ingredients.length > 0
        ? recipe.ingredients.map((ingredient) => ({
            category: ingredient.category ?? '',
            clientId: createClientId(),
            name: ingredient.name,
            quantity: ingredient.quantity ?? '',
            rawText: ingredient.rawText ?? '',
            unit: ingredient.unit ?? '',
          }))
        : [createEmptyIngredient()],
    prepTime: recipe.prepTime?.toString() ?? '',
    servings: recipe.servings?.toString() ?? '',
    sourceUrl: recipe.sourceUrl ?? '',
    steps:
      recipe.steps.length > 0
        ? recipe.steps.map((step) => ({
            clientId: createClientId(),
            instruction: step.instruction,
          }))
        : [createEmptyStep()],
    title: recipe.title,
  };
}
