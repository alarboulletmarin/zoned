import { useTranslation } from "react-i18next";
import type { SplitRow } from "@/lib/splits";
import { formatPaceDisplay } from "@/lib/splits";
import { convertPace, getPaceUnit } from "@/lib/units";
import type { UnitSystem } from "@/types/settings";
import { cn } from "@/lib/utils";

/**
 * Shape of the pacing plan, split by split. Faster sits higher.
 *
 * Only worth drawing when the pace actually moves — on an even plan the curve
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
    <figure className={cn("space-y-1.5", className)}>
      <figcaption className="flex items-baseline justify-between text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
        <span>{t("splits.curve")}</span>
        <span className="tabular-nums normal-case tracking-normal">
          {formatPaceDisplay(fastest)} – {formatPaceDisplay(slowest)}
          {paceUnit}
        </span>
      </figcaption>
      <div className="relative">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          role="img"
          aria-label={t("splits.curveAria", {
            fastest: formatPaceDisplay(fastest),
            slowest: formatPaceDisplay(slowest),
          })}
          className="h-20 w-full rounded-md border bg-muted/30"
        >
          <polygon
            points={`0,100 ${points.join(" ")} 100,100`}
            className="fill-primary/10"
          />
          <polyline
            points={points.join(" ")}
            fill="none"
            strokeWidth={2}
            vectorEffect="non-scaling-stroke"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-primary"
          />
        </svg>
        {/* The y axis has no scale, so it says which way is up. */}
        <span className="pointer-events-none absolute left-2 top-1.5 text-[0.6875rem] text-muted-foreground">
          {t("splits.curveFaster")}
        </span>
      </div>
      <div className="flex justify-between text-[0.6875rem] text-muted-foreground">
        <span>{t("splits.curveStart")}</span>
        <span>{t("splits.curveEnd")}</span>
      </div>
    </figure>
  );
}
