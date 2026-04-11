import { useState, useEffect, useMemo, memo } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { computePlanStats, computeEnhancedPlanAnalysis } from "@/lib/planStats";
import { PHASE_META } from "@/types/plan";
import type { TrainingPlan } from "@/types/plan";
import type { EnhancedPlanAnalysis } from "@/lib/planStats";
import { getPlanCompletionStats } from "@/lib/planGenerator/adapt";
import {
  Calendar,
  Clock,
  Route,
  Star,
  TrendingUp,
  Mountain,
  Timer,
  Heart,
  Loader2,
  ChevronDown,
} from "@/components/icons";
import { SESSION_TYPE_LABELS } from "@/lib/labels";

// ── Constants ────────────────────────────────────────────────────────

const SESSION_TYPE_COLORS: Record<string, string> = {
  endurance: "bg-blue-400",
  long_run: "bg-blue-600",
  tempo: "bg-yellow-400",
  threshold: "bg-orange-400",
  vo2max: "bg-red-500",
  speed: "bg-red-400",
  fartlek: "bg-purple-400",
  hills: "bg-green-500",
  race_specific: "bg-amber-500",
  recovery: "bg-slate-300 dark:bg-slate-600",
  strength: "bg-indigo-400",
  cycling: "bg-cyan-400",
  swimming: "bg-teal-400",
  yoga: "bg-pink-300",
  cross_training: "bg-gray-400",
};

const ZONE_COLORS: Record<string, string> = {
  Z1: "#94a3b8",
  Z2: "#22c55e",
  Z3: "#eab308",
  Z4: "#f97316",
  Z5: "#ef4444",
  Z6: "#7c3aed",
};

const TARGET_LABELS: Record<string, Record<string, string>> = {
  aerobic_base: { fr: "Base a\u00e9robie", en: "Aerobic base" },
  aerobic_power: { fr: "Puissance a\u00e9robie", en: "Aerobic power" },
  aerobic_threshold: { fr: "Seuil a\u00e9robie", en: "Aerobic threshold" },
  lactate_threshold: { fr: "Seuil lactique", en: "Lactate threshold" },
  lactate_tolerance: { fr: "Tol\u00e9rance lactique", en: "Lactate tolerance" },
  vo2max: { fr: "VO2max", en: "VO2max" },
  speed: { fr: "Vitesse", en: "Speed" },
  strength: { fr: "Force", en: "Strength" },
  mixed: { fr: "Mixte", en: "Mixed" },
  neuromuscular: { fr: "Neuromusculaire", en: "Neuromuscular" },
  race_specific: { fr: "Allure course", en: "Race specific" },
};

// ── Helpers ──────────────────────────────────────────────────────────

