import clsx from 'clsx';
import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type TextFieldProps = {
  errors?: unknown[];
  label: string;
  labelClassName?: string;
  name: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  required?: boolean;
  type?: 'number' | 'text' | 'url';
  value: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'onBlur' | 'onChange'>;

type TextAreaFieldProps = {
  errors?: unknown[];
  label: string;
  labelClassName?: string;
  name: string;
  onBlur: () => void;
  onChange: (value: string) => void;
  required?: boolean;
  value: string;
} & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onBlur' | 'onChange'>;

export function TextField({
  errors = [],
  label,
  labelClassName = '',
  name,
  onBlur,
  onChange,
  required = false,
  type = 'text',
  value,
  ...inputProps
}: TextFieldProps) {
  const error = getFirstError(errors);

  return (
    <label className="block space-y-2">
      <span
        className={clsx('font-medium text-foreground text-sm', labelClassName)}
      >
        {label}
      </span>
      <input
        {...inputProps}
        className="w-full rounded-xl border border-border bg-paper px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-soft"
        name={name}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
      {error ? <span className="text-red-700 text-sm">{error}</span> : null}
    </label>
  );
}

export function TextAreaField({
  errors = [],
  label,
  labelClassName = '',
  name,
  onBlur,
  onChange,
  required = false,
  value,
  ...textAreaProps
}: TextAreaFieldProps) {
  const error = getFirstError(errors);

  return (
    <label className="block space-y-2">
      <span
        className={clsx('font-medium text-foreground text-sm', labelClassName)}
      >
        {label}
      </span>
      <textarea
        {...textAreaProps}
        className="min-h-28 w-full rounded-xl border border-border bg-paper px-4 py-3 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary-soft"
        name={name}
        onBlur={onBlur}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        value={value}
      />
      {error ? <span className="text-red-700 text-sm">{error}</span> : null}
    </label>
  );
}

function getFirstError(errors: unknown[]) {
  const error = errors.find(Boolean);

  return typeof error === 'string' ? error : null;
}
