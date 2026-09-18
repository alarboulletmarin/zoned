import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle } from "@/components/icons";
import { PolarizationGauge, WeekRhythmChart } from "@/components/weekly";
import { cn } from "@/lib/utils";
import type { WeekStats } from "@/lib/weekStats";
import type { WeekSlot } from "@/types/week";

const BUDGET_MIN = 0.5;
const BUDGET_MAX = 30;

/**
 * Compact, full-width summary strip shown above the week board (Epic #83).
 * Mobile-first: a flex-wrap metric row (Séances · Volume/budget · TSS · dures)
 * with the 80/20 PolarizationGauge, the live proof the week is balanced, and
 * the WeekRhythmChart (shape of the week at a glance). Metrics + gauge stack
 * above the rhythm on mobile and sit side-by-side on desktop to stay compact.
 *
 * The budget is the week's own, and optional: without one the volume is
 * printed alone, with no bar and no warning, since a week built by hand
 * has nothing to be measured against. With `onTargetVolumeChange` the bar
 * carries the one field that sets or clears it, so the budget is reached
 * from the summary that shows it and not from the generator's form.
 */
export function WeekSummaryBar({
  stats,
  slots,
  targetVolumeH,
  onTargetVolumeChange,
  className,
}: {
  stats: WeekStats;
  slots: WeekSlot[];
  /** Volume budget in hours, omit to show the raw volume without a budget. */
  targetVolumeH?: number;
  /** Sets the week's budget, `undefined` clears it. Omit for a read-only bar. */
  onTargetVolumeChange?: (hours: number | undefined) => void;
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
          {onTargetVolumeChange && (
            <BudgetField value={targetVolumeH} onChange={onTargetVolumeChange} />
          )}
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

/**
 * The budget, in hours, as one narrow field among the metrics. Empty means
 * none: the field is cleared to drop the budget, and the change lands on
 * blur or Enter, never on every keystroke, so typing "6.5" does not save 6
 * on the way. The text is kept while editing so a half-typed value is not
 * rounded from under the finger.
 */
function BudgetField({
  value,
  onChange,
}: {
  value: number | undefined;
  onChange: (hours: number | undefined) => void;
}) {
  const { t } = useTranslation("library");
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (value != null ? String(value) : "");

  const commit = () => {
    if (draft === null) return;
    const raw = draft.trim().replace(",", ".");
    setDraft(null);
    if (raw === "") {
      if (value != null) onChange(undefined);
      return;
    }
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    // Half-hour steps between the floor and the cap.
    const next = Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, Math.round(n * 2) / 2));
    if (next !== value) onChange(next);
  };

  return (
    <label className="zn-wk-metric zn-wk-budget">
      <span className="zn-kicker">{t("weekly.summary.budget")}</span>
      <span className="zn-wk-budget__field">
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder={t("weekly.summary.budgetNone")}
          value={shown}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") setDraft(null);
          }}
          aria-describedby="zn-wk-budget-hint"
          className="zn-pfield zn-wk-budget__input"
        />
        <span className="zn-mono zn-muted">h</span>
      </span>
      <span id="zn-wk-budget-hint" className="zn-caption zn-wk-budget__hint">
        {t("weekly.summary.budgetHint")}
      </span>
    </label>
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
