import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { PageHeader } from '../../../components/layout/page-header';
import { LinkButton } from '../../../components/ui/button';
import { GenerateListPanel } from '../../../features/grocery-lists/components/generate-list-panel';
import { listRecipes } from '../../../features/recipes/recipes.functions';

export const Route = createFileRoute('/_authenticated/grocery-lists/new')({
  component: NewGroceryListPage,
  loader: async () => ({
    recipes: await listRecipes(),
  }),
});

function NewGroceryListPage() {
  const { recipes } = Route.useLoaderData();
  const navigate = Route.useNavigate();

  return (
    <div className="space-y-8">
      <LinkButton to="/grocery-lists" variant="secondary">
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Back to grocery lists
      </LinkButton>
      <PageHeader
        description="Choose recipes, review one-time pantry matches, then create your shopping list."
        eyebrow="Shopping workflow"
        title="New Grocery List"
      />
      <GenerateListPanel
        onGenerated={(groceryListId) =>
          navigate({
            params: { groceryListId },
            to: '/grocery-lists/$groceryListId',
          })
        }
        recipes={recipes}
      />
    </div>
  );
}
