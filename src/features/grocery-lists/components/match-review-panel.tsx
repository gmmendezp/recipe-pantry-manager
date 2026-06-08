import { X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '#/components/ui/button';
import { EmptyState } from '#/components/ui/empty-state';
import { FormError } from '#/components/ui/form-error';
import { Panel } from '#/components/ui/panel';
import { formatQuantity } from '#/lib/format';
import type {
  GroceryListReviewItem,
  PantryMatchOption,
} from '../grocery-lists.schema';

export type ReviewedItem = GroceryListReviewItem & {
  pantryItemId: string | null;
};

type MatchReviewPanelProps = {
  backLabel: string;
  description: string;
  error: string | null;
  initialItems: GroceryListReviewItem[];
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: (items: ReviewedItem[]) => Promise<void> | void;
  pantryOptions: PantryMatchOption[];
  pendingLabel: string;
  stepLabel?: string;
  submitLabel: string;
  title: string;
};

export function MatchReviewPanel({
  backLabel,
  description,
  error,
  initialItems,
  isSubmitting,
  onBack,
  onSubmit,
  pantryOptions,
  pendingLabel,
  stepLabel,
  submitLabel,
  title,
}: MatchReviewPanelProps) {
  const [reviewedItems, setReviewedItems] = useState<ReviewedItem[]>(() =>
    initialItems.map((item) => ({
      ...item,
      pantryItemId: item.matchedPantryItemId,
    })),
  );

  function updateReviewedPantryItem(reviewId: string, pantryItemId: string) {
    setReviewedItems((current) =>
      current.map((item) =>
        item.reviewId === reviewId
          ? { ...item, pantryItemId: pantryItemId || null }
          : item,
      ),
    );
  }

  function removeReviewedItem(reviewId: string) {
    setReviewedItems((current) =>
      current.filter((item) => item.reviewId !== reviewId),
    );
  }

  return (
    <Panel>
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit(reviewedItems);
        }}
      >
        <div>
          {stepLabel ? (
            <p className="font-medium text-muted text-sm uppercase tracking-[0.2em]">
              {stepLabel}
            </p>
          ) : null}
          <h2 className="mt-2 font-semibold text-2xl">{title}</h2>
          <p className="mt-2 text-muted">{description}</p>
        </div>

        {reviewedItems.length > 0 ? (
          <MatchReviewList
            items={reviewedItems}
            onPantryItemChange={updateReviewedPantryItem}
            onRemoveItem={removeReviewedItem}
            pantryOptions={pantryOptions}
          />
        ) : (
          <EmptyState title="No ingredients selected">
            Go back to recipes to rebuild the review.
          </EmptyState>
        )}

        {error ? <FormError>{error}</FormError> : null}

        <div className="flex flex-wrap gap-3">
          <Button
            disabled={isSubmitting || reviewedItems.length === 0}
            type="submit"
          >
            {isSubmitting ? pendingLabel : submitLabel}
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={onBack}
            type="button"
            variant="secondary"
          >
            {backLabel}
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function MatchReviewList({
  items,
  onPantryItemChange,
  onRemoveItem,
  pantryOptions,
}: {
  items: ReviewedItem[];
  onPantryItemChange: (reviewId: string, pantryItemId: string) => void;
  onRemoveItem: (reviewId: string) => void;
  pantryOptions: PantryMatchOption[];
}) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article
          className="grid gap-4 rounded-xl border border-border bg-background/40 p-4 md:grid-cols-[1fr_minmax(14rem,18rem)] md:items-center"
          key={item.reviewId}
        >
          <div>
            <h3 className="font-semibold">{item.name}</h3>
            <ReviewItemMeta item={item} />
          </div>
          <div className="flex items-end gap-2">
            <label className="block flex-1 space-y-2">
              <span className="font-medium text-foreground text-sm">
                Pantry match
              </span>
              <select
                className="w-full rounded-xl border border-border bg-paper px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-soft"
                onChange={(event) =>
                  onPantryItemChange(item.reviewId, event.target.value)
                }
                value={item.pantryItemId ?? ''}
              >
                <option value="">Need to buy</option>
                {pantryOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {formatPantryOption(option)}
                  </option>
                ))}
              </select>
            </label>
            <Button
              aria-label={`Remove ${item.name} from grocery list`}
              className="text-muted hover:border-red-700 hover:text-red-700 focus-visible:border-red-700 focus-visible:text-red-700"
              onClick={() => onRemoveItem(item.reviewId)}
              size="xs"
              type="button"
              variant="ghost"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

function ReviewItemMeta({ item }: { item: ReviewedItem }) {
  const amount = formatQuantity(item.quantity, item.unit, '');

  if (!amount && !item.category) return null;

  return (
    <p className="mt-1 text-muted text-sm">
      {amount ? `Needed: ${amount}` : item.category}
      {amount && item.category ? ` • ${item.category}` : ''}
    </p>
  );
}

function formatPantryOption(option: PantryMatchOption) {
  const amount = formatQuantity(option.quantity, option.unit, '');

  return amount ? `${option.name} (${amount})` : option.name;
}
