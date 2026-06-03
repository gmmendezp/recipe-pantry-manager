import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '../../../components/ui/badge';
import { Button, LinkButton } from '../../../components/ui/button';
import { FormError } from '../../../components/ui/form-error';
import { Panel } from '../../../components/ui/panel';
import { MissingPantryItem } from '../../../features/pantry/components/missing-pantry-item';
import {
  deletePantryItem,
  getPantryItem,
} from '../../../features/pantry/pantry.functions';
import {
  type PantryItemDetail,
  pantryItemIdSchema,
} from '../../../features/pantry/pantry.schema';

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

      <header className="space-y-5 rounded-2xl bg-primary p-8 text-paper">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-medium text-primary-soft text-sm uppercase tracking-[0.25em]">
              Pantry item
            </p>
            <h1 className="mt-3 break-words font-bold text-4xl tracking-tight">
              {pantryItem.name}
            </h1>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
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
          </div>
        </div>
        <PantryItemMeta pantryItem={pantryItem} />
      </header>

      {isConfirmingDelete ? (
        <section className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-900 shadow-sm">
          <h2 className="font-semibold text-xl">Delete this pantry item?</h2>
          <p className="mt-2 text-red-800 text-sm">
            This permanently removes the item from your pantry.
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
              {isDeleting ? 'Deleting...' : 'Delete pantry item'}
            </Button>
          </div>
        </section>
      ) : null}

      {deleteError ? <FormError>{deleteError}</FormError> : null}

      <Panel>
        <h2 className="font-semibold text-2xl">Details</h2>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <DetailItem label="Quantity">
            {[pantryItem.quantity, pantryItem.unit].filter(Boolean).join(' ') ||
              'No quantity specified'}
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
    [pantryItem.quantity, pantryItem.unit].filter(Boolean).join(' ') || null,
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
    <div className={wide ? 'sm:col-span-2' : undefined}>
      <dt className="font-medium text-muted text-sm">{label}</dt>
      <dd className="mt-1 font-semibold text-lg">{children}</dd>
    </div>
  );
}
