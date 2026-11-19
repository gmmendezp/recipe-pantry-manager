import { eq, sql } from 'drizzle-orm';

import { mergeGroceryListItems } from '#/features/grocery-lists/generate-grocery-list';
import { db } from '#/lib/db/client';
import {
  demoResetState,
  groceryListItems,
  groceryLists,
  pantryItems,
  recipeIngredients,
  recipeSteps,
  recipes,
  recipeTagAssignments,
  recipeTags,
} from '#/lib/db/schema';
import { serverEnv } from '#/lib/env.server';
import { getDemoResetDecision } from './demo-reset-policy';
import {
  demoGroceryList,
  demoPantryItems,
  demoRecipes,
} from './demo-seed.server';

type AuthUserRow = {
  id: string;
  lastSignInAt: Date | string | null;
};

type ResetDemoDataOptions = {
  force?: boolean;
  now?: Date;
};

function asDate(value: Date | string | null) {
  return value instanceof Date ? value : value ? new Date(value) : null;
}

function calculateTotalTime(prepTime: number | null, cookTime: number | null) {
  return prepTime === null || cookTime === null ? null : prepTime + cookTime;
}

export async function resetDemoDataIfDue({
  force = false,
  now = new Date(),
}: ResetDemoDataOptions = {}) {
  if (!serverEnv.DEMO_EMAIL) {
    throw new Error('Demo account is not configured.');
  }

  return db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext('recipe-pantry-demo-reset'))`,
    );

    const demoUsers = await tx.execute<AuthUserRow>(sql`
      select id, last_sign_in_at as "lastSignInAt"
      from auth.users
      where lower(email) = lower(${serverEnv.DEMO_EMAIL})
      limit 2
    `);
    const demoUser = demoUsers[0];

    if (!demoUser || demoUsers.length !== 1) {
      throw new Error('Configured demo user was not found.');
    }

    const [state] = await tx
      .select({ lastResetAt: demoResetState.lastResetAt })
      .from(demoResetState)
      .where(eq(demoResetState.userId, demoUser.id))
      .limit(1);
    const decision = force
      ? 'reset'
      : getDemoResetDecision({
          lastLoginAt: asDate(demoUser.lastSignInAt),
          lastResetAt: state?.lastResetAt ?? null,
          now,
        });

    if (decision !== 'reset') {
      return { status: decision } as const;
    }

    await tx.delete(groceryLists).where(eq(groceryLists.userId, demoUser.id));
    await tx.delete(recipes).where(eq(recipes.userId, demoUser.id));
    await tx.delete(recipeTags).where(eq(recipeTags.userId, demoUser.id));
    await tx.delete(pantryItems).where(eq(pantryItems.userId, demoUser.id));

    const createdPantryItems = await tx
      .insert(pantryItems)
      .values(
        demoPantryItems.map((item) => ({
          ...item,
          createdAt: now,
          updatedAt: now,
          userId: demoUser.id,
        })),
      )
      .returning({
        id: pantryItems.id,
        name: pantryItems.name,
        quantity: pantryItems.quantity,
        unit: pantryItems.unit,
      });
    const recipeIdsByKey = new Map<string, string>();

    for (const { key, recipe } of demoRecipes) {
      const [createdRecipe] = await tx
        .insert(recipes)
        .values({
          cookTime: recipe.cookTime,
          createdAt: now,
          description: recipe.description,
          imageUrl: recipe.imageUrl,
          prepTime: recipe.prepTime,
          servings: recipe.servings,
          sourceUrl: recipe.sourceUrl,
          title: recipe.title,
          totalTime: calculateTotalTime(recipe.prepTime, recipe.cookTime),
          updatedAt: now,
          userId: demoUser.id,
        })
        .returning({ id: recipes.id });

      if (!createdRecipe) {
        throw new Error(`Unable to create demo recipe: ${key}.`);
      }

      recipeIdsByKey.set(key, createdRecipe.id);

      await tx.insert(recipeIngredients).values(
        recipe.ingredients.map((ingredient, index) => ({
          ...ingredient,
          recipeId: createdRecipe.id,
          sortOrder: index,
        })),
      );
      await tx.insert(recipeSteps).values(
        recipe.steps.map((step, index) => ({
          instruction: step.instruction,
          recipeId: createdRecipe.id,
          stepNumber: index + 1,
        })),
      );
    }

    const tagNames = Array.from(
      new Set(demoRecipes.flatMap((recipe) => recipe.tags)),
    );
    const createdTags = await tx
      .insert(recipeTags)
      .values(
        tagNames.map((name) => ({
          createdAt: now,
          name,
          userId: demoUser.id,
        })),
      )
      .returning({ id: recipeTags.id, name: recipeTags.name });
    const tagIdsByName = new Map(createdTags.map((tag) => [tag.name, tag.id]));
    const tagAssignments = demoRecipes.flatMap(({ key, tags }) => {
      const recipeId = recipeIdsByKey.get(key);

      if (!recipeId) throw new Error(`Missing seeded recipe ID for ${key}.`);

      return tags.map((tagName) => {
        const tagId = tagIdsByName.get(tagName);

        if (!tagId) throw new Error(`Missing seeded tag ID for ${tagName}.`);

        return { recipeId, tagId };
      });
    });

    await tx.insert(recipeTagAssignments).values(tagAssignments);

    const selectedRecipeKeys = new Set<string>(
      demoGroceryList.sourceRecipeKeys,
    );
    const groceryIngredients = demoRecipes
      .filter((recipe) => selectedRecipeKeys.has(recipe.key))
      .flatMap(({ key, recipe }) => {
        const recipeId = recipeIdsByKey.get(key);

        if (!recipeId) throw new Error(`Missing seeded recipe ID for ${key}.`);

        return recipe.ingredients.map((ingredient) => ({
          ...ingredient,
          recipeId,
        }));
      });
    const mergedGroceryItems = mergeGroceryListItems(
      groceryIngredients,
      createdPantryItems,
    );
    const [createdGroceryList] = await tx
      .insert(groceryLists)
      .values({
        createdAt: now,
        title: demoGroceryList.title,
        updatedAt: now,
        userId: demoUser.id,
      })
      .returning({ id: groceryLists.id });

    if (!createdGroceryList) {
      throw new Error('Unable to create demo grocery list.');
    }

    const checkedItemNames = new Set<string>(demoGroceryList.checkedItemNames);

    await tx.insert(groceryListItems).values(
      Array.from(mergedGroceryItems.values()).map((item) => ({
        category: item.category,
        createdAt: now,
        groceryListId: createdGroceryList.id,
        isChecked: checkedItemNames.has(item.name),
        name: item.name,
        pantryMatch: item.pantryMatch,
        pantryQuantity: item.pantryQuantity,
        pantryUnit: item.pantryUnit,
        quantity: item.quantity,
        sourceRecipeIds: Array.from(item.sourceRecipeIds),
        unit: item.unit,
      })),
    );

    await tx
      .insert(demoResetState)
      .values({ lastResetAt: now, userId: demoUser.id })
      .onConflictDoUpdate({
        set: { lastResetAt: now },
        target: demoResetState.userId,
      });

    return { status: 'reset' } as const;
  });
}
