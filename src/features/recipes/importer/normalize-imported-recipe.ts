import { decode } from 'html-entities';

import type { RecipeFormValues } from '../recipes.schema';
import { createEmptyStep } from '../recipes.schema';
import type { JsonLdObject, JsonLdValue } from './json-ld-recipe';
import { isJsonLdObject } from './json-ld-recipe';
import { parseImportedIngredient } from './parse-imported-ingredient';

export function recipeObjectToFormValues(
  recipe: JsonLdObject,
  sourceUrl: string,
): RecipeFormValues {
  const title = getString(recipe.name);
  const ingredients = getStringArray(recipe.recipeIngredient);
  const steps = getInstructionStrings(recipe.recipeInstructions);

  if (!title) throw new Error('Imported recipe data is missing a title.');

  if (ingredients.length === 0) {
    throw new Error('Imported recipe data is missing ingredients.');
  }

  return {
    cookTime: parseDurationToMinutes(recipe.cookTime),
    description: getString(recipe.description),
    imageUrl: getImageUrl(recipe.image),
    ingredients: ingredients.map(parseImportedIngredient),
    prepTime: parseDurationToMinutes(recipe.prepTime),
    servings: getServings(recipe.recipeYield),
    sourceUrl,
    steps:
      steps.length > 0
        ? steps.map((instruction) => ({
            ...createEmptyStep(),
            instruction,
          }))
        : [createEmptyStep()],
    title,
  };
}

function getString(value: JsonLdValue | undefined): string {
  if (typeof value === 'string') return decode(value).trim();
  if (typeof value === 'number') return String(value);

  return '';
}

function getStringArray(value: JsonLdValue | undefined): string[] {
  if (typeof value === 'string') return [value.trim()].filter(Boolean);
  if (!Array.isArray(value)) return [];

  return value.map(getString).filter(Boolean);
}

function getImageUrl(value: JsonLdValue | undefined): string {
  if (typeof value === 'string') return value;

  if (Array.isArray(value)) {
    for (const item of value) {
      const imageUrl = getImageUrl(item);

      if (imageUrl) return imageUrl;
    }
  }

  if (isJsonLdObject(value)) {
    return getString(value.url) || getString(value.contentUrl);
  }

  return '';
}

function getInstructionStrings(value: JsonLdValue | undefined): string[] {
  if (typeof value === 'string') return [value.trim()].filter(Boolean);
  if (!Array.isArray(value)) return getInstructionStringFromObject(value);

  return value.flatMap((item) => getInstructionStrings(item));
}

function getInstructionStringFromObject(value: JsonLdValue | undefined) {
  if (!isJsonLdObject(value)) return [];

  const nested = value.itemListElement;

  if (nested) return getInstructionStrings(nested);

  return [getString(value.text) || getString(value.name)].filter(Boolean);
}

function parseDurationToMinutes(value: JsonLdValue | undefined) {
  const duration = getString(value);
  const match = /^P(?:\d+D)?T(?:(\d+)H)?(?:(\d+)M)?$/i.exec(duration);

  if (!match) return '';

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const totalMinutes = hours * 60 + minutes;

  return totalMinutes > 0 ? String(totalMinutes) : '';
}

function getServings(value: JsonLdValue | undefined): string {
  if (typeof value === 'number') return String(value);
  if (typeof value === 'string') return firstInteger(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const servings = getServings(item);

      if (servings) return servings;
    }
  }

  return '';
}

function firstInteger(value: string) {
  const match = /\d+/.exec(value);

  return match?.[0] ?? '';
}
