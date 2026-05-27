import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgPolicy,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { authenticatedRole, authUid, authUsers } from 'drizzle-orm/supabase';

export const recipes = pgTable(
  'recipes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description'),
    imageUrl: text('image_url'),
    prepTime: integer('prep_time'),
    cookTime: integer('cook_time'),
    totalTime: integer('total_time'),
    servings: integer('servings'),
    sourceUrl: text('source_url'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('recipes_user_id_idx').on(table.userId),
    pgPolicy('recipes_select_own', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
    }),
    pgPolicy('recipes_insert_own', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
    }),
    pgPolicy('recipes_update_own', {
      for: 'update',
      to: authenticatedRole,
      using: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
      withCheck: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
    }),
    pgPolicy('recipes_delete_own', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
    }),
  ],
).enableRLS();

export const recipeIngredients = pgTable(
  'recipe_ingredients',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    rawText: text('raw_text'),
    quantity: text('quantity'),
    unit: text('unit'),
    category: text('category'),
    sortOrder: integer('sort_order').default(0).notNull(),
  },
  (table) => [
    index('recipe_ingredients_recipe_id_idx').on(table.recipeId),
    pgPolicy('recipe_ingredients_select_own_recipe', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${authUid} is not null and exists (select 1 from ${recipes} where ${recipes.id} = ${table.recipeId} and ${recipes.userId} = ${authUid})`,
    }),
    pgPolicy('recipe_ingredients_insert_own_recipe', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`${authUid} is not null and exists (select 1 from ${recipes} where ${recipes.id} = ${table.recipeId} and ${recipes.userId} = ${authUid})`,
    }),
    pgPolicy('recipe_ingredients_update_own_recipe', {
      for: 'update',
      to: authenticatedRole,
      using: sql`${authUid} is not null and exists (select 1 from ${recipes} where ${recipes.id} = ${table.recipeId} and ${recipes.userId} = ${authUid})`,
      withCheck: sql`${authUid} is not null and exists (select 1 from ${recipes} where ${recipes.id} = ${table.recipeId} and ${recipes.userId} = ${authUid})`,
    }),
    pgPolicy('recipe_ingredients_delete_own_recipe', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`${authUid} is not null and exists (select 1 from ${recipes} where ${recipes.id} = ${table.recipeId} and ${recipes.userId} = ${authUid})`,
    }),
  ],
).enableRLS();

export const recipeSteps = pgTable(
  'recipe_steps',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    stepNumber: integer('step_number').notNull(),
    instruction: text('instruction').notNull(),
  },
  (table) => [
    index('recipe_steps_recipe_id_idx').on(table.recipeId),
    pgPolicy('recipe_steps_select_own_recipe', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${authUid} is not null and exists (select 1 from ${recipes} where ${recipes.id} = ${table.recipeId} and ${recipes.userId} = ${authUid})`,
    }),
    pgPolicy('recipe_steps_insert_own_recipe', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`${authUid} is not null and exists (select 1 from ${recipes} where ${recipes.id} = ${table.recipeId} and ${recipes.userId} = ${authUid})`,
    }),
    pgPolicy('recipe_steps_update_own_recipe', {
      for: 'update',
      to: authenticatedRole,
      using: sql`${authUid} is not null and exists (select 1 from ${recipes} where ${recipes.id} = ${table.recipeId} and ${recipes.userId} = ${authUid})`,
      withCheck: sql`${authUid} is not null and exists (select 1 from ${recipes} where ${recipes.id} = ${table.recipeId} and ${recipes.userId} = ${authUid})`,
    }),
    pgPolicy('recipe_steps_delete_own_recipe', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`${authUid} is not null and exists (select 1 from ${recipes} where ${recipes.id} = ${table.recipeId} and ${recipes.userId} = ${authUid})`,
    }),
  ],
).enableRLS();

export const recipeTags = pgTable(
  'recipe_tags',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('recipe_tags_user_id_idx').on(table.userId),
    uniqueIndex('recipe_tags_user_id_name_idx').on(table.userId, table.name),
    pgPolicy('recipe_tags_select_own', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
    }),
    pgPolicy('recipe_tags_insert_own', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
    }),
    pgPolicy('recipe_tags_update_own', {
      for: 'update',
      to: authenticatedRole,
      using: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
      withCheck: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
    }),
    pgPolicy('recipe_tags_delete_own', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
    }),
  ],
).enableRLS();

