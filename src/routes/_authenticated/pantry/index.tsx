import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';

import { PageHeader } from '../../../components/layout/page-header';
import { Badge } from '../../../components/ui/badge';
import { LinkButton } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/empty-state';
import {
  TableShell,
  tableCellClass,
  tableHeaderCellClass,
  tableRowClass,
} from '../../../components/ui/table-shell';
import { type ViewMode, ViewToggle } from '../../../components/ui/view-toggle';
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
  const [desktopView, setDesktopView] = useState<ViewMode>('cards');

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          description="Track ingredients already at home so generated grocery lists can separate what you need from what you have."
          eyebrow="Pantry mode"
          title="Pantry"
        />
        <div className="flex flex-nowrap gap-3 sm:justify-end">
          <ViewToggle onChange={setDesktopView} value={desktopView} />
          <LinkButton
            className="text-center whitespace-nowrap"
            to="/pantry/new"
          >
            New pantry item
          </LinkButton>
        </div>
      </div>

      {pantryItems.length > 0 ? (
        <>
          <div className="md:hidden">
            <PantryCards pantryItems={pantryItems} />
          </div>
          <div className="hidden md:block">
            {desktopView === 'cards' ? (
              <PantryCards pantryItems={pantryItems} />
            ) : (
              <PantryTable pantryItems={pantryItems} />
            )}
          </div>
        </>
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

function PantryCards({ pantryItems }: { pantryItems: PantryListItem[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      {pantryItems.map((pantryItem) => (
        <Link
          className="rounded-2xl border border-border bg-paper p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          key={pantryItem.id}
          params={{ pantryItemId: pantryItem.id }}
          to="/pantry/$pantryItemId"
        >
          <div className="flex items-start justify-between gap-4">
            <h2 className="font-semibold text-2xl">{pantryItem.name}</h2>
            {pantryItem.category ? <Badge>{pantryItem.category}</Badge> : null}
          </div>
          <p className="mt-3 text-muted">
            {[pantryItem.quantity, pantryItem.unit].filter(Boolean).join(' ') ||
              'No quantity specified'}
          </p>
          {pantryItem.notes ? (
            <p className="mt-3 line-clamp-2 text-muted text-sm">
              {pantryItem.notes}
            </p>
          ) : null}
        </Link>
      ))}
    </section>
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
              <p className="font-semibold text-foreground">{pantryItem.name}</p>
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
                <LinkButton
                  params={{ pantryItemId: pantryItem.id }}
                  size="xs"
                  to="/pantry/$pantryItemId"
                  variant="secondary"
                >
                  View
                </LinkButton>
                <LinkButton
                  params={{ pantryItemId: pantryItem.id }}
                  size="xs"
                  to="/pantry/$pantryItemId/edit"
                  variant="secondary"
                >
                  Edit
                </LinkButton>
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
