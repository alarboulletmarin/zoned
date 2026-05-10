import { cn } from "@/lib/utils";
import RLSSkeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { type ReactNode } from "react";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "zone-shimmer";
}

/**
 * Skeleton primitive — pulse-style placeholder used while content loads.
 *
 * Wraps `react-loading-skeleton` so every block in the app benefits from
 * the shimmer animation while keeping the existing call sites unchanged
 * (`<Skeleton className="h-4 w-3/4" />`). The two custom variants are
 * preserved: the default uses the design-system muted token, and
 * `zone-shimmer` keeps the bespoke rainbow gradient defined in
 * `src/styles/animations.css` for hero/loader moments where the stronger
 * brand-colored sweep reads better than a flat shimmer.
 */
export function Skeleton({
  className,
  variant = "default",
  ...props
}: SkeletonProps) {
  if (variant === "zone-shimmer") {
    return <div className={cn("rounded-md zone-shimmer", className)} {...props} />;
  }
  return (
    <div
      className={cn(
        "block overflow-hidden rounded-md leading-none",
        className,
      )}
      {...props}
    >
      <RLSSkeleton
        height="100%"
        width="100%"
        baseColor="var(--muted)"
        highlightColor="color-mix(in srgb, var(--muted) 70%, var(--background))"
        duration={1.6}
        borderRadius="inherit"
      />
    </div>
  );
}

interface SkeletonGroupProps {
  /** Optional theme overrides shared across nested skeletons. */
  baseColor?: string;
  highlightColor?: string;
  children: ReactNode;
}

/**
 * SkeletonGroup — provides a shared theme (base / highlight color, shimmer
 * speed) to descendant skeletons. Useful when a section needs a different
 * tone than the global theme — e.g. skeletons rendered on a primary-tinted
 * card need a softer base to stay visible.
 */
export function SkeletonGroup({
  baseColor = "var(--muted)",
  highlightColor = "color-mix(in srgb, var(--muted) 70%, var(--background))",
  children,
}: SkeletonGroupProps) {
  return (
    <SkeletonTheme baseColor={baseColor} highlightColor={highlightColor} duration={1.6}>
      {children}
    </SkeletonTheme>
  );
}
