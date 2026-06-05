import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { PageHeader } from '../../../components/layout/page-header';
import { Button } from '../../../components/ui/button';
import { FilterBar } from '../../../components/ui/filter-bar';
import { GenerateListPanel } from '../../../features/grocery-lists/components/generate-list-panel';
import { SavedLists } from '../../../features/grocery-lists/components/saved-lists';
import { listGroceryLists } from '../../../features/grocery-lists/grocery-lists.functions';
import { listRecipes } from '../../../features/recipes/recipes.functions';
import { useFilteredList } from '../../../hooks/use-filtered-list';

export const Route = createFileRoute('/_authenticated/grocery-lists/')({
  component: GroceryListsPage,
  loader: async () => ({
    groceryLists: await listGroceryLists(),
    recipes: await listRecipes(),
  }),
});

function GroceryListsPage() {
  const { groceryLists, recipes } = Route.useLoaderData();
  const navigate = Route.useNavigate();
  const [isGeneratePanelOpen, setIsGeneratePanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const filteredGroceryLists = useFilteredList(groceryLists, {
    searchFields: (list) => [list.title],
    searchQuery,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          description="Review saved shopping lists or generate a new pantry-aware list from recipes."
          eyebrow="Shopping workflow"
          title="Grocery Lists"
        />
        <Button
          className="text-center whitespace-nowrap"
          onClick={() => setIsGeneratePanelOpen((current) => !current)}
          type="button"
          variant={isGeneratePanelOpen ? 'secondary' : 'primary'}
        >
          {isGeneratePanelOpen ? 'Cancel' : 'Generate grocery list'}
        </Button>
      </div>
      {isGeneratePanelOpen ? (
        <GenerateListPanel
          onGenerated={(groceryListId) =>
            navigate({
              params: { groceryListId },
              to: '/grocery-lists/$groceryListId',
            })
          }
          recipes={recipes}
        />
      ) : null}
      {groceryLists.length > 0 ? (
        <FilterBar
          onSearchChange={setSearchQuery}
          searchLabel="Search grocery lists"
          searchPlaceholder="Search by list title"
          searchValue={searchQuery}
        />
      ) : null}
      <SavedLists
        groceryLists={filteredGroceryLists}
        hasSavedLists={groceryLists.length > 0}
        onGenerate={() => setIsGeneratePanelOpen(true)}
      />
    </div>
  );
}
