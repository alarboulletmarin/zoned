import { useTranslation } from "react-i18next";
import type { SplitRow } from "@/lib/splits";
import { formatPaceDisplay } from "@/lib/splits";
import { convertPace, getPaceUnit } from "@/lib/units";
import type { UnitSystem } from "@/types/settings";
import { cn } from "@/lib/utils";

/**
 * Shape of the pacing plan, split by split. Faster sits higher.
 *
 * Ink on paper: a band of sunken paper under the line, the line itself in ink,
 * and two hairline axes at the fastest and the slowest split, the pair the
 * caption prints, so the reader can put a number on both edges of the shape.
 *
 * Only worth drawing when the pace actually moves, on an even plan the curve
 * is a flat line that says nothing the summary sentence doesn't.
 */
export function PaceCurve({
  splits,
  unit,
  className,
}: {
  splits: SplitRow[];
  unit: UnitSystem;
  className?: string;
}) {
  const { t } = useTranslation("simulator");
  if (splits.length < 2) return null;

  const paces = splits.map((s) => convertPace(s.paceMinPerKm, unit));
  const fastest = Math.min(...paces);
  const slowest = Math.max(...paces);
  const range = slowest - fastest || 1;

  const points = paces.map((p, i) => {
    const x = (i / (paces.length - 1)) * 100;
    // 6 % padding top and bottom so the extremes aren't clipped by the stroke.
    const y = 6 + ((p - fastest) / range) * 88;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const paceUnit = getPaceUnit(unit);

  return (
    <figure
      className={cn("zn-stack zn-rs-curve", className)}
      style={{ "--gap": "var(--sp-3)" } as React.CSSProperties}
    >
      <figcaption className="zn-rs-curve__caption">
        <span className="zn-kicker">{t("splits.curve")}</span>
        <span className="zn-rs-curve__range">
          {formatPaceDisplay(fastest)} - {formatPaceDisplay(slowest)}
          {paceUnit}
        </span>
      </figcaption>
      <div className="zn-rs-curve__plot">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="img"
          aria-label={t("splits.curveAria", {
            fastest: formatPaceDisplay(fastest),
            slowest: formatPaceDisplay(slowest),
          })}
          className="zn-rs-curve__svg"
        >
          <polygon
            points={`0,100 ${points.join(" ")} 100,100`}
            className="zn-rs-curve__area"
          />
          <line
            x1="0"
            y1="6"
            x2="100"
            y2="6"
            vectorEffect="non-scaling-stroke"
            className="zn-rs-curve__axis"
          />
          <line
            x1="0"
            y1="94"
            x2="100"
            y2="94"
            vectorEffect="non-scaling-stroke"
            className="zn-rs-curve__axis"
          />
          <polyline
            points={points.join(" ")}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="zn-rs-curve__line"
          />
        </svg>
        {/* The y axis has no scale, so it says which way is up. */}
        <span className="zn-rs-curve__up">{t("splits.curveFaster")}</span>
      </div>
      <div className="zn-rs-curve__ends">
        <span className="zn-kicker">{t("splits.curveStart")}</span>
        <span className="zn-kicker">{t("splits.curveEnd")}</span>
      </div>
    </figure>
  );
}
