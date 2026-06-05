import { decode } from 'html-entities';

export type JsonLdValue =
  | JsonLdValue[]
  | boolean
  | null
  | number
  | string
  | { [key: string]: JsonLdValue };

export type JsonLdObject = { [key: string]: JsonLdValue };

export function extractJsonLdValues(html: string): JsonLdValue[] {
  const values: JsonLdValue[] = [];
  const scriptPattern =
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

  for (const match of html.matchAll(scriptPattern)) {
    const content = match[1]?.trim() ?? '';

    if (!content) continue;

    const parsed = parseJsonLdContent(content);

    if (parsed) values.push(parsed);
  }

  return values;
}

export function findRecipeObject(values: JsonLdValue[]): JsonLdObject | null {
  for (const value of values) {
    const recipe = findRecipeObjectInValue(value);

    if (recipe) return recipe;
  }

  return null;
}

export function isJsonLdObject(value: unknown): value is JsonLdObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJsonLdContent(content: string): JsonLdValue | null {
  try {
    return JSON.parse(content) as JsonLdValue;
  } catch {
    try {
      return JSON.parse(decode(content)) as JsonLdValue;
    } catch {
      return null;
    }
  }
}

function findRecipeObjectInValue(value: JsonLdValue): JsonLdObject | null {
  if (Array.isArray(value)) {
    for (const item of value) {
      const recipe = findRecipeObjectInValue(item);

      if (recipe) return recipe;
    }

    return null;
  }

  if (!isJsonLdObject(value)) return null;

  if (isRecipeObject(value)) return value;

  const graph = value['@graph'];

  if (graph) return findRecipeObjectInValue(graph);

  for (const child of Object.values(value)) {
    if (Array.isArray(child) || isJsonLdObject(child)) {
      const recipe = findRecipeObjectInValue(child);

      if (recipe) return recipe;
    }
  }

  return null;
}

function isRecipeObject(value: JsonLdObject) {
  const type = value['@type'];

  if (typeof type === 'string') return type.toLowerCase() === 'recipe';

  return (
    Array.isArray(type) &&
    type.some(
      (item) => typeof item === 'string' && item.toLowerCase() === 'recipe',
    )
  );
}
