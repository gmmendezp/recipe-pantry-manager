CREATE TABLE "grocery_list_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"grocery_list_id" uuid NOT NULL,
	"name" text NOT NULL,
	"quantity" text,
	"unit" text,
	"category" text,
	"is_checked" boolean DEFAULT false NOT NULL,
	"pantry_match" boolean DEFAULT false NOT NULL,
	"source_recipe_ids" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "grocery_list_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "grocery_lists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "grocery_lists" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "pantry_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"quantity" text,
	"unit" text,
	"category" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pantry_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "recipe_ingredients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"name" text NOT NULL,
	"raw_text" text,
	"quantity" text,
	"unit" text,
	"category" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "recipe_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipe_id" uuid NOT NULL,
	"step_number" integer NOT NULL,
	"instruction" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recipe_steps" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "recipe_tag_assignments" (
	"recipe_id" uuid NOT NULL,
	"tag_id" uuid NOT NULL,
	CONSTRAINT "recipe_tag_assignments_recipe_id_tag_id_pk" PRIMARY KEY("recipe_id","tag_id")
);
--> statement-breakpoint
ALTER TABLE "recipe_tag_assignments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "recipe_tags" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recipe_tags" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "recipes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image_url" text,
	"prep_time" integer,
	"cook_time" integer,
	"total_time" integer,
	"servings" integer,
	"source_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "recipes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "grocery_list_items" ADD CONSTRAINT "grocery_list_items_grocery_list_id_grocery_lists_id_fk" FOREIGN KEY ("grocery_list_id") REFERENCES "public"."grocery_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "grocery_lists" ADD CONSTRAINT "grocery_lists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pantry_items" ADD CONSTRAINT "pantry_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_ingredients" ADD CONSTRAINT "recipe_ingredients_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_steps" ADD CONSTRAINT "recipe_steps_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_tag_assignments" ADD CONSTRAINT "recipe_tag_assignments_recipe_id_recipes_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "public"."recipes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_tag_assignments" ADD CONSTRAINT "recipe_tag_assignments_tag_id_recipe_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."recipe_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "grocery_list_items_grocery_list_id_idx" ON "grocery_list_items" USING btree ("grocery_list_id");--> statement-breakpoint
