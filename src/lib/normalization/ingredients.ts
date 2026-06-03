export function normalizeIngredientName(value: string) {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ');

  if (normalized.endsWith('ies') && normalized.length > 3)
    return `${normalized.slice(0, -3)}y`;

  if (normalized.endsWith('es') && normalized.length > 3)
    return normalized.slice(0, -2);

  if (normalized.endsWith('s') && normalized.length > 3)
    return normalized.slice(0, -1);

  return normalized;
}
