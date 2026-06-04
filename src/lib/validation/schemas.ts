import { z } from 'zod';

export const optionalTextSchema = z
  .string()
  .trim()
  .transform((value) => value || null);

export const optionalPositiveIntegerSchema = z
  .union([z.string(), z.number(), z.null(), z.undefined()])
  .transform((value) => {
    if (value === null || value === undefined || value === '') return null;

    const parsed = typeof value === 'number' ? value : Number(value);

    return Number.isNaN(parsed) ? value : parsed;
  })
  .pipe(z.number().int().positive().nullable());
