import { Link } from '@tanstack/react-router';
import { Pencil } from 'lucide-react';

import { Badge } from '../../../components/ui/badge';
import type { RecipeListItem } from '../recipes.schema';

type RecipeCardsProps = {
  recipes: RecipeListItem[];
};

export function RecipeCards({ recipes }: RecipeCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {recipes.map((recipe) => (
        <article
          className="flex h-full flex-col rounded-xl border border-border bg-paper p-5 shadow-sm"
          key={recipe.id}
        >
          <div className="flex items-start justify-between gap-4">
            <h2 className="min-w-0 flex-1 break-words font-semibold text-xl">
              <Link
                className="hover:underline"
                params={{ recipeId: recipe.id }}
                to="/recipes/$recipeId"
              >
                {recipe.title}
              </Link>
            </h2>
            {recipe.totalTime ? (
              <Badge className="shrink-0 whitespace-nowrap">
                {recipe.totalTime} min
              </Badge>
            ) : null}
          </div>
          {recipe.description ? (
            <p className="mt-2 line-clamp-2 text-muted text-sm">
              {recipe.description}
            </p>
          ) : null}
          <div className="mt-auto flex items-end justify-between gap-3 pt-3">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-muted text-sm">
              {formatRecipeMeta(recipe).map((item, index) => (
                <span className="flex items-center gap-2" key={item}>
                  {index > 0 ? <span aria-hidden="true">·</span> : null}
                  {item}
                </span>
              ))}
            </div>
            <Link
              aria-label={`Edit ${recipe.title}`}
              className="shrink-0 rounded-full p-2 text-muted transition hover:bg-primary-soft hover:text-primary-hover"
              params={{ recipeId: recipe.id }}
              to="/recipes/$recipeId/edit"
            >
              <Pencil aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </article>
      ))}
    </section>
  );
}

function formatRecipeMeta(recipe: RecipeListItem) {
  return [
    recipe.prepTime ? `Prep ${recipe.prepTime} min` : null,
    recipe.cookTime ? `Cook ${recipe.cookTime} min` : null,
    recipe.servings ? `${recipe.servings} servings` : null,
  ].filter((item): item is string => Boolean(item));
}
