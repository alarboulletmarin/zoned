import type { CSSProperties } from "react";
import { useState, useEffect, useMemo, memo } from "react";
import { sessionColor } from "@/lib/sessionColors";
import { useTranslation } from "react-i18next";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { StatBlock } from "@/components/domain/StatBlock";
import { ZoneScale } from "@/components/visualization/ZoneScale";
import { computePlanStats, computeEnhancedPlanAnalysis, computeWeekKm } from "@/lib/planStats";
import { PHASE_META } from "@/types/plan";
import type { TrainingPhase } from "@/types";
import type { TrainingPlan } from "@/types/plan";
import type { EnhancedPlanAnalysis } from "@/lib/planStats";
import { getPlanCompletionStats } from "@/lib/planGenerator/adapt";
import { ChevronDown } from "@/components/icons";
import { SESSION_TYPE_LABELS } from "@/lib/labels";
import { usePickLang, usePickLocale } from "@/lib/i18n-utils";

// ── Helpers ──────────────────────────────────────────────────────────

function formatMinutes(min: number): string {
  if (min < 60) return `${Math.round(min)}min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

// ── Bar chart ────────────────────────────────────────────────────────

interface ChartBar {
  key: number;
  /** 0-100, the share of the tallest bar. */
  pct: number;
  phase?: TrainingPhase;
  recovery?: boolean;
  title: string;
  /** Printed under the column. Omitted on every bar = no tick row. */
  tick?: string;
}

/**
 * One column per week: width is the week, height is the figure, ink density is
 * the phase, and the hatch is a recovery week. The current week is marked by a
 * vermillon rule under its column rather than by a floating dot.
 */
function PhaseChart({
  bars,
  currentKey,
  height,
}: {
  bars: ChartBar[];
  currentKey?: number;
  height?: "sm" | "md" | "xl";
}) {
  const dense = bars.length > 10;
  const hasTicks = bars.some((bar) => bar.tick != null);

  return (
    <div className="zn-pchart" data-h={height}>
      <div className="zn-pchart__cols">
        {bars.map((bar) => (
          <div
            key={bar.key}
            className="zn-pchart__col"
            data-current={currentKey === bar.key || undefined}
          >
            <span
              className="zn-pchart__bar"
              data-phase={bar.phase}
              data-recovery={bar.recovery || undefined}
              style={{ "--zn-bar-h": `${bar.pct}%` } as CSSProperties}
              title={bar.title}
            />
          </div>
        ))}
      </div>
      {hasTicks && (
        <div className="zn-pchart__ticks">
          {bars.map((bar, i) => (
            <span
              key={bar.key}
              className="zn-pchart__tick"
              data-dense={(dense && i % 2 !== 0) || undefined}
            >
              {bar.tick}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Props ────────────────────────────────────────────────────────────

interface PlanStatsSectionProps {
  plan: TrainingPlan;
  currentWeek?: number;
  /** Sous un onglet, la divulgation est déjà faite : ni bascule, ni titre. */
  collapsible?: boolean;
}

// ── Component ────────────────────────────────────────────────────────

export const PlanStatsSection = memo(function PlanStatsSection({ plan, currentWeek, collapsible = true }: PlanStatsSectionProps) {
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  const pickLocale = usePickLocale();
  const stats = useMemo(() => computePlanStats(plan), [plan]);
  const [analysis, setAnalysis] = useState<EnhancedPlanAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [analysisFailed, setAnalysisFailed] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setAnalysisLoading(true);
    setAnalysisFailed(false);
    computeEnhancedPlanAnalysis(plan)
      .then((result) => {
        if (!cancelled) {
          setAnalysis(result);
          setAnalysisLoading(false);
        }
      })
      .catch((err) => {
        console.error("[PlanStatsSection] Failed to compute enhanced analysis:", err);
        if (!cancelled) {
          setAnalysis(null);
          setAnalysisFailed(true);
          setAnalysisLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [plan]);

  const sortedTypes = useMemo(
    () =>
      Object.entries(stats.sessionsByType).sort(
        ([, a], [, b]) => b - a,
      ),
    [stats.sessionsByType],
  );

  const maxVolume = useMemo(
    () => Math.max(...stats.weeklyVolumes.map((w) => w.durationMin), 0),
    [stats.weeklyVolumes],
  );

  // ── v2 derived data ────────────────────────────────────────────

  // Weekly km data
  const weeklyKmData = useMemo(() => {
    return plan.weeks.map(w => ({
      weekNumber: w.weekNumber,
      km: computeWeekKm(w),
      phase: w.phase,
      isRecovery: w.isRecoveryWeek,
    }));
  }, [plan.weeks]);
  const maxWeeklyKm = Math.max(...weeklyKmData.map(w => w.km), 1);

  // 80/20 per week (running sessions only)
  const NON_RUNNING_TYPES = new Set(["strength", "cycling", "swimming", "yoga", "rest", "rest_day", "cross_training"]);
  const easyHardPerWeek = useMemo(() => {
    const easyTypes = new Set(["endurance", "recovery", "long_run"]);
    return plan.weeks.map(w => {
      const runningSessions = w.sessions.filter(
        s => !NON_RUNNING_TYPES.has(s.sessionType) && !s.workoutId.startsWith("STR-") && !s.workoutId.startsWith("__activity_")
      );
      const total = runningSessions.length;
      if (total === 0) return { weekNumber: w.weekNumber, easyPct: 100, hardPct: 0 };
      const easy = runningSessions.filter(s => easyTypes.has(s.sessionType)).length;
      return {
        weekNumber: w.weekNumber,
        easyPct: Math.round((easy / total) * 100),
        hardPct: Math.round(((total - easy) / total) * 100),
      };
    });
  }, [plan.weeks]);

  // Weekly load scores
  const weeklyLoads = useMemo(() => {
    return plan.weeks.map(w => ({
      weekNumber: w.weekNumber,
      load: w.weeklyLoadScore ?? 0,
      phase: w.phase,
    }));
  }, [plan.weeks]);
  const maxLoad = Math.max(...weeklyLoads.map(w => w.load), 1);

  const longRunWeeks = useMemo(
    () =>
      plan.weeks
        .filter(w => w.targetLongRunKm && w.targetLongRunKm > 0)
        .map(w => ({ weekNumber: w.weekNumber, km: w.targetLongRunKm!, phase: w.phase })),
    [plan.weeks],
  );
  const maxLongRun = Math.max(...longRunWeeks.map(w => w.km), 1);

  const completion = useMemo(() => getPlanCompletionStats(plan), [plan]);

  return (
    <Card size="flush">
      {/* Accordion header — absent sous un onglet déjà nommé « Statistiques » :
          une section ne porte qu'un titre. */}
      {collapsible && (
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className="zn-pstats__toggle"
      >
        <h2 className="zn-pstats__heading">{t("stats.title")}</h2>

        {/* Summary facts while the section is shut */}
        {!isOpen && (
          <span className="zn-pstats__summary zn-mono">
            <span>{stats.totalSessions} {t("stats.sessions").toLowerCase()}</span>
            <span>{Math.round(stats.totalDurationMin / 60)}h</span>
            <span>~{Math.round(stats.totalEstimatedKm)} km</span>
          </span>
        )}

        <ChevronDown size={18} className="zn-pstats__chev" />
      </button>
      )}

      {/* Accordion content */}
      {(isOpen || !collapsible) && (
      <CardContent className="zn-pstats__body">

        {/* ── Section 1: Stats Grid ─────────────────────────────────── */}
        <div className="zn-grid zn-pstats__grid">
          <StatBlock
            tone="card"
            size="sm"
            value={String(stats.totalSessions)}
            label={t("stats.sessions")}
          />
          <StatBlock
            tone="card"
            size="sm"
            value={`${Math.round(stats.totalDurationMin / 60)}h`}
            label={t("stats.total")}
          />
          <StatBlock
            tone="card"
            size="sm"
            value={`${Math.round(stats.totalEstimatedKm)} km`}
            label={t("stats.estKm")}
          />
          <StatBlock
            tone="card"
            size="sm"
            value={String(stats.keySessionCount)}
            label={t("stats.keySessions")}
          />
          <StatBlock
            tone="card"
            size="sm"
            value={formatMinutes(stats.avgDurationPerWeekMin)}
            label={t("stats.avgWeek")}
          />
          <StatBlock
            tone="card"
            size="sm"
            value={`S${stats.peakVolumeWeek}`}
            label={t("stats.peakWeek")}
            footnote={formatMinutes(stats.peakVolumeMin)}
          />
          <StatBlock
            tone="card"
            size="sm"
            value={formatMinutes(stats.longestSessionMin)}
            label={t("stats.longestSession")}
          />
          <StatBlock
            tone="card"
            size="sm"
            value={String(stats.recoveryWeekCount)}
            label={t("stats.recoveryWeeks")}
          />
        </div>

        {/* ── Race time prediction ─────────────────────────────────── */}
        {plan.raceTimePrediction && (
          <StatBlock
            tone="ink"
            value={plan.raceTimePrediction}
            label={t("stats.predictedTime")}
          />
        )}

        {/* ── Section 2: Weekly km Chart ───────────────────────────── */}
        {weeklyKmData.some(w => w.km > 0) && (
          <div className="zn-pstats__block">
            <span className="zn-pstats__title">{t("stats.weeklyKm")}</span>
            <p className="zn-pstats__note">{t("stats.weeklyKmDesc")}</p>
            <PhaseChart
              currentKey={currentWeek}
              bars={weeklyKmData.map((week) => ({
                key: week.weekNumber,
                pct: (week.km / maxWeeklyKm) * 100,
                phase: week.phase,
                recovery: week.isRecovery,
                title: `S${week.weekNumber} · ${Math.round(week.km)} km`,
                tick: week.km > 0 ? String(Math.round(week.km)) : "",
              }))}
            />
          </div>
        )}

        {/* ── Section 2b: Weekly Volume (minutes) Chart ───────────── */}
        <div className="zn-pstats__block">
          <span className="zn-pstats__title">{t("stats.weeklyVolume")}</span>
          <p className="zn-pstats__note">{t("stats.weeklyVolumeDesc")}</p>
          <PhaseChart
            height="xl"
            currentKey={currentWeek}
            bars={stats.weeklyVolumes.map((week) => ({
              key: week.weekNumber,
              pct: maxVolume > 0 ? (week.durationMin / maxVolume) * 100 : 0,
              phase: week.phase,
              recovery: week.isRecovery,
              title: `S${week.weekNumber} · ${formatMinutes(week.durationMin)}`,
              tick: String(week.weekNumber),
            }))}
          />

          {/* Phase legend */}
          <div className="zn-pstats__legend">
            {Object.entries(PHASE_META)
              .filter(([key]) => key !== "recovery")
              .map(([key, meta]) => (
                <span key={key} className="zn-pstats__legend-item">
                  <span className="zn-pswatch" data-phase={key} aria-hidden="true" />
                  {pick(meta, "label")}
                </span>
              ))}
            <span className="zn-pstats__legend-item">
              <span className="zn-pswatch" data-hatch="true" aria-hidden="true" />
              {t("stats.recoveryWeeks")}
            </span>
          </div>
        </div>

        {/* ── Section 3: Session Type Distribution ──────────────────── */}
        {sortedTypes.length > 0 && (
          <div className="zn-pstats__block">
            <span className="zn-pstats__title">{t("stats.sessionTypes")}</span>

            {/* Stacked bar */}
            <div className="zn-pstats__mix">
              {sortedTypes.map(([type, count]) => (
                <span
                  key={type}
                  className="zn-pstats__mix-part"
                  style={{
                    "--zn-part-w": `${(count / stats.totalSessions) * 100}%`,
                    "--zn-part-fill": sessionColor(type),
                  } as CSSProperties}
                  title={`${pickLocale(SESSION_TYPE_LABELS[type], type)}: ${count}`}
                />
              ))}
            </div>

            {/* Legend */}
            <div className="zn-pstats__legend">
              {sortedTypes.map(([type, count]) => (
                <span key={type} className="zn-pstats__legend-item">
                  <span
                    className="zn-pswatch"
                    aria-hidden="true"
                    style={{ "--zn-swatch": sessionColor(type) } as CSSProperties}
                  />
                  {pickLocale(SESSION_TYPE_LABELS[type], type)} ({count})
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Section 4: Zone Distribution + Target System ──────────── */}
        {analysisLoading ? (
          <div className="zn-pstats__wait">
            <Spinner />
          </div>
        ) : analysisFailed ? (
          <Alert kind="error" title={t("stats.analysisFailed")}>
            {t("stats.analysisFailedBody")}
          </Alert>
        ) : (
          analysis && (
            <div className="zn-pstats__zones">
              {/* Zone distribution */}
              <div className="zn-pstats__block">
                <span className="zn-pstats__title">{t("stats.zoneDistribution")}</span>
                <div className="zn-pbars">
                  {analysis.zoneDistribution.map(({ zone, minutes, percent }) => (
                    <div key={zone} className="zn-pbars__row">
                      <span className="zn-pbars__code">{zone}</span>
                      <span className="zn-pbars__track">
                        <span
                          className="zn-pbars__fill"
                          data-zone={zone.slice(1)}
                          style={{ "--zn-fill-w": `${percent}%` } as CSSProperties}
                        />
                      </span>
                      <span className="zn-pbars__value">
                        {percent}% ({formatMinutes(minutes)})
                      </span>
                    </div>
                  ))}
                </div>
                <ZoneScale layout="column" showTitle={false} />
              </div>

              {/* Target system */}
              <div className="zn-pstats__block">
                <span className="zn-pstats__title">{t("stats.targetSystems")}</span>
                <div className="zn-pbars">
                  {analysis.targetSystemBreakdown.map(({ system, count, percent }) => (
                    <div key={system} className="zn-pbars__row">
                      <span className="zn-pbars__name zn-truncate">
                        {t(`targetSystems.${system}`, { defaultValue: system })}
                      </span>
                      <span className="zn-pbars__track">
                        <span
                          className="zn-pbars__fill"
                          style={{ "--zn-fill-w": `${percent}%` } as CSSProperties}
                        />
                      </span>
                      <span className="zn-pbars__value">
                        {percent}% ({count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        )}

        {/* ── 80/20 Intensity Distribution per week ──────────────── */}
        <div className="zn-pstats__block">
          <span className="zn-pstats__title">{t("stats.easyHardSplit")}</span>
          <div className="zn-pchart" data-h="sm">
            <div className="zn-pchart__cols">
              {easyHardPerWeek.map((week) => (
                <div
                  key={week.weekNumber}
                  className="zn-pchart__col"
                  data-current={currentWeek === week.weekNumber || undefined}
                >
                  <span
                    className="zn-psplit__col"
                    style={{ "--zn-hard-h": `${week.hardPct}%` } as CSSProperties}
                    title={`S${week.weekNumber} · ${week.easyPct}% / ${week.hardPct}%`}
                  >
                    <span className="zn-psplit__hard" />
                    <span className="zn-psplit__easy" />
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="zn-pstats__legend">
            <span className="zn-pstats__legend-item">
              <span
                className="zn-pswatch"
                aria-hidden="true"
                style={{ "--zn-swatch": "var(--zone-2)" } as CSSProperties}
              />
              {t("stats.easyZ12")}
            </span>
            <span className="zn-pstats__legend-item">
              <span
                className="zn-pswatch"
                aria-hidden="true"
                style={{ "--zn-swatch": "var(--zone-5)" } as CSSProperties}
              />
              {t("stats.hardZ3")}
            </span>
            <span className="zn-faint">{t("stats.target8020")}</span>
          </div>
        </div>

        {/* ── Training load per week ──────────────────────────────── */}
        {weeklyLoads.some(w => w.load > 0) && (
          <div className="zn-pstats__block">
            <span className="zn-pstats__title">{t("stats.trainingLoad")}</span>
            <p className="zn-pstats__note">{t("stats.trainingLoadDesc")}</p>
            <PhaseChart
              height="md"
              currentKey={currentWeek}
              bars={weeklyLoads.map((week) => ({
                key: week.weekNumber,
                pct: (week.load / maxLoad) * 100,
                phase: week.phase,
                title: `S${week.weekNumber} · ${week.load}`,
              }))}
            />
          </div>
        )}

        {/* ── Section 5: Long Run Progression (v2) ─────────────────── */}
        {longRunWeeks.length > 0 && (
          <div className="zn-pstats__block">
            <span className="zn-pstats__title">{t("stats.longRunProgression")}</span>
            <PhaseChart
              height="md"
              bars={longRunWeeks.map((week) => ({
                key: week.weekNumber,
                pct: (week.km / maxLongRun) * 100,
                phase: week.phase,
                title: `S${week.weekNumber} · ${week.km} km`,
                tick: String(week.km),
              }))}
            />
            {plan.peakLongRunKm && (
              <p className="zn-pstats__note">
                {t("stats.peak")}: {plan.peakLongRunKm} km
              </p>
            )}
          </div>
        )}

        {/* ── Section 6: Completion stats (v2) ─────────────────────── */}
        {completion.completed + completion.skipped > 0 && (
          <div className="zn-pstats__block">
            <span className="zn-pstats__title">{t("stats.completion")}</span>
            <div className="zn-row" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
              <span className="zn-pstats__progress">
                <span
                  className="zn-pstats__progress-done"
                  style={{
                    "--zn-done-w": `${(completion.completed / completion.totalSessions) * 100}%`,
                  } as CSSProperties}
                />
                <span
                  className="zn-pstats__progress-skipped"
                  style={{
                    "--zn-skipped-w": `${(completion.skipped / completion.totalSessions) * 100}%`,
                  } as CSSProperties}
                />
              </span>
              <span className="zn-mono zn-fixed">
                {Math.round(completion.completionRate * 100)}%
              </span>
            </div>
            <div className="zn-pstats__facts">
              <span>{completion.completed} {t("stats.done")}</span>
              <span>{completion.skipped} {t("stats.skipped")}</span>
              <span>{completion.planned} {t("stats.remaining")}</span>
              {completion.avgRpe !== null && (
                <span>{t("stats.rpeAvg")} {completion.avgRpe.toFixed(1)}</span>
              )}
            </div>
          </div>
        )}

        {/* ── Section 7: Plan metadata (v2) ────────────────────────── */}
        {(plan.peakWeeklyKm || plan.version) && (
          <div className="zn-pstats__meta">
            {plan.peakWeeklyKm && (
              <span>{t("stats.peakVolume")} <b>{plan.peakWeeklyKm} km/{t("stats.wk")}</b></span>
            )}
            {plan.peakLongRunKm && (
              <span>{t("stats.peakLongRun")} <b>{plan.peakLongRunKm} km</b></span>
            )}
            {plan.version && <span>v{plan.version}</span>}
          </div>
        )}
      </CardContent>
      )}
    </Card>
  );
});
