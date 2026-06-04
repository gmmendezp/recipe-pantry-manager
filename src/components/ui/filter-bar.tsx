import type { ReactNode } from 'react';

type FilterBarProps = {
  children?: ReactNode;
  onSearchChange: (value: string) => void;
  searchLabel: string;
  searchPlaceholder: string;
  searchValue: string;
};

type FilterSelectProps<T extends string> = {
  label: string;
  onChange: (value: T) => void;
  options: Array<{
    label: string;
    value: T;
  }>;
  value: T;
};

export function FilterBar({
  children,
  onSearchChange,
  searchLabel,
  searchPlaceholder,
  searchValue,
}: FilterBarProps) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl border border-border bg-paper p-4 shadow-sm sm:flex-row sm:items-end sm:justify-between">
      <label className="block flex-1 space-y-2">
        <span className="font-medium text-foreground text-sm">
          {searchLabel}
        </span>
        <input
          className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-soft"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          type="search"
          value={searchValue}
        />
      </label>
      {children ? (
        <div className="flex flex-col gap-3 sm:flex-row">{children}</div>
      ) : null}
    </section>
  );
}

export function FilterSelect<T extends string>({
  label,
  onChange,
  options,
  value,
}: FilterSelectProps<T>) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary-soft sm:min-w-40">
      <span className="shrink-0 font-medium text-muted text-sm">{label}</span>
      <select
        className="min-w-0 flex-1 bg-transparent text-foreground text-sm outline-none"
        onChange={(event) => onChange(event.target.value as T)}
        value={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
