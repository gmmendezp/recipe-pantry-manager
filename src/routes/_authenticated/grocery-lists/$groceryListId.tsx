import { createFileRoute, useRouter } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import { DetailHero } from '../../../components/layout/detail-hero';
import { Badge } from '../../../components/ui/badge';
import { Button, LinkButton } from '../../../components/ui/button';
import { ConfirmationPanel } from '../../../components/ui/confirmation-panel';
import { DeleteConfirmation } from '../../../components/ui/delete-confirmation';
import { FormError } from '../../../components/ui/form-error';
import { MissingResource } from '../../../components/ui/missing-resource';
import { GroceryListSection } from '../../../features/grocery-lists/components/grocery-list-section';
import {
  deleteGroceryList,
  getGroceryList,
  toggleGroceryListItem,
  updateGroceryList,
} from '../../../features/grocery-lists/grocery-lists.functions';
import {
  type GroceryListDetail,
  groceryListIdSchema,
} from '../../../features/grocery-lists/grocery-lists.schema';
import { formatCount } from '../../../lib/format';

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
  const [isConfirmingUpdate, setIsConfirmingUpdate] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
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

  async function handleUpdate() {
    setError(null);
    setIsUpdating(true);

    try {
      await updateGroceryList({ data: { groceryListId: groceryList.id } });
      setIsConfirmingUpdate(false);
      await router.invalidate();
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : 'Unable to update this grocery list. Please try again.',
      );
    } finally {
      setIsUpdating(false);
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
              disabled={
                isDeleting ||
                isConfirmingDelete ||
                isConfirmingUpdate ||
                isUpdating
              }
              onClick={() => {
                setError(null);
                setIsConfirmingUpdate(true);
              }}
              size="sm"
              type="button"
              variant="inverseOutline"
            >
              {isUpdating ? 'Updating...' : 'Update'}
            </Button>
            <Button
              disabled={
                isDeleting ||
                isConfirmingDelete ||
                isConfirmingUpdate ||
                isUpdating
              }
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

      {isConfirmingUpdate ? (
        <ConfirmationPanel
          confirmLabel="Update grocery list"
          description="This will regenerate the list from its source recipes and current pantry. Checked-off items will be reset."
          isPending={isUpdating}
          onCancel={() => setIsConfirmingUpdate(false)}
          onConfirm={handleUpdate}
          pendingLabel="Updating..."
          title="Update this grocery list?"
        />
      ) : null}

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
