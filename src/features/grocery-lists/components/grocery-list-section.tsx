import clsx from 'clsx';
import { Check, ChevronDown, ChevronRight, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { Panel } from '#/components/ui/panel';
import { formatDelimitedMeta, formatQuantity } from '#/lib/format';
import type { GroceryListItem } from '../grocery-lists.schema';

type GroceryListSectionProps = {
  emptyText: string;
  items: GroceryListItem[];
  onToggle: (itemId: string) => Promise<void>;
  pendingItemId: string | null;
  title: string;
  variant?: 'primary' | 'secondary';
};

export function GroceryListSection({
  emptyText,
  items,
  onToggle,
  pendingItemId,
  title,
  variant = 'primary',
}: GroceryListSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Panel>
      <h2
        className={clsx(
          'font-semibold',
          variant === 'primary' ? 'text-2xl' : 'text-xl',
        )}
      >
        <button
          aria-expanded={!isCollapsed}
          className="flex w-full items-center justify-between gap-3 rounded-xl text-left transition hover:text-primary"
          onClick={() => setIsCollapsed((current) => !current)}
          type="button"
        >
          <span>
            {title} <span className="text-muted">({items.length})</span>
          </span>
          <span className="rounded-full p-2 text-muted transition hover:bg-primary-soft hover:text-primary">
            {isCollapsed ? (
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            ) : (
              <ChevronDown aria-hidden="true" className="h-5 w-5" />
            )}
          </span>
        </button>
      </h2>
      <div
        className={clsx(
          'grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none',
          isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]',
        )}
      >
        <div className="overflow-hidden">
          <div className="pt-5">
            {items.length > 0 ? (
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      aria-label={
                        item.isChecked
                          ? `Uncheck ${item.name}`
                          : `Check off ${item.name}`
                      }
                      className={clsx(
                        'flex w-full items-start gap-3 rounded-xl border border-transparent text-left transition hover:border-primary hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60',
                        variant === 'primary' ? 'p-3' : 'p-2.5',
                      )}
                      disabled={pendingItemId === item.id}
                      onClick={() => void onToggle(item.id)}
                      type="button"
                    >
                      <span
                        className={clsx(
                          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border',
                          item.isChecked
                            ? 'border-primary bg-primary text-paper'
                            : 'border-border bg-paper text-paper',
                        )}
                      >
                        {item.isChecked ? (
                          <Check aria-hidden="true" className="h-4 w-4" />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">{item.name}</span>
                        <GroceryListItemMeta item={item} />
                      </span>
                      {pendingItemId === item.id ? (
                        <span className="mt-1 flex items-center gap-2 rounded-full px-2 py-1 font-medium text-muted text-xs">
                          <LoaderCircle
                            aria-hidden="true"
                            className="h-3.5 w-3.5 animate-spin"
                          />
                          <span className="sr-only">Updating</span>
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">{emptyText}</p>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}

function GroceryListItemMeta({ item }: { item: GroceryListItem }) {
  if (item.pantryMatch) {
    return (
      <div className="mt-1 space-y-1 text-muted text-sm">
        <p>
          Needed:{' '}
          {formatQuantity(item.quantity, item.unit, 'No amount specified')}
        </p>
        <p>
          In pantry:{' '}
          {formatQuantity(
            item.pantryQuantity,
            item.pantryUnit,
            'No amount specified',
          )}
        </p>
      </div>
    );
  }

  return (
    <p className="mt-1 text-muted text-sm">
      {formatDelimitedMeta([item.quantity, item.unit, item.category], '')}
    </p>
  );
}
