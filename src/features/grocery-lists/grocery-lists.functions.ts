import { createServerFn } from '@tanstack/react-start';

import {
  generateGroceryListInputSchema,
  generateReviewedGroceryListInputSchema,
  groceryListIdSchema,
  groceryListItemIdSchema,
} from './grocery-lists.schema';
import {
  deleteGroceryListForUser,
  generateGroceryListForUser,
  generateReviewedGroceryListForUser,
  getGroceryListForUser,
  listGroceryListsForUser,
  previewGroceryListMatchesForUser,
  toggleGroceryListItemForUser,
  updateGroceryListForUser,
} from './grocery-lists.server';

export const listGroceryLists = createServerFn({ method: 'GET' }).handler(
  async () => listGroceryListsForUser(),
);

export const getGroceryList = createServerFn({ method: 'GET' })
  .validator(groceryListIdSchema)
  .handler(async ({ data }) => getGroceryListForUser(data.groceryListId));

export const generateGroceryList = createServerFn({ method: 'POST' })
  .validator(generateGroceryListInputSchema)
  .handler(async ({ data }) => generateGroceryListForUser(data));

export const previewGroceryListMatches = createServerFn({ method: 'POST' })
  .validator(generateGroceryListInputSchema)
  .handler(async ({ data }) => previewGroceryListMatchesForUser(data));

export const generateReviewedGroceryList = createServerFn({ method: 'POST' })
  .validator(generateReviewedGroceryListInputSchema)
  .handler(async ({ data }) => generateReviewedGroceryListForUser(data));

export const toggleGroceryListItem = createServerFn({ method: 'POST' })
  .validator(groceryListItemIdSchema)
  .handler(async ({ data }) =>
    toggleGroceryListItemForUser(data.groceryListItemId),
  );

export const updateGroceryList = createServerFn({ method: 'POST' })
  .validator(groceryListIdSchema)
  .handler(async ({ data }) => updateGroceryListForUser(data.groceryListId));

export const deleteGroceryList = createServerFn({ method: 'POST' })
  .validator(groceryListIdSchema)
  .handler(async ({ data }) => deleteGroceryListForUser(data.groceryListId));
