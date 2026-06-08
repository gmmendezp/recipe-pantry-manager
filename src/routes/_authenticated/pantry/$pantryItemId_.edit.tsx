import { createFileRoute } from '@tanstack/react-router';
import { ArrowLeft } from 'lucide-react';

import { PageHeader } from '#/components/layout/page-header';
import { LinkButton } from '#/components/ui/button';
import { MissingPantryItem } from '#/features/pantry/components/missing-pantry-item';
import { PantryForm } from '#/features/pantry/components/pantry-form';
import {
  getPantryItem,
  updatePantryItem,
} from '#/features/pantry/pantry.functions';
import {
  pantryItemIdSchema,
  pantryItemToFormValues,
} from '#/features/pantry/pantry.schema';

export const Route = createFileRoute(
  '/_authenticated/pantry/$pantryItemId_/edit',
)({
  component: EditPantryItemPage,
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

function EditPantryItemPage() {
  const navigate = Route.useNavigate();
  const { pantryItem } = Route.useLoaderData();

  if (!pantryItem) return <MissingPantryItem />;

  return (
    <div className="space-y-8">
      <LinkButton
        params={{ pantryItemId: pantryItem.id }}
        to="/pantry/$pantryItemId"
        variant="secondary"
      >
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Back to pantry item
      </LinkButton>

      <PageHeader
        description="Update this pantry item."
        eyebrow="Pantry mode"
        title="Edit Pantry Item"
      />

      <PantryForm
        cancelParams={{ pantryItemId: pantryItem.id }}
        cancelTo="/pantry/$pantryItemId"
        defaultValues={pantryItemToFormValues(pantryItem)}
        onSubmit={async (values) => {
          await updatePantryItem({
            data: { ...values, pantryItemId: pantryItem.id },
          });
          await navigate({
            params: { pantryItemId: pantryItem.id },
            to: '/pantry/$pantryItemId',
          });
        }}
      />
    </div>
  );
}
