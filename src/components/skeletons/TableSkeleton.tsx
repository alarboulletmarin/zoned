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
 *
 * The frame and the cell rhythm come from `.zn-table`
 * (`src/styles/components/responsive-table.css`): a 1.5px outline with a 16px
 * radius, 12px/16px cells, a banded header closed by a rule, hairlines
 * between rows. The column widths stay inline — they are per-cell noise, the
 * escape hatch the component layer keeps for one-off values.
 */
export function TableSkeleton({ rows = 6, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn("zn-table-skel", className)} aria-hidden>
      <div className="zn-table-skel__head"
           style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: columns }, (_, i) => (
          <Skeleton key={i} className="zn-table-skel__th" style={{ width: `${60 + ((i * 13) % 30)}%` }} />
        ))}
      </div>
      <div className="zn-table-skel__body">
        {Array.from({ length: rows }, (_, r) => (
          <div
            key={r}
            className="zn-table-skel__row"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }, (_, c) => (
              <Skeleton
                key={c}
                className="zn-table-skel__td"
                style={{ width: `${50 + ((r * 7 + c * 11) % 40)}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
