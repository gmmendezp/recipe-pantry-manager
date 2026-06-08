import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { PageHeader } from '#/components/layout/page-header';
import { LinkButton } from '#/components/ui/button';
import { MissingRecipe } from '#/features/recipes/components/missing-recipe';
import { RecipeForm } from '#/features/recipes/components/recipe-form';
import { getRecipe, updateRecipe } from '#/features/recipes/recipes.functions';
import {
  recipeDetailToFormValues,
  recipeIdSchema,
} from '#/features/recipes/recipes.schema';

export const Route = createFileRoute('/_authenticated/recipes/$recipeId_/edit')(
  {
    component: EditRecipePage,
    loader: async ({ params }) => {
      const result = recipeIdSchema.safeParse({ recipeId: params.recipeId });

      if (!result.success) return { recipe: null };

      return {
        recipe: await getRecipe({ data: result.data }),
      };
    },
  },
);

function EditRecipePage() {
  const navigate = Route.useNavigate();
  const { recipe } = Route.useLoaderData();

  if (!recipe) return <MissingRecipe />;

  return (
    <div className="space-y-8">
      <LinkButton
        params={{ recipeId: recipe.id }}
        to="/recipes/$recipeId"
        variant="secondary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Back to recipe
      </LinkButton>

      <PageHeader
        description="Update recipe details, ingredients, and instructions."
        eyebrow="Recipe collection"
        title="Edit Recipe"
      />

      <RecipeForm
        cancelParams={{ recipeId: recipe.id }}
        cancelTo="/recipes/$recipeId"
        defaultValues={recipeDetailToFormValues(recipe)}
        onSubmit={(values) =>
          updateRecipe({ data: { ...values, recipeId: recipe.id } })
        }
        onSuccess={async () => {
          await navigate({
            params: { recipeId: recipe.id },
            to: '/recipes/$recipeId',
          });
        }}
      />
    </div>
  );
}
