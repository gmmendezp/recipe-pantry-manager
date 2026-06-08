import { DragDropProvider } from '@dnd-kit/react';
import { isSortableOperation, useSortable } from '@dnd-kit/react/sortable';
import { GripVertical } from 'lucide-react';
import type { ComponentType, ReactNode } from 'react';
import { useId } from 'react';

type DragHandleProps = {
  className?: string;
  label: string;
};

type RenderItemOptions<T> = {
  DragHandle: ComponentType<DragHandleProps>;
  index: number;
  item: T;
};

type SortableListProps<T> = {
  getItemId: (item: T) => string;
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (options: RenderItemOptions<T>) => ReactNode;
};

export function SortableList<T>({
  getItemId,
  items,
  onReorder,
  renderItem,
}: SortableListProps<T>) {
  const groupId = useId();

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled || !isSortableOperation(event.operation)) return;

        const { source, target } = event.operation;

        if (!source || !target || source.initialIndex === source.index) return;

        onReorder(moveArrayItem(items, source.initialIndex, source.index));
      }}
    >
      {items.map((item, index) => (
        <SortableListItem
          getItemId={getItemId}
          groupId={groupId}
          index={index}
          item={item}
          key={getItemId(item)}
          renderItem={renderItem}
        />
      ))}
    </DragDropProvider>
  );
}

type SortableListItemProps<T> = {
  getItemId: (item: T) => string;
  groupId: string;
  index: number;
  item: T;
  renderItem: (options: RenderItemOptions<T>) => ReactNode;
};

function SortableListItem<T>({
  getItemId,
  groupId,
  index,
  item,
  renderItem,
}: SortableListItemProps<T>) {
  const { handleRef, isDragSource, ref } = useSortable({
    group: groupId,
    id: getItemId(item),
    index,
  });

  function DragHandle({ className = '', label }: DragHandleProps) {
    return (
      <div className={`flex items-start ${className}`}>
        <button
          aria-label={label}
          className="inline-flex h-10 w-10 cursor-grab touch-none items-center justify-center rounded-lg text-muted transition hover:bg-primary-soft hover:text-primary active:cursor-grabbing"
          ref={handleRef}
          type="button"
        >
          <GripVertical aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={isDragSource ? 'opacity-60' : undefined} ref={ref}>
      {renderItem({ DragHandle, index, item })}
    </div>
  );
}

function moveArrayItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);

  if (!item) return items;

  next.splice(toIndex, 0, item);
  return next;
}
