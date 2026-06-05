import { Button } from '../../../components/ui/button';
import { Panel } from '../../../components/ui/panel';
import { formatDelimitedMeta } from '../../../lib/format';
import type { GroceryListItem } from '../grocery-lists.schema';

type GroceryListSectionProps = {
  emptyText: string;
  items: GroceryListItem[];
  onToggle: (itemId: string) => Promise<void>;
  pendingItemId: string | null;
  title: string;
};

export function GroceryListSection({
  emptyText,
  items,
  onToggle,
  pendingItemId,
  title,
}: GroceryListSectionProps) {
  return (
    <Panel>
      <h2 className="font-semibold text-2xl">{title}</h2>
      {items.length > 0 ? (
        <ul className="mt-5 divide-y divide-border">
          {items.map((item) => (
            <li
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              key={item.id}
            >
              <div>
                <p className="font-semibold">{item.name}</p>
                <GroceryListItemMeta item={item} />
              </div>
              <Button
                disabled={pendingItemId === item.id}
                onClick={() => void onToggle(item.id)}
                size="xs"
                type="button"
                variant={item.isChecked ? 'secondary' : 'primary'}
              >
                {pendingItemId === item.id
                  ? 'Updating...'
                  : item.isChecked
                    ? 'Uncheck'
                    : 'Check off'}
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-muted">{emptyText}</p>
      )}
    </Panel>
  );
}

function GroceryListItemMeta({ item }: { item: GroceryListItem }) {
  if (item.pantryMatch) {
    return (
      <div className="mt-1 space-y-1 text-muted text-sm">
        <p>Needed: {formatAmount(item.quantity, item.unit)}</p>
        <p>In pantry: {formatAmount(item.pantryQuantity, item.pantryUnit)}</p>
      </div>
    );
  }

  return <p className="mt-1 text-muted text-sm">{formatItemMeta(item)}</p>;
}

function formatItemMeta(item: GroceryListItem) {
  return formatDelimitedMeta([item.quantity, item.unit, item.category], '');
}

function formatAmount(quantity: string | null, unit: string | null) {
  return [quantity, unit].filter(Boolean).join(' ') || 'No amount specified';
}
