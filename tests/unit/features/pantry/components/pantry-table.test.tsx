// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PantryTable } from '#/features/pantry/components/pantry-table';
import type { PantryListItem } from '#/features/pantry/pantry.schema';

vi.mock(
  '@tanstack/react-router',
  async () => import('../../../helpers/mock-router'),
);

afterEach(() => {
  cleanup();
});

describe('PantryTable', () => {
  it('renders table headers', () => {
    render(<PantryTable pantryItems={[]} />);

    expect(screen.getByRole('columnheader', { name: 'Item' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Quantity' })).toBeTruthy();
    expect(screen.getByRole('columnheader', { name: 'Category' })).toBeTruthy();
  });

  it('renders pantry item details', () => {
    render(
      <PantryTable
        pantryItems={[
          createPantryItem({
            category: 'Produce',
            name: 'Tomatoes',
            notes: 'Use for soup.',
            quantity: '2',
            unit: 'cans',
          }),
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: 'Tomatoes' })).toBeTruthy();
    expect(screen.getByText('2 cans')).toBeTruthy();
    expect(screen.getByText('Produce')).toBeTruthy();
    expect(screen.getByText('Use for soup.')).toBeTruthy();
  });

  it('renders fallback values for missing quantity and category', () => {
    render(<PantryTable pantryItems={[createPantryItem()]} />);

    expect(screen.getAllByText('-')).toHaveLength(2);
  });

  it('renders item and edit links for each pantry item', () => {
    render(
      <PantryTable pantryItems={[createPantryItem({ id: 'pantry-item-1' })]} />,
    );

    expect(
      screen.getByRole('link', { name: 'Tomatoes' }).getAttribute('href'),
    ).toBe('/pantry/pantry-item-1');
    expect(
      screen.getByRole('link', { name: 'Edit Tomatoes' }).getAttribute('href'),
    ).toBe('/pantry/pantry-item-1/edit');
  });
});

function createPantryItem(
  overrides: Partial<PantryListItem> = {},
): PantryListItem {
  return {
    category: null,
    createdAt: '2026-06-06T00:00:00.000Z',
    id: 'pantry-item-1',
    name: 'Tomatoes',
    notes: null,
    quantity: null,
    unit: null,
    updatedAt: '2026-06-06T00:00:00.000Z',
    ...overrides,
  };
}
