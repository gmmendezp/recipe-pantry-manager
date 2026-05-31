import type { ReactNode } from 'react';

type FormErrorProps = {
  children: ReactNode;
};

export function FormError({ children }: FormErrorProps) {
  return (
    <p className="whitespace-pre-line rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
      {children}
    </p>
  );
}
