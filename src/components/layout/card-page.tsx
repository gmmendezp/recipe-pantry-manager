import type { ReactNode } from 'react';

type CardPageProps = {
  children: ReactNode;
};

export function CardPage({ children }: CardPageProps) {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <section className="mx-auto flex max-w-md flex-col gap-8 rounded-2xl border border-border bg-paper p-8 shadow-sm">
        {children}
      </section>
    </main>
  );
}
