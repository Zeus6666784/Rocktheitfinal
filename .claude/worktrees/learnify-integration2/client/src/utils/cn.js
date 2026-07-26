import { clsx } from 'clsx';

/**
 * Tailwind-friendly conditional className helper.
 * Thin wrapper around clsx so the call site stays readable.
 */
export function cn(...inputs) {
  return clsx(inputs);
}
