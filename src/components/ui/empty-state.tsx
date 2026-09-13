import type { ComponentType, FunctionComponent, ReactNode, SVGProps } from "react";
import type { IconProps } from "@/components/icons";
import { cn } from "@/lib/utils";
import Standing from "@/assets/doodles/standing.svg?react";
import Wondering from "@/assets/doodles/wondering.svg?react";

/**
 * Visual variant. Each variant is selected in CSS off the `data-variant`
 * attribute (`src/styles/components/empty-state.css`):
 *   - default, faint ink glyph (legacy callers, unchanged)
 *   - no-results, full-ink description carrying the count
 *   - not-started, accent tint on the glyph, to read as a positive call
 *   - error, danger tint for transient failures
 *   - offline, danger tint for connectivity issues
 *
 * Variants are visual only: they do *not* set ARIA roles or alter focus.
 * Callers needing live-region updates should wrap the component with
 * `role="status"` themselves.
 *
 * They also pick the drawing. The nineteen call sites collapse into three
 * situations, a filter that found nothing, something never started, and a
 * failure, so the doodle belongs to the variant rather than to each page:
 * one decision instead of nineteen, and the same page state always wears the
 * same figure. `art` overrides it where a page has a better one; `default`
 * keeps the glyph, since it is what the legacy call sites already expect.
 */
type Variant = "default" | "no-results" | "not-started" | "error" | "offline";

const VARIANT_ART: Partial<
  Record<Variant, FunctionComponent<SVGProps<SVGElement>>>
> = {
  "no-results": Wondering,
  "not-started": Standing,
  error: Wondering,
  offline: Wondering,
};

interface EmptyStateProps {
  icon: ComponentType<IconProps>;
  /**
   * A hand-drawn doodle, imported with `?react`. When one is given it takes
   * the place of the glyph, a 22px pictogram says "no data", a drawn figure
   * says whose page this is. `icon` stays required and stays the fallback:
   * nineteen call sites pass one, and a slot without a drawing must keep
   * looking finished rather than empty.
   */
  art?: FunctionComponent<SVGProps<SVGElement>>;
  title: string;
  description?: string;
  action?: ReactNode;
  variant?: Variant;
  /** Optional secondary text rendered below the action, context, hints. */
  hint?: ReactNode;
  className?: string;
}

/**
 * The starting line. No dashed card any more, that texture belongs to the
 * reserved hole, and an empty shelf is not a hole. The figure stands on a
 * straight rule that runs the width of the container (the scene's bottom
 * border), and the words sit under the rule on a phone, beside the figure on
 * a wider screen, where the primary button rests its base on the same rule.
 * Everything is left-aligned: nothing in the centre, nothing under the MENU
 * pill on a phone.
 */
export function EmptyState({
  icon: Icon,
  art: Art,
  title,
  description,
  action,
  variant = "default",
  hint,
  className,
}: EmptyStateProps) {
  const Drawing = Art ?? VARIANT_ART[variant];

  return (
    <div
      className={cn("zn-empty", className)}
      data-variant={variant}
    >
      <div className="zn-empty__scene">
        {Drawing ? (
          <Drawing className="zn-empty__art" aria-hidden="true" focusable="false" />
        ) : (
          <span className="zn-empty__icon" aria-hidden="true">
            <Icon size={22} />
          </span>
        )}
      </div>
      <div className="zn-empty__body">
        <h3 className="zn-empty__title">{title}</h3>
        {description && <p className="zn-empty__description">{description}</p>}
        {action && <div className="zn-empty__action">{action}</div>}
      </div>
      {hint && <p className="zn-empty__hint">{hint}</p>}
    </div>
  );
}
