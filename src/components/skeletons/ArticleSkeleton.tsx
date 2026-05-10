import { Skeleton } from "@/components/ui/skeleton";

/**
 * Long-form article placeholder — title, byline meta, hero block,
 * intro paragraph, two body paragraphs. Tight enough to fit the
 * narrow reading width but tall enough to occupy the fold while the
 * Markdown renderer hydrates.
 */
export function ArticleSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto" aria-hidden>
      {/* Breadcrumbs / back link */}
      <Skeleton className="h-3 w-32" />

      {/* Title */}
      <div className="space-y-3">
        <Skeleton className="h-9 w-5/6" />
        <Skeleton className="h-9 w-3/5" />
      </div>

      {/* Meta row */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-24" />
      </div>

      {/* Hero block */}
      <Skeleton className="h-44 w-full rounded-xl" variant="zone-shimmer" />

      {/* Intro */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Section heading */}
      <Skeleton className="h-6 w-2/5" />

      {/* Body paragraphs */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}
