import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { PageHeader } from '../../../components/layout/page-header';
import { Button, LinkButton } from '../../../components/ui/button';
import { FormError } from '../../../components/ui/form-error';
import { Panel } from '../../../components/ui/panel';
import { RecipeForm } from '../../../features/recipes/components/recipe-form';
import {
  createRecipe,
  importRecipe,
} from '../../../features/recipes/recipes.functions';
import type { RecipeFormValues } from '../../../features/recipes/recipes.schema';
import { getAuthErrorMessage } from '../../../lib/auth/errors';

export const Route = createFileRoute('/_authenticated/recipes/import')({
  component: ImportRecipePage,
});

function ImportRecipePage() {
  const navigate = Route.useNavigate();
  const [draftRecipe, setDraftRecipe] = useState<RecipeFormValues | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importVersion, setImportVersion] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [url, setUrl] = useState('');

  async function handleImport(
    event: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    event.preventDefault();
    setError(null);
    setIsImporting(true);

    try {
      const importedRecipe = await importRecipe({ data: { url } });
      setDraftRecipe(importedRecipe);
      setImportVersion((current) => current + 1);
    } catch (importError) {
      setError(
        getAuthErrorMessage(
          importError,
          'Unable to import this recipe. Try another URL or create it manually.',
        ),
      );
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        description="Paste a recipe URL, review the imported details, then save it to your recipe collection."
        eyebrow="Recipe import"
        title="Import Recipe"
      />

      <Panel>
        <form className="space-y-5" onSubmit={handleImport}>
          <label className="block space-y-2">
            <span className="font-medium text-foreground text-sm">
              Recipe URL
            </span>
            <input
              className="w-full rounded-xl border border-border bg-paper px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-soft"
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://example.com/recipe"
              required
              type="url"
              value={url}
            />
          </label>

          {error ? <FormError>{error}</FormError> : null}

          <div className="flex flex-wrap gap-3">
            <Button disabled={isImporting} type="submit">
              {isImporting ? 'Importing...' : 'Import recipe'}
            </Button>
            <LinkButton to="/recipes/new" variant="secondary">
              Create manually
            </LinkButton>
          </div>
        </form>
      </Panel>

      {draftRecipe ? (
        <div className="space-y-4">
          <div>
            <h2 className="font-semibold text-2xl">Review imported recipe</h2>
            <p className="mt-2 text-muted">
              Imported ingredients keep the original text. Edit anything that
              looks off before saving.
            </p>
          </div>
          <RecipeForm
            cancelTo="/recipes"
            defaultValues={draftRecipe}
            key={importVersion}
            onSubmit={async (values) => {
              const recipe = await createRecipe({ data: values });
              await navigate({
                params: { recipeId: recipe.id },
                to: '/recipes/$recipeId',
              });
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
