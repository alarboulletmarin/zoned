/**
 * PageContainer — the standard outer shell for top-level routes.
 *
 * Centralises the responsive padding ladder (`px-4 sm:px-6 lg:px-8`) and the
 * max-width cap so individual pages don't drift apart. The shell itself
 * stays content-agnostic: pages compose their own headers, hero blocks,
 * grids inside.
 *
 * Use `width="narrow"` for long-form reading (articles, methodology),
 * `width="default"` (max-w-6xl) for typical app pages, and `width="wide"`
 * for dashboards/calendars that need horizontal breathing room.
 */

import { type ElementType, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Width = "narrow" | "default" | "wide" | "full";

const WIDTH_CLASSES: Record<Width, string> = {
  narrow: "max-w-3xl",
  default: "max-w-6xl",
  wide: "max-w-7xl",
  full: "max-w-none",
};

interface PageContainerProps {
  children: ReactNode;
  /** HTML element to render as. Defaults to <div>; pages may pass `as="section"`. */
  as?: ElementType;
  /** Max-width preset; default = "default" (max-w-6xl). */
  width?: Width;
  /** Append additional classes; merged via cn. */
  className?: string;
  /** Strip horizontal padding (rare — full-bleed map/canvas pages). */
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
      className={cn(
        "mx-auto w-full",
        WIDTH_CLASSES[width],
        !flush && "px-4 sm:px-6 lg:px-8",
        className,
      )}
    >
      {children}
    </Comp>
  );
}
