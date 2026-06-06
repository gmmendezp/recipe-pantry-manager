import { normalizeIngredientName } from '../../lib/normalization/ingredients';

type RecipeIngredientForGroceryList = {
  category: string | null;
  name: string;
  quantity: string | null;
  recipeId: string;
  unit: string | null;
};

type PantryItemForGroceryList = {
  name: string;
  quantity: string | null;
  unit: string | null;
};

export type MergedGroceryListItem = {
  category: string | null;
  name: string;
  pantryMatch: boolean;
  pantryQuantity: string | null;
  pantryUnit: string | null;
  quantity: string | null;
  sourceRecipeIds: Set<string>;
  unit: string | null;
};

function mergeQuantity(current: string | null, next: string | null) {
  if (!current) return next;
  if (!next || current === next) return current;

  const currentNumber = Number(current);
  const nextNumber = Number(next);

  if (Number.isFinite(currentNumber) && Number.isFinite(nextNumber))
    return String(currentNumber + nextNumber);

  return Array.from(new Set([...current.split(', '), next])).join(', ');
}

export function mergeGroceryListItems(
  ingredients: RecipeIngredientForGroceryList[],
  pantryItems: PantryItemForGroceryList[],
) {
  const pantryByName = new Map<
    string,
    { quantity: string | null; unit: string | null }
  >();

  for (const item of pantryItems) {
    const normalizedName = normalizeIngredientName(item.name);

    if (normalizedName && !pantryByName.has(normalizedName)) {
      pantryByName.set(normalizedName, {
        quantity: item.quantity,
        unit: item.unit,
      });
    }
  }

  const mergedItems = new Map<string, MergedGroceryListItem>();

  for (const ingredient of ingredients) {
    const normalizedName = normalizeIngredientName(ingredient.name);
    const pantryMatch = pantryByName.get(normalizedName) ?? null;
    const key = [
      normalizedName,
      ingredient.unit ?? '',
      ingredient.category ?? '',
      Boolean(pantryMatch),
    ].join('|');
    const existing = mergedItems.get(key);

    if (existing) {
      existing.quantity = mergeQuantity(existing.quantity, ingredient.quantity);
      existing.sourceRecipeIds.add(ingredient.recipeId);
      continue;
    }

    mergedItems.set(key, {
      category: ingredient.category,
      name: ingredient.name,
      pantryMatch: Boolean(pantryMatch),
      pantryQuantity: pantryMatch?.quantity ?? null,
      pantryUnit: pantryMatch?.unit ?? null,
      quantity: ingredient.quantity,
      sourceRecipeIds: new Set([ingredient.recipeId]),
      unit: ingredient.unit,
    });
  }

  return mergedItems;
}
