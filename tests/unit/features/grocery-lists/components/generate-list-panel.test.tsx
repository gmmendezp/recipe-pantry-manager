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
import { generateGroceryList } from '../../../../../src/features/grocery-lists/grocery-lists.functions';
import type { RecipeListItem } from '../../../../../src/features/recipes/recipes.schema';

vi.mock(
  '../../../../../src/features/grocery-lists/grocery-lists.functions',
  () => ({
    generateGroceryList: vi.fn(),
  }),
);

const mockGenerateGroceryList = vi.mocked(generateGroceryList);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('GenerateListPanel', () => {
  it('renders recipe choices and matching counts', () => {
    render(
      <GenerateListPanel onGenerated={vi.fn()} recipes={createRecipes()} />,
    );

    expect(screen.getByText('Generate a list')).toBeTruthy();
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
      name: 'Generate grocery list',
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

  it('generates a grocery list from selected recipes', async () => {
    const onGenerated = vi.fn();
    mockGenerateGroceryList.mockResolvedValueOnce({
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
    fireEvent.click(
      screen.getByRole('button', { name: 'Generate grocery list' }),
    );

    await waitFor(() => {
      expect(mockGenerateGroceryList).toHaveBeenCalledWith({
        data: {
          recipeIds: ['recipe-1', 'recipe-2'],
          title: 'Weekend Shopping',
        },
      });
      expect(onGenerated).toHaveBeenCalledWith('list-1');
    });
  });

  it('renders an error when grocery list generation fails', async () => {
    mockGenerateGroceryList.mockRejectedValueOnce(new Error('Unable to save.'));

    render(
      <GenerateListPanel onGenerated={vi.fn()} recipes={createRecipes()} />,
    );

    fireEvent.click(screen.getByLabelText(/Tomato Soup/));
    fireEvent.click(
      screen.getByRole('button', { name: 'Generate grocery list' }),
    );

    expect(await screen.findByText('Unable to save.')).toBeTruthy();
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
