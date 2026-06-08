// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SortableList } from '../../../../src/components/ui/sortable-list';

type DragEndHandler = (event: {
  canceled: boolean;
  operation: {
    source: { index: number; initialIndex: number } | null;
    target: { index: number } | null;
  };
}) => void;

let handleDragEnd: DragEndHandler | null = null;

vi.mock('@dnd-kit/react', () => ({
  DragDropProvider: ({
    children,
    onDragEnd,
  }: {
    children: ReactNode;
    onDragEnd: DragEndHandler;
  }) => {
    handleDragEnd = onDragEnd;

    return <div>{children}</div>;
  },
}));

vi.mock('@dnd-kit/react/sortable', () => ({
  isSortableOperation: () => true,
  useSortable: () => ({
    handleRef: vi.fn(),
    isDragSource: false,
    ref: vi.fn(),
  }),
}));

afterEach(() => {
  cleanup();
  handleDragEnd = null;
  vi.clearAllMocks();
});

describe('SortableList', () => {
  it('renders drag handles and reorders items after a drag ends', () => {
    const onReorder = vi.fn();
    const items = [
      { id: 'first', label: 'First' },
      { id: 'second', label: 'Second' },
      { id: 'third', label: 'Third' },
    ];

    render(
      <SortableList
        getItemId={(item) => item.id}
        items={items}
        onReorder={onReorder}
        renderItem={({ DragHandle, item }) => (
          <div>
            <DragHandle label={`Reorder ${item.label}`} />
            <span>{item.label}</span>
          </div>
        )}
      />,
    );

    expect(screen.getByRole('button', { name: 'Reorder First' })).toBeTruthy();

    handleDragEnd?.({
      canceled: false,
      operation: {
        source: { index: 2, initialIndex: 0 },
        target: { index: 2 },
      },
    });

    expect(onReorder).toHaveBeenCalledWith([items[1], items[2], items[0]]);
  });
});
