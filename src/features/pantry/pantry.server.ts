import { and, desc, eq } from 'drizzle-orm';

import { requireUser } from '#/lib/auth/server';
import { toIsoString } from '#/lib/date';
import { db } from '#/lib/db/client';
import { pantryItems } from '#/lib/db/schema';
import type {
  PantryItemDetail,
  PantryListItem,
  ParsedPantryItemInput,
} from './pantry.schema';

function toPantryListItem(
  pantryItem: typeof pantryItems.$inferSelect,
): PantryListItem {
  return {
    category: pantryItem.category,
    createdAt: toIsoString(pantryItem.createdAt),
    id: pantryItem.id,
    name: pantryItem.name,
    notes: pantryItem.notes,
    quantity: pantryItem.quantity,
    unit: pantryItem.unit,
    updatedAt: toIsoString(pantryItem.updatedAt),
  };
}

export async function listPantryItemsForUser(): Promise<PantryListItem[]> {
  const user = await requireUser();

  const rows = await db
    .select()
    .from(pantryItems)
    .where(eq(pantryItems.userId, user.id))
    .orderBy(desc(pantryItems.updatedAt));

  return rows.map(toPantryListItem);
}

export async function getPantryItemForUser(
  pantryItemId: string,
): Promise<PantryItemDetail | null> {
  const user = await requireUser();

  const [pantryItem] = await db
    .select()
    .from(pantryItems)
    .where(
      and(eq(pantryItems.id, pantryItemId), eq(pantryItems.userId, user.id)),
    )
    .limit(1);

  return pantryItem ? toPantryListItem(pantryItem) : null;
}

export async function createPantryItemForUser(input: ParsedPantryItemInput) {
  const user = await requireUser();
  const now = new Date();

  const [pantryItem] = await db
    .insert(pantryItems)
    .values({
      category: input.category,
      name: input.name,
      notes: input.notes,
      quantity: input.quantity,
      unit: input.unit,
      updatedAt: now,
      userId: user.id,
    })
    .returning();

  return toPantryListItem(pantryItem);
}

export async function updatePantryItemForUser(
  pantryItemId: string,
  input: ParsedPantryItemInput,
) {
  const user = await requireUser();

  const [pantryItem] = await db
    .update(pantryItems)
    .set({
      category: input.category,
      name: input.name,
      notes: input.notes,
      quantity: input.quantity,
      unit: input.unit,
      updatedAt: new Date(),
    })
    .where(
      and(eq(pantryItems.id, pantryItemId), eq(pantryItems.userId, user.id)),
    )
    .returning();

  return pantryItem ? toPantryListItem(pantryItem) : null;
}

export async function deletePantryItemForUser(pantryItemId: string) {
  const user = await requireUser();

  const deletedPantryItems = await db
    .delete(pantryItems)
    .where(
      and(eq(pantryItems.id, pantryItemId), eq(pantryItems.userId, user.id)),
    )
    .returning({ id: pantryItems.id });

  return { deleted: deletedPantryItems.length > 0 };
}
