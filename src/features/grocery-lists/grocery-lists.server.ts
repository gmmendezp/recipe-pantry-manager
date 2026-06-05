import { and, asc, desc, eq, inArray } from 'drizzle-orm';

import { requireUser } from '../../lib/auth/server';
import { toIsoString } from '../../lib/date';
import { db } from '../../lib/db/client';
import {
  groceryListItems,
  groceryLists,
  pantryItems,
  recipeIngredients,
  recipes,
} from '../../lib/db/schema';
import { normalizeIngredientName } from '../../lib/normalization/ingredients';
import type {
  GroceryListDetail,
  GroceryListItem,
  GroceryListSummary,
  ParsedGenerateGroceryListInput,
} from './grocery-lists.schema';

function toGroceryListItem(
  item: typeof groceryListItems.$inferSelect,
): GroceryListItem {
  return {
    category: item.category,
    createdAt: toIsoString(item.createdAt),
    groceryListId: item.groceryListId,
    id: item.id,
    isChecked: item.isChecked,
    name: item.name,
    pantryMatch: item.pantryMatch,
    pantryQuantity: item.pantryQuantity,
    pantryUnit: item.pantryUnit,
    quantity: item.quantity,
    sourceRecipeIds: item.sourceRecipeIds,
    unit: item.unit,
  };
}

function toGroceryListSummary(
  list: typeof groceryLists.$inferSelect,
  itemCount: number,
): GroceryListSummary {
  return {
    createdAt: toIsoString(list.createdAt),
    id: list.id,
    itemCount,
    title: list.title,
    updatedAt: toIsoString(list.updatedAt),
  };
}

function createDefaultTitle() {
  return `Grocery List ${new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })}`;
}

function mergeQuantity(current: string | null, next: string | null) {
  if (!current) return next;
  if (!next || current === next) return current;

  const currentNumber = Number(current);
  const nextNumber = Number(next);

  if (Number.isFinite(currentNumber) && Number.isFinite(nextNumber))
    return String(currentNumber + nextNumber);

  return Array.from(new Set([...current.split(', '), next])).join(', ');
}

type MergedGroceryListItem = {
  category: string | null;
  name: string;
  pantryMatch: boolean;
  pantryQuantity: string | null;
  pantryUnit: string | null;
  quantity: string | null;
  sourceRecipeIds: Set<string>;
  unit: string | null;
};

async function buildMergedGroceryListItems(
  userId: string,
  recipeIds: string[],
) {
  const uniqueRecipeIds = Array.from(new Set(recipeIds));

  const selectedRecipes = await db
    .select({ id: recipes.id })
    .from(recipes)
    .where(
      and(eq(recipes.userId, userId), inArray(recipes.id, uniqueRecipeIds)),
    );

  if (selectedRecipes.length === 0) {
    throw new Error('Select at least one recipe you can access.');
  }

  const ownedRecipeIds = selectedRecipes.map((recipe) => recipe.id);

  const [ingredients, pantry] = await Promise.all([
    db
      .select()
      .from(recipeIngredients)
      .where(inArray(recipeIngredients.recipeId, ownedRecipeIds))
      .orderBy(asc(recipeIngredients.sortOrder)),
    db.select().from(pantryItems).where(eq(pantryItems.userId, userId)),
  ]);

  const pantryByName = new Map<
    string,
    { quantity: string | null; unit: string | null }
  >();

  for (const item of pantry) {
    const normalizedName = normalizeIngredientName(item.name);

    if (normalizedName && !pantryByName.has(normalizedName)) {
      pantryByName.set(normalizedName, {
        quantity: item.quantity,
        unit: item.unit,
      });
    }
  }

  const mergedItems = new Map<string, MergedGroceryListItem>();

  for (const ingredient of ingredients) {
    const normalizedName = normalizeIngredientName(ingredient.name);
    const pantryMatch = pantryByName.get(normalizedName) ?? null;
    const key = [
      normalizedName,
      ingredient.unit ?? '',
      ingredient.category ?? '',
      Boolean(pantryMatch),
    ].join('|');
    const existing = mergedItems.get(key);

    if (existing) {
      existing.quantity = mergeQuantity(existing.quantity, ingredient.quantity);
      existing.sourceRecipeIds.add(ingredient.recipeId);
      continue;
    }

    mergedItems.set(key, {
      category: ingredient.category,
      name: ingredient.name,
      pantryMatch: Boolean(pantryMatch),
      pantryQuantity: pantryMatch?.quantity ?? null,
      pantryUnit: pantryMatch?.unit ?? null,
      quantity: ingredient.quantity,
      sourceRecipeIds: new Set([ingredient.recipeId]),
      unit: ingredient.unit,
    });
  }

  if (mergedItems.size === 0) {
    throw new Error('Selected recipes do not have ingredients to add.');
  }

  return mergedItems;
}

