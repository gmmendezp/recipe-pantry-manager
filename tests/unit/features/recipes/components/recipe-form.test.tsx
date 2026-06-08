// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RecipeForm } from '#/features/recipes/components/recipe-form';
import {
  deleteUploadedRecipeImage,
  uploadRecipeImage,
} from '#/features/recipes/images/recipe-image-upload';
import type { RecipeFormValues } from '#/features/recipes/recipes.schema';

vi.mock(
  '@tanstack/react-router',
  async () => import('../../../helpers/mock-router'),
);

vi.mock('#/features/recipes/images/recipe-image-upload', () => ({
  deleteUploadedRecipeImage: vi.fn(),
  uploadRecipeImage: vi.fn(),
}));

const mockUploadRecipeImage = vi.mocked(uploadRecipeImage);
const mockDeleteUploadedRecipeImage = vi.mocked(deleteUploadedRecipeImage);

beforeEach(() => {
  vi.stubGlobal('URL', {
    createObjectURL: vi.fn(() => 'blob:recipe-preview'),
    revokeObjectURL: vi.fn(),
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.unstubAllGlobals();
});

describe('RecipeForm', () => {
  it('submits directly when there is no pending image', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ id: 'recipe-1' });
    const onSuccess = vi.fn().mockResolvedValue(undefined);

    renderRecipeForm({ onSubmit, onSuccess });

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(submittedRecipeValues());
      expect(onSuccess).toHaveBeenCalledWith({ id: 'recipe-1' });
    });
    expect(mockUploadRecipeImage).not.toHaveBeenCalled();
  });

  it('uploads a pending image before submitting recipe values', async () => {
    const file = createImageFile('image/png');
    const onSubmit = vi.fn().mockResolvedValue({ id: 'recipe-1' });
    mockUploadRecipeImage.mockResolvedValueOnce(
      'https://example.com/uploaded.png',
    );

    renderRecipeForm({ onSubmit });

    fireEvent.change(screen.getByLabelText('Upload from device'), {
      target: { files: [file] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(mockUploadRecipeImage).toHaveBeenCalledWith(file);
      expect(onSubmit).toHaveBeenCalledWith({
        ...submittedRecipeValues(),
        imageUrl: 'https://example.com/uploaded.png',
      });
    });
  });

  it('cleans up the uploaded image if recipe submission fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Unable to save.'));
    mockUploadRecipeImage.mockResolvedValueOnce(
      'https://example.com/uploaded.png',
    );

    renderRecipeForm({ onSubmit });

    fireEvent.change(screen.getByLabelText('Upload from device'), {
      target: { files: [createImageFile('image/png')] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Unable to save.')).toBeTruthy();
    expect(mockDeleteUploadedRecipeImage).toHaveBeenCalledWith(
      'https://example.com/uploaded.png',
    );
  });

  it('capitalizes only ingredient names before submitting', async () => {
    const onSubmit = vi.fn().mockResolvedValue({ id: 'recipe-1' });

    renderRecipeForm({ onSubmit });

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        ...defaultRecipeValues(),
        ingredients: [
          {
            category: 'produce',
            clientId: 'ingredient-1',
            name: 'Tomato',
            quantity: '2',
            rawText: '2 cups tomato',
            unit: 'cups',
          },
        ],
      });
    });
  });

  it('validates selected image files before marking them pending', () => {
    renderRecipeForm({ onSubmit: vi.fn() });

    fireEvent.change(screen.getByLabelText('Upload from device'), {
      target: { files: [createImageFile('image/gif')] },
    });

    expect(screen.getByText('Upload a JPG, PNG, or WebP image.')).toBeTruthy();
    expect(screen.getByText('No image selected')).toBeTruthy();
    expect(URL.createObjectURL).not.toHaveBeenCalled();
  });

  it('clears a pending image when removing the image', () => {
    renderRecipeForm({ onSubmit: vi.fn() });

    fireEvent.change(screen.getByLabelText('Upload from device'), {
      target: { files: [createImageFile('image/png')] },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Remove image' }));

    expect(screen.getByText('No image selected')).toBeTruthy();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:recipe-preview');
  });
});

function renderRecipeForm({
  onSubmit,
  onSuccess,
}: {
  onSubmit: (values: RecipeFormValues) => Promise<unknown>;
  onSuccess?: (result: unknown) => Promise<void>;
}) {
  return render(
    <RecipeForm
      cancelTo="/recipes"
      defaultValues={defaultRecipeValues()}
      onSubmit={onSubmit}
      onSuccess={onSuccess}
    />,
  );
}

function defaultRecipeValues(): RecipeFormValues {
  return {
    cookTime: '20',
    description: 'A simple soup.',
    imageUrl: '',
    ingredients: [
      {
        category: 'produce',
        clientId: 'ingredient-1',
        name: 'tomato',
        quantity: '2',
        rawText: '2 cups tomato',
        unit: 'cups',
      },
    ],
    prepTime: '10',
    servings: '4',
    sourceUrl: '',
    steps: [{ clientId: 'step-1', instruction: 'Simmer.' }],
    title: 'Tomato Soup',
  };
}

function submittedRecipeValues(): RecipeFormValues {
  return {
    ...defaultRecipeValues(),
    ingredients: [
      {
        ...defaultRecipeValues().ingredients[0],
        name: 'Tomato',
      },
    ],
  };
}

function createImageFile(type: string) {
  return new File([new Uint8Array(1024)], 'recipe-image', { type });
}
