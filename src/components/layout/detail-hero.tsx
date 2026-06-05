import type { ReactNode } from 'react';

type DetailHeroProps = {
  actions?: ReactNode;
  description?: string | null;
  eyebrow: string;
  footer?: ReactNode;
  media?: ReactNode;
  meta?: ReactNode;
  title: string;
};

export function DetailHero({
  actions,
  description,
  eyebrow,
  footer,
  media,
  meta,
  title,
}: DetailHeroProps) {
  if (media) {
    return (
      <header className="rounded-2xl bg-primary p-6 text-paper sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr] lg:items-start">
          <div className="h-64 overflow-hidden rounded-xl lg:h-72">{media}</div>
          <div className="flex flex-col gap-5 lg:min-h-72">
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
            {meta || footer ? (
              <div className="space-y-5 lg:mt-auto">
                {meta}
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </header>
    );
  }

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
      {footer}
    </header>
  );
}
