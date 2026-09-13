/**
 * PageContainer, the standard outer shell for top-level routes.
 *
 * Centralises the screen margin (40px, 20px on mobile, the design's
 * --pad-screen-x) and the max-width cap so individual pages don't drift
 * apart. The shell itself stays content-agnostic: pages compose their own
 * headers, hero blocks and grids inside.
 *
 * Use `width="narrow"` for long-form reading (articles, methodology),
 * `width="default"` for typical app pages, and `width="wide"` for
 * dashboards/calendars that need the full 1360px content column.
 *
 * The prop API is unchanged; only the paint moved. Widths are selected off a
 * data attribute, which is the house rule for variants, see
 * src/styles/components/shell.css for the caps.
 */

import { type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Width = "narrow" | "default" | "wide" | "full";

interface PageContainerProps {
  children: ReactNode;
  /** HTML element to render as. Defaults to <div>; pages may pass `as="section"`. */
  as?: ElementType;
  /** Max-width preset; default = "default". */
  width?: Width;
  /** Append additional classes; merged via cn. */
  className?: string;
  /** Strip horizontal padding (rare, full-bleed map/canvas pages). */
  flush?: boolean;
}

export function PageContainer({
  children,
  as: Comp = "div",
  width = "default",
  className,
  flush = false,
}: PageContainerProps) {
  return (
    <Comp
      data-width={width}
      data-flush={flush || undefined}
      className={cn("zn-page", className)}
    >
      {children}
    </Comp>
  );
}
