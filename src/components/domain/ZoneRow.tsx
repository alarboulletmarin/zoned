/**
 * ZoneRow — one zone's share of a week, a plan or a session.
 *
 * Four columns: the Z-code, the zone's name, the bar, the value. The bar is
 * the ink ramp (Z1 = 14 % ink, Z6 = solid), so the encoding is ordered rather
 * than categorical; the Z-code next to it is what names the zone, since the
 * ramp orders but does not label. The bar itself is aria-hidden — the value
 * sits in text at the end of the row.
 */

import type { CSSProperties } from "react";
import type { ZoneNumber } from "@/types";
import { cn } from "@/lib/utils";

/** The ink ramp, written out: Tailwind and CSS both need literal names. */
const ZONE_FILL: Record<ZoneNumber, string> = {
  1: "var(--zone-1)",
  2: "var(--zone-2)",
  3: "var(--zone-3)",
  4: "var(--zone-4)",
  5: "var(--zone-5)",
  6: "var(--zone-6)",
};

interface ZoneRowProps {
  zone: ZoneNumber;
  /** The zone's name, already localised. */
  name: string;
  /** The value printed at the end of the row, already formatted. */
  value: string;
  /** Share of the row's width, 0–100. */
  percent: number;
  /** Width of the name column in pixels. */
  labelWidth?: number;
  className?: string;
}

export function ZoneRow({
  zone,
  name,
  value,
  percent,
  labelWidth = 120,
  className,
}: ZoneRowProps) {
  return (
    <div
      className={cn("zn-zone-row", className)}
      style={{ "--label-w": `${labelWidth}px` } as CSSProperties}
    >
      <span className="zn-zone-row__code">Z{zone}</span>
      <span className="zn-zone-row__name">{name}</span>
      <span className="zn-zone-row__track" aria-hidden="true">
        <span
          className="zn-zone-row__fill"
          style={
            {
              "--pct": `${Math.max(percent, 1)}%`,
              "--fill": ZONE_FILL[zone],
            } as CSSProperties
          }
        />
      </span>
      <span className="zn-zone-row__value">{value}</span>
    </div>
  );
}
