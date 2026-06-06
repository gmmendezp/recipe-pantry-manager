import { clientEnv } from '../../../lib/env';

export const RECIPE_IMAGES_BUCKET = 'recipe-images';

const MAX_RECIPE_IMAGE_SIZE = 5 * 1024 * 1024;

const allowedImageTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
]);

export function validateRecipeImageFile(file: File) {
  const extension = allowedImageTypes.get(file.type);

  if (!extension) {
    throw new Error('Upload a JPG, PNG, or WebP image.');
  }

  if (file.size > MAX_RECIPE_IMAGE_SIZE) {
    throw new Error('Recipe images must be 5MB or smaller.');
  }

  return extension;
}

export function getRecipeImagePathFromPublicUrl(
  imageUrl: string | null | undefined,
  userId: string,
) {
  if (!imageUrl) return null;

  const supabaseUrl = clientEnv.VITE_SUPABASE_URL.replace(/\/$/, '');
  const prefix = `${supabaseUrl}/storage/v1/object/public/${RECIPE_IMAGES_BUCKET}/`;

  if (!imageUrl.startsWith(prefix)) return null;

  try {
    const path = decodeURIComponent(imageUrl.slice(prefix.length));

    return path.startsWith(`${userId}/`) ? path : null;
  } catch {
    return null;
  }
}
