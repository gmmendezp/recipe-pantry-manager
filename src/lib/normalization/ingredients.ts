const prepWords = new Set([
  'chopped',
  'diced',
  'drained',
  'minced',
  'peeled',
  'rinsed',
  'sliced',
  'trimmed',
]);

const containerWords = new Set([
  'bag',
  'bottle',
  'box',
  'can',
  'jar',
  'package',
  'pkg',
]);

const measurementWords = new Set([
  'bunch',
  'bunches',
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
  'pinch',
  'pound',
  'pounds',
  'sprig',
  'sprigs',
  'tablespoon',
  'tablespoons',
  'tbsp',
  'teaspoon',
  'teaspoons',
  'tsp',
]);

const herbWords = new Set([
  'basil',
  'chive',
  'chives',
  'cilantro',
  'dill',
  'mint',
  'oregano',
  'parsley',
  'rosemary',
  'sage',
  'tarragon',
  'thyme',
]);

const singularWords = new Set([
  'asparagus',
  'basil',
  'couscous',
  'hummus',
  'molasses',
]);

export function normalizeIngredientShoppingKey(value: string) {
  const words = cleanIngredientText(value).split(' ').filter(Boolean);
  const withoutQuantity = removeLeadingQuantity(words);
  const withoutMeasurement = removeLeadingMeasurement(withoutQuantity);
  const withoutContainer = removeLeadingContainer(withoutMeasurement);
  const withoutPrepWords = withoutContainer.filter(
    (word) => !prepWords.has(word),
  );
  const withoutHerbFormWords = removeHerbFormWords(withoutPrepWords);

  return normalizePhrase(withoutHerbFormWords.join(' '));
}

function cleanIngredientText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/[,:;]+/g, ' ')
    .replace(/\s+-\s+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizePhrase(value: string) {
  const words = value.split(' ').filter(Boolean);

  if (words.length === 0) return '';

  return words
    .map((word, index) =>
      index === words.length - 1 ? singularizeWord(word) : word,
    )
    .join(' ');
}

function removeLeadingQuantity(words: string[]) {
  const firstIngredientWordIndex = words.findIndex(
    (word) => !isQuantityToken(word),
  );

  return firstIngredientWordIndex === -1
    ? []
    : words.slice(firstIngredientWordIndex);
}

function removeLeadingContainer(words: string[]) {
  if (!containerWords.has(words[0] ?? '')) return words;

  return words[1] === 'of' ? words.slice(2) : words.slice(1);
}

function removeLeadingMeasurement(words: string[]) {
  if (!measurementWords.has(words[0] ?? '')) return words;

  return words[1] === 'of' ? words.slice(2) : words.slice(1);
}

function removeHerbFormWords(words: string[]) {
  const hasHerb = words.some((word) => herbWords.has(singularizeWord(word)));

  if (!hasHerb) return words;

  return words.filter(
    (word) =>
      word !== 'leaf' &&
      word !== 'leaves' &&
      word !== 'sprig' &&
      word !== 'sprigs',
  );
}

function isQuantityToken(word: string) {
  return /^(?:\d+(?:\.\d+)?|\d+\/\d+|[¼½¾⅓⅔⅛⅜⅝⅞])$/.test(word);
}

function singularizeWord(word: string) {
  if (singularWords.has(word)) return word;

  if (word === 'leaves') return 'leaf';

  if (word.endsWith('ies') && word.length > 3) return `${word.slice(0, -3)}y`;

  if (word.endsWith('ches') || word.endsWith('shes') || word.endsWith('xes'))
    return word.slice(0, -2);

  if (word.endsWith('oes') && word.length > 4) return word.slice(0, -2);

  if (word.endsWith('s') && word.length > 3 && !word.endsWith('ss'))
    return word.slice(0, -1);

  return word;
}
