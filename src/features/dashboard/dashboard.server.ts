import { count, eq } from 'drizzle-orm';

import { requireUser } from '../../lib/auth/server';
import { db } from '../../lib/db/client';
import { groceryLists, pantryItems, recipes } from '../../lib/db/schema';

export type DashboardStats = {
  groceryListCount: number;
  pantryItemCount: number;
  recipeCount: number;
};

async function countUserRows(
  table: typeof recipes | typeof pantryItems | typeof groceryLists,
  userId: string,
) {
  const [result] = await db
    .select({ value: count() })
    .from(table)
    .where(eq(table.userId, userId));

  return result?.value ?? 0;
}

export async function getDashboardStatsForUser(): Promise<DashboardStats> {
  const user = await requireUser();

  const [recipeCount, pantryItemCount, groceryListCount] = await Promise.all([
    countUserRows(recipes, user.id),
    countUserRows(pantryItems, user.id),
    countUserRows(groceryLists, user.id),
  ]);

  return {
    groceryListCount,
    pantryItemCount,
    recipeCount,
  };
}
