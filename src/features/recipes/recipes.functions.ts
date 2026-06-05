import { createServerFn } from '@tanstack/react-start';

import { importRecipeFromUrl } from './importer/recipe-import.server';
import {
  importRecipeInputSchema,
  recipeIdSchema,
  recipeInputSchema,
  updateRecipeInputSchema,
} from './recipes.schema';
import {
  createRecipeForUser,
  deleteRecipeForUser,
  getRecipeForUser,
  listRecipesForUser,
  updateRecipeForUser,
} from './recipes.server';

export const listRecipes = createServerFn({ method: 'GET' }).handler(async () =>
  listRecipesForUser(),
);

export const getRecipe = createServerFn({ method: 'GET' })
  .inputValidator(recipeIdSchema)
  .handler(async ({ data }) => getRecipeForUser(data.recipeId));

export const createRecipe = createServerFn({ method: 'POST' })
  .inputValidator(recipeInputSchema)
  .handler(async ({ data }) => createRecipeForUser(data));

export const importRecipe = createServerFn({ method: 'POST' })
  .inputValidator(importRecipeInputSchema)
  .handler(async ({ data }) => importRecipeFromUrl(data.url));

export const updateRecipe = createServerFn({ method: 'POST' })
  .inputValidator(updateRecipeInputSchema)
  .handler(async ({ data }) => {
    const { recipeId, ...input } = data;

    return updateRecipeForUser(recipeId, input);
  });

export const deleteRecipe = createServerFn({ method: 'POST' })
  .inputValidator(recipeIdSchema)
  .handler(async ({ data }) => deleteRecipeForUser(data.recipeId));
