import { clsx } from 'clsx';
import type { ReactNode } from 'react';

type BadgeVariant = 'primary' | 'soft';

type BadgeProps = {
  children: ReactNode;
  className?: string;
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary-hover text-primary-soft',
  soft: 'bg-primary-soft text-primary-soft-foreground',
};

export function Badge({ children, className, variant = 'soft' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'rounded-full px-3 py-1 font-semibold text-sm',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
