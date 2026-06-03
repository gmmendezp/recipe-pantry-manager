import { createFileRoute, useRouter } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '../../../components/ui/badge';
import { Button, LinkButton } from '../../../components/ui/button';
import { FormError } from '../../../components/ui/form-error';
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
    <section className="rounded-2xl border border-border bg-paper p-8 text-center shadow-sm">
      <h1 className="font-bold text-3xl tracking-tight">
        Grocery list not found
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-muted">
        This grocery list may have been deleted or belongs to another account.
      </p>
      <LinkButton className="mt-6" to="/grocery-lists">
        Back to grocery lists
      </LinkButton>
    </section>
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

      <header className="space-y-5 rounded-2xl bg-primary p-8 text-paper">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-primary-soft text-sm uppercase tracking-[0.25em]">
              Grocery list
            </p>
            <h1 className="mt-3 break-words font-bold text-4xl tracking-tight">
              {groceryList.title}
            </h1>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
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
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="primary">
            {groceryList.itemCount}{' '}
            {groceryList.itemCount === 1 ? 'item' : 'items'}
          </Badge>
        </div>
      </header>

      {isConfirmingDelete ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-sm">
          <h2 className="font-semibold text-xl">Delete this grocery list?</h2>
          <p className="mt-2 text-red-800 text-sm">
            This permanently removes the grocery list.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              className="border-red-300 text-red-900 hover:border-red-900 disabled:opacity-60"
              disabled={isDeleting}
              onClick={() => setIsConfirmingDelete(false)}
              size="sm"
              type="button"
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              disabled={isDeleting}
              onClick={handleDelete}
              size="sm"
              type="button"
              variant="danger"
            >
              {isDeleting ? 'Deleting...' : 'Delete grocery list'}
            </Button>
          </div>
        </section>
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
  return (
    [item.quantity, item.unit, item.category].filter(Boolean).join(' · ') ||
    'No quantity specified'
  );
}
