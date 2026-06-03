import type { ReactNode } from 'react';

type TableShellProps = {
  children: ReactNode;
};

export const tableHeaderCellClass =
  'px-5 py-3 font-semibold text-muted text-sm';
export const tableCellClass = 'px-5 py-3 align-middle';
export const tableRowClass =
  'border-border border-t transition hover:bg-primary-soft';

export function TableShell({ children }: TableShellProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-paper shadow-sm">
      <table className="w-full text-left">{children}</table>
    </section>
  );
}
