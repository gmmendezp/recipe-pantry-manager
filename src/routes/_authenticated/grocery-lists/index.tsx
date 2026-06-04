import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';

import { PageHeader } from '../../../components/layout/page-header';
import { Button, LinkButton } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/empty-state';
import { FormError } from '../../../components/ui/form-error';
import { Panel } from '../../../components/ui/panel';
import {
  TableShell,
  tableCellClass,
  tableHeaderCellClass,
  tableRowClass,
} from '../../../components/ui/table-shell';
import {
  generateGroceryList,
  listGroceryLists,
} from '../../../features/grocery-lists/grocery-lists.functions';
import type { GroceryListSummary } from '../../../features/grocery-lists/grocery-lists.schema';
import { listRecipes } from '../../../features/recipes/recipes.functions';
import type { RecipeListItem } from '../../../features/recipes/recipes.schema';
import { getAuthErrorMessage } from '../../../lib/auth/errors';
import { formatShortDate } from '../../../lib/date';
import { formatCount } from '../../../lib/format';

export const Route = createFileRoute('/_authenticated/grocery-lists/')({
  component: GroceryListsPage,
  loader: async () => ({
    groceryLists: await listGroceryLists(),
    recipes: await listRecipes(),
  }),
});

function GroceryListsPage() {
  const { groceryLists, recipes } = Route.useLoaderData();
  const [isGeneratePanelOpen, setIsGeneratePanelOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          description="Review saved shopping lists or generate a new pantry-aware list from recipes."
          eyebrow="Shopping workflow"
          title="Grocery Lists"
        />
        <Button
          className="text-center whitespace-nowrap"
          onClick={() => setIsGeneratePanelOpen((current) => !current)}
          type="button"
          variant={isGeneratePanelOpen ? 'secondary' : 'primary'}
        >
          {isGeneratePanelOpen ? 'Cancel' : 'Generate grocery list'}
        </Button>
      </div>
      {isGeneratePanelOpen ? <GenerateListPanel recipes={recipes} /> : null}
      <SavedLists
        groceryLists={groceryLists}
        onGenerate={() => setIsGeneratePanelOpen(true)}
      />
    </div>
  );
}

function GenerateListPanel({ recipes }: { recipes: RecipeListItem[] }) {
  const navigate = Route.useNavigate();
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function toggleRecipe(recipeId: string) {
    setSelectedRecipeIds((current) =>
      current.includes(recipeId)
        ? current.filter((id) => id !== recipeId)
        : [...current, recipeId],
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const list = await generateGroceryList({
        data: { recipeIds: selectedRecipeIds, title },
      });
      await navigate({
        params: { groceryListId: list.id },
        to: '/grocery-lists/$groceryListId',
      });
    } catch (generationError) {
      setError(
        getAuthErrorMessage(
          generationError,
          'Unable to generate grocery list. Please try again.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Panel>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <h2 className="font-semibold text-2xl">Generate a list</h2>
          <p className="mt-2 text-muted">
            Pick one or more saved recipes. Pantry matches are moved into a
            separate section on the generated list.
          </p>
        </div>

        <label className="block space-y-2">
          <span className="font-medium text-foreground text-sm">
            List title
          </span>
          <input
            className="w-full rounded-xl border border-border bg-paper px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-soft"
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Optional"
            value={title}
          />
        </label>

        {recipes.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {recipes.map((recipe) => (
              <label
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background/40 p-4 transition hover:border-primary"
                key={recipe.id}
              >
                <input
                  checked={selectedRecipeIds.includes(recipe.id)}
                  className="mt-1 h-4 w-4 accent-primary"
                  onChange={() => toggleRecipe(recipe.id)}
                  type="checkbox"
                />
                <span>
                  <span className="block font-semibold">{recipe.title}</span>
                  <span className="mt-1 block text-muted text-sm">
                    {recipe.description || 'No description'}
                  </span>
                </span>
              </label>
            ))}
          </div>
        ) : (
          <EmptyState
            action={<LinkButton to="/recipes/new">Create recipe</LinkButton>}
            title="No recipes available"
          >
            Add a recipe before generating a grocery list.
          </EmptyState>
        )}

        {error ? <FormError>{error}</FormError> : null}

        <Button disabled={isSubmitting || recipes.length === 0} type="submit">
          {isSubmitting ? 'Generating...' : 'Generate grocery list'}
        </Button>
      </form>
    </Panel>
  );
}

function SavedLists({
  groceryLists,
  onGenerate,
}: {
  groceryLists: GroceryListSummary[];
  onGenerate: () => void;
}) {
  if (groceryLists.length === 0) {
    return (
      <EmptyState
        action={
          <Button onClick={onGenerate} type="button">
            Generate grocery list
          </Button>
        }
        title="No saved grocery lists yet"
      >
        Generated lists will appear here after you select recipes.
      </EmptyState>
    );
  }

  return (
    <TableShell>
      <thead className="bg-primary-soft/50">
        <tr>
          <th className={tableHeaderCellClass} scope="col">
            List
          </th>
          <th className={tableHeaderCellClass} scope="col">
            Items
          </th>
          <th className={tableHeaderCellClass} scope="col">
            Updated
          </th>
        </tr>
      </thead>
      <tbody>
        {groceryLists.map((list) => (
          <tr className={tableRowClass} key={list.id}>
            <td className={tableCellClass}>
              <Link
                className="font-semibold text-foreground hover:underline"
                params={{ groceryListId: list.id }}
                to="/grocery-lists/$groceryListId"
              >
                {list.title}
              </Link>
            </td>
            <td className={tableCellClass}>
              {formatCount(list.itemCount, 'item')}
            </td>
            <td className={tableCellClass}>
              {formatShortDate(list.updatedAt)}
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}
