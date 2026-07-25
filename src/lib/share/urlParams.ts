/**
 * Readable query-param sharing for calculators.
 *
 * Calculator inputs are a handful of numbers, so base64 would be the wrong
 * tool: `?vma=16.5&fcmax=190` is ~30 chars, shorter than the encoded form,
 * and it stays hand-editable and readable in a chat message. Only the
 * structured payloads (workouts, weeks, plans) go through `codec.ts`.
 */

import { shareOrigin } from "./codec";

/** Build `/path?a=1&b=2`, skipping empty values so defaults stay out of the link. */
export function buildParamsUrl(
  path: string,
  params: Record<string, string | number | undefined | null>,
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const str = String(value).trim();
    if (str.length === 0) continue;
    search.set(key, str);
  }
  const query = search.toString();
  return `${shareOrigin()}${path}${query ? `?${query}` : ""}`;
}
