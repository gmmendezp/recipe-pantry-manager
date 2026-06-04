export function formatDelimitedMeta(
  values: Array<null | string | undefined>,
  fallback = '-',
) {
  return values.filter(Boolean).join(' · ') || fallback;
}

export function formatQuantity(
  quantity: null | string | undefined,
  unit: null | string | undefined,
  fallback = '-',
) {
  return [quantity, unit].filter(Boolean).join(' ') || fallback;
}

export function formatCount(count: number, singular: string, plural?: string) {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`;
}
