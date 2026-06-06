import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../../../src/lib/env', () => ({
  clientEnv: {
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    VITE_SUPABASE_URL: 'https://example.supabase.co/',
  },
}));

import {
  getRecipeImagePathFromPublicUrl,
  validateRecipeImageFile,
} from '../../../../../src/features/recipes/images/recipe-image-storage';

describe('validateRecipeImageFile', () => {
  it('returns the storage extension for supported image types', () => {
    expect(validateRecipeImageFile(createFile('image/jpeg'))).toBe('jpg');
    expect(validateRecipeImageFile(createFile('image/png'))).toBe('png');
    expect(validateRecipeImageFile(createFile('image/webp'))).toBe('webp');
  });

  it('throws for unsupported image types', () => {
    expect(() => validateRecipeImageFile(createFile('image/gif'))).toThrow(
      'Upload a JPG, PNG, or WebP image.',
    );
  });

  it('throws when the image is larger than 5MB', () => {
    const largeImage = createFile('image/png', 5 * 1024 * 1024 + 1);

    expect(() => validateRecipeImageFile(largeImage)).toThrow(
      'Recipe images must be 5MB or smaller.',
    );
  });
});

describe('getRecipeImagePathFromPublicUrl', () => {
  it('returns the user-owned storage path from a public recipe image URL', () => {
    expect(
      getRecipeImagePathFromPublicUrl(
        'https://example.supabase.co/storage/v1/object/public/recipe-images/user-1/image.png',
        'user-1',
      ),
    ).toBe('user-1/image.png');
  });

  it('decodes encoded storage paths', () => {
    expect(
      getRecipeImagePathFromPublicUrl(
        'https://example.supabase.co/storage/v1/object/public/recipe-images/user-1/folder%20image.webp',
        'user-1',
      ),
    ).toBe('user-1/folder image.webp');
  });

  it('returns null for non-recipe-image URLs or another user path', () => {
    expect(
      getRecipeImagePathFromPublicUrl(
        'https://images.example.com/image.png',
        'user-1',
      ),
    ).toBeNull();
    expect(
      getRecipeImagePathFromPublicUrl(
        'https://example.supabase.co/storage/v1/object/public/recipe-images/user-2/image.png',
        'user-1',
      ),
    ).toBeNull();
  });

  it('returns null when the encoded path is malformed', () => {
    expect(
      getRecipeImagePathFromPublicUrl(
        'https://example.supabase.co/storage/v1/object/public/recipe-images/user-1/%E0%A4%A',
        'user-1',
      ),
    ).toBeNull();
  });
});

function createFile(type: string, size = 1024) {
  return new File([new Uint8Array(size)], 'recipe-image', { type });
}
