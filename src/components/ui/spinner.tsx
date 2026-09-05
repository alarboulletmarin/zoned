import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

/**
 * A wait that has no shape yet.
 *
 * Where the shape IS known, use a Skeleton instead: a spinner says "something
 * is happening", a skeleton says "this is what is coming". The system asks that
 * a wait longer than a second be named in words, which is what `label` is for —
 * a ring spinning on its own tells the person nothing.
 */
export function Spinner({
  size = 20,
  label,
  inline = false,
  className,
  style,
}: {
  size?: number;
  /** What is being waited for. Add one past a second of waiting. */
  label?: string;
  inline?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const { t } = useTranslation();
  const ring = (
    <span
      aria-hidden="true"
      className="zn-spinner__ring"
      style={{ inlineSize: size, blockSize: size }}
    />
  );

  if (!label) {
    return (
      <span role="status" aria-label={t("common:status.loading")} className={className} style={style}>
        {ring}
      </span>
    );
  }

  return (
    <span
      role="status"
      data-inline={inline || undefined}
      className={cn("zn-spinner", className)}
      style={style}
    >
      {ring}
      {label}
    </span>
  );
}
