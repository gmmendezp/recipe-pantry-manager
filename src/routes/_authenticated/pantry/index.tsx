import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { PageHeader } from '#/components/layout/page-header';
import { LinkButton } from '#/components/ui/button';
import { EmptyState } from '#/components/ui/empty-state';
import { FilterBar, FilterSelect } from '#/components/ui/filter-bar';
import { PantryTable } from '#/features/pantry/components/pantry-table';
import { listPantryItems } from '#/features/pantry/pantry.functions';
import type { PantryListItem } from '#/features/pantry/pantry.schema';
import { useFilteredList } from '#/hooks/use-filtered-list';

export const Route = createFileRoute('/_authenticated/pantry/')({
  component: PantryPage,
  loader: async () => ({
    pantryItems: await listPantryItems(),
  }),
});

function PantryPage() {
  const { pantryItems } = Route.useLoaderData();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const categoryOptions = getCategoryOptions(pantryItems);
  const filteredPantryItems = useFilteredList(pantryItems, {
    filters: [
      (pantryItem) =>
        categoryFilter === 'all' || pantryItem.category === categoryFilter,
    ],
    searchFields: (pantryItem) => [
      pantryItem.name,
      pantryItem.category,
      pantryItem.notes,
    ],
    searchQuery,
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          description="Track ingredients already at home so generated grocery lists can separate what you need from what you have."
          eyebrow="Pantry mode"
          title="Pantry"
        />
        <div className="flex flex-nowrap gap-3 sm:justify-end">
          <LinkButton
            className="text-center whitespace-nowrap"
            to="/pantry/new"
          >
            New pantry item
          </LinkButton>
        </div>
      </div>

      {pantryItems.length > 0 ? (
        <FilterBar
          onSearchChange={setSearchQuery}
          searchLabel="Search pantry"
          searchPlaceholder="Search by item, category, or notes"
          searchValue={searchQuery}
        >
          <FilterSelect
            label="Category"
            onChange={setCategoryFilter}
            options={categoryOptions}
            value={categoryFilter}
          />
        </FilterBar>
      ) : null}

      {pantryItems.length > 0 ? (
        filteredPantryItems.length > 0 ? (
          <PantryTable pantryItems={filteredPantryItems} />
        ) : (
          <EmptyState title="No pantry items match your filters">
            Try a different search or category filter.
          </EmptyState>
        )
      ) : (
        <EmptyState
          action={<LinkButton to="/pantry/new">Create pantry item</LinkButton>}
          title="No pantry items yet"
        >
          Add ingredients you already have at home so grocery lists can separate
          what you need from what is already covered.
        </EmptyState>
      )}
    </div>
  );
}

function getCategoryOptions(pantryItems: PantryListItem[]) {
  const categories = Array.from(
    new Set(
      pantryItems
        .map((pantryItem) => pantryItem.category)
        .filter((category): category is string => Boolean(category)),
    ),
  ).sort((first, second) => first.localeCompare(second));

  return [
    { label: 'All', value: 'all' },
    ...categories.map((category) => ({ label: category, value: category })),
  ];
}