function formatMinutes(min: number): string {
  if (min < 60) return `${Math.round(min)}min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

// ── Props ────────────────────────────────────────────────────────────

interface PlanStatsSectionProps {
  plan: TrainingPlan;
  currentWeek?: number;
  isEn: boolean;
}

// ── Component ────────────────────────────────────────────────────────

export const PlanStatsSection = memo(function PlanStatsSection({ plan, currentWeek, isEn }: PlanStatsSectionProps) {
  const { t } = useTranslation("plan");
  const stats = useMemo(() => computePlanStats(plan), [plan]);
  const [analysis, setAnalysis] = useState<EnhancedPlanAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setAnalysisLoading(true);
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
      km: w.targetKm ?? 0,
      phase: w.phase,
      isRecovery: w.isRecoveryWeek,
    }));
  }, [plan.weeks]);
  const maxWeeklyKm = Math.max(...weeklyKmData.map(w => w.km), 1);

  // Current week data
  const currentWeekData = useMemo(() => {
    if (!currentWeek) return null;
    const week = plan.weeks.find(w => w.weekNumber === currentWeek);
    if (!week) return null;
    const keySession = week.sessions.find(s => s.isKeySession);
    const longRun = week.sessions.find(s => s.sessionType === "long_run");
    return { week, keySession, longRun };
  }, [plan.weeks, currentWeek]);

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

  return (
    <Card>
      {/* Accordion header */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className={cn(
          "w-full flex items-center justify-between p-4 sm:px-6 transition-colors",
          "hover:bg-accent/50",
          isOpen && "border-b",
        )}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">
            {t("stats.title")}
          </h2>
          {/* Summary badges when collapsed */}
          {!isOpen && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">
                {stats.totalSessions} {t("stats.sessions").toLowerCase()}
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">
                {Math.round(stats.totalDurationMin / 60)}h
              </span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">
                ~{Math.round(stats.totalEstimatedKm)} km
              </span>
            </div>
          )}
        </div>
        <ChevronDown
          className={cn(
            "size-5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {/* Accordion content */}
      {isOpen && (
      <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 space-y-6">

        {/* ── Section 1: Stats Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={Calendar}
            value={String(stats.totalSessions)}
            label={t("stats.sessions")}
          />
          <StatCard
            icon={Clock}
            value={`${Math.round(stats.totalDurationMin / 60)}h`}
            label="Total"
          />
          <StatCard
            icon={Route}
            value={`${Math.round(stats.totalEstimatedKm)} km`}
            label={t("stats.estKm")}
          />
          <StatCard
            icon={Star}
            value={String(stats.keySessionCount)}
            label={t("stats.keySessions")}
          />
          <StatCard
            icon={TrendingUp}
            value={formatMinutes(stats.avgDurationPerWeekMin)}
            label={t("stats.avgWeek")}
          />
          <StatCard
            icon={Mountain}
            value={`S${stats.peakVolumeWeek}`}
            sublabel={formatMinutes(stats.peakVolumeMin)}
            label={t("stats.peakWeek")}
          />
          <StatCard
            icon={Timer}
            value={formatMinutes(stats.longestSessionMin)}
            label={t("stats.longestSession")}
          />
          <StatCard
            icon={Heart}
            value={String(stats.recoveryWeekCount)}
            label={t("stats.recoveryWeeks")}
          />
        </div>

        {/* ── Race time prediction ─────────────────────────────────── */}
        {plan.raceTimePrediction && (
          <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Timer className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {t("stats.predictedTime")}
              </p>
              <p className="text-xl font-bold text-primary">{plan.raceTimePrediction}</p>
            </div>
          </div>
        )}

        {/* ── Current week summary ────────────────────────────────── */}
        {currentWeekData && (
          <div className="rounded-lg bg-secondary/50 border border-border/50 p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                {t("stats.thisWeek")}
              </h3>
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                PHASE_META[currentWeekData.week.phase]?.color, "text-white"
              )}>
                S{currentWeekData.week.weekNumber} · {isEn ? PHASE_META[currentWeekData.week.phase]?.labelEn : PHASE_META[currentWeekData.week.phase]?.label}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {currentWeekData.week.targetKm && currentWeekData.week.targetKm > 0 && (
                <span className="flex items-center gap-1.5">
                  <Route className="size-3.5 text-muted-foreground" />
                  <span className="font-medium">~{currentWeekData.week.targetKm} km</span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-muted-foreground" />
                <span>{currentWeekData.week.sessions.length} {t("stats.sessionsLower")}</span>
              </span>
              {currentWeekData.longRun && currentWeekData.week.targetLongRunKm && (
                <span className="flex items-center gap-1.5">
                  <TrendingUp className="size-3.5 text-muted-foreground" />
                  <span>{t("stats.longRun")} {currentWeekData.week.targetLongRunKm} km</span>
                </span>
              )}
              {currentWeekData.keySession && (
                <span className="flex items-center gap-1.5">
                  <Star className="size-3.5 text-yellow-500" />
                  <span className="capitalize">{currentWeekData.keySession.sessionType.replace("_", " ")}</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* ── Section 2: Weekly km Chart ───────────────────────────── */}
        {weeklyKmData.some(w => w.km > 0) && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              {t("stats.weeklyKm")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("stats.weeklyKmDesc")}
            </p>
            <div className="flex items-end gap-[2px] h-28">
              {weeklyKmData.map((week) => {
                const heightPct = maxWeeklyKm > 0 ? (week.km / maxWeeklyKm) * 100 : 0;
                const phaseColor = PHASE_META[week.phase]?.color || "bg-gray-400";
                const isCurrent = currentWeek === week.weekNumber;
                return (
                  <div key={week.weekNumber} className="flex-1 flex flex-col items-center justify-end h-full relative">
                    <div
                      className={cn(phaseColor, week.isRecovery && "opacity-50", "w-full rounded-t-sm min-h-[2px]")}
                      style={{ height: `${heightPct}%` }}
                      title={`S${week.weekNumber}: ${week.km}km`}
                    />
                    {isCurrent && (
                      <div className="absolute -bottom-4 size-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex gap-[2px]">
              {weeklyKmData.map((week, i) => (
                <div
                  key={week.weekNumber}
                  className={cn(
                    "flex-1 text-center text-[9px] text-muted-foreground",
                    i % 2 !== 0 && weeklyKmData.length > 10 && "hidden sm:block",
                  )}
                >
                  {week.km > 0 ? week.km : ""}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Section 2b: Weekly Volume (minutes) Chart ───────────── */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            {t("stats.weeklyVolume")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("stats.weeklyVolumeDesc")}
          </p>
          <div className="flex items-end gap-[2px] h-32">
            {stats.weeklyVolumes.map((week) => {
              const heightPercent =
                maxVolume > 0 ? (week.durationMin / maxVolume) * 100 : 0;
              const phaseColor =
                PHASE_META[week.phase]?.color || "bg-gray-400";
              const isCurrentWeek = currentWeek === week.weekNumber;
              return (
                <div
                  key={week.weekNumber}
                  className="flex-1 flex flex-col items-center justify-end h-full relative"
                >
                  <div
                    className={cn(
                      phaseColor,
                      week.isRecovery && "opacity-50",
                      "w-full rounded-t-sm min-h-[2px]",
                    )}
                    style={{ height: `${heightPercent}%` }}
                    title={`S${week.weekNumber}: ${formatMinutes(week.durationMin)}`}
                  />
                  {isCurrentWeek && (
                    <div className="absolute -bottom-4 size-1.5 rounded-full bg-primary" />
                  )}
                </div>
              );
            })}
          </div>
          {/* Week numbers */}
          <div className="flex gap-[2px]">
            {stats.weeklyVolumes.map((week, i) => (
              <div
                key={week.weekNumber}
                className={cn(
                  "flex-1 text-center text-[9px] text-muted-foreground",
                  i % 2 !== 0 &&
                    stats.weeklyVolumes.length > 10 &&
                    "hidden sm:block",
                )}
              >
                {week.weekNumber}
              </div>
            ))}
          </div>
          {/* Phase legend */}
          <div className="flex flex-wrap gap-3 mt-1">
            {Object.entries(PHASE_META)
              .filter(([key]) => key !== "recovery")
              .map(([key, meta]) => (
                <div
                  key={key}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <div className={cn("size-2.5 rounded-full", meta.color)} />
                  <span>{isEn ? meta.labelEn : meta.label}</span>
                </div>
              ))}
          </div>
        </div>

        {/* ── Section 3: Session Type Distribution ──────────────────── */}
        {sortedTypes.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              {t("stats.sessionTypes")}
            </h3>
            {/* Stacked bar */}
            <div className="flex rounded-full overflow-hidden h-3">
              {sortedTypes.map(([type, count]) => (
                <div
                  key={type}
                  className={cn(SESSION_TYPE_COLORS[type] || "bg-gray-300")}
                  style={{
                    width: `${(count / stats.totalSessions) * 100}%`,
                  }}
                  title={`${SESSION_TYPE_LABELS[type]?.[isEn ? "en" : "fr"] || type}: ${count}`}
                />
              ))}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {sortedTypes.map(([type, count]) => (
                <div
                  key={type}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <div
                    className={cn(
                      "size-2.5 rounded-full",
                      SESSION_TYPE_COLORS[type] || "bg-gray-300",
                    )}
                  />
                  <span>
                    {SESSION_TYPE_LABELS[type]?.[isEn ? "en" : "fr"] || type} (
                    {count})
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Section 4: Zone Distribution + Target System ──────────── */}
        {analysisLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Zone distribution */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">
                  {t("stats.zoneDistribution")}
                </h3>
                <div className="space-y-1.5">
                  {analysis.zoneDistribution.map(({ zone, minutes, percent }) => (
                    <div key={zone} className="flex items-center gap-2">
                      <span className="text-xs font-medium w-6">{zone}</span>
                      <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${percent}%`, backgroundColor: ZONE_COLORS[zone] }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-20 text-right">
                        {percent}% ({formatMinutes(minutes)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target system */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">
                  {t("stats.targetSystems")}
                </h3>
                <div className="space-y-1.5">
                  {analysis.targetSystemBreakdown.map(
                    ({ system, count, percent }) => (
                      <div key={system} className="flex items-center gap-2">
                        <span className="text-xs w-28 truncate">
                          {TARGET_LABELS[system]?.[isEn ? "en" : "fr"] || system}
                        </span>
                        <div className="flex-1 h-2.5 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary/70"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          {percent}% ({count})
                        </span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          )
        )}
        {/* ── 80/20 Intensity Distribution per week ──────────────── */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            {t("stats.easyHardSplit")}
          </h3>
          <div className="flex items-end gap-[2px] h-16">
            {easyHardPerWeek.map((week) => {
              const isCurrent = currentWeek === week.weekNumber;
              return (
                <div
                  key={week.weekNumber}
                  className="flex-1 flex flex-col h-full rounded-t-sm overflow-hidden relative"
                  title={`S${week.weekNumber}: ${week.easyPct}% easy / ${week.hardPct}% hard`}
                >
                  <div
                    className="bg-red-400/70 w-full"
                    style={{ height: `${week.hardPct}%` }}
                  />
                  <div
                    className="bg-green-400/50 w-full flex-1"
                  />
                  {isCurrent && (
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-primary" />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-green-400/50" />
              {t("stats.easyZ12")}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-red-400/70" />
              {t("stats.hardZ3")}
            </span>
            <span className="text-muted-foreground/50">
              {t("stats.target8020")}
            </span>
          </div>
        </div>

        {/* ── Training load per week ──────────────────────────────── */}
        {weeklyLoads.some(w => w.load > 0) && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              {t("stats.trainingLoad")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t("stats.trainingLoadDesc")}
            </p>
            <div className="flex items-end gap-[2px] h-24">
              {weeklyLoads.map((week) => {
                const heightPct = maxLoad > 0 ? (week.load / maxLoad) * 100 : 0;
                const phaseColor = PHASE_META[week.phase]?.color || "bg-gray-400";
                const isCurrent = currentWeek === week.weekNumber;
                return (
                  <div key={week.weekNumber} className="flex-1 flex flex-col items-center justify-end h-full relative">
                    <div
                      className={cn(phaseColor, "w-full rounded-t-sm min-h-[2px]")}
                      style={{ height: `${heightPct}%` }}
                      title={`S${week.weekNumber}: ${week.load}`}
                    />
                    {isCurrent && (
                      <div className="absolute -bottom-4 size-1.5 rounded-full bg-primary" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Section 5: Long Run Progression (v2) ─────────────────── */}
        {plan.weeks.some(w => w.targetLongRunKm && w.targetLongRunKm > 0) && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">
              {t("stats.longRunProgression")}
            </h3>
            {(() => {
              const lrWeeks = plan.weeks
                .filter(w => w.targetLongRunKm && w.targetLongRunKm > 0)
                .map(w => ({ weekNumber: w.weekNumber, km: w.targetLongRunKm!, phase: w.phase }));
              const maxLr = Math.max(...lrWeeks.map(w => w.km), 1);
              return (
                <>
                  <div className="flex items-end gap-[2px] h-24">
                    {lrWeeks.map((w) => {
                      const heightPct = (w.km / maxLr) * 100;
                      const phaseColor = PHASE_META[w.phase]?.color || "bg-gray-400";
                      return (
                        <div
                          key={w.weekNumber}
                          className="flex-1 flex flex-col items-center justify-end h-full"
                        >
                          <div
                            className={cn(phaseColor, "w-full rounded-t-sm min-h-[2px]")}
                            style={{ height: `${heightPct}%` }}
                            title={`S${w.weekNumber}: ${w.km}km`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-[2px]">
                    {lrWeeks.map((w, i) => (
                      <div
                        key={w.weekNumber}
                        className={cn(
                          "flex-1 text-center text-[9px] text-muted-foreground",
                          i % 2 !== 0 && lrWeeks.length > 10 && "hidden sm:block",
                        )}
                      >
                        {w.km}
                      </div>
                    ))}
                  </div>
                  {plan.peakLongRunKm && (
                    <p className="text-xs text-muted-foreground">
                      {t("stats.peak")}: <span className="font-medium text-foreground">{plan.peakLongRunKm} km</span>
                    </p>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* ── Section 6: Completion stats (v2) ─────────────────────── */}
        {(() => {
          const cs = getPlanCompletionStats(plan);
          if (cs.completed + cs.skipped === 0) return null;
          return (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                {t("stats.completion")}
              </h3>
              <div className="flex items-center gap-3">
                {/* Progress bar */}
                <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-green-500 transition-all"
                    style={{ width: `${(cs.completed / cs.totalSessions) * 100}%` }}
                  />
                  <div
                    className="h-full bg-muted-foreground/20 transition-all"
                    style={{ width: `${(cs.skipped / cs.totalSessions) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium tabular-nums shrink-0">
                  {Math.round(cs.completionRate * 100)}%
                </span>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-green-500" />
                  {cs.completed} {t("stats.done")}
                </span>
                <span className="flex items-center gap-1">
                  <span className="size-2 rounded-full bg-muted-foreground/20" />
                  {cs.skipped} {t("stats.skipped")}
                </span>
                <span>{cs.planned} {t("stats.remaining")}</span>
                {cs.avgRpe !== null && (
                  <span>{t("stats.rpeAvg")}: {cs.avgRpe.toFixed(1)}</span>
                )}
              </div>
            </div>
          );
        })()}

        {/* ── Section 7: Plan metadata (v2) ────────────────────────── */}
        {(plan.peakWeeklyKm || plan.version) && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground pt-2 border-t">
            {plan.peakWeeklyKm && (
              <span>{t("stats.peakVolume")}: <span className="font-medium text-foreground">{plan.peakWeeklyKm} km/{t("stats.wk")}</span></span>
            )}
            {plan.peakLongRunKm && (
              <span>{t("stats.peakLongRun")}: <span className="font-medium text-foreground">{plan.peakLongRunKm} km</span></span>
            )}
            {plan.version && (
              <span className="opacity-50">v{plan.version}</span>
            )}
          </div>
        )}
      </CardContent>
      )}
    </Card>
  );
});

// ── StatCard sub-component ───────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  sublabel,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  sublabel?: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="size-4 text-primary" />
      </div>
      <div>
        <p className="text-lg font-bold leading-none">
          {value}
          {sublabel && (
            <span className="text-xs font-normal text-muted-foreground ml-1">
              {sublabel}
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}
