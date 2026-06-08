import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import { DetailHero } from '#/components/layout/detail-hero';
import { Badge } from '#/components/ui/badge';
import { Button, LinkButton } from '#/components/ui/button';
import { DeleteConfirmation } from '#/components/ui/delete-confirmation';
import { FormError } from '#/components/ui/form-error';
import { Panel } from '#/components/ui/panel';
import { MissingRecipe } from '#/features/recipes/components/missing-recipe';
import { deleteRecipe, getRecipe } from '#/features/recipes/recipes.functions';
import {
  type RecipeDetail,
  recipeIdSchema,
} from '#/features/recipes/recipes.schema';
import { formatDelimitedMeta } from '#/lib/format';

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

      <DetailHero
        actions={
          <>
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
          </>
        }
        description={recipe.description}
        eyebrow="Recipe"
        footer={<RecipeSourceLink recipe={recipe} />}
        media={
          recipe.imageUrl ? (
            <img
              alt=""
              className="h-full w-full object-cover"
              src={recipe.imageUrl}
            />
          ) : null
        }
        meta={<RecipeMeta recipe={recipe} />}
        title={recipe.title}
      />

      {isConfirmingDelete ? (
        <DeleteConfirmation
          confirmLabel="Delete recipe"
          description="This permanently removes the recipe, ingredients, and instructions."
          isDeleting={isDeleting}
          onCancel={() => setIsConfirmingDelete(false)}
          onConfirm={handleDelete}
          title="Delete this recipe?"
        />
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
                  {formatDelimitedMeta(
                    [ingredient.quantity, ingredient.unit, ingredient.category],
                    '',
                  )}
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

function RecipeSourceLink({ recipe }: { recipe: RecipeDetail }) {
  if (!recipe.sourceUrl) return null;

  return (
    <p className="text-primary-soft text-sm">
      Source:{' '}
      <a
        className="font-semibold text-paper transition hover:text-primary-soft"
        href={recipe.sourceUrl}
        rel="noreferrer"
        target="_blank"
      >
        Original recipe
      </a>
    </p>
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
