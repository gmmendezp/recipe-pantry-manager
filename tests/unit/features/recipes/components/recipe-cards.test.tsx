// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { RecipeCards } from '../../../../../src/features/recipes/components/recipe-cards';
import type { RecipeListItem } from '../../../../../src/features/recipes/recipes.schema';

vi.mock(
  '@tanstack/react-router',
  async () => import('../../../helpers/mock-router'),
);

afterEach(() => {
  cleanup();
});

describe('RecipeCards', () => {
  it('renders recipe title, description, and total time badge', () => {
    render(
      <RecipeCards
        recipes={[
          createRecipe({
            description: 'A simple dinner.',
            title: 'Tomato Soup',
            totalTime: 45,
          }),
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Tomato Soup' })).toBeTruthy();
    expect(screen.getByText('A simple dinner.')).toBeTruthy();
    expect(screen.getByText('45 min')).toBeTruthy();
  });

  it('renders prep, cook, and servings metadata', () => {
    render(
      <RecipeCards
        recipes={[createRecipe({ cookTime: 20, prepTime: 10, servings: 4 })]}
      />,
    );

    expect(screen.getByText('Prep 10 min')).toBeTruthy();
    expect(screen.getByText('Cook 20 min')).toBeTruthy();
    expect(screen.getByText('4 servings')).toBeTruthy();
  });

  it('omits optional description and total time badge when missing', () => {
    render(<RecipeCards recipes={[createRecipe()]} />);

    expect(screen.queryByText('A simple dinner.')).toBeNull();
    expect(screen.queryByText(/min$/)).toBeNull();
  });

  it('renders detail and edit links for each recipe', () => {
    render(<RecipeCards recipes={[createRecipe({ id: 'recipe-1' })]} />);

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
