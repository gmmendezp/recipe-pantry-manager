import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '../../../components/ui/badge';
import { Button, LinkButton } from '../../../components/ui/button';
import { FormError } from '../../../components/ui/form-error';
import { Panel } from '../../../components/ui/panel';
import { MissingRecipe } from '../../../features/recipes/components/missing-recipe';
import {
  deleteRecipe,
  getRecipe,
} from '../../../features/recipes/recipes.functions';
import {
  type RecipeDetail,
  recipeIdSchema,
} from '../../../features/recipes/recipes.schema';

export const Route = createFileRoute('/_authenticated/recipes/$recipeId')({
  component: RecipeDetailPage,
  loader: async ({ params }) => {
    const result = recipeIdSchema.safeParse({ recipeId: params.recipeId });

    if (!result.success) return { recipe: null };

    return {
      recipe: await getRecipe({ data: result.data }),
    };
  },
});

function RecipeDetailPage() {
  const { recipe } = Route.useLoaderData();

  if (!recipe) return <MissingRecipe />;

  return <RecipeDetailView recipe={recipe} />;
}

function RecipeDetailView({ recipe }: { recipe: RecipeDetail }) {
  const navigate = Route.useNavigate();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deleteRecipe({ data: { recipeId: recipe.id } });
      await navigate({ to: '/recipes' });
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : 'Unable to delete this recipe. Please try again.',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <LinkButton to="/recipes" variant="secondary">
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Back to recipes
      </LinkButton>

      <header className="space-y-5 rounded-2xl bg-primary p-8 text-paper">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-primary-soft text-sm uppercase tracking-[0.25em]">
              Recipe
            </p>
            <h1 className="mt-3 break-words font-bold text-4xl tracking-tight">
              {recipe.title}
            </h1>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <LinkButton
              params={{ recipeId: recipe.id }}
              size="sm"
              to="/recipes/$recipeId/edit"
              variant="inverse"
            >
              Edit
            </LinkButton>
            <Button
              disabled={isDeleting || isConfirmingDelete}
              onClick={() => {
                setDeleteError(null);
                setIsConfirmingDelete(true);
              }}
              size="sm"
              type="button"
              variant="inverseOutline"
            >
              Delete
            </Button>
          </div>
        </div>
        {recipe.description ? (
          <p className="max-w-2xl text-primary-soft">{recipe.description}</p>
        ) : null}
        <RecipeMeta recipe={recipe} />
      </header>

      {isConfirmingDelete ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-sm">
          <h2 className="font-semibold text-xl">Delete this recipe?</h2>
          <p className="mt-2 text-red-800 text-sm">
            This permanently removes the recipe, ingredients, and instructions.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              className="border-red-300 text-red-900 hover:border-red-900 disabled:opacity-60"
              disabled={isDeleting}
              onClick={() => setIsConfirmingDelete(false)}
              size="sm"
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              disabled={isDeleting}
              onClick={handleDelete}
              size="sm"
              type="button"
              variant="danger"
            >
              {isDeleting ? 'Deleting...' : 'Delete recipe'}
            </Button>
          </div>
        </section>
      ) : null}

      {deleteError ? <FormError>{deleteError}</FormError> : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Panel>
          <h2 className="font-semibold text-2xl">Ingredients</h2>
          <ul className="mt-5 divide-y divide-border">
            {recipe.ingredients.map((ingredient) => (
              <li
                className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                key={ingredient.id}
              >
                <p className="font-semibold">{ingredient.name}</p>
                <p className="text-muted text-sm sm:text-right">
                  {[ingredient.quantity, ingredient.unit, ingredient.category]
                    .filter(Boolean)
                    .join(' · ') || 'No quantity specified'}
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel>
          <h2 className="font-semibold text-2xl">Instructions</h2>
          <ol className="mt-5 divide-y divide-border">
            {recipe.steps.map((step) => (
              <li
                className="flex gap-4 py-4 first:pt-0 last:pb-0"
                key={step.id}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-soft font-bold text-primary-soft-foreground text-sm">
                  {step.stepNumber}
                </span>
                <p className="pt-1 text-muted">{step.instruction}</p>
              </li>
            ))}
          </ol>
        </Panel>
      </section>
    </div>
  );
}

function RecipeMeta({ recipe }: { recipe: RecipeDetail }) {
  const meta = [
    recipe.prepTime ? `Prep ${recipe.prepTime} min` : null,
    recipe.cookTime ? `Cook ${recipe.cookTime} min` : null,
    recipe.totalTime ? `Total ${recipe.totalTime} min` : null,
    recipe.servings ? `${recipe.servings} servings` : null,
  ].filter(Boolean);

  if (meta.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {meta.map((item) => (
        <Badge key={item} variant="primary">
          {item}
        </Badge>
      ))}
    </div>
  );
}
