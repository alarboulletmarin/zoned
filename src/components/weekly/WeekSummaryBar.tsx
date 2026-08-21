import { useTranslation } from "react-i18next";
import { AlertTriangle } from "@/components/icons";
import { PolarizationGauge, WeekRhythmChart } from "@/components/weekly";
import { cn } from "@/lib/utils";
import type { WeekStats } from "@/lib/weekStats";
import type { WeekSlot } from "@/types/week";

/**
 * Compact, full-width summary strip shown above the week board (Epic #83).
 * Mobile-first: a flex-wrap metric row (Séances · Volume/budget · TSS · dures)
 * with the 80/20 PolarizationGauge — the live proof the week is balanced — and
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
  /** Volume budget in hours — omit to show the raw volume without a budget. */
  targetVolumeH?: number;
  className?: string;
}) {
  const { t } = useTranslation("library");
  const overBudget = targetVolumeH != null && stats.totalHours > targetVolumeH;

  return (
    <div
      className={cn(
        "rounded-none border-2 bg-card p-3 sm:p-4",
        "grid gap-4 lg:grid-cols-[1fr_18rem] lg:items-center",
        className,
      )}
    >
      <div className="space-y-3">
        <div className="flex flex-wrap items-stretch gap-x-5 gap-y-2">
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
            // polarisation bar — so it gets a bar too, not just a number.
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
          <p className="flex items-center gap-1.5 border-l-2 border-poster-red pl-2 font-mono text-[11px] uppercase tracking-[0.06em] text-poster-red">
            <AlertTriangle className="size-3.5 shrink-0" />
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
  /** Achieved / target ratio — renders a thin fill under the value. */
  progress?: number;
}) {
  return (
    <div className="min-w-0">
      <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">{label}</div>
      <div
        className={cn(
          "font-mono text-lg tabular-nums",
          alert && "text-poster-red",
        )}
      >
        {value}
      </div>
      {progress != null && (
        <div className="mt-1 h-1.5 w-full min-w-16 overflow-hidden rounded-none bg-muted">
          <div
            className={cn(
              "h-full rounded-none transition-[width]",
              alert ? "bg-poster-red" : "bg-foreground",
            )}
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        </div>
      )}
    </div>
  );
}
