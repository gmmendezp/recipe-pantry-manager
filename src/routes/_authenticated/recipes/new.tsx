import { createFileRoute } from '@tanstack/react-router';

import { PageHeader } from '#/components/layout/page-header';
import { RecipeForm } from '#/features/recipes/components/recipe-form';
import { createRecipe } from '#/features/recipes/recipes.functions';

export const Route = createFileRoute('/_authenticated/recipes/new')({
  component: NewRecipePage,
});

function NewRecipePage() {
  const navigate = Route.useNavigate();

  return (
    <div className="space-y-8">
      <PageHeader
        description="Add recipe details, ingredients, and instructions."
        eyebrow="Recipe collection"
        title="New Recipe"
      />

      <RecipeForm
        cancelTo="/recipes"
        onSubmit={(values) => createRecipe({ data: values })}
        onSuccess={async (result) => {
          const recipe = result as Awaited<ReturnType<typeof createRecipe>>;

          await navigate({
            params: { recipeId: recipe.id },
            to: '/recipes/$recipeId',
          });
        }}
      />
    </div>
  );
}
