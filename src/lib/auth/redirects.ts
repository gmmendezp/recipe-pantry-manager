export const loginRedirects = [
  '/dashboard',
  '/recipes',
  '/pantry',
  '/grocery-lists',
] as const;

export type LoginRedirect = (typeof loginRedirects)[number];

export function getLoginRedirect(value: unknown): LoginRedirect | undefined {
  if (typeof value === 'string') {
    return loginRedirects.find((redirect) => redirect === value);
  }
}

export function getLoginRedirectOrDefault(value: unknown): LoginRedirect {
  return getLoginRedirect(value) ?? '/dashboard';
}
