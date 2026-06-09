import { createLink } from '@tanstack/react-router';
import clsx from 'clsx';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes } from 'react';
import { forwardRef } from 'react';

type ButtonVariant =
  | 'danger'
  | 'ghost'
  | 'inverse'
  | 'inverseOutline'
  | 'primary'
  | 'secondary';
type ButtonSize = 'md' | 'sm' | 'xs';

type ButtonStyleProps = {
  fullWidth?: boolean;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleProps;
type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  ButtonStyleProps;

const baseClass =
  'inline-flex items-center justify-center rounded-full font-semibold transition disabled:cursor-not-allowed whitespace-nowrap';

const variantClasses: Record<ButtonVariant, string> = {
  danger:
    'bg-red-700 text-paper hover:bg-red-800 disabled:bg-red-300 disabled:text-paper',
  ghost:
    'border border-border text-muted hover:border-foreground disabled:border-border disabled:text-muted/60',
  inverse:
    'bg-paper text-primary hover:bg-primary-soft disabled:bg-primary-soft disabled:text-primary/60',
  inverseOutline:
    'border border-primary-soft text-paper hover:bg-primary-hover disabled:border-primary-soft/60 disabled:text-paper/60 disabled:opacity-60',
  primary: 'bg-primary text-paper hover:bg-primary-hover disabled:bg-border',
  secondary: 'border border-border hover:border-foreground',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-5 py-3',
  sm: 'px-4 py-2 text-sm',
  xs: 'px-3 py-1.5 text-sm',
};

function getButtonClassName({
  className,
  fullWidth,
  size = 'md',
  variant = 'primary',
}: ButtonStyleProps & { className?: string }) {
  return clsx(
    baseClass,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth && 'w-full',
    className,
  );
}

export function Button({
  className,
  fullWidth,
  size,
  variant,
  ...props
}: ButtonProps) {
  return (
    <button
      className={getButtonClassName({ className, fullWidth, size, variant })}
      {...props}
    />
  );
}

const StyledLinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function StyledLinkButton(
    { className, fullWidth, size, variant, ...props },
    ref,
  ) {
    return (
      <a
        className={getButtonClassName({ className, fullWidth, size, variant })}
        ref={ref}
        {...props}
      />
    );
  },
);

export const LinkButton = createLink(StyledLinkButton);
