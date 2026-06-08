// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MissingRecipe } from '#/features/recipes/components/missing-recipe';

vi.mock(
  '@tanstack/react-router',
  async () => import('../../../helpers/mock-router'),
);

afterEach(() => {
  cleanup();
});

describe('MissingRecipe', () => {
  it('renders the missing recipe message and back link', () => {
    render(<MissingRecipe />);

    expect(
      screen.getByRole('heading', { name: 'Recipe not found' }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'This recipe may have been deleted or belongs to another account.',
      ),
    ).toBeTruthy();
    expect(
      screen
        .getByRole('link', { name: 'Back to recipes' })
        .getAttribute('href'),
    ).toBe('/recipes');
  });
});
