import type { ReactNode } from 'react';

type DetailHeroProps = {
  actions?: ReactNode;
  description?: string | null;
  eyebrow: string;
  meta?: ReactNode;
  title: string;
};

export function DetailHero({
  actions,
  description,
  eyebrow,
  meta,
  title,
}: DetailHeroProps) {
  return (
    <header className="space-y-5 rounded-2xl bg-primary p-8 text-paper">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-primary-soft text-sm uppercase tracking-[0.25em]">
            {eyebrow}
          </p>
          <h1 className="mt-3 break-words font-bold text-4xl tracking-tight">
            {title}
          </h1>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        ) : null}
      </div>
      {description ? (
        <p className="max-w-2xl text-primary-soft">{description}</p>
      ) : null}
      {meta}
    </header>
  );
}
