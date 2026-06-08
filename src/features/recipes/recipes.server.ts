import { and, asc, desc, eq } from 'drizzle-orm';

import { requireUser } from '#/lib/auth/server';
import { toIsoString } from '#/lib/date';
import { db } from '#/lib/db/client';
import { recipeIngredients, recipeSteps, recipes } from '#/lib/db/schema';
import { createSupabaseServerClient } from '#/lib/supabase/server';
import {
  getRecipeImagePathFromPublicUrl,
  RECIPE_IMAGES_BUCKET,
} from './images/recipe-image-storage';
import type {
  ParsedRecipeInput,
  RecipeDetail,
  RecipeListItem,
} from './recipes.schema';

function calculateTotalTime(input: ParsedRecipeInput) {
  if (input.prepTime === null || input.cookTime === null) return null;

  return input.prepTime + input.cookTime;
}

function toRecipeListItem(recipe: typeof recipes.$inferSelect): RecipeListItem {
  return {
    cookTime: recipe.cookTime,
    createdAt: toIsoString(recipe.createdAt),
    description: recipe.description,
    id: recipe.id,
    imageUrl: recipe.imageUrl,
    prepTime: recipe.prepTime,
    servings: recipe.servings,
    sourceUrl: recipe.sourceUrl,
    title: recipe.title,
    totalTime: recipe.totalTime,
    updatedAt: toIsoString(recipe.updatedAt),
  };
}

function toRecipeIngredientRows(
  recipeId: string,
  ingredients: ParsedRecipeInput['ingredients'],
) {
  return ingredients.map((ingredient, index) => ({
    category: ingredient.category,
    name: ingredient.name,
    quantity: ingredient.quantity,
    rawText: ingredient.rawText,
    recipeId,
    sortOrder: index,
    unit: ingredient.unit,
  }));
}

function toRecipeStepRows(recipeId: string, steps: ParsedRecipeInput['steps']) {
  return steps.map((step, index) => ({
    instruction: step.instruction,
    recipeId,
    stepNumber: index + 1,
  }));
}

async function deleteRecipeImageByUrl(imageUrl: string | null, userId: string) {
  try {
    const path = getRecipeImagePathFromPublicUrl(imageUrl, userId);

    if (!path) return;

    const supabase = createSupabaseServerClient();

    await supabase.storage.from(RECIPE_IMAGES_BUCKET).remove([path]);
  } catch {
    // Image cleanup is best-effort; recipe writes should remain authoritative.
  }
}

export async function listRecipesForUser(): Promise<RecipeListItem[]> {
  const user = await requireUser();

  const rows = await db
    .select()
    .from(recipes)
    .where(eq(recipes.userId, user.id))
    .orderBy(desc(recipes.updatedAt));

  return rows.map(toRecipeListItem);
}

export async function getRecipeForUser(
  recipeId: string,
): Promise<RecipeDetail | null> {
  const user = await requireUser();

  const [recipe] = await db
    .select()
    .from(recipes)
    .where(and(eq(recipes.id, recipeId), eq(recipes.userId, user.id)))
    .limit(1);

  if (!recipe) return null;

  const [ingredients, steps] = await Promise.all([
    db
      .select()
      .from(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, recipe.id))
      .orderBy(asc(recipeIngredients.sortOrder)),
    db
      .select()
      .from(recipeSteps)
      .where(eq(recipeSteps.recipeId, recipe.id))
      .orderBy(asc(recipeSteps.stepNumber)),
  ]);

  return {
    ...toRecipeListItem(recipe),
    ingredients: ingredients.map((ingredient) => ({
      category: ingredient.category,
      id: ingredient.id,
      name: ingredient.name,
      quantity: ingredient.quantity,
      rawText: ingredient.rawText,
      sortOrder: ingredient.sortOrder,
      unit: ingredient.unit,
    })),
    steps: steps.map((step) => ({
      id: step.id,
      instruction: step.instruction,
      stepNumber: step.stepNumber,
    })),
  };
}

export async function createRecipeForUser(input: ParsedRecipeInput) {
  const user = await requireUser();
  const now = new Date();

  const [recipe] = await db.transaction(async (tx) => {
    const [createdRecipe] = await tx
      .insert(recipes)
      .values({
        cookTime: input.cookTime,
        description: input.description,
        imageUrl: input.imageUrl,
        prepTime: input.prepTime,
        servings: input.servings,
        sourceUrl: input.sourceUrl,
        title: input.title,
        totalTime: calculateTotalTime(input),
        updatedAt: now,
        userId: user.id,
      })
      .returning();

    await tx
      .insert(recipeIngredients)
      .values(toRecipeIngredientRows(createdRecipe.id, input.ingredients));

    await tx
      .insert(recipeSteps)
      .values(toRecipeStepRows(createdRecipe.id, input.steps));

    return [createdRecipe];
  });

  return toRecipeListItem(recipe);
}

export async function updateRecipeForUser(
  recipeId: string,
  input: ParsedRecipeInput,
) {
  const user = await requireUser();
  const now = new Date();
  const [currentRecipe] = await db
    .select({ imageUrl: recipes.imageUrl })
    .from(recipes)
    .where(and(eq(recipes.id, recipeId), eq(recipes.userId, user.id)))
    .limit(1);

  const [recipe] = await db.transaction(async (tx) => {
    const [updatedRecipe] = await tx
      .update(recipes)
      .set({
        cookTime: input.cookTime,
        description: input.description,
        imageUrl: input.imageUrl,
        prepTime: input.prepTime,
        servings: input.servings,
        sourceUrl: input.sourceUrl,
        title: input.title,
        totalTime: calculateTotalTime(input),
        updatedAt: now,
      })
      .where(and(eq(recipes.id, recipeId), eq(recipes.userId, user.id)))
      .returning();

    if (!updatedRecipe) return [null];

    await tx
      .delete(recipeIngredients)
      .where(eq(recipeIngredients.recipeId, updatedRecipe.id));
    await tx
      .delete(recipeSteps)
      .where(eq(recipeSteps.recipeId, updatedRecipe.id));

    await tx
      .insert(recipeIngredients)
      .values(toRecipeIngredientRows(updatedRecipe.id, input.ingredients));

    await tx
      .insert(recipeSteps)
      .values(toRecipeStepRows(updatedRecipe.id, input.steps));

    return [updatedRecipe];
  });

  if (recipe && currentRecipe?.imageUrl !== input.imageUrl) {
    await deleteRecipeImageByUrl(currentRecipe?.imageUrl ?? null, user.id);
  }

  return recipe ? toRecipeListItem(recipe) : null;
}

export async function deleteRecipeForUser(recipeId: string) {
  const user = await requireUser();

  const deletedRecipes = await db
    .delete(recipes)
    .where(and(eq(recipes.id, recipeId), eq(recipes.userId, user.id)))
    .returning({ id: recipes.id, imageUrl: recipes.imageUrl });

  await deleteRecipeImageByUrl(deletedRecipes[0]?.imageUrl ?? null, user.id);

  return { deleted: deletedRecipes.length > 0 };
}
