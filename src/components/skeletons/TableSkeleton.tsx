import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  /** Number of placeholder rows. Defaults to 6 — long enough to feel real. */
  rows?: number;
  /** Number of columns; affects header line widths and row cell widths. */
  columns?: number;
  className?: string;
}

/**
 * Generic table skeleton — outline, header row, alternating rows. Used by
 * pages whose primary content is a tabular reference (race equivalence,
 * pace table, VMA zones) so the empty state during data fetch matches the
 * rendered structure.
 */
export function TableSkeleton({ rows = 6, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn("rounded-lg border overflow-hidden", className)} aria-hidden>
      <div className="grid items-center px-3 py-2 border-b bg-muted/30 gap-3"
           style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="h-4" style={{ width: `${60 + ((i * 13) % 30)}%` }} />
        ))}
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }, (_, r) => (
          <div
            key={r}
            className="grid items-center px-3 py-2.5 gap-3"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }, (_, c) => (
              <Skeleton
                key={c}
                className="h-3"
                style={{ width: `${50 + ((r * 7 + c * 11) % 40)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
