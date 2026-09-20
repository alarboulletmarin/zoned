import type { ReactNode } from "react";
import { toast as sonner } from "sonner";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Check, Info, Loader2, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { failureReason, type FailureReason } from "@/lib/failure";

/**
 * The house toast: the only way the app is allowed to speak from the corner.
 *
 * `sonner` stays underneath as the transport, it owns the queue, the stack,
 * the swipe to dismiss, the timers and the `aria-live` region, and none of that
 * is worth rewriting. What it no longer owns is the drawing. Its default toast
 * is a foreign object here: a coloured pictogram on a tinted pill, with none of
 * the anatomy the rest of the system uses for a message about what just
 * happened. `Alert` and the shell banners (`.zn-prompt`) already agree on that
 * anatomy, an ink disc with the glyph, the kind named in mono capitals, a
 * title, a quiet line under it, house buttons. A toast is the same message
 * that happens to float, so it borrows the same shape.
 *
 * Every toast goes through `sonner.custom`, which hands sonner a finished
 * element and nothing else to paint: no icon slot, no close button, no
 * `data-type`. Import `toast` from here, never from `sonner`; the paint in
 * `toast.css` assumes this markup and nothing else.
 *
 * Durations follow the kind, not the screen. A confirmation is read in a
 * glance and leaves; an error has to be read, so it stays long enough to be,
 * and it carries its own close button anyway. A toast with an undo button
 * keeps the button reachable for a while. "Loading" never times out on its
 * own: the caller resolves it into a success or an error under the same id,
 * and the guard against a promise that never settles lives at the call site
 * (`renderPng` in `lib/export/share.ts` is the model).
 *
 * An error is reported through `toast.failure(title, cause)`: the title says
 * what did not happen, in the caller's words, and the cause, whatever the
 * `catch` received, becomes the second line through `lib/failure`, the same
 * three beats everywhere: what happened, what is intact, what to do. A
 * dismissed native sheet (`cancelled`) shows nothing.
 */
export type ToastKind = "success" | "error" | "warning" | "info" | "loading";

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  /** Reuse an id to replace a toast in place: loading, then success or error. */
  id?: string | number;
  /** What happened in one more line: the cause, what is intact, what to do. */
  description?: ReactNode;
  /** One button, the way forward or the way back (undo). Closes the toast. */
  action?: ToastAction;
  /** Override the kind's duration, in ms. `Infinity` pins the toast. */
  duration?: number;
}

/** Milliseconds a toast stays, by kind, before the policy below adjusts it. */
export const TOAST_DURATION: Record<ToastKind, number> = {
  success: 2500,
  info: 4000,
  warning: 6000,
  error: 8000,
  loading: Infinity,
};

/** A toast with a button stays at least this long, whatever its kind. */
export const TOAST_ACTION_MIN_DURATION = 8000;

/**
 * The duration policy, in one place so a test can pin it.
 *
 * An explicit duration wins, that is how the offline notice pins itself.
 * Otherwise the kind decides, and a button raises the floor: an undo that
 * vanishes after two seconds is not an undo.
 */
export function toastDuration(
  kind: ToastKind,
  options: Pick<ToastOptions, "duration" | "action"> = {},
): number {
  if (options.duration !== undefined) return options.duration;
  const base = TOAST_DURATION[kind];
  return options.action ? Math.max(base, TOAST_ACTION_MIN_DURATION) : base;
}

const GLYPH = {
  error: AlertTriangle,
  success: Check,
  warning: Info,
  info: Info,
  loading: Loader2,
} as const;

function ToastCard({
  kind,
  title,
  description,
  reason,
  action,
  onClose,
}: {
  kind: ToastKind;
  title: ReactNode;
  description?: ReactNode;
  /** Said under the title when no description is given, in the house words. */
  reason?: FailureReason;
  action?: ToastAction;
  onClose: () => void;
}) {
  const { t } = useTranslation("common");
  const Glyph = GLYPH[kind];
  const text = description ?? (reason ? t(`failure.${reason}`) : null);

  return (
    <div className="zn-toast" data-kind={kind}>
      <span aria-hidden="true" className="zn-toast__glyph">
        <Glyph size={15} />
      </span>

      <div className="zn-toast__body">
        {/* The kind, named in words: no state in this system rests on colour
            alone, and a toast is read in the corner of the eye. */}
        <span className="zn-toast__kind">{t(`alert.${kind}`)}</span>
        <span className="zn-toast__title">{title}</span>
        {text ? <span className="zn-toast__text">{text}</span> : null}
        {action ? (
          <span className="zn-toast__actions">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                action.onClick();
                onClose();
              }}
            >
              {action.label}
            </Button>
          </span>
        ) : null}
      </div>

      {/* A loading toast is not dismissed, it is resolved by whoever opened
          it; closing it by hand would leave the work running with no sign. */}
      {kind !== "loading" ? (
        <button
          type="button"
          onClick={onClose}
          aria-label={t("actions.close")}
          className="zn-toast__dismiss"
        >
          <X size={15} />
        </button>
      ) : null}
    </div>
  );
}

function show(
  kind: ToastKind,
  title: ReactNode,
  options: ToastOptions = {},
  reason?: FailureReason,
) {
  const { id, description, action, duration } = options;
  return sonner.custom(
    (toastId) => (
      <ToastCard
        kind={kind}
        title={title}
        description={description}
        reason={reason}
        action={action}
        onClose={() => sonner.dismiss(toastId)}
      />
    ),
    { id, duration: toastDuration(kind, { duration, action }) },
  );
}

/**
 * An error with its cause. `cause` is whatever the `catch` received, an
 * `Outcome` a helper answered, or a bare reason; `undefined` reads as unknown
 * and still gets the honest generic line rather than nothing.
 */
function failure(title: ReactNode, cause?: unknown, options: ToastOptions = {}) {
  const reason = failureReason(cause);
  if (reason === "cancelled") {
    if (options.id !== undefined) sonner.dismiss(options.id);
    return options.id;
  }
  return show("error", title, options, reason);
}

export const toast = {
  success: (title: ReactNode, options?: ToastOptions) => show("success", title, options),
  error: (title: ReactNode, options?: ToastOptions) => show("error", title, options),
  failure,
  warning: (title: ReactNode, options?: ToastOptions) => show("warning", title, options),
  info: (title: ReactNode, options?: ToastOptions) => show("info", title, options),
  loading: (title: ReactNode, options?: ToastOptions) => show("loading", title, options),
  /** Without an id, closes every toast. */
  dismiss: (id?: string | number) => sonner.dismiss(id),
};
