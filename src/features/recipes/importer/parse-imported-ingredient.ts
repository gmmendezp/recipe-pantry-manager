import {
  createEmptyIngredient,
  type RecipeFormValues,
} from '../recipes.schema';

const knownUnits = new Set([
  'bunch',
  'bunches',
  'can',
  'cans',
  'clove',
  'cloves',
  'cup',
  'cups',
  'dash',
  'g',
  'gram',
  'grams',
  'kg',
  'kilogram',
  'kilograms',
  'l',
  'lb',
  'lbs',
  'liter',
  'liters',
  'ml',
  'ounce',
  'ounces',
  'oz',
  'package',
  'packages',
  'pkg',
  'pinch',
  'pound',
  'pounds',
  'tablespoon',
  'tablespoons',
  'tbsp',
  'teaspoon',
  'teaspoons',
  'tsp',
]);

const unicodeFractions: Record<string, string> = {
  '¼': '1/4',
  '½': '1/2',
  '¾': '3/4',
  '⅓': '1/3',
  '⅔': '2/3',
  '⅛': '1/8',
  '⅜': '3/8',
  '⅝': '5/8',
  '⅞': '7/8',
};

const quantityPattern =
  /^(?<quantity>\d+\s*[¼½¾⅓⅔⅛⅜⅝⅞]|\d+\s*-\s*\d+\/\d+|(?:\d+\s+)?\d+\/\d+|\d+(?:\.\d+)?(?:\s*(?:-|to)\s*\d+(?:\.\d+)?)?|[¼½¾⅓⅔⅛⅜⅝⅞])\s+(?<rest>.+)$/i;

export function parseImportedIngredient(
  rawText: string,
): RecipeFormValues['ingredients'][number] {
  const text = rawText.trim();

  if (!text) return createEmptyIngredient();

  const match = quantityPattern.exec(text);

  if (!match?.groups) {
    return {
      ...createEmptyIngredient(),
      name: text,
      rawText: text,
    };
  }

  const quantity = normalizeQuantity(match.groups.quantity);
  const rest = match.groups.rest.trim();
  const [unitCandidate = '', ...nameParts] = rest.split(/\s+/);
  const normalizedUnit = normalizeUnit(unitCandidate);

  if (knownUnits.has(normalizedUnit) && nameParts.length > 0) {
    return {
      ...createEmptyIngredient(),
      name: nameParts.join(' '),
      quantity,
      rawText: text,
      unit: normalizedUnit,
    };
  }

  return {
    ...createEmptyIngredient(),
    name: rest,
    quantity,
    rawText: text,
  };
}

function normalizeQuantity(quantity: string) {
  return quantity
    .replace(/(\d)\s*([¼½¾⅓⅔⅛⅜⅝⅞])/g, '$1 $2')
    .replace(/^(\d+)\s*-\s*(\d+\/\d+)$/, '$1 $2')
    .replace(
      /[¼½¾⅓⅔⅛⅜⅝⅞]/g,
      (fraction) => unicodeFractions[fraction] ?? fraction,
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeUnit(unit: string) {
  return unit.toLowerCase().replace(/[.,:]$/, '');
}
