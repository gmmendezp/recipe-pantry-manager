import { createFileRoute } from '@tanstack/react-router';

import { PageHeader } from '../../../components/layout/page-header';
import { MissingRecipe } from '../../../features/recipes/components/missing-recipe';
import { RecipeForm } from '../../../features/recipes/components/recipe-form';
import {
  getRecipe,
  updateRecipe,
} from '../../../features/recipes/recipes.functions';
import {
  recipeDetailToFormValues,
  recipeIdSchema,
} from '../../../features/recipes/recipes.schema';

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
      <PageHeader
        description="Update recipe details, ingredients, and instructions."
        eyebrow="Recipe collection"
        title="Edit Recipe"
      />

      <RecipeForm
        cancelParams={{ recipeId: recipe.id }}
        cancelTo="/recipes/$recipeId"
        defaultValues={recipeDetailToFormValues(recipe)}
        onSubmit={async (values) => {
          await updateRecipe({ data: { ...values, recipeId: recipe.id } });
          await navigate({
            params: { recipeId: recipe.id },
            to: '/recipes/$recipeId',
          });
        }}
      />
    </div>
  );
}
