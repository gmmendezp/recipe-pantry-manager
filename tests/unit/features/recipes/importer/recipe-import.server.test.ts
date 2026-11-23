import { beforeEach, describe, expect, it, vi } from 'vitest';

const { fetchRecipeHtml, requireUser, validateImportUrl } = vi.hoisted(() => ({
  fetchRecipeHtml: vi.fn(),
  requireUser: vi.fn(),
  validateImportUrl: vi.fn(),
}));

vi.mock('#/lib/auth/server', () => ({ requireUser }));

vi.mock('#/features/recipes/importer/import-fetch.server', () => ({
  fetchRecipeHtml,
  validateImportUrl,
}));

import { importRecipeFromUrl } from '#/features/recipes/importer/recipe-import.server';

describe('importRecipeFromUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unauthenticated imports before validating or fetching the URL', async () => {
    const authenticationError = new Error('Authentication required.');
    requireUser.mockRejectedValue(authenticationError);

    await expect(
      importRecipeFromUrl('https://example.com/recipe'),
    ).rejects.toBe(authenticationError);

    expect(validateImportUrl).not.toHaveBeenCalled();
    expect(fetchRecipeHtml).not.toHaveBeenCalled();
  });
});
