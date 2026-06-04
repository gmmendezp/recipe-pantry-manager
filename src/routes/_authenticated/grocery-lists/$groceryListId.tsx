import { createFileRoute, useRouter } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import { DetailHero } from '../../../components/layout/detail-hero';
import { Badge } from '../../../components/ui/badge';
import { Button, LinkButton } from '../../../components/ui/button';
import { DeleteConfirmation } from '../../../components/ui/delete-confirmation';
import { FormError } from '../../../components/ui/form-error';
import { MissingResource } from '../../../components/ui/missing-resource';
import { Panel } from '../../../components/ui/panel';
import {
  deleteGroceryList,
  getGroceryList,
  toggleGroceryListItem,
} from '../../../features/grocery-lists/grocery-lists.functions';
import {
  type GroceryListDetail,
  type GroceryListItem,
  groceryListIdSchema,
} from '../../../features/grocery-lists/grocery-lists.schema';
import { formatCount, formatDelimitedMeta } from '../../../lib/format';

export const Route = createFileRoute(
  '/_authenticated/grocery-lists/$groceryListId',
)({
  component: GroceryListDetailPage,
  loader: async ({ params }) => {
    const result = groceryListIdSchema.safeParse({
      groceryListId: params.groceryListId,
    });

    if (!result.success) return { groceryList: null };

    return {
      groceryList: await getGroceryList({ data: result.data }),
    };
  },
});

function GroceryListDetailPage() {
  const { groceryList } = Route.useLoaderData();

  if (!groceryList) return <MissingGroceryList />;

  return <GroceryListDetailView groceryList={groceryList} />;
}

function MissingGroceryList() {
  return (
    <MissingResource
      backLabel="Back to grocery lists"
      message="This grocery list may have been deleted or belongs to another account."
      title="Grocery list not found"
      to="/grocery-lists"
    />
  );
}

function GroceryListDetailView({
  groceryList,
}: {
  groceryList: GroceryListDetail;
}) {
  const router = useRouter();
  const navigate = Route.useNavigate();
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const checkedItems = groceryList.items.filter((item) => item.isChecked);
  const pantryItems = groceryList.items.filter(
    (item) => item.pantryMatch && !item.isChecked,
  );
  const needToBuyItems = groceryList.items.filter(
    (item) => !item.pantryMatch && !item.isChecked,
  );

  async function handleToggle(itemId: string) {
    setError(null);
    setPendingItemId(itemId);

    try {
      await toggleGroceryListItem({ data: { groceryListItemId: itemId } });
      await router.invalidate();
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : 'Unable to update this grocery item. Please try again.',
      );
    } finally {
      setPendingItemId(null);
    }
  }

  async function handleDelete() {
    setError(null);
    setIsDeleting(true);

    try {
      await deleteGroceryList({ data: { groceryListId: groceryList.id } });
      await navigate({ to: '/grocery-lists' });
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Unable to delete this grocery list. Please try again.',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <LinkButton to="/grocery-lists" variant="secondary">
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Back to grocery lists
      </LinkButton>

      <DetailHero
        actions={
          <Button
            disabled={isDeleting || isConfirmingDelete}
            onClick={() => {
              setError(null);
              setIsConfirmingDelete(true);
            }}
            size="sm"
            type="button"
            variant="inverseOutline"
          >
            Delete
          </Button>
        }
        eyebrow="Grocery list"
        meta={
          <div className="flex flex-wrap gap-2">
            <Badge variant="primary">
              {formatCount(groceryList.itemCount, 'item')}
            </Badge>
          </div>
        }
        title={groceryList.title}
      />

      {isConfirmingDelete ? (
        <DeleteConfirmation
          confirmLabel="Delete grocery list"
          description="This permanently removes the grocery list."
          isDeleting={isDeleting}
          onCancel={() => setIsConfirmingDelete(false)}
          onConfirm={handleDelete}
          title="Delete this grocery list?"
        />
      ) : null}

      {error ? <FormError>{error}</FormError> : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <GroceryListSection
          emptyText="No shopping items for these recipes."
          items={needToBuyItems}
          onToggle={handleToggle}
          pendingItemId={pendingItemId}
          title="Need to Buy"
        />
        <GroceryListSection
          emptyText="No ingredients matched your pantry."
          items={pantryItems}
          onToggle={handleToggle}
          pendingItemId={pendingItemId}
          title="Already in Pantry"
        />
      </section>

      <GroceryListSection
        emptyText="Checked items stay visible here while shopping."
        items={checkedItems}
        onToggle={handleToggle}
        pendingItemId={pendingItemId}
        title="Checked Off"
      />
    </div>
  );
}

function GroceryListSection({
  emptyText,
  items,
  onToggle,
  pendingItemId,
  title,
}: {
  emptyText: string;
  items: GroceryListItem[];
  onToggle: (itemId: string) => Promise<void>;
  pendingItemId: string | null;
  title: string;
}) {
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
                <p className="mt-1 text-muted text-sm">
                  {formatItemMeta(item)}
                </p>
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

function formatItemMeta(item: GroceryListItem) {
  return formatDelimitedMeta(
    [item.quantity, item.unit, item.category],
    'No quantity specified',
  );
}
