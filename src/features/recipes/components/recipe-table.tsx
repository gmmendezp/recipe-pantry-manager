import { Link } from '@tanstack/react-router';
import { Pencil } from 'lucide-react';

import {
  TableShell,
  tableCellClass,
  tableHeaderCellClass,
  tableRowClass,
} from '../../../components/ui/table-shell';
import type { RecipeListItem } from '../recipes.schema';

type RecipeTableProps = {
  recipes: RecipeListItem[];
};

export function RecipeTable({ recipes }: RecipeTableProps) {
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
              <Link
                className="font-semibold text-foreground hover:underline"
                params={{ recipeId: recipe.id }}
                to="/recipes/$recipeId"
              >
                {recipe.title}
              </Link>
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
                <Link
                  aria-label={`Edit ${recipe.title}`}
                  className="inline-flex rounded-full p-2 text-muted transition hover:text-primary-hover"
                  params={{ recipeId: recipe.id }}
                  to="/recipes/$recipeId/edit"
                >
                  <Pencil aria-hidden="true" className="h-4 w-4" />
                </Link>
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
