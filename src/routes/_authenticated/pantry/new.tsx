import { createFileRoute } from '@tanstack/react-router';

import { PageHeader } from '#/components/layout/page-header';
import { PantryForm } from '#/features/pantry/components/pantry-form';
import { createPantryItem } from '#/features/pantry/pantry.functions';

export const Route = createFileRoute('/_authenticated/pantry/new')({
  component: NewPantryItemPage,
});

function NewPantryItemPage() {
  const navigate = Route.useNavigate();

  return (
    <div className="space-y-8">
      <PageHeader
        description="Add an ingredient you already have at home."
        eyebrow="Pantry mode"
        title="New Pantry Item"
      />

      <PantryForm
        cancelTo="/pantry"
        onSubmit={async (values) => {
          const pantryItem = await createPantryItem({ data: values });
          await navigate({
            params: { pantryItemId: pantryItem.id },
            to: '/pantry/$pantryItemId',
          });
        }}
      />
    </div>
  );
}
