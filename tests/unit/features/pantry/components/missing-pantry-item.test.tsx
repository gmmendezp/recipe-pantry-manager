// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MissingPantryItem } from '#/features/pantry/components/missing-pantry-item';

vi.mock(
  '@tanstack/react-router',
  async () => import('../../../helpers/mock-router'),
);

afterEach(() => {
  cleanup();
});

describe('MissingPantryItem', () => {
  it('renders the missing pantry item message and back link', () => {
    render(<MissingPantryItem />);

    expect(
      screen.getByRole('heading', { name: 'Pantry item not found' }),
    ).toBeTruthy();
    expect(
      screen.getByText(
        'This pantry item does not exist or you do not have access to it.',
      ),
    ).toBeTruthy();
    expect(
      screen.getByRole('link', { name: 'Back to pantry' }).getAttribute('href'),
    ).toBe('/pantry');
  });
});
