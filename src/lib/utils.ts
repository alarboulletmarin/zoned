import { clsx, type ClassValue } from "clsx";

/**
 * Joins class names, dropping anything falsy.
 *
 * It used to wrap `clsx` in `tailwind-merge`, whose job was to arbitrate
 * between two utilities that set the same property — `px-2` losing to a later
 * `px-4`. With Tailwind gone there is nothing left to arbitrate: the app's
 * classes are `zn-` component names, and two of those never fight over a
 * declaration. So `cn` is now the assembler alone.
 *
 * The signature does not move — it is what keeps two hundred call sites
 * unedited — and it still takes every shape `clsx` takes: strings, `false`,
 * `null`, `undefined`, numbers, nested arrays, and `{ "zn-x": condition }`
 * objects.
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
