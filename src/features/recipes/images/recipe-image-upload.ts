import {
  getRecipeImagePathFromPublicUrl,
  RECIPE_IMAGES_BUCKET,
  validateRecipeImageFile,
} from './recipe-image-storage';

export { validateRecipeImageFile } from './recipe-image-storage';

export async function uploadRecipeImage(file: File) {
  const extension = validateRecipeImageFile(file);

  const { supabase } = await import('#/lib/supabase/client');
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    throw new Error('Sign in again before uploading a recipe image.');
  }

  const path = `${userData.user.id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(RECIPE_IMAGES_BUCKET)
    .upload(path, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(uploadError.message || 'Unable to upload recipe image.');
  }

  const { data } = supabase.storage
    .from(RECIPE_IMAGES_BUCKET)
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteUploadedRecipeImage(imageUrl: string) {
  try {
    const { supabase } = await import('#/lib/supabase/client');
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return;

    const path = getRecipeImagePathFromPublicUrl(imageUrl, user.id);

    if (!path) return;

    await supabase.storage.from(RECIPE_IMAGES_BUCKET).remove([path]);
  } catch {
    // Best-effort rollback cleanup should not mask the original save error.
  }
}
