import type { AnchorHTMLAttributes, ComponentType, ReactNode } from 'react';

type RouteParams = Record<string, string>;

type LinkLikeProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children?: ReactNode;
  params?: RouteParams;
  to: string;
};

function toHref(to: string, params?: RouteParams) {
  if (!params) return to;

  return Object.entries(params).reduce(
    (href, [key, value]) => href.replace(`$${key}`, value),
    to,
  );
}

export function Link({ children, params, to, ...props }: LinkLikeProps) {
  return (
    <a href={toHref(to, params)} {...props}>
      {children}
    </a>
  );
}

export function createLink(
  Component: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement>>,
) {
  return function TestLink({ params, to, ...props }: LinkLikeProps) {
    return <Component href={toHref(to, params)} {...props} />;
  };
}
