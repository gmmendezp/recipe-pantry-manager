// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RecipeTable } from '#/features/recipes/components/recipe-table';
import type { RecipeListItem } from '#/features/recipes/recipes.schema';

vi.mock(
  '@tanstack/react-router',
  async () => import('../../../helpers/mock-router'),
);

afterEach(() => {
  cleanup();
});

describe('RecipeTable', () => {
  it('renders table headers', () => {
    render(<RecipeTable recipes={[]} />);

    expect(screen.getByRole('columnheader', { name: 'Recipe' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Time' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Servings' })).toBeTruthy();
  });

  it('renders recipe details with total time', () => {
    render(
      <RecipeTable
        recipes={[
          createRecipe({
            description: 'A simple dinner.',
            servings: 4,
            title: 'Tomato Soup',
            totalTime: 45,
          }),
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Tomato Soup' })).toBeTruthy();
    expect(screen.getByText('A simple dinner.')).toBeTruthy();
    expect(screen.getByText('45 min total')).toBeTruthy();
    expect(screen.getByText('4')).toBeTruthy();
  });

  it('renders prep and cook time when total time is missing', () => {
    render(
      <RecipeTable
        recipes={[
          createRecipe({ cookTime: 20, prepTime: 10, totalTime: null }),
        ]}
      />,
    );

    expect(screen.getByText('Prep 10 min · Cook 20 min')).toBeTruthy();
  });

  it('renders fallback values for missing time and servings', () => {
    render(<RecipeTable recipes={[createRecipe({ servings: null })]} />);

    expect(screen.getAllByText('-')).toHaveLength(2);
  });

  it('renders detail and edit links for each recipe', () => {
    render(<RecipeTable recipes={[createRecipe({ id: 'recipe-1' })]} />);

    expect(
      screen.getByRole('link', { name: 'Tomato Soup' }).getAttribute('href'),
    ).toBe('/recipes/recipe-1');
    expect(
      screen
        .getByRole('link', { name: 'Edit Tomato Soup' })
        .getAttribute('href'),
    ).toBe('/recipes/recipe-1/edit');
  });
});

function createRecipe(overrides: Partial<RecipeListItem> = {}): RecipeListItem {
  return {
    cookTime: null,
    createdAt: '2026-06-06T00:00:00.000Z',
    description: null,
    id: 'recipe-1',
    imageUrl: null,
    prepTime: null,
    servings: null,
    sourceUrl: null,
    title: 'Tomato Soup',
    totalTime: null,
    updatedAt: '2026-06-06T00:00:00.000Z',
    ...overrides,
  };
}
