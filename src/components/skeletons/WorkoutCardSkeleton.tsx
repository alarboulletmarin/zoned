import { type CSSProperties } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Composite skeleton mirroring the layout of `<WorkoutCard>` — rounded
 * outline, title, optional badges, intensity bar, footer meta. Renders the
 * same vertical rhythm as the real card so swap-in feels stable.
 *
 * Every height is measured against `.zn-wcard` in
 * `src/styles/components/workout-card.css`, not eyeballed: the 24px padding,
 * the 22px frame, the 16px rhythm, the 66px description well, the 36px
 * ZoneBar and the 33px badge capsules. A skeleton whose blocks are the wrong
 * height is a layout shift with extra steps.
 *
 * Use this in lieu of bare `<Skeleton>` rectangles when a section is known
 * to render workout cards: the silhouette communicates *what* is loading
 * rather than just *that* something is loading.
 */
interface WorkoutCardSkeletonProps {
  className?: string;
  compact?: boolean;
}

export function WorkoutCardSkeleton({ className, compact = false }: WorkoutCardSkeletonProps) {
  return (
    <div
      className={cn("zn-wcard-skel", compact && "zn-wcard-skel--compact", className)}
      aria-hidden
    >
      {/* Header: title + heart icon */}
      <div className="zn-row zn-row--start zn-row--split">
        <Skeleton className="zn-wcard-skel__title" />
        <Skeleton className="zn-wcard-skel__fav" />
      </div>

      {/* Optional 2-line description. Flush lines, because the real
          description is one clamped paragraph and not two stacked blocks. */}
      {!compact && (
        <div
          className="zn-stack zn-wcard-skel__desc"
          style={{ "--gap": "0px" } as CSSProperties}
        >
          <Skeleton className="zn-wcard-skel__line" />
          <Skeleton className="zn-wcard-skel__line zn-wcard-skel__line--short" />
        </div>
      )}

      {/* Intensity bar */}
      <Skeleton className="zn-wcard-skel__bar" />

      {/* Meta row: duration + difficulty + zones */}
      <div
        className="zn-row zn-wcard-skel__meta"
        style={{ "--gap": "var(--sp-7)" } as CSSProperties}
      >
        <Skeleton className="zn-wcard-skel__fact zn-wcard-skel__fact--short" />
        <Skeleton className="zn-wcard-skel__fact zn-wcard-skel__fact--long" />
      </div>

      {/* Badges */}
      <div className="zn-cluster">
        <Skeleton className="zn-wcard-skel__badge zn-wcard-skel__badge--long" />
        <Skeleton className="zn-wcard-skel__badge zn-wcard-skel__badge--short" />
      </div>
    </div>
  );
}

/** Render N skeleton cards in a responsive grid matching the library layout. */
export function WorkoutCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="zn-grid">
      {Array.from({ length: count }, (_, i) => (
        <WorkoutCardSkeleton key={i} />
      ))}
    </div>
  );
}
