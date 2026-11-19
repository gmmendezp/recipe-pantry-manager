import { describe, expect, it } from 'vitest';

import { importedDemoRecipes } from '#/features/demo/demo-recipes.server';
import recipeSnapshots from '#/features/demo/demo-recipes.snapshot.json';
import { recipeInputSchema } from '#/features/recipes/recipes.schema';

describe('importedDemoRecipes', () => {
  it('contains valid recipe snapshots', () => {
    expect(recipeInputSchema.array().safeParse(recipeSnapshots).success).toBe(
      true,
    );
    expect(importedDemoRecipes).toHaveLength(2);
  });

  it('preserves recipe sources and required content', () => {
    for (const recipe of importedDemoRecipes) {
      expect(new URL(recipe.sourceUrl ?? 'invalid:').protocol).toBe('https:');
      expect(recipe.ingredients.length).toBeGreaterThan(0);
      expect(recipe.steps.length).toBeGreaterThan(0);
    }
  });

  it('does not retain temporary form identifiers', () => {
    expect(JSON.stringify(recipeSnapshots)).not.toContain('clientId');
  });
});
