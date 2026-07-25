import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "@/components/icons";
import type { RacePlan } from "@/lib/raceSimulator";
import { formatPaceDisplay, formatSplitTime } from "@/lib/splits";
import {
  convertDistance,
  convertPace,
  getDistanceUnit,
  getPaceUnit,
} from "@/lib/units";
import type { UnitSystem } from "@/types/settings";
import type { SplitStrategy } from "@/lib/splits";
import { cn } from "@/lib/utils";
import { Stat } from "./RaceSimSection";
import { PaceCurve } from "./PaceCurve";

/**
 * Pacing plan, shown at the density the strategy earns.
 *
 * On an even plan the table is ten identical rows restating one number, so it
 * starts folded behind a one-line summary. On a negative/positive split the
 * numbers actually move, so the table opens and the curve comes with it.
 */
export function SplitsPanel({
  plan,
  strategy,
  unit,
}: {
  plan: RacePlan;
  strategy: SplitStrategy;
  unit: UnitSystem;
}) {
  const { t } = useTranslation("simulator");
  const isEven = strategy === "even";
  const [showTable, setShowTable] = useState(!isEven);

  const paceUnit = getPaceUnit(unit);
  const distUnit = getDistanceUnit(unit);
  const avgPace = convertPace(
    plan.targetTimeSeconds / 60 / plan.distanceKm,
    unit,
  );

  // On an even metric plan the pace column restates the split column on every
  // row. It only earns its place when the pace moves (negative/positive) or
  // when splits are kilometres read as miles.
  const showPaceColumn = unit === "imperial" || !isEven;

  const first = plan.splits[0];
  const last = plan.splits[plan.splits.length - 1];

  // Long tables scroll inside their own box. That is also what makes the
  // sticky header legal: it pins to this container, not to the page, so it
  // can no longer sit on top of the first rows.
  const scrolls = plan.splits.length > 12;

  // Distance marker at the end of each split — what you actually read off the
  // course signage, rather than "1 km" repeated on every row.
  let running = 0;
  const markers = plan.splits.map((s) => {
    running += s.distance;
    return Math.round(convertDistance(running, unit) * 1000) / 1000;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
        <Stat
          label={t("labels.targetPace")}
          value={
            <>
              {formatPaceDisplay(avgPace)}
              <span className="text-sm font-normal text-muted-foreground">
                {paceUnit}
              </span>
            </>
          }
        />
        <Stat
          label={t("labels.estimatedFinish")}
          value={plan.estimatedFinishTime}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {isEven
          ? t("splits.evenSummary", {
              pace: `${formatPaceDisplay(avgPace)}${paceUnit}`,
            })
          : t(`splits.${strategy}Summary`, {
              first: `${formatPaceDisplay(convertPace(first.paceMinPerKm, unit))}${paceUnit}`,
              last: `${formatPaceDisplay(convertPace(last.paceMinPerKm, unit))}${paceUnit}`,
            })}
      </p>

      {!isEven && <PaceCurve splits={plan.splits} unit={unit} />}

      <button
        type="button"
        onClick={() => setShowTable((v) => !v)}
        aria-expanded={showTable}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronDown
          className={cn("size-4 transition-transform", showTable && "rotate-180")}
        />
        {showTable ? t("splits.hideTable") : t("splits.showTable")}
      </button>

      {showTable && (
        <div
          className={cn(
            "overflow-x-auto rounded-lg border",
            scrolls && "max-h-[26rem] overflow-y-auto",
          )}
        >
          <table className="w-full text-sm">
            <thead
              className={cn(
                "bg-card text-left",
                scrolls && "sticky top-0 z-10 shadow-[0_1px_0_var(--border)]",
              )}
            >
              <tr className="border-b">
                <th scope="col" className="px-3 py-2 font-medium">
                  {distUnit}
                </th>
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  {t("labels.split")}
                </th>
                {showPaceColumn && (
                  <th scope="col" className="px-3 py-2 text-right font-medium">
                    {t("labels.pace")}
                  </th>
                )}
                <th scope="col" className="px-3 py-2 text-right font-medium">
                  {t("labels.cumulative")}
                </th>
              </tr>
            </thead>
            <tbody>
              {plan.splits.map((split, i) => {
                const marker = markers[i];
                return (
                  <tr
                    key={split.index}
                    className="border-b last:border-b-0 hover:bg-muted/40"
                  >
                    <td className="px-3 py-2 tabular-nums text-muted-foreground">
                      {marker.toFixed(Number.isInteger(marker) ? 0 : 1)}
                    </td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatSplitTime(split.splitTimeSeconds)}
                    </td>
                    {showPaceColumn && (
                      <td className="px-3 py-2 text-right tabular-nums">
                        {formatPaceDisplay(convertPace(split.paceMinPerKm, unit))}
                      </td>
                    )}
                    <td className="px-3 py-2 text-right font-medium tabular-nums">
                      {formatSplitTime(split.cumulativeTimeSeconds)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* No totals row: the last split already carries the full distance
                and the target time, so a footer would just restate them. */}
          </table>
        </div>
      )}
    </div>
  );
}
