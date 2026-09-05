import type { HTMLAttributes, ReactNode } from "react";
import { AlertTriangle, Check, Info, X } from "@/components/icons";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/**
 * An in-page message about something that just happened, or is about to.
 *
 * The app had no such component: errors were either a `sonner` toast that
 * vanishes or nothing at all. A toast is the wrong shape for a message the
 * person has to act on — it leaves before they can read it, and it cannot hold
 * the recovery button.
 *
 * The system's rule for the copy: say what happened, say what is intact, say
 * what to do next. No error code, no "oops", and never the person's fault.
 * An error with no way forward is a dead end — pass an `action`.
 */
type AlertKind = "error" | "success" | "warning" | "info";

const GLYPH = {
  error: AlertTriangle,
  success: Check,
  warning: Info,
  info: Info,
} as const;

export function Alert({
  kind = "info",
  title,
  children,
  action,
  onDismiss,
  className,
  ...rest
}: {
  kind?: AlertKind;
  /** One line, in the user's terms. Not "Erreur 422". */
  title?: ReactNode;
  /** What happened, what survived, and what to do about it. */
  children?: ReactNode;
  /** A Button — the way forward. */
  action?: ReactNode;
  /** Only for messages the person can safely never read again. */
  onDismiss?: () => void;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "title">) {
  const { t } = useTranslation();
  const Glyph = GLYPH[kind];

  return (
    <div
      // An error interrupts; everything else is announced politely when the
      // screen reader next gets a turn.
      role={kind === "error" ? "alert" : "status"}
      data-kind={kind}
      className={cn("zn-alert", className)}
      {...rest}
    >
      <span aria-hidden="true" className="zn-alert__glyph">
        <Glyph size={15} />
      </span>

      <div className="zn-alert__body">
        <span className="zn-alert__kind">{t(`common:alert.${kind}`)}</span>
        {title ? <span className="zn-alert__title">{title}</span> : null}
        {children ? <span className="zn-alert__text">{children}</span> : null}
        {action ? <span className="zn-alert__action">{action}</span> : null}
      </div>

      {onDismiss ? (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={t("common:actions.close")}
          className="zn-alert__dismiss"
        >
          <X size={15} />
        </button>
      ) : null}
    </div>
  );
}

export type { AlertKind };
