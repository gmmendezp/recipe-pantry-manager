export function toIsoString(value: Date) {
  return value.toISOString();
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value));
}
