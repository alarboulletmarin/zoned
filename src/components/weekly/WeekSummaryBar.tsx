import { useTranslation } from "react-i18next";
import { AlertTriangle } from "@/components/icons";
import { PolarizationGauge, WeekRhythmChart } from "@/components/weekly";
import { cn } from "@/lib/utils";
import type { WeekStats } from "@/lib/weekStats";
import type { WeekSlot } from "@/types/week";

/**
 * Compact, full-width summary strip shown above the week board (Epic #83).
 * Mobile-first: a flex-wrap metric row (Séances · Volume/budget · TSS · dures)
 * with the 80/20 PolarizationGauge, the live proof the week is balanced, and
 * the WeekRhythmChart (shape of the week at a glance). Metrics + gauge stack
 * above the rhythm on mobile and sit side-by-side on desktop to stay compact.
 */
export function WeekSummaryBar({
  stats,
  slots,
  targetVolumeH,
  className,
}: {
  stats: WeekStats;
  slots: WeekSlot[];
  /** Volume budget in hours, omit to show the raw volume without a budget. */
  targetVolumeH?: number;
  className?: string;
}) {
  const { t } = useTranslation("library");
  const overBudget = targetVolumeH != null && stats.totalHours > targetVolumeH;

  return (
    <div className={cn("zn-wk-summary", className)}>
      <div className="zn-wk-summary__main">
        <div className="zn-wk-summary__metrics">
          <Metric label={t("weekly.summary.sessions")} value={String(stats.sessions)} />
          <Metric
            label={t("weekly.summary.volume")}
            value={
              targetVolumeH != null
                ? `${stats.totalHours.toFixed(1)} / ${targetVolumeH} h`
                : `${stats.totalHours.toFixed(1)} h`
            }
            alert={overBudget}
            // Volume vs budget is an achieved-vs-target reading, like the
            // polarisation bar, so it gets a bar too, not just a number.
            progress={
              targetVolumeH != null
                ? stats.totalHours / targetVolumeH
                : undefined
            }
          />
          <Metric label={t("weekly.summary.load")} value={`${stats.totalTss} TSS`} />
          <Metric label={t("weekly.summary.hard")} value={String(stats.hardSessions)} />
        </div>

        {overBudget && (
          <p className="zn-wk-summary__warn">
            <AlertTriangle />
            {t("weekly.summary.overBudget", { target: targetVolumeH })}
          </p>
        )}

        {stats.polarised.zonedMinutes > 0 && (
          <PolarizationGauge polarised={stats.polarised} />
        )}
      </div>

      <WeekRhythmChart slots={slots} />
    </div>
  );
}

function Metric({
  label,
  value,
  alert,
  progress,
}: {
  label: string;
  value: string;
  alert?: boolean;
  /** Achieved / target ratio, renders a thin fill under the value. */
  progress?: number;
}) {
  return (
    <div className={cn("zn-wk-metric", alert && "zn-wk-metric--alert")}>
      <div className="zn-kicker">{label}</div>
      <div className="zn-wk-metric__value">{value}</div>
      {progress != null && (
        <div className="zn-wk-metric__track">
          <div
            className="zn-wk-metric__fill"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
      )}
    </div>
  );
}
