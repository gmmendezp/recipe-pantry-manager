import type { RecipeFormValues } from '../recipes.schema';
import { fetchRecipeHtml, validateImportUrl } from './import-fetch.server';
import { extractJsonLdValues, findRecipeObject } from './json-ld-recipe';
import { recipeObjectToFormValues } from './normalize-imported-recipe';

export async function importRecipeFromUrl(
  url: string,
): Promise<RecipeFormValues> {
  const recipeUrl = validateImportUrl(url);
  const html = await fetchRecipeHtml(recipeUrl);
  const jsonLdValues = extractJsonLdValues(html);
  const recipe = findRecipeObject(jsonLdValues);

  if (!recipe) {
    throw new Error(
      'No Schema.org recipe data was found on this page. Try another URL or create the recipe manually.',
    );
  }

  return recipeObjectToFormValues(recipe, recipeUrl.toString());
}
