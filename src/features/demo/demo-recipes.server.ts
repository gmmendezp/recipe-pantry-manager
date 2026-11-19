import {
  type ParsedRecipeInput,
  recipeInputSchema,
} from '#/features/recipes/recipes.schema';
import recipeSnapshots from './demo-recipes.snapshot.json';

export const importedDemoRecipes: ParsedRecipeInput[] = recipeInputSchema
  .array()
  .parse(recipeSnapshots);
