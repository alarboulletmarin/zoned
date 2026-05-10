/**
 * ResponsiveTable — table on tablet+, key/value cards on mobile.
 *
 * The same data renders as a true HTML <table> at md+ and as stacked
 * cards below md, so dense reference views (race splits, pace tables)
 * stay scannable on both phones and laptops without horizontal scroll.
 *
 * Each column declares an optional `hideOnMobile` flag to drop low-value
 * columns from the card view, and a `mobileLabel` override for shorter
 * labels in card layout. The card title is taken from the first column
 * by default but can be overridden via `mobileCardTitle`.
 */

import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ResponsiveTableColumn<T> {
  /** Stable key for React reconciliation and accessibility. */
  key: string;
  /** Header rendered in <th>; reused as label in card view unless overridden. */
  header: ReactNode;
  /** Optional shorter label displayed in card layout. */
  mobileLabel?: ReactNode;
  /** Cell renderer. */
  cell: (row: T, rowIndex: number) => ReactNode;
  /** Tailwind classes appended to <th> and <td>. */
  className?: string;
  /** Hide this column from the mobile card layout entirely. */
  hideOnMobile?: boolean;
  /** th scope attribute (default "col"). */
  scope?: "col" | "row";
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: ResponsiveTableColumn<T>[];
  /** Stable row key — string field or function. */
  rowKey: keyof T | ((row: T, index: number) => string | number);
  /** Optional caption rendered above the table for screen readers. */
  caption?: ReactNode;
  /** Optional title shown at the top of each mobile card. */
  mobileCardTitle?: (row: T) => ReactNode;
  /** Render this when `data` is empty. */
  emptyState?: ReactNode;
  /** Outer wrapper className. */
  className?: string;
  /** className applied to the underlying <table>. */
  tableClassName?: string;
  /** Make the desktop <thead> sticky to the closest scrolling ancestor. */
  stickyHeader?: boolean;
}

function getRowKey<T>(
  row: T,
  index: number,
  rowKey: keyof T | ((row: T, index: number) => string | number),
): string | number {
  if (typeof rowKey === "function") return rowKey(row, index);
  const value = row[rowKey];
  if (typeof value === "string" || typeof value === "number") return value;
  return index;
}

export function ResponsiveTable<T>({
  data,
  columns,
  rowKey,
  caption,
  mobileCardTitle,
  emptyState,
  className,
  tableClassName,
  stickyHeader,
}: ResponsiveTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <div className={className}>{emptyState}</div>;
  }

  const visibleMobileColumns = columns.filter((c) => !c.hideOnMobile);

  return (
    <div className={className}>
      {/* Desktop: real <table>, hidden on phones */}
      <div className="hidden md:block overflow-x-auto">
        <table className={cn("w-full text-sm", tableClassName)}>
          {caption && <caption className="sr-only">{caption}</caption>}
          <thead
            className={cn(
              stickyHeader && "sticky top-0 bg-background z-10",
            )}
          >
            <tr className="border-b">
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope={col.scope ?? "col"}
                  className={cn(
                    "py-2 px-3 text-left font-medium text-muted-foreground",
                    col.className,
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={getRowKey(row, rowIndex, rowKey)}
                className="border-b last:border-0 hover:bg-muted/40 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={cn("py-2 px-3", col.className)}
                  >
                    {col.cell(row, rowIndex)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="md:hidden flex flex-col gap-3">
        {data.map((row, rowIndex) => (
          <div
            key={getRowKey(row, rowIndex, rowKey)}
            className="rounded-lg border bg-card p-3 shadow-xs"
          >
            {mobileCardTitle && (
              <div className="mb-2 text-sm font-semibold text-foreground">
                {mobileCardTitle(row)}
              </div>
            )}
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
              {visibleMobileColumns.map((col) => (
                <Fragment key={col.key}>
                  <dt className="text-xs font-medium text-muted-foreground self-center">
                    {col.mobileLabel ?? col.header}
                  </dt>
                  <dd className="text-foreground self-center">
                    {col.cell(row, rowIndex)}
                  </dd>
                </Fragment>
              ))}
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
