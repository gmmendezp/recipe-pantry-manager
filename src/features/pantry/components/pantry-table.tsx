import { Link } from '@tanstack/react-router';
import { Pencil } from 'lucide-react';

import {
  TableShell,
  tableCellClass,
  tableHeaderCellClass,
  tableRowClass,
} from '#/components/ui/table-shell';
import { formatQuantity } from '#/lib/format';
import type { PantryListItem } from '../pantry.schema';

type PantryTableProps = {
  pantryItems: PantryListItem[];
};

export function PantryTable({ pantryItems }: PantryTableProps) {
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
            <td className={tableCellClass}>
              {formatQuantity(pantryItem.quantity, pantryItem.unit)}
            </td>
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
