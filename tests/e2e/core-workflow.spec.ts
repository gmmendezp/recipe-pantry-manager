import { expect, type Page, test } from '@playwright/test';

const email = process.env.E2E_EMAIL?.trim();
const password = process.env.E2E_PASSWORD;

test('creates a pantry-aware grocery list with need-to-buy and pantry sections', async ({
  page,
}) => {
  test.setTimeout(60_000);
  test.skip(
    !email || !password,
    'Set E2E_EMAIL and E2E_PASSWORD to run the core workflow E2E test.',
  );

  const runId = Date.now().toString(36);
  const pantryIngredient = `E2E Tomato ${runId}`;
  const matchedRecipeIngredient = pantryIngredient;
  const neededIngredient = `E2E Basil ${runId}`;
  const recipeTitle = `E2E Pantry Pasta ${runId}`;
  const listTitle = `E2E Grocery List ${runId}`;
  let groceryListUrl: string | null = null;
  let pantryItemUrl: string | null = null;
  let recipeUrl: string | null = null;

  await login(page);

  try {
    pantryItemUrl = await createPantryItem(page, pantryIngredient);
    recipeUrl = await createRecipe(page, {
      matchedRecipeIngredient,
      neededIngredient,
      recipeTitle,
    });
    groceryListUrl = await generateGroceryList(page, {
      listTitle,
      recipeTitle,
    });

    const needToBuySection = page
      .getByRole('heading', { name: 'Need to Buy' })
      .locator('xpath=ancestor::section[1]');
    const pantrySection = page
      .getByRole('heading', { name: 'Already in Pantry' })
      .locator('xpath=ancestor::section[1]');

    await expect(page.getByRole('heading', { name: listTitle })).toBeVisible();
    await expect(needToBuySection).toContainText(neededIngredient);
    await expect(pantrySection).toContainText(matchedRecipeIngredient);
  } finally {
    await cleanupIfCreated(page, groceryListUrl, deleteGroceryList);
    await cleanupIfCreated(page, recipeUrl, deleteRecipe);
    await cleanupIfCreated(page, pantryItemUrl, deletePantryItem);
  }
});

async function login(page: Page) {
  if (!email || !password) {
    throw new Error('Set E2E_EMAIL and E2E_PASSWORD to run this test.');
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error('E2E_EMAIL must be a valid email address.');
  }

  if (password.length < 8) {
    throw new Error('E2E_PASSWORD must be at least 8 characters.');
  }

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Log in' })).toBeVisible();
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(page).toHaveURL(/\/dashboard\/?(?:[?#].*)?$/);
}

async function createPantryItem(page: Page, pantryIngredient: string) {
  await page.goto('/pantry/new');
  await expect(
    page.getByRole('heading', { name: 'New Pantry Item' }),
  ).toBeVisible();
  await page.getByLabel('Name').fill(pantryIngredient);
  await page.getByLabel('Quantity').fill('1');
  await page.getByLabel('Unit').fill('can');
  await page.getByLabel('Category').fill('Produce');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(
    page.getByRole('heading', { name: pantryIngredient }),
  ).toBeVisible();

  return page.url();
}

async function createRecipe(
  page: Page,
  {
    matchedRecipeIngredient,
    neededIngredient,
    recipeTitle,
  }: {
    matchedRecipeIngredient: string;
    neededIngredient: string;
    recipeTitle: string;
  },
) {
  await page.goto('/recipes/new');
  await expect(page.getByRole('heading', { name: 'New Recipe' })).toBeVisible();
  await page.getByLabel('Title').fill(recipeTitle);
  await page.getByLabel('Description').fill('E2E recipe with pantry split.');
  await page.getByLabel('Prep time').fill('10');
  await page.getByLabel('Cook time').fill('20');
  await page.getByLabel('Servings').fill('4');

  await page.getByLabel('Name').fill(matchedRecipeIngredient);
  await page.getByLabel('Quantity').fill('2');
  await page.getByLabel('Unit').fill('cups');
  await page.getByLabel('Category').fill('Produce');

  await page.getByRole('button', { name: 'Add ingredient' }).click();
  await page.getByLabel('Name').nth(1).fill(neededIngredient);
  await page.getByLabel('Quantity').nth(1).fill('1');
  await page.getByLabel('Unit').nth(1).fill('bunch');
  await page.getByLabel('Category').nth(1).fill('Produce');

  await page.getByLabel('Instruction').fill('Cook everything together.');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('heading', { name: recipeTitle })).toBeVisible();

  return page.url();
}

async function generateGroceryList(
  page: Page,
  { listTitle, recipeTitle }: { listTitle: string; recipeTitle: string },
) {
  await page.goto('/grocery-lists');
  await expect(
    page.getByRole('heading', { name: 'Grocery Lists' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Generate grocery list' })
    .first()
    .click();

  const form = page.locator('form').filter({
    has: page.getByLabel('List title'),
  });
  await form.getByLabel('List title').fill(listTitle);
  await form.getByLabel(new RegExp(recipeTitle)).click();
  await form.getByRole('button', { name: 'Generate grocery list' }).click();
  await expect(page.getByRole('heading', { name: listTitle })).toBeVisible();

  return page.url();
}

async function cleanupIfCreated(
  page: Page,
  url: string | null,
  cleanup: (page: Page, url: string) => Promise<void>,
) {
  if (!url) return;

  try {
    await cleanup(page, url);
  } catch {
    // Cleanup is best-effort so the original workflow failure remains visible.
  }
}

async function deleteGroceryList(page: Page, url: string) {
  await page.goto(url);
  const deleteButton = page.getByRole('button', { name: 'Delete' });
  await expect(deleteButton).toBeVisible();
  await deleteButton.click();
  await page.getByRole('button', { name: 'Delete grocery list' }).click();
  await expect(page).toHaveURL(/\/grocery-lists\/?$/);
}

async function deleteRecipe(page: Page, url: string) {
  await page.goto(url);
  const deleteButton = page.getByRole('button', { name: 'Delete' });
  await expect(deleteButton).toBeVisible();
  await deleteButton.click();
  await page.getByRole('button', { name: 'Delete recipe' }).click();
  await expect(page).toHaveURL(/\/recipes\/?$/);
}

async function deletePantryItem(page: Page, url: string) {
  await page.goto(url);
  const deleteButton = page.getByRole('button', { name: 'Delete' });
  await expect(deleteButton).toBeVisible();
  await deleteButton.click();
  await page.getByRole('button', { name: 'Delete pantry item' }).click();
  await expect(page).toHaveURL(/\/pantry\/?$/);
}