CREATE INDEX "grocery_lists_user_id_idx" ON "grocery_lists" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "pantry_items_user_id_idx" ON "pantry_items" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "recipe_ingredients_recipe_id_idx" ON "recipe_ingredients" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "recipe_steps_recipe_id_idx" ON "recipe_steps" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "recipe_tag_assignments_recipe_id_idx" ON "recipe_tag_assignments" USING btree ("recipe_id");--> statement-breakpoint
CREATE INDEX "recipe_tag_assignments_tag_id_idx" ON "recipe_tag_assignments" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "recipe_tags_user_id_idx" ON "recipe_tags" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "recipe_tags_user_id_name_idx" ON "recipe_tags" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "recipes_user_id_idx" ON "recipes" USING btree ("user_id");--> statement-breakpoint
CREATE POLICY "grocery_list_items_select_own_list" ON "grocery_list_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) is not null and exists (select 1 from "grocery_lists" where "grocery_lists"."id" = "grocery_list_items"."grocery_list_id" and "grocery_lists"."user_id" = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "grocery_list_items_insert_own_list" ON "grocery_list_items" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) is not null and exists (select 1 from "grocery_lists" where "grocery_lists"."id" = "grocery_list_items"."grocery_list_id" and "grocery_lists"."user_id" = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "grocery_list_items_update_own_list" ON "grocery_list_items" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) is not null and exists (select 1 from "grocery_lists" where "grocery_lists"."id" = "grocery_list_items"."grocery_list_id" and "grocery_lists"."user_id" = (select auth.uid()))) WITH CHECK ((select auth.uid()) is not null and exists (select 1 from "grocery_lists" where "grocery_lists"."id" = "grocery_list_items"."grocery_list_id" and "grocery_lists"."user_id" = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "grocery_list_items_delete_own_list" ON "grocery_list_items" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) is not null and exists (select 1 from "grocery_lists" where "grocery_lists"."id" = "grocery_list_items"."grocery_list_id" and "grocery_lists"."user_id" = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "grocery_lists_select_own" ON "grocery_lists" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) is not null and (select auth.uid()) = "grocery_lists"."user_id");--> statement-breakpoint
CREATE POLICY "grocery_lists_insert_own" ON "grocery_lists" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) is not null and (select auth.uid()) = "grocery_lists"."user_id");--> statement-breakpoint
CREATE POLICY "grocery_lists_update_own" ON "grocery_lists" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) is not null and (select auth.uid()) = "grocery_lists"."user_id") WITH CHECK ((select auth.uid()) is not null and (select auth.uid()) = "grocery_lists"."user_id");--> statement-breakpoint
CREATE POLICY "grocery_lists_delete_own" ON "grocery_lists" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) is not null and (select auth.uid()) = "grocery_lists"."user_id");--> statement-breakpoint
CREATE POLICY "pantry_items_select_own" ON "pantry_items" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) is not null and (select auth.uid()) = "pantry_items"."user_id");--> statement-breakpoint
CREATE POLICY "pantry_items_insert_own" ON "pantry_items" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) is not null and (select auth.uid()) = "pantry_items"."user_id");--> statement-breakpoint
CREATE POLICY "pantry_items_update_own" ON "pantry_items" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) is not null and (select auth.uid()) = "pantry_items"."user_id") WITH CHECK ((select auth.uid()) is not null and (select auth.uid()) = "pantry_items"."user_id");--> statement-breakpoint
CREATE POLICY "pantry_items_delete_own" ON "pantry_items" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) is not null and (select auth.uid()) = "pantry_items"."user_id");--> statement-breakpoint
CREATE POLICY "recipe_ingredients_select_own_recipe" ON "recipe_ingredients" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) is not null and exists (select 1 from "recipes" where "recipes"."id" = "recipe_ingredients"."recipe_id" and "recipes"."user_id" = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "recipe_ingredients_insert_own_recipe" ON "recipe_ingredients" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) is not null and exists (select 1 from "recipes" where "recipes"."id" = "recipe_ingredients"."recipe_id" and "recipes"."user_id" = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "recipe_ingredients_update_own_recipe" ON "recipe_ingredients" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) is not null and exists (select 1 from "recipes" where "recipes"."id" = "recipe_ingredients"."recipe_id" and "recipes"."user_id" = (select auth.uid()))) WITH CHECK ((select auth.uid()) is not null and exists (select 1 from "recipes" where "recipes"."id" = "recipe_ingredients"."recipe_id" and "recipes"."user_id" = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "recipe_ingredients_delete_own_recipe" ON "recipe_ingredients" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) is not null and exists (select 1 from "recipes" where "recipes"."id" = "recipe_ingredients"."recipe_id" and "recipes"."user_id" = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "recipe_steps_select_own_recipe" ON "recipe_steps" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) is not null and exists (select 1 from "recipes" where "recipes"."id" = "recipe_steps"."recipe_id" and "recipes"."user_id" = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "recipe_steps_insert_own_recipe" ON "recipe_steps" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) is not null and exists (select 1 from "recipes" where "recipes"."id" = "recipe_steps"."recipe_id" and "recipes"."user_id" = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "recipe_steps_update_own_recipe" ON "recipe_steps" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) is not null and exists (select 1 from "recipes" where "recipes"."id" = "recipe_steps"."recipe_id" and "recipes"."user_id" = (select auth.uid()))) WITH CHECK ((select auth.uid()) is not null and exists (select 1 from "recipes" where "recipes"."id" = "recipe_steps"."recipe_id" and "recipes"."user_id" = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "recipe_steps_delete_own_recipe" ON "recipe_steps" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) is not null and exists (select 1 from "recipes" where "recipes"."id" = "recipe_steps"."recipe_id" and "recipes"."user_id" = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "recipe_tag_assignments_select_own" ON "recipe_tag_assignments" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) is not null and exists (select 1 from "recipes" where "recipes"."id" = "recipe_tag_assignments"."recipe_id" and "recipes"."user_id" = (select auth.uid())) and exists (select 1 from "recipe_tags" where "recipe_tags"."id" = "recipe_tag_assignments"."tag_id" and "recipe_tags"."user_id" = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "recipe_tag_assignments_insert_own" ON "recipe_tag_assignments" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) is not null and exists (select 1 from "recipes" where "recipes"."id" = "recipe_tag_assignments"."recipe_id" and "recipes"."user_id" = (select auth.uid())) and exists (select 1 from "recipe_tags" where "recipe_tags"."id" = "recipe_tag_assignments"."tag_id" and "recipe_tags"."user_id" = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "recipe_tag_assignments_delete_own" ON "recipe_tag_assignments" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) is not null and exists (select 1 from "recipes" where "recipes"."id" = "recipe_tag_assignments"."recipe_id" and "recipes"."user_id" = (select auth.uid())) and exists (select 1 from "recipe_tags" where "recipe_tags"."id" = "recipe_tag_assignments"."tag_id" and "recipe_tags"."user_id" = (select auth.uid())));--> statement-breakpoint
CREATE POLICY "recipe_tags_select_own" ON "recipe_tags" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) is not null and (select auth.uid()) = "recipe_tags"."user_id");--> statement-breakpoint
CREATE POLICY "recipe_tags_insert_own" ON "recipe_tags" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) is not null and (select auth.uid()) = "recipe_tags"."user_id");--> statement-breakpoint
CREATE POLICY "recipe_tags_update_own" ON "recipe_tags" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) is not null and (select auth.uid()) = "recipe_tags"."user_id") WITH CHECK ((select auth.uid()) is not null and (select auth.uid()) = "recipe_tags"."user_id");--> statement-breakpoint
CREATE POLICY "recipe_tags_delete_own" ON "recipe_tags" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) is not null and (select auth.uid()) = "recipe_tags"."user_id");--> statement-breakpoint
CREATE POLICY "recipes_select_own" ON "recipes" AS PERMISSIVE FOR SELECT TO "authenticated" USING ((select auth.uid()) is not null and (select auth.uid()) = "recipes"."user_id");--> statement-breakpoint
CREATE POLICY "recipes_insert_own" ON "recipes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ((select auth.uid()) is not null and (select auth.uid()) = "recipes"."user_id");--> statement-breakpoint
CREATE POLICY "recipes_update_own" ON "recipes" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ((select auth.uid()) is not null and (select auth.uid()) = "recipes"."user_id") WITH CHECK ((select auth.uid()) is not null and (select auth.uid()) = "recipes"."user_id");--> statement-breakpoint
CREATE POLICY "recipes_delete_own" ON "recipes" AS PERMISSIVE FOR DELETE TO "authenticated" USING ((select auth.uid()) is not null and (select auth.uid()) = "recipes"."user_id");
