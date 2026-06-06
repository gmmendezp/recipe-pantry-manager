// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GroceryListSection } from '../../../../../src/features/grocery-lists/components/grocery-list-section';
import type { GroceryListItem } from '../../../../../src/features/grocery-lists/grocery-lists.schema';

afterEach(() => {
  cleanup();
});

describe('GroceryListSection', () => {
  it('renders the section title and empty state', () => {
    render(
      <GroceryListSection
        emptyText="Nothing to buy."
        items={[]}
        onToggle={vi.fn()}
        pendingItemId={null}
        title="Need to Buy"
      />,
    );

    expect(screen.getByText('Need to Buy')).toBeTruthy();
    expect(screen.getByText('Nothing to buy.')).toBeTruthy();
  });

  it('renders item details for shopping list items', () => {
    render(
      <GroceryListSection
        emptyText="Nothing to buy."
        items={[
          createGroceryListItem({
            category: 'Produce',
            name: 'Tomato',
            quantity: '2',
            unit: 'cups',
          }),
        ]}
        onToggle={vi.fn()}
        pendingItemId={null}
        title="Need to Buy"
      />,
    );

    expect(screen.getByText('Tomato')).toBeTruthy();
    expect(screen.getByText('2 · cups · Produce')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Check off' })).toBeTruthy();
  });

  it('renders pantry match details', () => {
    render(
      <GroceryListSection
        emptyText="No pantry matches."
        items={[
          createGroceryListItem({
            name: 'Tomato',
            pantryMatch: true,
            pantryQuantity: '1',
            pantryUnit: 'can',
            quantity: '2',
            unit: 'cups',
          }),
        ]}
        onToggle={vi.fn()}
        pendingItemId={null}
        title="Already in Pantry"
      />,
    );

    expect(screen.getByText('Needed: 2 cups')).toBeTruthy();
    expect(screen.getByText('In pantry: 1 can')).toBeTruthy();
  });

  it('renders the unchecked action for checked items', () => {
    render(
      <GroceryListSection
        emptyText="No checked items."
        items={[createGroceryListItem({ isChecked: true })]}
        onToggle={vi.fn()}
        pendingItemId={null}
        title="Checked Off"
      />,
    );

    expect(screen.getByRole('button', { name: 'Uncheck' })).toBeTruthy();
  });

  it('disables the pending item action', () => {
    render(
      <GroceryListSection
        emptyText="Nothing to buy."
        items={[createGroceryListItem({ id: 'item-1' })]}
        onToggle={vi.fn()}
        pendingItemId="item-1"
        title="Need to Buy"
      />,
    );

    const button = screen.getByRole('button', { name: 'Updating...' });

    expect(button).toHaveProperty('disabled', true);
  });

  it('calls onToggle with the item ID when checking off an item', () => {
    const onToggle = vi.fn();

    render(
      <GroceryListSection
        emptyText="Nothing to buy."
        items={[createGroceryListItem({ id: 'item-1' })]}
        onToggle={onToggle}
        pendingItemId={null}
        title="Need to Buy"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Check off' }));

    expect(onToggle).toHaveBeenCalledWith('item-1');
  });
});

function createGroceryListItem(
  overrides: Partial<GroceryListItem> = {},
): GroceryListItem {
  return {
    category: null,
    createdAt: '2026-06-06T00:00:00.000Z',
    groceryListId: 'list-1',
    id: 'item-1',
    isChecked: false,
    name: 'Tomato',
    pantryMatch: false,
    pantryQuantity: null,
    pantryUnit: null,
    quantity: null,
    sourceRecipeIds: ['recipe-1'],
    unit: null,
    ...overrides,
  };
}
