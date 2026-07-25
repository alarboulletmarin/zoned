/**
 * Shared codec for URL-encoded payloads — no backend involved.
 *
 * Every share feature ("Ma semaine", custom workouts, race simulations,
 * training plans) serializes a compact payload to base64url and hands it to a
 * `/…/shared?d=…` route. Keeping the link short is a format concern, not a
 * compression one: deflate only buys ~15 % on a 200-char payload, so the
 * savings come from what we choose to encode.
 *
 * Two rules keep the URLs short:
 *  - Encode the intent, not the result. A generated 12-week plan is ~1700
 *    chars; the config that produced it is ~250.
 *  - Fixed-position tuples, no repeated JSON keys, omit defaults.
 */

/** UTF-8 safe — TextEncoder first, so accented names survive btoa. */
export function toBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

export function fromBase64Url(encoded: string): string | null {
  try {
    const base64 = encoded.replaceAll("-", "+").replaceAll("_", "/");
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch {
    return null;
  }
}

export function encodePayload(payload: unknown): string {
  return toBase64Url(JSON.stringify(payload));
}

/** base64url → parsed JSON object, or null on any malformed input. */
export function decodePayload(encoded: string): Record<string, unknown> | null {
  const json = fromBase64Url(encoded);
  if (!json) return null;

  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    return null;
  }
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return null;
  return raw as Record<string, unknown>;
}

export function shareOrigin(): string {
  return typeof window !== "undefined" && window.location.origin
    ? window.location.origin
    : "https://zoned.run";
}

/** `shareUrl("/workout/shared", encoded)` → `https://zoned.run/workout/shared?d=…` */
export function shareUrl(path: string, encoded: string): string {
  return `${shareOrigin()}${path}?d=${encoded}`;
}
