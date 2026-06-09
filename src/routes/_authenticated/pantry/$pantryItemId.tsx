import { createFileRoute } from '@tanstack/react-router';
import clsx from 'clsx';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { DetailHero } from '#/components/layout/detail-hero';
import { Badge } from '#/components/ui/badge';
import { Button, LinkButton } from '#/components/ui/button';
import { DeleteConfirmation } from '#/components/ui/delete-confirmation';
import { FormError } from '#/components/ui/form-error';
import { Panel } from '#/components/ui/panel';
import { MissingPantryItem } from '#/features/pantry/components/missing-pantry-item';
import {
  deletePantryItem,
  getPantryItem,
} from '#/features/pantry/pantry.functions';
import {
  type PantryItemDetail,
  pantryItemIdSchema,
} from '#/features/pantry/pantry.schema';
import { formatQuantity } from '#/lib/format';

export const Route = createFileRoute('/_authenticated/pantry/$pantryItemId')({
  component: PantryItemDetailPage,
  loader: async ({ params }) => {
    const result = pantryItemIdSchema.safeParse({
      pantryItemId: params.pantryItemId,
    });

    if (!result.success) return { pantryItem: null };

    return {
      pantryItem: await getPantryItem({ data: result.data }),
    };
  },
});

function PantryItemDetailPage() {
  const { pantryItem } = Route.useLoaderData();

  if (!pantryItem) return <MissingPantryItem />;

  return <PantryItemDetailView pantryItem={pantryItem} />;
}

function PantryItemDetailView({
  pantryItem,
}: {
  pantryItem: PantryItemDetail;
}) {
  const navigate = Route.useNavigate();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setDeleteError(null);
    setIsDeleting(true);

    try {
      await deletePantryItem({ data: { pantryItemId: pantryItem.id } });
      await navigate({ to: '/pantry' });
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : 'Unable to delete this pantry item. Please try again.',
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <LinkButton to="/pantry" variant="secondary">
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Back to pantry
      </LinkButton>

      <DetailHero
        actions={
          <>
            <LinkButton
              params={{ pantryItemId: pantryItem.id }}
              size="sm"
              to="/pantry/$pantryItemId/edit"
              variant="inverse"
            >
              Edit
            </LinkButton>
            <Button
              disabled={isDeleting || isConfirmingDelete}
              onClick={() => {
                setDeleteError(null);
                setIsConfirmingDelete(true);
              }}
              size="sm"
              type="button"
              variant="inverseOutline"
            >
              Delete
            </Button>
          </>
        }
        eyebrow="Pantry item"
        meta={<PantryItemMeta pantryItem={pantryItem} />}
        title={pantryItem.name}
      />

      {isConfirmingDelete ? (
        <DeleteConfirmation
          confirmLabel="Delete pantry item"
          description="This permanently removes the item from your pantry."
          isDeleting={isDeleting}
          onCancel={() => setIsConfirmingDelete(false)}
          onConfirm={handleDelete}
          title="Delete this pantry item?"
        />
      ) : null}

      {deleteError ? <FormError>{deleteError}</FormError> : null}

      <Panel>
        <h2 className="font-semibold text-2xl">Details</h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <DetailItem label="Quantity">
            {formatQuantity(
              pantryItem.quantity,
              pantryItem.unit,
              'No quantity specified',
            )}
          </DetailItem>
          <DetailItem label="Category">
            {pantryItem.category ?? 'No category'}
          </DetailItem>
          <DetailItem label="Notes" wide>
            {pantryItem.notes ?? 'No notes'}
          </DetailItem>
        </dl>
      </Panel>
    </div>
  );
}

function PantryItemMeta({ pantryItem }: { pantryItem: PantryItemDetail }) {
  const meta = [
    pantryItem.category,
    formatQuantity(pantryItem.quantity, pantryItem.unit, ''),
  ].filter(Boolean);

  if (meta.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {meta.map((item) => (
        <Badge key={item} variant="primary">
          {item}
        </Badge>
      ))}
    </div>
  );
}

function DetailItem({
  children,
  label,
  wide = false,
}: {
  children: string;
  label: string;
  wide?: boolean;
}) {
  return (
    <div className={clsx(wide && 'sm:col-span-2')}>
      <dt className="font-medium text-muted text-sm">{label}</dt>
      <dd className="mt-1 font-semibold text-lg">{children}</dd>
    </div>
  );
}
