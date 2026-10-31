/**
 * Why something failed, in a word the interface can turn into a sentence.
 *
 * The app used to lose the cause at the first `catch`: a `catch {}` with no
 * binding, a helper answering `false`, and the toast could only say "Erreur".
 * Worse, some messages asserted a cause they had not checked ("espace de
 * stockage insuffisant" for any refused write). A reason travels from where
 * the failure is known to where it is said, and nowhere in between is it
 * guessed.
 *
 * Three ways to carry it:
 *  - `AppFailure`, thrown by a helper that knows (a capture that timed out, a
 *    store that reached its cap);
 *  - `Outcome`, returned by a helper that used to return a boolean, so its
 *    callers keep an `if (!saved.ok)` and gain `saved.reason`;
 *  - `failureReason(anything)`, which reads a reason out of whatever a `catch`
 *    receives: one of the above, or a browser error it recognises.
 *
 * The words for each reason live under `common:failure.*`, one sentence in
 * three beats, what happened, what is intact, what to do. `cancelled` has no
 * words on purpose: a share sheet closed without choosing is not an error and
 * is never shown.
 */
export type FailureReason =
  /** The browser's storage is full; nothing was written. */
  | "quota"
  /** The data was refused by validation before any write. */
  | "invalid"
  /** The target no longer exists (deleted in another tab, stale id). */
  | "notFound"
  /** A count cap was reached (max custom workouts, max plans). */
  | "limit"
  /** A render or a request took too long and was interrupted. */
  | "timeout"
  /** The network is needed and `navigator.onLine` says there is none. */
  | "offline"
  /** The browser refused an access (clipboard, share, permission). */
  | "denied"
  /** The browser lacks the API. */
  | "unsupported"
  /** The person dismissed a native sheet: not an error, never shown. */
  | "cancelled"
  /** Everything else. */
  | "unknown";

export const FAILURE_REASONS = [
  "quota",
  "invalid",
  "notFound",
  "limit",
  "timeout",
  "offline",
  "denied",
  "unsupported",
  "cancelled",
  "unknown",
] as const satisfies readonly FailureReason[];

export function isFailureReason(value: unknown): value is FailureReason {
  return typeof value === "string" && (FAILURE_REASONS as readonly string[]).includes(value);
}

/** An error that knows why it happened. */
export class AppFailure extends Error {
  readonly reason: FailureReason;

  constructor(reason: FailureReason, message?: string, options?: { cause?: unknown }) {
    super(message ?? reason, options);
    this.name = "AppFailure";
    this.reason = reason;
  }
}

/**
 * What a write helper answers instead of a boolean.
 *
 * `ok` keeps every `if (!result.ok)` as readable as `if (!saved)` was, and the
 * reason rides along for the message. The type is a union so `reason` only
 * exists once `ok` has been checked.
 */
export type Outcome = { ok: true } | { ok: false; reason: FailureReason };

export const OK: Outcome = Object.freeze({ ok: true }) as Outcome;

/** An `Outcome` for a failure, from a reason or from whatever was caught. */
export function failed(cause: unknown): Outcome {
  return { ok: false, reason: failureReason(cause) };
}

function isOutcome(value: unknown): value is Outcome {
  return typeof value === "object" && value !== null && "ok" in value && typeof value.ok === "boolean";
}

function errorName(value: unknown): string | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const name = (value as { name?: unknown }).name;
  return typeof name === "string" ? name : undefined;
}

function errorCode(value: unknown): number | undefined {
  if (typeof value !== "object" || value === null) return undefined;
  const code = (value as { code?: unknown }).code;
  return typeof code === "number" ? code : undefined;
}

/**
 * Whether a thrown value is the browser refusing a write for lack of room.
 *
 * Read by name and code rather than `instanceof DOMException`: an error thrown
 * in another realm (an iframe, a worker) fails `instanceof` and still carries
 * the name. Firefox has its own name for it, and the legacy code 22 covers
 * browsers that predate the name.
 */
export function isQuotaError(value: unknown): boolean {
  const name = errorName(value);
  if (name === "QuotaExceededError" || name === "NS_ERROR_DOM_QUOTA_REACHED") return true;
  const code = errorCode(value);
  return code === 22 || code === 1014;
}

/**
 * The reason behind anything a `catch` can receive.
 *
 * Order matters: an explicit reason wins over a guess, and a guess is only
 * made from what the browser states (an error name), never from a message
 * string. The offline check comes last: it only explains a failure that
 * nothing else explains, so a quota error while offline still reads "quota".
 */
export function failureReason(cause: unknown): FailureReason {
  if (isFailureReason(cause)) return cause;
  if (cause instanceof AppFailure) return cause.reason;
  if (isOutcome(cause)) return cause.ok ? "unknown" : cause.reason;
  if (isQuotaError(cause)) return "quota";

  switch (errorName(cause)) {
    case "AbortError":
      return "cancelled";
    case "NotAllowedError":
    case "SecurityError":
      return "denied";
    case "NotSupportedError":
      return "unsupported";
    case "TimeoutError":
      return "timeout";
    default:
      break;
  }

  if (typeof navigator !== "undefined" && navigator.onLine === false) return "offline";
  return "unknown";
}
