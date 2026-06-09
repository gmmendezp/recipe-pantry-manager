import clsx from 'clsx';
import type { ReactNode } from 'react';

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className }: PanelProps) {
  return (
    <section
      className={clsx(
        'rounded-2xl border border-border bg-paper p-6 shadow-sm',
        className,
      )}
    >
      {children}
    </section>
  );
}
