// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { GenerateListPanel } from '../../../../../src/features/grocery-lists/components/generate-list-panel';
import {
  generateReviewedGroceryList,
  previewGroceryListMatches,
} from '../../../../../src/features/grocery-lists/grocery-lists.functions';
import type { RecipeListItem } from '../../../../../src/features/recipes/recipes.schema';

vi.mock(
  '../../../../../src/features/grocery-lists/grocery-lists.functions',
  () => ({
    generateReviewedGroceryList: vi.fn(),
    previewGroceryListMatches: vi.fn(),
  }),
);

const mockGenerateReviewedGroceryList = vi.mocked(generateReviewedGroceryList);
const mockPreviewGroceryListMatches = vi.mocked(previewGroceryListMatches);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('GenerateListPanel', () => {
  it('renders recipe choices and matching counts', () => {
    render(
      <GenerateListPanel onGenerated={vi.fn()} recipes={createRecipes()} />,
    );

    expect(screen.getByText('Choose recipes')).toBeTruthy();
    expect(screen.getByText('0 recipes selected')).toBeTruthy();
    expect(screen.getByText('3 matching recipes')).toBeTruthy();
    expect(screen.getByLabelText(/Tomato Soup/)).toBeTruthy();
    expect(screen.getByLabelText(/Pancakes/)).toBeTruthy();
    expect(screen.getByLabelText(/Slow Chili/)).toBeTruthy();
  });

  it('updates the selected recipe count when recipes are toggled', () => {
    render(
      <GenerateListPanel onGenerated={vi.fn()} recipes={createRecipes()} />,
    );

    fireEvent.click(screen.getByLabelText(/Tomato Soup/));
    expect(screen.getByText('1 recipe selected')).toBeTruthy();

    fireEvent.click(screen.getByLabelText(/Pancakes/));
    expect(screen.getByText('2 recipes selected')).toBeTruthy();

    fireEvent.click(screen.getByLabelText(/Tomato Soup/));
    expect(screen.getByText('1 recipe selected')).toBeTruthy();
  });

  it('requires at least one selected recipe before submission', () => {
    render(
      <GenerateListPanel onGenerated={vi.fn()} recipes={createRecipes()} />,
    );

    const button = screen.getByRole('button', {
      name: 'Review matches',
    });

    expect(button).toHaveProperty('disabled', true);

    fireEvent.click(screen.getByLabelText(/Tomato Soup/));
    expect(button).toHaveProperty('disabled', false);

    fireEvent.click(screen.getByLabelText(/Tomato Soup/));
    expect(button).toHaveProperty('disabled', true);
  });

  it('filters recipes by search query', () => {
    render(
      <GenerateListPanel onGenerated={vi.fn()} recipes={createRecipes()} />,
    );

    fireEvent.change(screen.getByLabelText('Search recipes'), {
      target: { value: 'breakfast' },
    });

    expect(screen.getByText('1 matching recipe')).toBeTruthy();
    expect(screen.getByLabelText(/Pancakes/)).toBeTruthy();
    expect(screen.queryByLabelText(/Tomato Soup/)).toBeNull();
  });

  it('filters recipes by time', () => {
    render(
      <GenerateListPanel onGenerated={vi.fn()} recipes={createRecipes()} />,
    );

    fireEvent.change(screen.getByLabelText('Time'), {
      target: { value: '60-plus' },
    });

    expect(screen.getByText('1 matching recipe')).toBeTruthy();
    expect(screen.getByLabelText(/Slow Chili/)).toBeTruthy();
    expect(screen.queryByLabelText(/Tomato Soup/)).toBeNull();
  });

  it('renders an empty state when filters exclude every recipe', () => {
    render(
      <GenerateListPanel onGenerated={vi.fn()} recipes={createRecipes()} />,
    );

    fireEvent.change(screen.getByLabelText('Search recipes'), {
      target: { value: 'not a recipe' },
    });

    expect(screen.getByText('No recipes match your filters')).toBeTruthy();
  });

  it('reviews matches and creates a grocery list from selected recipes', async () => {
    const onGenerated = vi.fn();
    mockPreviewGroceryListMatches.mockResolvedValueOnce({
      items: [
        {
          category: null,
          matchedPantryItemId: 'pantry-1',
          name: 'minced fresh basil',
          quantity: '3',
          reviewId: 'review-1',
          sourceRecipeIds: ['recipe-1'],
          unit: 'tbsp',
        },
        {
          category: null,
          matchedPantryItemId: null,
          name: 'flour',
          quantity: '2',
          reviewId: 'review-2',
          sourceRecipeIds: ['recipe-2'],
          unit: 'cups',
        },
      ],
      pantryOptions: [
        { id: 'pantry-1', name: 'fresh basil', quantity: '1', unit: 'bunch' },
        {
          id: 'pantry-2',
          name: 'all-purpose flour',
          quantity: '5',
          unit: 'lb',
        },
      ],
    });
    mockGenerateReviewedGroceryList.mockResolvedValueOnce({
      createdAt: '2026-06-06T00:00:00.000Z',
      id: 'list-1',
      itemCount: 3,
      title: 'Weekend Shopping',
      updatedAt: '2026-06-06T00:00:00.000Z',
    });

    render(
      <GenerateListPanel onGenerated={onGenerated} recipes={createRecipes()} />,
    );

    fireEvent.change(screen.getByLabelText('List title'), {
      target: { value: 'Weekend Shopping' },
    });
    fireEvent.click(screen.getByLabelText(/Tomato Soup/));
    fireEvent.click(screen.getByLabelText(/Pancakes/));
    fireEvent.click(screen.getByRole('button', { name: 'Review matches' }));

    await waitFor(() => {
      expect(mockPreviewGroceryListMatches).toHaveBeenCalledWith({
        data: {
          recipeIds: ['recipe-1', 'recipe-2'],
          title: 'Weekend Shopping',
        },
      });
    });

    expect(await screen.findByText('Review pantry matches')).toBeTruthy();
    expect(screen.getByText('minced fresh basil')).toBeTruthy();

    const pantryMatchSelects = screen.getAllByLabelText('Pantry match');
    const flourPantryMatchSelect = pantryMatchSelects[1];

    expect(flourPantryMatchSelect).toBeTruthy();

    fireEvent.change(flourPantryMatchSelect, {
      target: { value: 'pantry-2' },
    });
    fireEvent.click(
      screen.getByRole('button', { name: 'Create grocery list' }),
    );

    await waitFor(() => {
      expect(mockGenerateReviewedGroceryList).toHaveBeenCalledWith({
        data: {
          items: [
            {
              category: null,
              name: 'minced fresh basil',
              pantryItemId: 'pantry-1',
              quantity: '3',
              sourceRecipeIds: ['recipe-1'],
              unit: 'tbsp',
            },
            {
              category: null,
              name: 'flour',
              pantryItemId: 'pantry-2',
              quantity: '2',
              sourceRecipeIds: ['recipe-2'],
              unit: 'cups',
            },
          ],
          title: 'Weekend Shopping',
        },
      });
      expect(onGenerated).toHaveBeenCalledWith('list-1');
    });
  });

  it('renders an error when grocery list review fails', async () => {
    mockPreviewGroceryListMatches.mockRejectedValueOnce(
      new Error('Unable to review.'),
    );

    render(
      <GenerateListPanel onGenerated={vi.fn()} recipes={createRecipes()} />,
    );

    fireEvent.click(screen.getByLabelText(/Tomato Soup/));
    fireEvent.click(screen.getByRole('button', { name: 'Review matches' }));

    expect(await screen.findByText('Unable to review.')).toBeTruthy();
  });
});

function createRecipes(): RecipeListItem[] {
  return [
    createRecipe({
      description: 'Dinner soup',
      id: 'recipe-1',
      title: 'Tomato Soup',
      totalTime: 30,
    }),
    createRecipe({
      description: 'Breakfast stack',
      id: 'recipe-2',
      title: 'Pancakes',
      totalTime: 25,
    }),
    createRecipe({
      description: 'Dinner simmer',
      id: 'recipe-3',
      title: 'Slow Chili',
      totalTime: 90,
    }),
  ];
}

function createRecipe(overrides: Partial<RecipeListItem>): RecipeListItem {
  return {
    cookTime: null,
    createdAt: '2026-06-06T00:00:00.000Z',
    description: null,
    id: 'recipe-1',
    imageUrl: null,
    prepTime: null,
    servings: null,
    sourceUrl: null,
    title: 'Recipe',
    totalTime: null,
    updatedAt: '2026-06-06T00:00:00.000Z',
    ...overrides,
  };
}
