import { createFileRoute, Link } from '@tanstack/react-router';

import { PageHeader } from '../../../components/layout/page-header';
import { Badge } from '../../../components/ui/badge';
import { LinkButton } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/empty-state';
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

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          description="See and add recipes, including ingredients and instructions."
          eyebrow="Recipe collection"
          title="Recipes"
        />
        <LinkButton className="text-center" to="/recipes/new">
          New recipe
        </LinkButton>
      </div>

      {recipes.length > 0 ? (
        <RecipeGrid recipes={recipes} />
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

function RecipeGrid({ recipes }: { recipes: RecipeListItem[] }) {
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