export async function listGroceryListsForUser(): Promise<GroceryListSummary[]> {
  const user = await requireUser();

  const lists = await db
    .select()
    .from(groceryLists)
    .where(eq(groceryLists.userId, user.id))
    .orderBy(desc(groceryLists.updatedAt));

  if (lists.length === 0) return [];

  const items = await db
    .select({ groceryListId: groceryListItems.groceryListId })
    .from(groceryListItems)
    .where(
      inArray(
        groceryListItems.groceryListId,
        lists.map((list) => list.id),
      ),
    );

  const counts = new Map<string, number>();

  for (const item of items) {
    counts.set(item.groceryListId, (counts.get(item.groceryListId) ?? 0) + 1);
  }

  return lists.map((list) =>
    toGroceryListSummary(list, counts.get(list.id) ?? 0),
  );
}

export async function getGroceryListForUser(
  groceryListId: string,
): Promise<GroceryListDetail | null> {
  const user = await requireUser();

  const [list] = await db
    .select()
    .from(groceryLists)
    .where(
      and(eq(groceryLists.id, groceryListId), eq(groceryLists.userId, user.id)),
    )
    .limit(1);

  if (!list) return null;

  const items = await db
    .select()
    .from(groceryListItems)
    .where(eq(groceryListItems.groceryListId, list.id))
    .orderBy(asc(groceryListItems.pantryMatch), asc(groceryListItems.name));

  return {
    ...toGroceryListSummary(list, items.length),
    items: items.map(toGroceryListItem),
  };
}

export async function generateGroceryListForUser(
  input: ParsedGenerateGroceryListInput,
) {
  const user = await requireUser();
  const now = new Date();
  const mergedItems = await buildMergedGroceryListItems(
    user.id,
    input.recipeIds,
  );

  const [list] = await db.transaction(async (tx) => {
    const [createdList] = await tx
      .insert(groceryLists)
      .values({
        title: input.title?.trim() || createDefaultTitle(),
        updatedAt: now,
        userId: user.id,
      })
      .returning();

    await tx.insert(groceryListItems).values(
      Array.from(mergedItems.values()).map((item) => ({
        category: item.category,
        groceryListId: createdList.id,
        name: item.name,
        pantryMatch: item.pantryMatch,
        pantryQuantity: item.pantryQuantity,
        pantryUnit: item.pantryUnit,
        quantity: item.quantity,
        sourceRecipeIds: Array.from(item.sourceRecipeIds),
        unit: item.unit,
      })),
    );

    return [createdList];
  });

  return toGroceryListSummary(list, mergedItems.size);
}

export async function updateGroceryListForUser(groceryListId: string) {
  const user = await requireUser();
  const now = new Date();

  const [list] = await db
    .select()
    .from(groceryLists)
    .where(
      and(eq(groceryLists.id, groceryListId), eq(groceryLists.userId, user.id)),
    )
    .limit(1);

  if (!list) return null;

  const currentItems = await db
    .select({ sourceRecipeIds: groceryListItems.sourceRecipeIds })
    .from(groceryListItems)
    .where(eq(groceryListItems.groceryListId, list.id));

  const sourceRecipeIds = Array.from(
    new Set(currentItems.flatMap((item) => item.sourceRecipeIds)),
  );

  if (sourceRecipeIds.length === 0) {
    throw new Error('This grocery list has no source recipes to update from.');
  }

  const mergedItems = await buildMergedGroceryListItems(
    user.id,
    sourceRecipeIds,
  );

  const [updatedList] = await db.transaction(async (tx) => {
    await tx
      .delete(groceryListItems)
      .where(eq(groceryListItems.groceryListId, list.id));

    await tx.insert(groceryListItems).values(
      Array.from(mergedItems.values()).map((item) => ({
        category: item.category,
        groceryListId: list.id,
        name: item.name,
        pantryMatch: item.pantryMatch,
        pantryQuantity: item.pantryQuantity,
        pantryUnit: item.pantryUnit,
        quantity: item.quantity,
        sourceRecipeIds: Array.from(item.sourceRecipeIds),
        unit: item.unit,
      })),
    );

    return tx
      .update(groceryLists)
      .set({ updatedAt: now })
      .where(eq(groceryLists.id, list.id))
      .returning();
  });

  return toGroceryListSummary(updatedList, mergedItems.size);
}

export async function toggleGroceryListItemForUser(groceryListItemId: string) {
  const user = await requireUser();

  const [item] = await db
    .select({
      groceryListId: groceryListItems.groceryListId,
      id: groceryListItems.id,
      isChecked: groceryListItems.isChecked,
    })
    .from(groceryListItems)
    .innerJoin(
      groceryLists,
      eq(groceryLists.id, groceryListItems.groceryListId),
    )
    .where(
      and(
        eq(groceryListItems.id, groceryListItemId),
        eq(groceryLists.userId, user.id),
      ),
    )
    .limit(1);

  if (!item) return null;

  const [updatedItem] = await db
    .update(groceryListItems)
    .set({ isChecked: !item.isChecked })
    .where(eq(groceryListItems.id, item.id))
    .returning();

  await db
    .update(groceryLists)
    .set({ updatedAt: new Date() })
    .where(eq(groceryLists.id, item.groceryListId));

  return toGroceryListItem(updatedItem);
}

export async function deleteGroceryListForUser(groceryListId: string) {
  const user = await requireUser();

  const deletedLists = await db
    .delete(groceryLists)
    .where(
      and(eq(groceryLists.id, groceryListId), eq(groceryLists.userId, user.id)),
    )
    .returning({ id: groceryLists.id });

  return { deleted: deletedLists.length > 0 };
}
