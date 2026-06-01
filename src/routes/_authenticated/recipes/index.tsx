import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';

import { PageHeader } from '../../../components/layout/page-header';
import { Badge } from '../../../components/ui/badge';
import { LinkButton } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/empty-state';
import {
  TableShell,
  tableCellClass,
  tableHeaderCellClass,
  tableRowClass,
} from '../../../components/ui/table-shell';
import { type ViewMode, ViewToggle } from '../../../components/ui/view-toggle';
import { listRecipes } from '../../../features/recipes/recipes.functions';
import type { RecipeListItem } from '../../../features/recipes/recipes.schema';

export const Route = createFileRoute('/_authenticated/recipes/')({
  component: RecipesPage,
  loader: async () => ({
    recipes: await listRecipes(),
  }),
});

function RecipesPage() {
  const { recipes } = Route.useLoaderData();
  const [desktopView, setDesktopView] = useState<ViewMode>('cards');

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          description="See and add recipes, including ingredients and instructions."
          eyebrow="Recipe collection"
          title="Recipes"
        />
        <div className="flex flex-nowrap gap-3 sm:justify-end">
          <ViewToggle onChange={setDesktopView} value={desktopView} />
          <LinkButton
            className="text-center whitespace-nowrap"
            to="/recipes/new"
          >
            New recipe
          </LinkButton>
        </div>
      </div>

      {recipes.length > 0 ? (
        <>
          <div className="md:hidden">
            <RecipeCards recipes={recipes} />
          </div>
          <div className="hidden md:block">
            {desktopView === 'cards' ? (
              <RecipeCards recipes={recipes} />
            ) : (
              <RecipeTable recipes={recipes} />
            )}
          </div>
        </>
      ) : (
        <EmptyState
          action={<LinkButton to="/recipes/new">Create recipe</LinkButton>}
          title="No recipes yet"
        >
          Create your first recipe with ingredients and instructions, you can
          use it later to generate pantry-aware grocery lists.
        </EmptyState>
      )}
    </div>
  );
}

function RecipeCards({ recipes }: { recipes: RecipeListItem[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {recipes.map((recipe) => (
        <Link
          className="rounded-2xl border border-border bg-paper p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          key={recipe.id}
          params={{ recipeId: recipe.id }}
          to="/recipes/$recipeId"
        >
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-semibold text-2xl">{recipe.title}</h2>
            {recipe.totalTime ? <Badge>{recipe.totalTime} min</Badge> : null}
          </div>
          {recipe.description ? (
            <p className="mt-3 line-clamp-2 text-muted">{recipe.description}</p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-2 text-muted text-sm">
            {recipe.prepTime ? <span>Prep {recipe.prepTime} min</span> : null}
            {recipe.cookTime ? <span>Cook {recipe.cookTime} min</span> : null}
            {recipe.servings ? <span>{recipe.servings} servings</span> : null}
          </div>
        </Link>
      ))}
    </section>
  );
}

function RecipeTable({ recipes }: { recipes: RecipeListItem[] }) {
  return (
    <TableShell>
      <thead className="bg-primary-soft/50">
        <tr>
          <th className={tableHeaderCellClass} scope="col">
            Recipe
          </th>
          <th className={tableHeaderCellClass} scope="col">
            Time
          </th>
          <th className={tableHeaderCellClass} scope="col">
            Servings
          </th>
          <th className={tableHeaderCellClass} scope="col">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {recipes.map((recipe) => (
          <tr className={tableRowClass} key={recipe.id}>
            <td className={tableCellClass}>
              <p className="font-semibold text-foreground">{recipe.title}</p>
              {recipe.description ? (
                <p className="mt-1 line-clamp-2 max-w-xl text-muted text-sm">
                  {recipe.description}
                </p>
              ) : null}
            </td>
            <td className={tableCellClass}>{formatRecipeTime(recipe)}</td>
            <td className={tableCellClass}>{recipe.servings ?? '-'}</td>
            <td className={`${tableCellClass} text-right`}>
              <div className="flex justify-end gap-2">
                <LinkButton
                  params={{ recipeId: recipe.id }}
                  size="xs"
                  to="/recipes/$recipeId"
                  variant="secondary"
                >
                  View
                </LinkButton>
                <LinkButton
                  params={{ recipeId: recipe.id }}
                  size="xs"
                  to="/recipes/$recipeId/edit"
                  variant="secondary"
                >
                  Edit
                </LinkButton>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function formatRecipeTime(recipe: RecipeListItem) {
  if (recipe.totalTime) return `${recipe.totalTime} min total`;

  const parts = [
    recipe.prepTime ? `Prep ${recipe.prepTime} min` : null,
    recipe.cookTime ? `Cook ${recipe.cookTime} min` : null,
  ].filter(Boolean);

  return parts.join(' · ') || '-';
}
