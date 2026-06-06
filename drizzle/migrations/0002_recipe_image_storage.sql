INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;--> statement-breakpoint
CREATE POLICY "recipe_images_insert_own_folder" ON storage.objects AS PERMISSIVE FOR INSERT TO authenticated WITH CHECK (bucket_id = 'recipe-images' AND (storage.foldername(name))[1] = (select auth.uid())::text);--> statement-breakpoint
CREATE POLICY "recipe_images_update_own_folder" ON storage.objects AS PERMISSIVE FOR UPDATE TO authenticated USING (bucket_id = 'recipe-images' AND (storage.foldername(name))[1] = (select auth.uid())::text) WITH CHECK (bucket_id = 'recipe-images' AND (storage.foldername(name))[1] = (select auth.uid())::text);--> statement-breakpoint
CREATE POLICY "recipe_images_delete_own_folder" ON storage.objects AS PERMISSIVE FOR DELETE TO authenticated USING (bucket_id = 'recipe-images' AND (storage.foldername(name))[1] = (select auth.uid())::text);
