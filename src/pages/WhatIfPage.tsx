import { useState, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Scale,
  Activity,
  Target,
  Calendar,
  Loader2,
  AlertTriangle,
  Save,
  Trash2,
  Plus,
} from "@/components/icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { generatePlan } from "@/lib/planGenerator";
import { computePlanStats, computeEnhancedPlanAnalysis } from "@/lib/planStats";
import { generateInsights } from "@/lib/whatIfInsights";
import { RACE_DISTANCE_META } from "@/types/plan";
import type { RaceDistance, TrainingGoal, TrainingPlan } from "@/types/plan";
import type { PlanStats, EnhancedPlanAnalysis } from "@/lib/planStats";
import type { Difficulty } from "@/types";
import type { WhatIfInsight } from "@/lib/whatIfInsights";
import { toast } from "sonner";
import { formatDate } from "@/lib/i18n-utils";

// ── Constants ────────────────────────────────────────────────────────

const STORAGE_KEY = "zoned-whatif-scenarios";

const ZONE_COLORS: Record<string, string> = {
  Z1: "#94a3b8",
  Z2: "#22c55e",
  Z3: "#eab308",
  Z4: "#f97316",
  Z5: "#ef4444",
  Z6: "#7c3aed",
};

const ALL_ZONES = ["Z1", "Z2", "Z3", "Z4", "Z5", "Z6"] as const;

const RACE_DISTANCES: RaceDistance[] = [
  "5K",
  "10K",
  "semi",
  "marathon",
  "trail_short",
  "trail",
  "ultra",
];

const DIFFICULTIES: Difficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
  "elite",
];

const GOALS: TrainingGoal[] = ["finish", "time", "compete"];

interface ScenarioConfig {
  daysPerWeek: number;
  trainingGoal: TrainingGoal;
  totalWeeks: number;
}

const PRESETS: {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  a: ScenarioConfig;
  b: ScenarioConfig;
}[] = [
  {
    id: "frequency",
    icon: Activity,
    a: { daysPerWeek: 3, trainingGoal: "time", totalWeeks: 12 },
    b: { daysPerWeek: 5, trainingGoal: "time", totalWeeks: 12 },
  },
  {
    id: "goal",
    icon: Target,
    a: { daysPerWeek: 4, trainingGoal: "finish", totalWeeks: 12 },
    b: { daysPerWeek: 4, trainingGoal: "compete", totalWeeks: 12 },
  },
  {
    id: "duration",
    icon: Calendar,
    a: { daysPerWeek: 4, trainingGoal: "time", totalWeeks: 10 },
    b: { daysPerWeek: 4, trainingGoal: "time", totalWeeks: 16 },
  },
];

// ── Types ────────────────────────────────────────────────────────────

interface ComparisonResults {
  planA: TrainingPlan;
  planB: TrainingPlan;
  statsA: PlanStats;
  statsB: PlanStats;
  analysisA: EnhancedPlanAnalysis;
  analysisB: EnhancedPlanAnalysis;
  insights: WhatIfInsight[];
}

interface SavedScenario {
  id: string;
  name: string;
  savedAt: string;
  shared: {
    raceDistance: RaceDistance;
    runnerLevel: Difficulty;
    currentWeeklyKm: number;
    currentLongRunKm: number;
  };
  scenarioA: ScenarioConfig;
  scenarioB: ScenarioConfig;
}

// ── Helpers ──────────────────────────────────────────────────────────

function buildConfig(
  shared: {
    raceDistance: RaceDistance;
    runnerLevel: Difficulty;
    currentWeeklyKm: number;
    currentLongRunKm: number;
  },
  scenario: ScenarioConfig,
) {
  const raceDate = new Date();
  raceDate.setDate(raceDate.getDate() + scenario.totalWeeks * 7);
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    raceDistance: shared.raceDistance,
    raceDate: raceDate.toISOString().split("T")[0],
    runnerLevel: shared.runnerLevel,
    longRunDay: 6 as const,
    daysPerWeek: scenario.daysPerWeek,
    trainingGoal: scenario.trainingGoal,
    currentWeeklyKm: shared.currentWeeklyKm,
    currentLongRunKm: shared.currentLongRunKm,
    totalWeeksOverride: scenario.totalWeeks,
  };
}

function loadSavedScenarios(): SavedScenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistScenarios(scenarios: SavedScenario[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios));
}

