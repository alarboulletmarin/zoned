import { useTranslation } from "react-i18next";
import { AlertTriangle, Check, ChevronDown } from "@/components/icons";
import { polarisationStatus } from "@/components/weekly/PolarizationGauge";
import { WeekRhythmChart } from "@/components/weekly/WeekRhythmChart";
import { WeekSummaryBar } from "@/components/weekly/WeekSummaryBar";
import { cn } from "@/lib/utils";
import type { WeekStats } from "@/lib/weekStats";
import type { WeekSlot } from "@/types/week";

/**
 * The summary, folded to one strip for a phone: the figures, the 80/20
 * verdict and a thumbnail of the rhythm, with the full bar behind a
 * disclosure. On a phone the full bar took the first screen entire and the
 * week itself began a screen and a half lower; the board is the object and
 * the summary its consequence, so the consequence folds.
 */
export function WeekSummaryStrip({
  stats,
  slots,
  targetVolumeH,
  className,
}: {
  stats: WeekStats;
  slots: WeekSlot[];
  targetVolumeH?: number;
  className?: string;
}) {
  const { t } = useTranslation("library");
  const hours = stats.totalHours.toFixed(1).replace(".", ",");
  // "5,4/6 h", not "5,4 / 6 h": the strip has one line on a phone and the
  // spaces around the slash were what pushed the load onto a second.
  const figures =
    targetVolumeH != null
      ? t("weekly.summary.stripBudget", { sessions: stats.sessions, hours, target: targetVolumeH, tss: stats.totalTss })
      : t("weekly.summary.strip", { sessions: stats.sessions, hours, tss: stats.totalTss });
  const { lowShare, midShare, highShare, zonedMinutes } = stats.polarised;
  const status = zonedMinutes > 0 ? polarisationStatus(midShare + highShare) : null;
  const pct = (n: number) => Math.round(n * 100);

  return (
    <details className={cn("zn-disclosure zn-pw__summary-strip", className)}>
      <summary className="zn-disclosure__summary">
        <span className="zn-pw__summary-line">
          <span className="zn-pw__summary-figures">{figures}</span>
          {status && (
            <span
              className={cn(
                "zn-wk-gauge__verdict",
                status === "balanced" && "zn-wk-gauge__verdict--ok",
              )}
              title={t(`weekly.gauge.${status}`)}
            >
              {status === "balanced" ? <Check /> : <AlertTriangle />}
              <span className="zn-mono">
                {pct(lowShare)} / {pct(midShare + highShare)}
              </span>
            </span>
          )}
        </span>
        <span className="zn-pw__summary-foot">
          <WeekRhythmChart slots={slots} compact />
          <span className="zn-kicker zn-kicker--xs zn-pw__summary-more">
            {t("weekly.summary.details")}
            <ChevronDown className="zn-disclosure__chevron" />
          </span>
        </span>
      </summary>
      <div className="zn-disclosure__panel">
        <WeekSummaryBar stats={stats} slots={slots} targetVolumeH={targetVolumeH} />
      </div>
    </details>
  );
}
