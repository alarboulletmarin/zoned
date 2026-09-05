import type { ReactNode, ComponentType } from "react";
import type { IconProps } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Visual variant controls the icon tint. Each variant is selected in CSS off
 * the `data-variant` attribute (`src/styles/components/empty-state.css`):
 *   - default       — faint ink glyph (legacy callers, unchanged)
 *   - no-results    — faint glyph, full-ink description carrying the count
 *   - not-started   — accent tint to read as a positive call-to-action
 *   - error         — danger tint for transient failures
 *   - offline       — danger tint for connectivity issues
 *
 * Variants are visual only: they do *not* set ARIA roles or alter focus.
 * Callers needing live-region updates should wrap the component with
 * `role="status"` themselves.
 */
type Variant = "default" | "no-results" | "not-started" | "error" | "offline";

interface EmptyStateProps {
  icon: ComponentType<IconProps>;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: Variant;
  /** Optional secondary text rendered below the action — context, hints. */
  hint?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
  hint,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("zn-empty", className)} data-variant={variant}>
      <span className="zn-empty__icon" aria-hidden="true">
        <Icon size={22} />
      </span>
      <h3 className="zn-empty__title">{title}</h3>
      {description && <p className="zn-empty__description">{description}</p>}
      {action}
      {hint && <p className="zn-empty__hint">{hint}</p>}
    </div>
  );
}
