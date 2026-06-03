import { createFileRoute, Link } from '@tanstack/react-router';
import { Pencil } from 'lucide-react';

import { PageHeader } from '../../../components/layout/page-header';
import { LinkButton } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/empty-state';
import {
  TableShell,
  tableCellClass,
  tableHeaderCellClass,
  tableRowClass,
} from '../../../components/ui/table-shell';
import { listPantryItems } from '../../../features/pantry/pantry.functions';
import type { PantryListItem } from '../../../features/pantry/pantry.schema';

export const Route = createFileRoute('/_authenticated/pantry/')({
  component: PantryPage,
  loader: async () => ({
    pantryItems: await listPantryItems(),
  }),
});

function PantryPage() {
  const { pantryItems } = Route.useLoaderData();

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
        <PantryTable pantryItems={pantryItems} />
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

function PantryTable({ pantryItems }: { pantryItems: PantryListItem[] }) {
  return (
    <TableShell>
      <thead className="bg-primary-soft/50">
        <tr>
          <th className={tableHeaderCellClass} scope="col">
            Item
          </th>
          <th className={tableHeaderCellClass} scope="col">
            Quantity
          </th>
          <th className={tableHeaderCellClass} scope="col">
            Category
          </th>
          <th className={tableHeaderCellClass} scope="col">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {pantryItems.map((pantryItem) => (
          <tr className={tableRowClass} key={pantryItem.id}>
            <td className={tableCellClass}>
              <Link
                className="font-semibold text-foreground hover:underline"
                params={{ pantryItemId: pantryItem.id }}
                to="/pantry/$pantryItemId"
              >
                {pantryItem.name}
              </Link>
              {pantryItem.notes ? (
                <p className="mt-1 line-clamp-2 max-w-xl text-muted text-sm">
                  {pantryItem.notes}
                </p>
              ) : null}
            </td>
            <td className={tableCellClass}>{formatQuantity(pantryItem)}</td>
            <td className={tableCellClass}>{pantryItem.category ?? '-'}</td>
            <td className={`${tableCellClass} text-right`}>
              <div className="flex justify-end gap-2">
                <Link
                  aria-label={`Edit ${pantryItem.name}`}
                  className="inline-flex rounded-full p-2 text-muted transition hover:text-primary-hover"
                  params={{ pantryItemId: pantryItem.id }}
                  to="/pantry/$pantryItemId/edit"
                >
                  <Pencil aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function formatQuantity(pantryItem: PantryListItem) {
  return (
    [pantryItem.quantity, pantryItem.unit].filter(Boolean).join(' ') || '-'
  );
}
