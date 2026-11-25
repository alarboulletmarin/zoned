/**
 * The `/plan/import` link: payload in, URL out, and back.
 *
 * The payload rides in the URL **fragment** (`#d=…`), never the query: a
 * fragment is not sent to the server, so the plan an agent wrote for someone
 * never reaches a log, and it escapes the query-length limits of proxies.
 *
 * `d` holds one of two encodings, told apart by a prefix base64url cannot
 * contain (`.` is outside its alphabet):
 *
 *  - `<base64url>`: the UTF-8 JSON, through `toBase64Url` from `share/codec`.
 *  - `z1.<base64url>`: the same JSON, raw-deflated (RFC 1951) first. `z1` is
 *    the encoding version; a later one would be `z2.`, and readers that do
 *    not know it reject the link instead of misreading it.
 *
 * Measured on a 16-week, 5-sessions-a-week plan (see agentApi tests): 4.4k
 * characters plain, 8.5k once three sessions a week carry a note, 0.6k and
 * 0.8k deflated. Past ~8k some chat clients and QR codes truncate, hence
 * `z1`. Agents without code execution can also send `j=<percent-encoded
 * JSON>`, read leniently; it is the fallback, not the format.
 */

import { fromBase64Url, toBase64Url } from "@/lib/share/codec";
import { PLAN_IMPORT_PATH, SITE_URL } from "./constants";

export const DEFLATE_PREFIX = "z1.";

/** Beyond this, `planImportUrl` deflates. Plain stays readable when it fits. */
export const PLAIN_URL_BUDGET = 2000;

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function base64UrlToBytes(encoded: string): Uint8Array | null {
  try {
    const binary = atob(encoded.replaceAll("-", "+").replaceAll("_", "/"));
    return Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
  } catch {
    return null;
  }
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
  const out = new Blob([bytes as BlobPart]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

export function encodeImportPlain(payload: unknown): string {
  return toBase64Url(JSON.stringify(payload));
}

export async function encodeImportDeflated(payload: unknown): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  return DEFLATE_PREFIX + bytesToBase64Url(await pipe(bytes, new CompressionStream("deflate-raw")));
}

export function planImportUrlFor(encoded: string, lang: "fr" | "en" = "fr"): string {
  return `${SITE_URL}${PLAN_IMPORT_PATH}${lang === "en" ? "?lang=en" : ""}#d=${encoded}`;
}

/** The link to hand a user: plain when short enough to read, deflated otherwise. */
export async function planImportUrl(payload: unknown, lang: "fr" | "en" = "fr"): Promise<string> {
  const plain = planImportUrlFor(encodeImportPlain(payload), lang);
  if (plain.length <= PLAIN_URL_BUDGET) return plain;
  return planImportUrlFor(await encodeImportDeflated(payload), lang);
}

export type FragmentReadFailure = "missing" | "malformed_base64" | "malformed_json" | "unknown_encoding";

export type FragmentRead = { ok: true; raw: unknown } | { ok: false; reason: FragmentReadFailure };

function parseJson(text: string | null): FragmentRead {
  if (text === null) return { ok: false, reason: "malformed_base64" };
  try {
    return { ok: true, raw: JSON.parse(text) as unknown };
  } catch {
    return { ok: false, reason: "malformed_json" };
  }
}

/** Decode the `d` value, either encoding. */
export async function decodeImportValue(value: string): Promise<FragmentRead> {
  const trimmed = value.trim();
  if (trimmed.length === 0) return { ok: false, reason: "missing" };

  const dot = trimmed.indexOf(".");
  if (dot === -1) return parseJson(fromBase64Url(trimmed));

  if (trimmed.slice(0, dot + 1) !== DEFLATE_PREFIX) return { ok: false, reason: "unknown_encoding" };
  const bytes = base64UrlToBytes(trimmed.slice(dot + 1));
  if (!bytes) return { ok: false, reason: "malformed_base64" };
  try {
    const inflated = await pipe(bytes, new DecompressionStream("deflate-raw"));
    return parseJson(new TextDecoder().decode(inflated));
  } catch {
    return { ok: false, reason: "malformed_base64" };
  }
}

/** Read `location.hash` (`#d=…` or `#j=…`), with or without the leading `#`. */
export async function readImportFragment(hash: string): Promise<FragmentRead> {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const d = params.get("d");
  if (d !== null) return decodeImportValue(d);
  // URLSearchParams has already percent-decoded `j`.
  const j = params.get("j");
  if (j !== null) return j.trim() ? parseJson(j) : { ok: false, reason: "missing" };
  return { ok: false, reason: "missing" };
}