export const recipeTagAssignments = pgTable(
  'recipe_tag_assignments',
  {
    recipeId: uuid('recipe_id')
      .notNull()
      .references(() => recipes.id, { onDelete: 'cascade' }),
    tagId: uuid('tag_id')
      .notNull()
      .references(() => recipeTags.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.recipeId, table.tagId] }),
    index('recipe_tag_assignments_recipe_id_idx').on(table.recipeId),
    index('recipe_tag_assignments_tag_id_idx').on(table.tagId),
    pgPolicy('recipe_tag_assignments_select_own', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${authUid} is not null and exists (select 1 from ${recipes} where ${recipes.id} = ${table.recipeId} and ${recipes.userId} = ${authUid}) and exists (select 1 from ${recipeTags} where ${recipeTags.id} = ${table.tagId} and ${recipeTags.userId} = ${authUid})`,
    }),
    pgPolicy('recipe_tag_assignments_insert_own', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`${authUid} is not null and exists (select 1 from ${recipes} where ${recipes.id} = ${table.recipeId} and ${recipes.userId} = ${authUid}) and exists (select 1 from ${recipeTags} where ${recipeTags.id} = ${table.tagId} and ${recipeTags.userId} = ${authUid})`,
    }),
    pgPolicy('recipe_tag_assignments_delete_own', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`${authUid} is not null and exists (select 1 from ${recipes} where ${recipes.id} = ${table.recipeId} and ${recipes.userId} = ${authUid}) and exists (select 1 from ${recipeTags} where ${recipeTags.id} = ${table.tagId} and ${recipeTags.userId} = ${authUid})`,
    }),
  ],
).enableRLS();

export const pantryItems = pgTable(
  'pantry_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    quantity: text('quantity'),
    unit: text('unit'),
    category: text('category'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('pantry_items_user_id_idx').on(table.userId),
    pgPolicy('pantry_items_select_own', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
    }),
    pgPolicy('pantry_items_insert_own', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
    }),
    pgPolicy('pantry_items_update_own', {
      for: 'update',
      to: authenticatedRole,
      using: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
      withCheck: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
    }),
    pgPolicy('pantry_items_delete_own', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
    }),
  ],
).enableRLS();

export const groceryLists = pgTable(
  'grocery_lists',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => authUsers.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('grocery_lists_user_id_idx').on(table.userId),
    pgPolicy('grocery_lists_select_own', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
    }),
    pgPolicy('grocery_lists_insert_own', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
    }),
    pgPolicy('grocery_lists_update_own', {
      for: 'update',
      to: authenticatedRole,
      using: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
      withCheck: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
    }),
    pgPolicy('grocery_lists_delete_own', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`${authUid} is not null and ${authUid} = ${table.userId}`,
    }),
  ],
).enableRLS();

export const groceryListItems = pgTable(
  'grocery_list_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    groceryListId: uuid('grocery_list_id')
      .notNull()
      .references(() => groceryLists.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    quantity: text('quantity'),
    unit: text('unit'),
    category: text('category'),
    isChecked: boolean('is_checked').default(false).notNull(),
    pantryMatch: boolean('pantry_match').default(false).notNull(),
    sourceRecipeIds: jsonb('source_recipe_ids')
      .$type<string[]>()
      .default(sql`'[]'::jsonb`)
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('grocery_list_items_grocery_list_id_idx').on(table.groceryListId),
    pgPolicy('grocery_list_items_select_own_list', {
      for: 'select',
      to: authenticatedRole,
      using: sql`${authUid} is not null and exists (select 1 from ${groceryLists} where ${groceryLists.id} = ${table.groceryListId} and ${groceryLists.userId} = ${authUid})`,
    }),
    pgPolicy('grocery_list_items_insert_own_list', {
      for: 'insert',
      to: authenticatedRole,
      withCheck: sql`${authUid} is not null and exists (select 1 from ${groceryLists} where ${groceryLists.id} = ${table.groceryListId} and ${groceryLists.userId} = ${authUid})`,
    }),
    pgPolicy('grocery_list_items_update_own_list', {
      for: 'update',
      to: authenticatedRole,
      using: sql`${authUid} is not null and exists (select 1 from ${groceryLists} where ${groceryLists.id} = ${table.groceryListId} and ${groceryLists.userId} = ${authUid})`,
      withCheck: sql`${authUid} is not null and exists (select 1 from ${groceryLists} where ${groceryLists.id} = ${table.groceryListId} and ${groceryLists.userId} = ${authUid})`,
    }),
    pgPolicy('grocery_list_items_delete_own_list', {
      for: 'delete',
      to: authenticatedRole,
      using: sql`${authUid} is not null and exists (select 1 from ${groceryLists} where ${groceryLists.id} = ${table.groceryListId} and ${groceryLists.userId} = ${authUid})`,
    }),
  ],
).enableRLS();

export const recipesRelations = relations(recipes, ({ many }) => ({
  ingredients: many(recipeIngredients),
  steps: many(recipeSteps),
  tagAssignments: many(recipeTagAssignments),
}));

export const recipeIngredientsRelations = relations(
  recipeIngredients,
  ({ one }) => ({
    recipe: one(recipes, {
      fields: [recipeIngredients.recipeId],
      references: [recipes.id],
    }),
  }),
);

export const recipeStepsRelations = relations(recipeSteps, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeSteps.recipeId],
    references: [recipes.id],
  }),
}));

export const recipeTagsRelations = relations(recipeTags, ({ many }) => ({
  tagAssignments: many(recipeTagAssignments),
}));

export const recipeTagAssignmentsRelations = relations(
  recipeTagAssignments,
  ({ one }) => ({
    recipe: one(recipes, {
      fields: [recipeTagAssignments.recipeId],
      references: [recipes.id],
    }),
    tag: one(recipeTags, {
      fields: [recipeTagAssignments.tagId],
      references: [recipeTags.id],
    }),
  }),
);

export const groceryListsRelations = relations(groceryLists, ({ many }) => ({
  items: many(groceryListItems),
}));

export const groceryListItemsRelations = relations(
  groceryListItems,
  ({ one }) => ({
    groceryList: one(groceryLists, {
      fields: [groceryListItems.groceryListId],
      references: [groceryLists.id],
    }),
  }),
);
