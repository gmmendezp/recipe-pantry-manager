import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import { DetailHero } from '#/components/layout/detail-hero';
import { Badge } from '#/components/ui/badge';
import { Button, LinkButton } from '#/components/ui/button';
import { DeleteConfirmation } from '#/components/ui/delete-confirmation';
import { FormError } from '#/components/ui/form-error';
import { MissingResource } from '#/components/ui/missing-resource';
import { GroceryListSection } from '#/features/grocery-lists/components/grocery-list-section';
import {
  deleteGroceryList,
  getGroceryList,
  toggleGroceryListItem,
} from '#/features/grocery-lists/grocery-lists.functions';
import {
  type GroceryListDetail,
  groceryListIdSchema,
} from '#/features/grocery-lists/grocery-lists.schema';
import { formatCount } from '#/lib/format';

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
  const navigate = Route.useNavigate();
  const [items, setItems] = useState(groceryList.items);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const checkedItems = items.filter((item) => item.isChecked);
  const pantryItems = items.filter(
    (item) => item.pantryMatch && !item.isChecked,
  );
  const needToBuyItems = items.filter(
    (item) => !item.pantryMatch && !item.isChecked,
  );

  async function handleToggle(itemId: string) {
    setError(null);
    setPendingItemId(itemId);

    try {
      const updatedItem = await toggleGroceryListItem({
        data: { groceryListItemId: itemId },
      });

      if (!updatedItem) {
        throw new Error('Unable to update this grocery item.');
      }

      setItems((current) =>
        current.map((item) => (item.id === itemId ? updatedItem : item)),
      );
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
          <div className="flex flex-wrap gap-2">
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

      <GroceryListSection
        emptyText="There are no more shopping items for these recipes."
        items={needToBuyItems}
        onToggle={handleToggle}
        pendingItemId={pendingItemId}
        title="Need to Buy"
      />

      <section className="grid items-start gap-6 lg:grid-cols-2">
        <GroceryListSection
          emptyText="No more ingredients match your pantry."
          items={pantryItems}
          onToggle={handleToggle}
          pendingItemId={pendingItemId}
          title="Already in Pantry"
          variant="secondary"
        />

        <GroceryListSection
          emptyText="Checked items will stay visible here while shopping."
          items={checkedItems}
          onToggle={handleToggle}
          pendingItemId={pendingItemId}
          title="Checked Off"
          variant="secondary"
        />
      </section>
    </div>
  );
}
