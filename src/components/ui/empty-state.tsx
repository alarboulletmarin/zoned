import type { ReactNode, ComponentType } from "react";
import type { IconProps } from "@/components/icons";
import { cn } from "@/lib/utils";

/**
 * Visual variant controls the icon tint and (subtly) background. Each
 * variant maps to a class set:
 *   - default       — neutral muted icon (legacy callers, unchanged)
 *   - no-results    — muted icon, slightly larger description for filter recoveries
 *   - not-started   — primary tint to read as a positive call-to-action
 *   - error         — destructive tint for transient failures
 *   - offline       — warning tint for connectivity issues
 *
 * Variants are visual only: they do *not* set ARIA roles or alter focus.
 * Callers needing live-region updates should wrap the component with
 * `role="status"` themselves.
 */
type Variant = "default" | "no-results" | "not-started" | "error" | "offline";

const VARIANT_ICON_CLASSES: Record<Variant, string> = {
  "default": "text-muted-foreground/50",
  "no-results": "text-muted-foreground/60",
  "not-started": "text-primary/70",
  "error": "text-destructive/70",
  "offline": "text-warning/70",
};

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
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 text-center",
        className,
      )}
      data-variant={variant}
    >
      <Icon className={cn("size-12 mb-4", VARIANT_ICON_CLASSES[variant])} />
      <h3 className="text-lg font-medium text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">
          {description}
        </p>
      )}
      {action}
      {hint && <p className="mt-3 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
