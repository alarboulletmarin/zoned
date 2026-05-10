import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Composite skeleton mirroring the layout of `<WorkoutCard>` — rounded
 * outline, title, optional badges, intensity bar, footer meta. Renders the
 * same vertical rhythm as the real card so swap-in feels stable.
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
      className={cn(
        "rounded-lg border bg-card p-4 space-y-3",
        compact && "p-3 space-y-2",
        className,
      )}
      aria-hidden
    >
      {/* Header: title + heart icon */}
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="size-6 rounded-full shrink-0" />
      </div>

      {/* Optional 2-line description */}
      {!compact && (
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </div>
      )}

      {/* Intensity bar */}
      <Skeleton className="h-1 w-full rounded-full" />

      {/* Meta row: duration + difficulty + zones */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-14" />
        <Skeleton className="h-3 w-16" />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1.5">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
    </div>
  );
}

/** Render N skeleton cards in a responsive grid matching the library layout. */
export function WorkoutCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <WorkoutCardSkeleton key={i} />
      ))}
    </div>
  );
}
