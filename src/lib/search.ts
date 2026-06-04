export function normalizeSearchText(value: null | string | undefined) {
  return value?.trim().toLowerCase().replace(/\s+/g, ' ') ?? '';
}

export function matchesSearch(
  values: Array<null | string | undefined>,
  query: string,
) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) return true;

  return values.some((value) =>
    normalizeSearchText(value).includes(normalizedQuery),
  );
}
