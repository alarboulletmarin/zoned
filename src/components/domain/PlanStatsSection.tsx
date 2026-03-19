import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { computePlanStats, computeEnhancedPlanAnalysis } from "@/lib/planStats";
import { PHASE_META } from "@/types/plan";
import type { TrainingPlan } from "@/types/plan";
import type { EnhancedPlanAnalysis } from "@/lib/planStats";
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
};

const SESSION_TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  recovery: { fr: "R\u00e9cup\u00e9ration", en: "Recovery" },
  endurance: { fr: "Endurance", en: "Endurance" },
  tempo: { fr: "Tempo", en: "Tempo" },
  threshold: { fr: "Seuil", en: "Threshold" },
  vo2max: { fr: "VO2max", en: "VO2max" },
  speed: { fr: "Vitesse", en: "Speed" },
  long_run: { fr: "Sortie longue", en: "Long Run" },
  hills: { fr: "C\u00f4tes", en: "Hills" },
  fartlek: { fr: "Fartlek", en: "Fartlek" },
  race_specific: { fr: "Allure course", en: "Race Specific" },
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
  lactate_threshold: { fr: "Seuil lactique", en: "Lactate threshold" },
  vo2max: { fr: "VO2max", en: "VO2max" },
  speed: { fr: "Vitesse", en: "Speed" },
  strength: { fr: "Force", en: "Strength" },
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

export function PlanStatsSection({ plan, currentWeek, isEn }: PlanStatsSectionProps) {
  const stats = useMemo(() => computePlanStats(plan), [plan]);
  const [analysis, setAnalysis] = useState<EnhancedPlanAnalysis | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setAnalysisLoading(true);
    computeEnhancedPlanAnalysis(plan).then((result) => {
      if (!cancelled) {
        setAnalysis(result);
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
            {isEn ? "Statistics" : "Statistiques"}
          </h2>
          {/* Summary badges when collapsed */}
          {!isOpen && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">
                {stats.totalSessions} {isEn ? "sessions" : "séances"}
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
            label={isEn ? "Sessions" : "S\u00e9ances"}
          />
          <StatCard
            icon={Clock}
            value={`${Math.round(stats.totalDurationMin / 60)}h`}
            label="Total"
          />
          <StatCard
            icon={Route}
            value={`${Math.round(stats.totalEstimatedKm)} km`}
            label={isEn ? "Est. km" : "Km estim\u00e9s"}
          />
          <StatCard
            icon={Star}
            value={String(stats.keySessionCount)}
            label={isEn ? "Key sessions" : "S\u00e9ances cl\u00e9s"}
          />
          <StatCard
            icon={TrendingUp}
            value={`${stats.avgDurationPerWeekMin} min`}
            label={isEn ? "Avg/week" : "Moy./semaine"}
          />
          <StatCard
            icon={Mountain}
            value={`S${stats.peakVolumeWeek}`}
            sublabel={`${stats.peakVolumeMin}min`}
            label={isEn ? "Peak week" : "Semaine pic"}
          />
          <StatCard
            icon={Timer}
            value={`${stats.longestSessionMin} min`}
            label={isEn ? "Longest" : "Session max"}
          />
          <StatCard
            icon={Heart}
            value={String(stats.recoveryWeekCount)}
            label={isEn ? "Recovery wk" : "Sem. r\u00e9cup"}
          />
        </div>

        {/* ── Section 2: Weekly Volume Chart ────────────────────────── */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">
            {isEn ? "Weekly volume" : "Volume par semaine"}
          </h3>
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
                    title={`S${week.weekNumber}: ${week.durationMin}min`}
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
              {isEn ? "Session types" : "Types de s\u00e9ance"}
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
                  {isEn ? "Zone distribution" : "R\u00e9partition par zone"}
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
                  {isEn ? "Target systems" : "Syst\u00e8mes cibl\u00e9s"}
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
      </CardContent>
      )}
    </Card>
  );
}

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
