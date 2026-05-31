import type { ReactNode } from 'react';

type EmptyStateProps = {
  action?: ReactNode;
  children?: ReactNode;
  title: string;
};

export function EmptyState({ action, children, title }: EmptyStateProps) {
  return (
    <section className="rounded-2xl border border-border border-dashed bg-paper p-8 text-center">
      <h2 className="font-semibold text-2xl">{title}</h2>
      {children ? (
        <p className="mx-auto mt-3 max-w-xl text-muted">{children}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </section>
  );
}
