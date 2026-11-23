import { createServerFn } from '@tanstack/react-start';

import {
  pantryItemIdSchema,
  pantryItemInputSchema,
  updatePantryItemInputSchema,
} from './pantry.schema';
import {
  createPantryItemForUser,
  deletePantryItemForUser,
  getPantryItemForUser,
  listPantryItemsForUser,
  updatePantryItemForUser,
} from './pantry.server';

export const listPantryItems = createServerFn({ method: 'GET' }).handler(
  async () => listPantryItemsForUser(),
);

export const getPantryItem = createServerFn({ method: 'GET' })
  .validator(pantryItemIdSchema)
  .handler(async ({ data }) => getPantryItemForUser(data.pantryItemId));

export const createPantryItem = createServerFn({ method: 'POST' })
  .validator(pantryItemInputSchema)
  .handler(async ({ data }) => createPantryItemForUser(data));

export const updatePantryItem = createServerFn({ method: 'POST' })
  .validator(updatePantryItemInputSchema)
  .handler(async ({ data }) => {
    const { pantryItemId, ...input } = data;

    return updatePantryItemForUser(pantryItemId, input);
  });

export const deletePantryItem = createServerFn({ method: 'POST' })
  .validator(pantryItemIdSchema)
  .handler(async ({ data }) => deletePantryItemForUser(data.pantryItemId));
