// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PantryForm } from '../../../../../src/features/pantry/components/pantry-form';
import type { PantryFormValues } from '../../../../../src/features/pantry/pantry.schema';

vi.mock(
  '@tanstack/react-router',
  async () => import('../../../helpers/mock-router'),
);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('PantryForm', () => {
  it('renders empty default fields', () => {
    renderPantryForm({ onSubmit: vi.fn() });

    expect(screen.getByLabelText('Name')).toHaveProperty('value', '');
    expect(screen.getByLabelText('Quantity')).toHaveProperty('value', '');
    expect(screen.getByLabelText('Unit')).toHaveProperty('value', '');
    expect(screen.getByLabelText('Category')).toHaveProperty('value', '');
    expect(screen.getByLabelText('Notes')).toHaveProperty('value', '');
  });

  it('renders provided default values for editing', () => {
    renderPantryForm({
      defaultValues: defaultPantryValues(),
      onSubmit: vi.fn(),
    });

    expect(screen.getByLabelText('Name')).toHaveProperty('value', 'Tomatoes');
    expect(screen.getByLabelText('Quantity')).toHaveProperty('value', '2');
    expect(screen.getByLabelText('Unit')).toHaveProperty('value', 'cans');
    expect(screen.getByLabelText('Category')).toHaveProperty(
      'value',
      'Produce',
    );
    expect(screen.getByLabelText('Notes')).toHaveProperty(
      'value',
      'Use for soup.',
    );
  });

  it('submits current form values', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    renderPantryForm({ onSubmit });

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Tomatoes' },
    });
    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: '2' },
    });
    fireEvent.change(screen.getByLabelText('Unit'), {
      target: { value: 'cans' },
    });
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: 'Produce' },
    });
    fireEvent.change(screen.getByLabelText('Notes'), {
      target: { value: 'Use for soup.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(defaultPantryValues());
    });
  });

  it('renders submit errors', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Unable to save.'));

    renderPantryForm({ defaultValues: defaultPantryValues(), onSubmit });

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Unable to save.')).toBeTruthy();
  });
});

function renderPantryForm({
  defaultValues,
  onSubmit,
}: {
  defaultValues?: PantryFormValues;
  onSubmit: (values: PantryFormValues) => Promise<void>;
}) {
  return render(
    <PantryForm
      cancelTo="/pantry"
      defaultValues={defaultValues}
      onSubmit={onSubmit}
    />,
  );
}

function defaultPantryValues(): PantryFormValues {
  return {
    category: 'Produce',
    name: 'Tomatoes',
    notes: 'Use for soup.',
    quantity: '2',
    unit: 'cans',
  };
}
