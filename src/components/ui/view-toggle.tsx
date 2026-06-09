import clsx from 'clsx';
import { LayoutGrid, Table } from 'lucide-react';

export type ViewMode = 'cards' | 'table';

type ViewToggleProps = {
  onChange: (value: ViewMode) => void;
  value: ViewMode;
};

const options = [
  { icon: LayoutGrid, label: 'Cards', value: 'cards' },
  { icon: Table, label: 'Table', value: 'table' },
] as const;

export function ViewToggle({ onChange, value }: ViewToggleProps) {
  return (
    <div className="hidden h-12 overflow-hidden rounded-full border border-border bg-paper shadow-sm md:inline-flex">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = option.value === value;

        return (
          <button
            aria-pressed={isActive}
            className={clsx(
              'inline-flex h-full items-center gap-1.5 border-border px-4 font-medium text-sm transition first:rounded-l-full last:rounded-r-full [&+button]:border-l',
              isActive
                ? 'bg-primary-soft text-primary-soft-foreground'
                : 'text-muted hover:bg-primary-soft/60 hover:text-primary-hover',
            )}
            key={option.value}
            onClick={() => onChange(option.value)}
            type="button"
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
