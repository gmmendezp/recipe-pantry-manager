import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { PageHeader } from '#/components/layout/page-header';
import { LinkButton } from '#/components/ui/button';
import { FilterBar } from '#/components/ui/filter-bar';
import { SavedLists } from '#/features/grocery-lists/components/saved-lists';
import { listGroceryLists } from '#/features/grocery-lists/grocery-lists.functions';
import { useFilteredList } from '#/hooks/use-filtered-list';

export const Route = createFileRoute('/_authenticated/grocery-lists/')({
  component: GroceryListsPage,
  loader: async () => ({
    groceryLists: await listGroceryLists(),
  }),
});

function GroceryListsPage() {
  const { groceryLists } = Route.useLoaderData();
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
        <LinkButton
          className="text-center whitespace-nowrap"
          to="/grocery-lists/new"
        >
          New grocery list
        </LinkButton>
      </div>
      {groceryLists.length > 0 ? (
        <FilterBar
          onSearchChange={setSearchQuery}
          searchLabel="Search grocery lists"
          searchPlaceholder="Search by list title"
          searchValue={searchQuery}
        />
      ) : null}
      <SavedLists
        emptyAction={
          <LinkButton to="/grocery-lists/new">Create grocery list</LinkButton>
        }
        groceryLists={filteredGroceryLists}
        hasSavedLists={groceryLists.length > 0}
      />
    </div>
  );
}
