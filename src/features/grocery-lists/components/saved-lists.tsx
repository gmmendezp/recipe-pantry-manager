import { Link } from '@tanstack/react-router';

import { Button } from '../../../components/ui/button';
import { EmptyState } from '../../../components/ui/empty-state';
import {
  TableShell,
  tableCellClass,
  tableHeaderCellClass,
  tableRowClass,
} from '../../../components/ui/table-shell';
import { formatShortDate } from '../../../lib/date';
import { formatCount } from '../../../lib/format';
import type { GroceryListSummary } from '../grocery-lists.schema';

type SavedListsProps = {
  groceryLists: GroceryListSummary[];
  hasSavedLists: boolean;
  onGenerate: () => void;
};

export function SavedLists({
  groceryLists,
  hasSavedLists,
  onGenerate,
}: SavedListsProps) {
  if (groceryLists.length === 0) {
    if (hasSavedLists) {
      return (
        <EmptyState title="No grocery lists match your search">
          Try a different list title.
        </EmptyState>
      );
    }

    return (
      <EmptyState
        action={
          <Button onClick={onGenerate} type="button">
            Generate grocery list
          </Button>
        }
        title="No saved grocery lists yet"
      >
        Generated lists will appear here after you select recipes.
      </EmptyState>
    );
  }

  return (
    <TableShell>
      <thead className="bg-primary-soft/50">
        <tr>
          <th className={tableHeaderCellClass} scope="col">
            List
          </th>
          <th className={tableHeaderCellClass} scope="col">
            Items
          </th>
          <th className={tableHeaderCellClass} scope="col">
            Updated
          </th>
        </tr>
      </thead>
      <tbody>
        {groceryLists.map((list) => (
          <tr className={tableRowClass} key={list.id}>
            <td className={tableCellClass}>
              <Link
                className="font-semibold text-foreground hover:underline"
                params={{ groceryListId: list.id }}
                to="/grocery-lists/$groceryListId"
              >
                {list.title}
              </Link>
            </td>
            <td className={tableCellClass}>
              {formatCount(list.itemCount, 'item')}
            </td>
            <td className={tableCellClass}>
              {formatShortDate(list.updatedAt)}
            </td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}
