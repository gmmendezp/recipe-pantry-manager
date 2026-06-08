// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  MatchReviewPanel,
  type ReviewedItem,
} from '../../../../../src/features/grocery-lists/components/match-review-panel';
import type {
  GroceryListReviewItem,
  PantryMatchOption,
} from '../../../../../src/features/grocery-lists/grocery-lists.schema';

afterEach(() => {
  cleanup();
});

describe('MatchReviewPanel', () => {
  it('submits reviewed items with pantry changes', async () => {
    const onSubmit = vi.fn();

    renderMatchReviewPanel({ onSubmit });

    const pantryMatchSelect = screen.getAllByLabelText('Pantry match')[1];

    expect(pantryMatchSelect).toBeTruthy();

    fireEvent.change(pantryMatchSelect, {
      target: { value: 'pantry-2' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Create grocery list' }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith([
        expect.objectContaining({
          name: 'minced fresh basil',
          pantryItemId: 'pantry-1',
        }),
        expect.objectContaining({
          name: 'flour',
          pantryItemId: 'pantry-2',
        }),
      ] satisfies Partial<ReviewedItem>[]);
    });
  });

  it('removes a reviewed item before submitting', async () => {
    const onSubmit = vi.fn();

    renderMatchReviewPanel({ onSubmit });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Remove minced fresh basil from grocery list',
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Create grocery list' }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith([
        expect.objectContaining({ name: 'flour' }),
      ]);
    });
  });

  it('disables submission when all reviewed items are removed', () => {
    renderMatchReviewPanel({
      initialItems: [createReviewItem({ name: 'Salt to taste' })],
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: 'Remove Salt to taste from grocery list',
      }),
    );

    expect(screen.getByText('No ingredients selected')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'Create grocery list' }),
    ).toHaveProperty('disabled', true);
  });

  it('omits the needed label when a review item has no amount', () => {
    renderMatchReviewPanel({
      initialItems: [createReviewItem({ name: 'Salt to taste' })],
    });

    expect(screen.getByText('Salt to taste')).toBeTruthy();
    expect(screen.queryByText(/Needed:/)).toBeNull();
  });

  it('calls the back handler', () => {
    const onBack = vi.fn();

    renderMatchReviewPanel({ onBack });

    fireEvent.click(screen.getByRole('button', { name: 'Back to recipes' }));

    expect(onBack).toHaveBeenCalledOnce();
  });
});

function renderMatchReviewPanel({
  initialItems = [
    createReviewItem({
      matchedPantryItemId: 'pantry-1',
      name: 'minced fresh basil',
      quantity: '3',
      reviewId: 'review-1',
      unit: 'tbsp',
    }),
    createReviewItem({
      name: 'flour',
      quantity: '2',
      reviewId: 'review-2',
      sourceRecipeIds: ['recipe-2'],
      unit: 'cups',
    }),
  ],
  isSubmitting = false,
  onBack = vi.fn(),
  onSubmit = vi.fn(),
  pantryOptions = [
    { id: 'pantry-1', name: 'fresh basil', quantity: '1', unit: 'bunch' },
    { id: 'pantry-2', name: 'all-purpose flour', quantity: '5', unit: 'lb' },
  ],
}: {
  initialItems?: GroceryListReviewItem[];
  isSubmitting?: boolean;
  onBack?: () => void;
  onSubmit?: (items: ReviewedItem[]) => Promise<void> | void;
  pantryOptions?: PantryMatchOption[];
} = {}) {
  return render(
    <MatchReviewPanel
      backLabel="Back to recipes"
      description="Review matches before creating the grocery list."
      error={null}
      initialItems={initialItems}
      isSubmitting={isSubmitting}
      onBack={onBack}
      onSubmit={onSubmit}
      pantryOptions={pantryOptions}
      pendingLabel="Creating..."
      stepLabel="Step 2 of 2"
      submitLabel="Create grocery list"
      title="Review pantry matches"
    />,
  );
}

function createReviewItem(
  overrides: Partial<GroceryListReviewItem> = {},
): GroceryListReviewItem {
  return {
    category: null,
    matchedPantryItemId: null,
    name: 'Ingredient',
    quantity: null,
    reviewId: 'review-1',
    sourceRecipeIds: ['recipe-1'],
    unit: null,
    ...overrides,
  };
}
