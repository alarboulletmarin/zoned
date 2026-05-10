import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton for a single training week as rendered by PlanWeeklyView.
 * Mirrors the horizontal day strip + summary footer so a long plan
 * (16+ weeks) shows useful structure during data load instead of one
 * giant pulsing rectangle.
 */
export function PlanWeekSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3" aria-hidden>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-md" />
        ))}
      </div>
      <div className="flex items-center gap-3 text-xs">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

/** Stack N week skeletons (e.g. 4 for a tapered marathon plan view). */
export function PlanWeekSkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: count }, (_, i) => (
        <PlanWeekSkeleton key={i} />
      ))}
    </div>
  );
}
