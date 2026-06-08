// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SavedLists } from '../../../../../src/features/grocery-lists/components/saved-lists';
import type { GroceryListSummary } from '../../../../../src/features/grocery-lists/grocery-lists.schema';

vi.mock(
  '@tanstack/react-router',
  async () => import('../../../helpers/mock-router'),
);

afterEach(() => {
  cleanup();
});

describe('SavedLists', () => {
  it('renders the new-user empty state and generate action', () => {
    render(
      <SavedLists
        emptyAction={<a href="/grocery-lists/new">Create grocery list</a>}
        groceryLists={[]}
        hasSavedLists={false}
      />,
    );

    expect(screen.getByText('No saved grocery lists yet')).toBeTruthy();
    expect(
      screen.getByText(
        'Generated lists will appear here after you select recipes.',
      ),
    ).toBeTruthy();

    expect(
      screen
        .getByRole('link', { name: 'Create grocery list' })
        .getAttribute('href'),
    ).toBe('/grocery-lists/new');
  });

  it('renders the filtered empty state when saved lists exist', () => {
    render(
      <SavedLists
        emptyAction={<a href="/grocery-lists/new">Create grocery list</a>}
        groceryLists={[]}
        hasSavedLists={true}
      />,
    );

    expect(screen.getByText('No grocery lists match your search')).toBeTruthy();
    expect(screen.getByText('Try a different title.')).toBeTruthy();
  });

  it('renders saved grocery list rows', () => {
    render(
      <SavedLists
        emptyAction={<a href="/grocery-lists/new">Create grocery list</a>}
        groceryLists={[
          createGroceryList({
            itemCount: 1,
            title: 'Weekend Shopping',
            updatedAt: '2026-06-06T12:00:00.000Z',
          }),
          createGroceryList({
            id: 'list-2',
            itemCount: 3,
            title: 'Meal Prep',
            updatedAt: '2026-06-07T12:00:00.000Z',
          }),
        ]}
        hasSavedLists={true}
      />,
    );

    expect(screen.getByRole('columnheader', { name: 'List' })).toBeTruthy();
    expect(screen.getByText('1 item')).toBeTruthy();
    expect(screen.getByText('3 items')).toBeTruthy();
    expect(screen.getByText('Jun 6')).toBeTruthy();
    expect(screen.getByText('Jun 7')).toBeTruthy();
  });

  it('renders detail links for saved grocery lists', () => {
    render(
      <SavedLists
        emptyAction={<a href="/grocery-lists/new">Create grocery list</a>}
        groceryLists={[createGroceryList({ id: 'list-1' })]}
        hasSavedLists={true}
      />,
    );

    expect(
      screen
        .getByRole('link', { name: 'Weekend Shopping' })
        .getAttribute('href'),
    ).toBe('/grocery-lists/list-1');
  });
});

function createGroceryList(
  overrides: Partial<GroceryListSummary> = {},
): GroceryListSummary {
  return {
    createdAt: '2026-06-06T00:00:00.000Z',
    id: 'list-1',
    itemCount: 1,
    title: 'Weekend Shopping',
    updatedAt: '2026-06-06T00:00:00.000Z',
    ...overrides,
  };
}
