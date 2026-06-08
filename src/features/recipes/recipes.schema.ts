import { z } from 'zod';

import {
  optionalPositiveIntegerSchema,
  optionalTextSchema,
} from '#/lib/validation/schemas';

export const recipeIngredientInputSchema = z.object({
  category: optionalTextSchema,
  name: z.string().trim().min(1, 'Ingredient name is required.'),
  quantity: optionalTextSchema,
  rawText: optionalTextSchema,
  unit: optionalTextSchema,
});

export const recipeStepInputSchema = z.object({
  instruction: z.string().trim().min(1, 'Instruction is required.'),
});

export const recipeInputSchema = z.object({
  cookTime: optionalPositiveIntegerSchema,
  description: optionalTextSchema,
  imageUrl: optionalTextSchema,
  ingredients: z
    .array(recipeIngredientInputSchema)
    .min(1, 'Add at least one ingredient.'),
  prepTime: optionalPositiveIntegerSchema,
  servings: optionalPositiveIntegerSchema,
  sourceUrl: optionalTextSchema,
  steps: z.array(recipeStepInputSchema).min(1, 'Add at least one step.'),
  title: z.string().trim().min(1, 'Recipe title is required.'),
});

export const importRecipeInputSchema = z.object({
  url: z.url('Enter a valid recipe URL.'),
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
