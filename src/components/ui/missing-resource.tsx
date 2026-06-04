import type { LinkProps } from '@tanstack/react-router';

import { LinkButton } from './button';

type MissingResourceProps = {
  backLabel: string;
  message: string;
  title: string;
  to: LinkProps['to'];
};

export function MissingResource({
  backLabel,
  message,
  title,
  to,
}: MissingResourceProps) {
  return (
    <section className="rounded-2xl border border-border bg-paper p-8 text-center shadow-sm">
      <h1 className="font-bold text-3xl tracking-tight">{title}</h1>
      <p className="mx-auto mt-3 max-w-xl text-muted">{message}</p>
      <LinkButton className="mt-6" to={to}>
        {backLabel}
      </LinkButton>
    </section>
  );
}
