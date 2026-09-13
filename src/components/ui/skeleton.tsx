import { cn } from "@/lib/utils";
import { type CSSProperties, type ReactNode } from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "zone-shimmer";
}

/**
 * Skeleton primitive, placeholder in the shape of the content that is loading.
 *
 * The paint lives in `src/styles/components/skeleton.css` and selects on the
 * `data-variant` attribute. Call sites are unchanged (`<Skeleton className="h-4
 * w-3/4" />`): the block still takes its size and its corner radius from the
 * className, which is why the stylesheet declares neither.
 *
 * `react-loading-skeleton` is gone. Its shimmer is a `linear-gradient` swept
 * across the block and the design system has no gradients, so the library could
 * not be re-coloured into the redesign, only replaced by the flat pulse the
 * design bundle's Skeleton uses. `zone-shimmer` survives as a variant name and
 * now means "the heavier block", one step up the zone ink ramp.
 */
export function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  return (
    <div
      data-variant={variant}
      className={cn("zn-skeleton", className)}
      {...props}
    />
  );
}

interface SkeletonGroupProps {
  /** Optional theme overrides shared across nested skeletons. */
  baseColor?: string;
  highlightColor?: string;
  children: ReactNode;
}

/**
 * SkeletonGroup, gives descendant skeletons a shared fill, for a section that
 * needs a different tone than the page (skeletons on a tinted card need a
 * softer base to stay visible).
 *
 * Renders `display: contents`, so it adds no box to the layout: the colour
 * travels down as a custom property. `highlightColor` is accepted and ignored,
 * there is no sweep left to highlight.
 */
export function SkeletonGroup({
  baseColor = "var(--muted)",
  highlightColor = "color-mix(in srgb, var(--muted) 70%, var(--background))",
  children,
}: SkeletonGroupProps) {
  void highlightColor;
  return (
    <div
      className="zn-skeleton-group"
      style={{ "--zn-skeleton-fill": baseColor } as CSSProperties}
    >
      {children}
    </div>
  );
}