function formatMinutes(min: number): string {
  if (min < 60) return `${Math.round(min)} min`;
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return m > 0 ? `${h}h${m.toString().padStart(2, "0")}` : `${h}h`;
}

// ── Sub-components ───────────────────────────────────────────────────

function ScenarioCard({
  label,
  scenario,
  onChange,
  t,
}: {
  label: string;
  scenario: ScenarioConfig;
  onChange: (s: ScenarioConfig) => void;
  t: (key: string) => string;
}) {
  const goalLabels: Record<TrainingGoal, string> = {
    finish: t("scenario.goalFinish"),
    time: t("scenario.goalTime"),
    compete: t("scenario.goalCompete"),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{label}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Days per week */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("scenario.daysPerWeek")}
          </label>
          <div className="flex items-center gap-3">
            <Slider
              value={[scenario.daysPerWeek]}
              min={3}
              max={7}
              step={1}
              onValueChange={([v]) =>
                onChange({ ...scenario, daysPerWeek: v })
              }
              className="flex-1"
            />
            <span className="text-sm font-medium tabular-nums w-6 text-right">
              {scenario.daysPerWeek}
            </span>
          </div>
        </div>

        {/* Training goal */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("scenario.goal")}</label>
          <Select
            value={scenario.trainingGoal}
            onValueChange={(v) =>
              onChange({ ...scenario, trainingGoal: v as TrainingGoal })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GOALS.map((g) => (
                <SelectItem key={g} value={g}>
                  {goalLabels[g]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Total weeks */}
        <div className="space-y-2">
          <label className="text-sm font-medium">{t("scenario.weeks")}</label>
          <div className="flex items-center gap-3">
            <Slider
              value={[scenario.totalWeeks]}
              min={6}
              max={24}
              step={1}
              onValueChange={([v]) =>
                onChange({ ...scenario, totalWeeks: v })
              }
              className="flex-1"
            />
            <span className="text-sm font-medium tabular-nums w-6 text-right">
              {scenario.totalWeeks}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricRow({
  label,
  valueA,
  valueB,
  delta,
  deltaWarning,
}: {
  label: string;
  valueA: string;
  valueB: string;
  delta: string;
  deltaWarning?: boolean;
}) {
  const isPositive = delta.startsWith("+");
  return (
    <tr className="border-b last:border-b-0">
      <td className="py-2 px-2 text-sm font-medium">{label}</td>
      <td className="py-2 px-2 text-sm tabular-nums text-center">{valueA}</td>
      <td className="py-2 px-2 text-sm tabular-nums text-center">{valueB}</td>
      <td
        className={cn(
          "py-2 px-2 text-sm tabular-nums text-center font-medium",
          deltaWarning
            ? "text-red-600 dark:text-red-400"
            : isPositive
              ? "text-green-600 dark:text-green-400"
              : "text-muted-foreground",
        )}
      >
        {delta}
      </td>
    </tr>
  );
}

// ── Main component ───────────────────────────────────────────────────

export function WhatIfPage() {
  const { t, i18n } = useTranslation("whatif");
  const isEn = i18n.language?.startsWith("en") ?? false;

  // ── Shared config ──────────────────────────────────────────────────
  const [raceDistance, setRaceDistance] = useState<RaceDistance>("10K");
  const [runnerLevel, setRunnerLevel] = useState<Difficulty>("intermediate");
  const [currentWeeklyKm, setCurrentWeeklyKm] = useState(30);
  const [currentLongRunKm, setCurrentLongRunKm] = useState(12);

  // ── Scenario A ─────────────────────────────────────────────────────
  const [scenarioA, setScenarioA] = useState<ScenarioConfig>({
    daysPerWeek: 3,
    trainingGoal: "time",
    totalWeeks: 12,
  });

  // ── Scenario B ─────────────────────────────────────────────────────
  const [scenarioB, setScenarioB] = useState<ScenarioConfig>({
    daysPerWeek: 5,
    trainingGoal: "time",
    totalWeeks: 12,
  });

  // ── Results ────────────────────────────────────────────────────────
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<ComparisonResults | null>(null);

  // ── Save/Load ──────────────────────────────────────────────────────
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [savedScenarios, setSavedScenarios] = useState<SavedScenario[]>([]);
  const [saveName, setSaveName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Load saved scenarios on mount
  useEffect(() => {
    setSavedScenarios(loadSavedScenarios());
  }, []);

  // ── Shared config object ───────────────────────────────────────────
  const shared = useMemo(
    () => ({ raceDistance, runnerLevel, currentWeeklyKm, currentLongRunKm }),
    [raceDistance, runnerLevel, currentWeeklyKm, currentLongRunKm],
  );

  // ── Handlers ───────────────────────────────────────────────────────

  const handleCompare = useCallback(async () => {
    setIsGenerating(true);
    try {
      const configA = buildConfig(shared, scenarioA);
      const configB = buildConfig(shared, scenarioB);

      const [planA, planB] = await Promise.all([
        generatePlan(configA),
        generatePlan(configB),
      ]);

      const statsA = computePlanStats(planA);
      const statsB = computePlanStats(planB);

      const [analysisA, analysisB] = await Promise.all([
        computeEnhancedPlanAnalysis(planA),
        computeEnhancedPlanAnalysis(planB),
      ]);

      const insights = generateInsights(statsA, statsB, analysisA, analysisB, planA, planB);

      setResults({
        planA,
        planB,
        statsA,
        statsB,
        analysisA,
        analysisB,
        insights,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t("errors.generic");
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  }, [shared, scenarioA, scenarioB, t]);

  const applyPreset = useCallback(
    (preset: (typeof PRESETS)[number]) => {
      setScenarioA(preset.a);
      setScenarioB(preset.b);
      setResults(null);
    },
    [],
  );

  const handleSave = useCallback(() => {
    if (!saveName.trim()) return;
    const scenario: SavedScenario = {
      id: crypto.randomUUID(),
      name: saveName.trim(),
      savedAt: new Date().toISOString(),
      shared,
      scenarioA,
      scenarioB,
    };
    const updated = [...savedScenarios, scenario];
    persistScenarios(updated);
    setSavedScenarios(updated);
    setSaveName("");
    setSaveDialogOpen(false);
    toast.success(t("toast.saved"));
  }, [saveName, shared, scenarioA, scenarioB, savedScenarios, t]);

  const handleLoad = useCallback((scenario: SavedScenario) => {
    setRaceDistance(scenario.shared.raceDistance);
    setRunnerLevel(scenario.shared.runnerLevel);
    setCurrentWeeklyKm(scenario.shared.currentWeeklyKm);
    setCurrentLongRunKm(scenario.shared.currentLongRunKm);
    setScenarioA(scenario.scenarioA);
    setScenarioB(scenario.scenarioB);
    setResults(null);
    setLoadDialogOpen(false);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    const updated = savedScenarios.filter((s) => s.id !== deleteTarget);
    persistScenarios(updated);
    setSavedScenarios(updated);
    setDeleteTarget(null);
    toast.success(t("toast.deleted"));
  }, [deleteTarget, savedScenarios, t]);

  // ── Derived data for visualizations ────────────────────────────────

  const volumeData = useMemo(() => {
    if (!results) return null;
    const { statsA, statsB } = results;
    const maxWeeks = Math.max(
      statsA.weeklyVolumes.length,
      statsB.weeklyVolumes.length,
    );
    const allDurations = [
      ...statsA.weeklyVolumes.map((w) => w.durationMin),
      ...statsB.weeklyVolumes.map((w) => w.durationMin),
    ];
    const maxDuration = Math.max(...allDurations, 1);
    return { maxWeeks, maxDuration };
  }, [results]);

  const zoneData = useMemo(() => {
    if (!results) return null;
    const { analysisA, analysisB } = results;
    const allMinutes = [
      ...analysisA.zoneDistribution.map((z) => z.minutes),
      ...analysisB.zoneDistribution.map((z) => z.minutes),
    ];
    const maxMinutes = Math.max(...allMinutes, 1);
    return { maxMinutes };
  }, [results]);

  // ── Metric comparison rows ─────────────────────────────────────────

  const metricRows = useMemo(() => {
    if (!results) return [];
    const { statsA, statsB, planA, planB } = results;

    const peakKmA = planA.peakWeeklyKm ?? 0;
    const peakKmB = planB.peakWeeklyKm ?? 0;
    const peakKmDelta = peakKmB - peakKmA;
    const peakKmPctDelta =
      peakKmA > 0 ? Math.round(((peakKmB - peakKmA) / peakKmA) * 100) : 0;

    const totalKmA = Math.round(statsA.totalEstimatedKm);
    const totalKmB = Math.round(statsB.totalEstimatedKm);
    const totalKmDelta = totalKmB - totalKmA;

    const avgTimeA = statsA.avgDurationPerWeekMin;
    const avgTimeB = statsB.avgDurationPerWeekMin;
    const avgTimeDelta = avgTimeB - avgTimeA;

    const keyA = statsA.keySessionCount;
    const keyB = statsB.keySessionCount;
    const keyDelta = keyB - keyA;

    const peakLrA = planA.peakLongRunKm ?? 0;
    const peakLrB = planB.peakLongRunKm ?? 0;
    const peakLrDelta = peakLrB - peakLrA;

    const recA = statsA.recoveryWeekCount;
    const recB = statsB.recoveryWeekCount;
    const recDelta = recB - recA;

    const sessionsA = statsA.totalSessions;
    const sessionsB = statsB.totalSessions;
    const sessionsDelta = sessionsB - sessionsA;

    const fmtDelta = (d: number, suffix?: string) => {
      const s = suffix ?? "";
      return d > 0 ? `+${d}${s}` : d === 0 ? "=" : `${d}${s}`;
    };

    return [
      {
        label: t("results.totalSessions"),
        valueA: String(sessionsA),
        valueB: String(sessionsB),
        delta: fmtDelta(sessionsDelta),
      },
      {
        label: t("results.totalKm"),
        valueA: `${totalKmA} km`,
        valueB: `${totalKmB} km`,
        delta: fmtDelta(totalKmDelta, " km"),
      },
      {
        label: t("results.avgTimePerWeek"),
        valueA: formatMinutes(avgTimeA),
        valueB: formatMinutes(avgTimeB),
        delta: fmtDelta(avgTimeDelta, " min"),
      },
      {
        label: t("results.keySessions"),
        valueA: String(keyA),
        valueB: String(keyB),
        delta: fmtDelta(keyDelta),
      },
      {
        label: t("results.peakVolume"),
        valueA: `${peakKmA} km`,
        valueB: `${peakKmB} km`,
        delta: fmtDelta(peakKmDelta, " km"),
        deltaWarning: peakKmPctDelta > 40,
      },
      {
        label: t("results.peakLongRun"),
        valueA: `${peakLrA} km`,
        valueB: `${peakLrB} km`,
        delta: fmtDelta(Math.round(peakLrDelta), " km"),
      },
      {
        label: t("results.recoveryWeeks"),
        valueA: String(recA),
        valueB: String(recB),
        delta: fmtDelta(recDelta),
      },
    ];
  }, [results, t]);

  // ── Validation ─────────────────────────────────────────────────────

  const isValid =
    scenarioA.daysPerWeek >= 3 &&
    scenarioB.daysPerWeek >= 3 &&
    scenarioA.totalWeeks >= 6 &&
    scenarioB.totalWeeks >= 6;

  // ── Level/goal labels ──────────────────────────────────────────────

  const levelLabels: Record<Difficulty, string> = {
    beginner: t("levels.beginner"),
    intermediate: t("levels.intermediate"),
    advanced: t("levels.advanced"),
    elite: t("levels.elite"),
  };

  const inputClassName =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <>
      <SEOHead
        title={t("title")}
        description={t("seo.description")}
        canonical="/calculators/what-if"
        jsonLd={{
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
            { "@type": "ListItem", position: 2, name: t("seo.breadcrumbCalculators"), item: "https://zoned.run/calculators" },
            { "@type": "ListItem", position: 3, name: t("title") },
          ],
        }}
      />
      <div className="py-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Scale className="size-8" />
              {t("title")}
            </h1>
            <p className="text-muted-foreground text-lg">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSaveDialogOpen(true)}
            >
              <Save className="size-4" />
              {t("actions.save")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLoadDialogOpen(true)}
              disabled={savedScenarios.length === 0}
            >
              <Plus className="size-4" />
              {t("actions.load")}
            </Button>
          </div>
        </div>

        {/* Shared Config Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("shared.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Race distance */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("shared.distance")}
                </label>
                <Select
                  value={raceDistance}
                  onValueChange={(v) => {
                    setRaceDistance(v as RaceDistance);
                    setResults(null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RACE_DISTANCES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {isEn
                          ? RACE_DISTANCE_META[d].labelEn
                          : RACE_DISTANCE_META[d].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Runner level */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("shared.level")}
                </label>
                <Select
                  value={runnerLevel}
                  onValueChange={(v) => {
                    setRunnerLevel(v as Difficulty);
                    setResults(null);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTIES.map((d) => (
                      <SelectItem key={d} value={d}>
                        {levelLabels[d]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Current weekly km */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("shared.currentKm")}
                </label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[currentWeeklyKm]}
                    min={5}
                    max={120}
                    step={5}
                    onValueChange={([v]) => {
                      setCurrentWeeklyKm(v);
                      setResults(null);
                    }}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium tabular-nums w-12 text-right">
                    {currentWeeklyKm} km
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("shared.currentKmHelp")}
                </p>
              </div>

              {/* Current long run km */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("shared.currentLongRun")}
                </label>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[currentLongRunKm]}
                    min={3}
                    max={40}
                    step={1}
                    onValueChange={([v]) => {
                      setCurrentLongRunKm(v);
                      setResults(null);
                    }}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium tabular-nums w-12 text-right">
                    {currentLongRunKm} km
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("shared.currentLongRunHelp")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Compare Presets */}
        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground">
            {t("presets.title")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((preset) => {
              const Icon = preset.icon;
              return (
                <Button
                  key={preset.id}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(preset)}
                  className="gap-2"
                >
                  <Icon className="size-4" />
                  {t(`presets.${preset.id}`)}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Scenario Inputs */}
        {/* Desktop: side by side */}
        <div className="hidden md:grid md:grid-cols-2 gap-4">
          <ScenarioCard
            label={t("scenario.a")}
            scenario={scenarioA}
            onChange={(s) => {
              setScenarioA(s);
              setResults(null);
            }}
            t={t}
          />
          <ScenarioCard
            label={t("scenario.b")}
            scenario={scenarioB}
            onChange={(s) => {
              setScenarioB(s);
              setResults(null);
            }}
            t={t}
          />
        </div>

        {/* Mobile: tabs */}
        <div className="md:hidden">
          <Tabs defaultValue="a">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="a">{t("scenario.a")}</TabsTrigger>
              <TabsTrigger value="b">{t("scenario.b")}</TabsTrigger>
            </TabsList>
            <TabsContent value="a">
              <ScenarioCard
                label={t("scenario.a")}
                scenario={scenarioA}
                onChange={(s) => {
                  setScenarioA(s);
                  setResults(null);
                }}
                t={t}
              />
            </TabsContent>
            <TabsContent value="b">
              <ScenarioCard
                label={t("scenario.b")}
                scenario={scenarioB}
                onChange={(s) => {
                  setScenarioB(s);
                  setResults(null);
                }}
                t={t}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Compare Button */}
        <Button
          onClick={handleCompare}
          disabled={!isValid || isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t("actions.comparing")}
            </>
          ) : (
            <>
              <Scale className="size-4" />
              {t("actions.compare")}
            </>
          )}
        </Button>

        {/* ── Comparison Results ──────────────────────────────────────── */}
        {results && (
          <div className="space-y-6">
            {/* Metric Comparison Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {t("results.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-2 text-left font-medium">
                          {t("results.metric")}
                        </th>
                        <th className="py-2 px-2 text-center font-medium">
                          A
                        </th>
                        <th className="py-2 px-2 text-center font-medium">
                          B
                        </th>
                        <th className="py-2 px-2 text-center font-medium">
                          {t("results.delta")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {metricRows.map((row) => (
                        <MetricRow key={row.label} {...row} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Volume Progression Chart */}
            {volumeData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("results.volumeProgression")}
                  </CardTitle>
                  <CardDescription>
                    {t("results.volumeProgressionDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-[2px] h-48">
                    {Array.from({ length: volumeData.maxWeeks }).map((_, i) => {
                      const weekA = results.statsA.weeklyVolumes[i];
                      const weekB = results.statsB.weeklyVolumes[i];
                      const durA = weekA?.durationMin ?? 0;
                      const durB = weekB?.durationMin ?? 0;
                      return (
                        <div
                          key={i}
                          className="flex-1 flex items-end gap-[1px] h-full"
                        >
                          <div
                            className="flex-1 bg-blue-500/60 rounded-t-sm min-h-[1px]"
                            style={{
                              height: `${(durA / volumeData.maxDuration) * 100}%`,
                            }}
                            title={`A S${i + 1}: ${formatMinutes(durA)}`}
                          />
                          <div
                            className="flex-1 bg-orange-500/60 rounded-t-sm min-h-[1px]"
                            style={{
                              height: `${(durB / volumeData.maxDuration) * 100}%`,
                            }}
                            title={`B S${i + 1}: ${formatMinutes(durB)}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {/* Week numbers */}
                  <div className="flex gap-[2px] mt-1">
                    {Array.from({ length: volumeData.maxWeeks }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex-1 text-center text-[9px] text-muted-foreground",
                          i % 2 !== 0 &&
                            volumeData.maxWeeks > 10 &&
                            "hidden sm:block",
                        )}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  {/* Legend */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-blue-500/60" />
                      {t("scenario.a")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-orange-500/60" />
                      {t("scenario.b")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Zone Distribution Comparison */}
            {zoneData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("results.zoneDistribution")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ALL_ZONES.map((zone) => {
                    const zdA = results.analysisA.zoneDistribution.find(
                      (z) => z.zone === zone,
                    );
                    const zdB = results.analysisB.zoneDistribution.find(
                      (z) => z.zone === zone,
                    );
                    const minutesA = zdA?.minutes ?? 0;
                    const minutesB = zdB?.minutes ?? 0;
                    const pctA =
                      zoneData.maxMinutes > 0
                        ? (minutesA / zoneData.maxMinutes) * 100
                        : 0;
                    const pctB =
                      zoneData.maxMinutes > 0
                        ? (minutesB / zoneData.maxMinutes) * 100
                        : 0;
                    return (
                      <div key={zone} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="text-xs font-medium w-6"
                            style={{ color: ZONE_COLORS[zone] }}
                          >
                            {zone}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs w-6 text-right text-muted-foreground">
                              A
                            </span>
                            <div className="flex-1 h-4 bg-muted rounded-sm overflow-hidden">
                              <div
                                className="h-full bg-blue-500/60 rounded-sm transition-all"
                                style={{ width: `${pctA}%` }}
                              />
                            </div>
                            <span className="text-xs w-16 text-right tabular-nums">
                              {formatMinutes(minutesA)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs w-6 text-right text-muted-foreground">
                              B
                            </span>
                            <div className="flex-1 h-4 bg-muted rounded-sm overflow-hidden">
                              <div
                                className="h-full bg-orange-500/60 rounded-sm transition-all"
                                style={{ width: `${pctB}%` }}
                              />
                            </div>
                            <span className="text-xs w-16 text-right tabular-nums">
                              {formatMinutes(minutesB)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Legend */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-blue-500/60" />
                      {t("scenario.a")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="size-2.5 rounded-full bg-orange-500/60" />
                      {t("scenario.b")}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Qualitative Insights */}
            {results.insights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {t("insights.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {results.insights.map((insight, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm"
                      >
                        <span
                          className={cn(
                            "mt-1.5 size-2 rounded-full shrink-0",
                            insight.type === "warning"
                              ? "bg-amber-500"
                              : insight.type === "stimulus"
                                ? "bg-green-500"
                                : "bg-blue-500",
                          )}
                        />
                        <span>{t(insight.key, insight.params)}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Model Disclaimer */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-5 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium mb-1">
                      {t("disclaimer.title")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("disclaimer.text")}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("disclaimer.variability")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Save Dialog ────────────────────────────────────────────── */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("actions.save")}
              </DialogTitle>
              <DialogDescription>
                {t("saveDialog.description")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("actions.scenarioName")}
              </label>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder={t("saveDialog.placeholder")}
                className={inputClassName}
                autoFocus
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">
                  {t("saveDialog.cancel")}
                </Button>
              </DialogClose>
              <Button onClick={handleSave} disabled={!saveName.trim()}>
                <Save className="size-4" />
                {t("actions.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Load Dialog ────────────────────────────────────────────── */}
        <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("actions.savedScenarios")}
              </DialogTitle>
            </DialogHeader>
            {savedScenarios.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                {t("actions.noSaved")}
              </p>
            ) : (
              <ul className="space-y-2 max-h-80 overflow-y-auto">
                {savedScenarios.map((scenario) => (
                  <li
                    key={scenario.id}
                    className="flex items-center justify-between gap-2 rounded-md border p-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {scenario.name}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatDate(new Date(scenario.savedAt))}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLoad(scenario)}
                      >
                        {t("actions.load")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(scenario.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DialogContent>
        </Dialog>

        {/* ── Delete Confirmation Dialog ──────────────────────────────── */}
        <Dialog
          open={deleteTarget !== null}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {t("deleteDialog.title")}
              </DialogTitle>
              <DialogDescription>
                {t("deleteDialog.description")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">
                  {t("deleteDialog.cancel")}
                </Button>
              </DialogClose>
              <Button variant="destructive" onClick={confirmDelete}>
                <Trash2 className="size-4" />
                {t("actions.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
