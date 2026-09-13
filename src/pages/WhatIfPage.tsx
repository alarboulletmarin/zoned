import {
  useState,
  useCallback,
  useEffect,
  useMemo,
  type CSSProperties,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Scale,
  Activity,
  Target,
  Calendar,
  Loader2,
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
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveTable } from "@/components/ui/responsive-table";
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
import { ZoneScale } from "@/components/visualization";
import { PageContainer } from "@/components/layout/PageContainer";
import { SEOHead } from "@/components/seo";
import { generatePlan } from "@/lib/planGenerator";
import { computePlanStats, computeEnhancedPlanAnalysis } from "@/lib/planStats";
import { generateInsights } from "@/lib/whatIfInsights";
import { RACE_DISTANCE_META } from "@/types/plan";
import type { RaceDistance, TrainingGoal, TrainingPlan } from "@/types/plan";
import type { PlanStats, EnhancedPlanAnalysis } from "@/lib/planStats";
import type { Difficulty } from "@/types";
import { getZoneNumber } from "@/types";
import type { WhatIfInsight } from "@/lib/whatIfInsights";
import { toast } from "sonner";
import { formatDate } from "@/lib/i18n-utils";
import { loadRunnerProfile } from "@/lib/runnerProfile";

// ── Constants ────────────────────────────────────────────────────────

const STORAGE_KEY = "zoned-whatif-scenarios";

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
  icon: React.ComponentType<{ size?: number; className?: string }>;
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

interface MetricRow {
  label: string;
  valueA: string;
  valueB: string;
  delta: string;
  deltaWarning?: boolean;
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
  id,
  label,
  scenario,
  onChange,
  t,
}: {
  id: string;
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
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent
        className="zn-stack"
        style={{ "--gap": "var(--sp-11)" } as CSSProperties}
      >
        {/* Days per week */}
        <div className="zn-ct__field">
          <span className="zn-label">{t("scenario.daysPerWeek")}</span>
          <div className="zn-row zn-ct__slider" style={{ "--gap": "var(--sp-8)" } as CSSProperties}>
            <Slider
              value={[scenario.daysPerWeek]}
              min={3}
              max={7}
              step={1}
              onValueChange={([v]) => onChange({ ...scenario, daysPerWeek: v })}
              thumbLabel={`${label} · ${t("scenario.daysPerWeek")}`}
              thumbValueText={String(scenario.daysPerWeek)}
              className="zn-fill"
            />
            <span className="zn-mono zn-fixed">{scenario.daysPerWeek}</span>
          </div>
        </div>

        {/* Training goal */}
        <div className="zn-ct__field">
          <span id={`${id}-goal-label`} className="zn-label">
            {t("scenario.goal")}
          </span>
          <Select
            value={scenario.trainingGoal}
            onValueChange={(v) =>
              onChange({ ...scenario, trainingGoal: v as TrainingGoal })
            }
          >
            <SelectTrigger
              aria-labelledby={`${id}-goal-label`}
              className="zn-ct__wide"
            >
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
        <div className="zn-ct__field">
          <span className="zn-label">{t("scenario.weeks")}</span>
          <div className="zn-row zn-ct__slider" style={{ "--gap": "var(--sp-8)" } as CSSProperties}>
            <Slider
              value={[scenario.totalWeeks]}
              min={6}
              max={24}
              step={1}
              onValueChange={([v]) => onChange({ ...scenario, totalWeeks: v })}
              thumbLabel={`${label} · ${t("scenario.weeks")}`}
              thumbValueText={String(scenario.totalWeeks)}
              className="zn-fill"
            />
            <span className="zn-mono zn-fixed">{scenario.totalWeeks}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Which of the two series a mark belongs to: A is hollow, B is solid ink. */
function SeriesKey({ series, label }: { series: "a" | "b"; label: string }) {
  return (
    <span className="zn-ct__key">
      <span
        className="zn-ct__key-swatch"
        data-series={series}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

// ── Main component ───────────────────────────────────────────────────

export function WhatIfPage() {
  const { t, i18n } = useTranslation("whatif");
  const isEn = i18n.language?.startsWith("en") ?? false;

  // ── Shared config (pre-filled from runner profile if available) ─────
  const [raceDistance, setRaceDistance] = useState<RaceDistance>("10K");
  const [runnerLevel, setRunnerLevel] = useState<Difficulty>(() => {
    const rp = loadRunnerProfile();
    return rp?.runnerLevel ?? "intermediate";
  });
  const [currentWeeklyKm, setCurrentWeeklyKm] = useState(() => {
    const rp = loadRunnerProfile();
    return rp?.currentWeeklyKm ?? 30;
  });
  const [currentLongRunKm, setCurrentLongRunKm] = useState(() => {
    const rp = loadRunnerProfile();
    return rp?.currentLongRunKm ?? 12;
  });

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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
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
      // An in-page Alert rather than a toast: a toast leaves before the
      // sentence is read, and it cannot hold the way forward.
      setError(err instanceof Error ? err.message : t("errors.generic"));
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

  const metricRows = useMemo<MetricRow[]>(() => {
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

      <PageContainer className="zn-ct">
        {/* Mono kicker, display title, one sentence, and the two records
            actions, which are outlines: the screen's one fill is "Comparer". */}
        <header className="zn-ct__head">
          <div
            className="zn-row zn-row--split zn-row--start zn-ct__headrow"
            style={{ "--gap": "var(--sp-12)" } as CSSProperties}
          >
            <div
              className="zn-stack"
              style={{ "--gap": "var(--sp-6)" } as CSSProperties}
            >
              <span className="zn-kicker">{t("kicker")}</span>
              <h1 className="zn-display" data-level="2">
                {t("title")}
              </h1>
              <p className="zn-body zn-body--lead zn-ct__lede">
                {t("subtitle")}
              </p>
            </div>

            <div className="zn-cluster zn-fixed">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSaveDialogOpen(true)}
              >
                <Save size={15} />
                {t("actions.save")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLoadDialogOpen(true)}
                disabled={savedScenarios.length === 0}
              >
                <Plus size={15} />
                {t("actions.load")}
              </Button>
            </div>
          </div>
        </header>

        {/* ── What both scenarios share, then what separates them ─────── */}
        <section
          className="zn-ct__band zn-stack"
          style={{ "--gap": "var(--sp-13)" } as CSSProperties}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t("shared.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="zn-grid" style={{ "--cols": 2, "--cols-md": 2 } as CSSProperties}>
                {/* Race distance */}
                <div className="zn-ct__field">
                  <span id="whatif-distance-label" className="zn-label">
                    {t("shared.distance")}
                  </span>
                  <Select
                    value={raceDistance}
                    onValueChange={(v) => {
                      setRaceDistance(v as RaceDistance);
                      setResults(null);
                    }}
                  >
                    <SelectTrigger
                      aria-labelledby="whatif-distance-label"
                      className="zn-ct__wide"
                    >
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
                <div className="zn-ct__field">
                  <span id="whatif-level-label" className="zn-label">
                    {t("shared.level")}
                  </span>
                  <Select
                    value={runnerLevel}
                    onValueChange={(v) => {
                      setRunnerLevel(v as Difficulty);
                      setResults(null);
                    }}
                  >
                    <SelectTrigger
                      aria-labelledby="whatif-level-label"
                      className="zn-ct__wide"
                    >
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
                <div className="zn-ct__field">
                  <span className="zn-label">{t("shared.currentKm")}</span>
                  <div
                    className="zn-row zn-ct__slider"
                    style={{ "--gap": "var(--sp-8)" } as CSSProperties}
                  >
                    <Slider
                      thumbLabel={t("shared.currentKm")}
                      thumbValueText={`${currentWeeklyKm} km`}
                      value={[currentWeeklyKm]}
                      min={5}
                      max={120}
                      step={5}
                      onValueChange={([v]) => {
                        setCurrentWeeklyKm(v);
                        setResults(null);
                      }}
                      className="zn-fill"
                    />
                    <span className="zn-mono zn-fixed">{currentWeeklyKm} km</span>
                  </div>
                  <p className="zn-ct__hint">{t("shared.currentKmHelp")}</p>
                </div>

                {/* Current long run km */}
                <div className="zn-ct__field">
                  <span className="zn-label">{t("shared.currentLongRun")}</span>
                  <div
                    className="zn-row zn-ct__slider"
                    style={{ "--gap": "var(--sp-8)" } as CSSProperties}
                  >
                    <Slider
                      thumbLabel={t("shared.currentLongRun")}
                      thumbValueText={`${currentLongRunKm} km`}
                      value={[currentLongRunKm]}
                      min={3}
                      max={40}
                      step={1}
                      onValueChange={([v]) => {
                        setCurrentLongRunKm(v);
                        setResults(null);
                      }}
                      className="zn-fill"
                    />
                    <span className="zn-mono zn-fixed">{currentLongRunKm} km</span>
                  </div>
                  <p className="zn-ct__hint">{t("shared.currentLongRunHelp")}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Compare Presets */}
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-6)" } as CSSProperties}
          >
            <h2 className="zn-kicker">{t("presets.title")}</h2>
            <div className="zn-cluster">
              {PRESETS.map((preset) => {
                const Icon = preset.icon;
                return (
                  <Button
                    key={preset.id}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(preset)}
                  >
                    <Icon size={15} />
                    {t(`presets.${preset.id}`)}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Scenario inputs, side by side on desktop, tabbed on a phone */}
          <div className="zn-ct__scenarios">
            <div className="zn-grid" style={{ "--cols": 2, "--cols-md": 2 } as CSSProperties}>
              <ScenarioCard
                id="scenario-a"
                label={t("scenario.a")}
                scenario={scenarioA}
                onChange={(s) => {
                  setScenarioA(s);
                  setResults(null);
                }}
                t={t}
              />
              <ScenarioCard
                id="scenario-b"
                label={t("scenario.b")}
                scenario={scenarioB}
                onChange={(s) => {
                  setScenarioB(s);
                  setResults(null);
                }}
                t={t}
              />
            </div>
          </div>

          <div className="zn-ct__scenariotabs">
            <Tabs defaultValue="a">
              <TabsList>
                <TabsTrigger value="a">{t("scenario.a")}</TabsTrigger>
                <TabsTrigger value="b">{t("scenario.b")}</TabsTrigger>
              </TabsList>
              <TabsContent value="a">
                <ScenarioCard
                  id="scenario-a-mobile"
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
                  id="scenario-b-mobile"
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

          {/* The screen's one vermillon fill. */}
          <Button
            onClick={handleCompare}
            disabled={!isValid || isGenerating}
            size="lg"
            className="zn-ct__wide"
          >
            {isGenerating ? (
              <>
                <Loader2 size={15} className="zn-ct__spinner" />
                {t("actions.comparing")}
              </>
            ) : (
              <>
                <Scale size={15} />
                {t("actions.compare")}
              </>
            )}
          </Button>

          {error && (
            <Alert
              kind="error"
              title={t("errors.title")}
              action={
                <Button size="sm" onClick={handleCompare} disabled={isGenerating}>
                  {t("actions.compare")}
                </Button>
              }
            >
              {error} {t("errors.intact")}
            </Alert>
          )}
        </section>

        {/* ── Comparison results ───────────────────────────────────────── */}
        {results && (
          <section
            className="zn-ct__band zn-stack"
            style={{ "--gap": "var(--sp-13)" } as CSSProperties}
          >
            {/* Metric comparison table */}
            <Card>
              <CardHeader>
                <CardTitle>{t("results.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveTable
                  data={metricRows}
                  rowKey={(row) => row.label}
                  columns={[
                    {
                      key: "metric",
                      header: t("results.metric"),
                      // The mobile card already prints this as its title.
                      hideOnMobile: true,
                      cell: (row) => row.label,
                    },
                    {
                      key: "a",
                      header: t("scenario.a"),
                      className: "zn-ct__num",
                      cell: (row) => row.valueA,
                    },
                    {
                      key: "b",
                      header: t("scenario.b"),
                      className: "zn-ct__num",
                      cell: (row) => row.valueB,
                    },
                    {
                      key: "delta",
                      header: t("results.delta"),
                      className: "zn-ct__num",
                      cell: (row) => (
                        <span
                          className="zn-ct__delta"
                          data-warning={row.deltaWarning ? "true" : undefined}
                        >
                          {row.delta}
                        </span>
                      ),
                    },
                  ]}
                  mobileCardTitle={(row) => row.label}
                />
              </CardContent>
            </Card>

            {/* Volume progression, A hollow, B solid ink */}
            {volumeData && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("results.volumeProgression")}</CardTitle>
                  <CardDescription>
                    {t("results.volumeProgressionDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="zn-ct__chart">
                    {Array.from({ length: volumeData.maxWeeks }).map((_, i) => {
                      const durA = results.statsA.weeklyVolumes[i]?.durationMin ?? 0;
                      const durB = results.statsB.weeklyVolumes[i]?.durationMin ?? 0;
                      return (
                        <div key={i} className="zn-ct__week">
                          <div
                            className="zn-ct__bar"
                            data-series="a"
                            style={{ "--h": `${(durA / volumeData.maxDuration) * 100}%` } as CSSProperties}
                            title={`${t("scenario.a")} · ${t("results.week")} ${i + 1} · ${formatMinutes(durA)}`}
                          />
                          <div
                            className="zn-ct__bar"
                            data-series="b"
                            style={{ "--h": `${(durB / volumeData.maxDuration) * 100}%` } as CSSProperties}
                            title={`${t("scenario.b")} · ${t("results.week")} ${i + 1} · ${formatMinutes(durB)}`}
                          />
                        </div>
                      );
                    })}
                  </div>

                  <div className="zn-ct__ticks">
                    {Array.from({ length: volumeData.maxWeeks }).map((_, i) => (
                      <span
                        key={i}
                        className="zn-ct__tick"
                        data-dense={
                          i % 2 !== 0 && volumeData.maxWeeks > 10
                            ? "true"
                            : undefined
                        }
                      >
                        {i + 1}
                      </span>
                    ))}
                  </div>

                  <div
                    className="zn-cluster zn-ct__keys"
                    style={{ "--gap": "var(--sp-11)" } as CSSProperties}
                  >
                    <SeriesKey series="a" label={t("scenario.a")} />
                    <SeriesKey series="b" label={t("scenario.b")} />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Zone distribution, the only place zone fills are painted */}
            {zoneData && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("results.zoneDistribution")}</CardTitle>
                </CardHeader>
                <CardContent
                  className="zn-stack"
                  style={{ "--gap": "var(--sp-10)" } as CSSProperties}
                >
                  {ALL_ZONES.map((zone) => {
                    const minutesA =
                      results.analysisA.zoneDistribution.find((z) => z.zone === zone)
                        ?.minutes ?? 0;
                    const minutesB =
                      results.analysisB.zoneDistribution.find((z) => z.zone === zone)
                        ?.minutes ?? 0;
                    const pctA = (minutesA / zoneData.maxMinutes) * 100;
                    const pctB = (minutesB / zoneData.maxMinutes) * 100;
                    return (
                      <div key={zone} className="zn-ct__zonerow">
                        <span className="zn-zone-badge" data-zone={getZoneNumber(zone)}>
                          {zone}
                        </span>
                        {(
                          [
                            ["a", t("scenario.a"), minutesA, pctA],
                            ["b", t("scenario.b"), minutesB, pctB],
                          ] as const
                        ).map(([series, seriesLabel, minutes, pct]) => (
                          <div key={series} className="zn-ct__zonebar">
                            <span className="zn-ct__series" aria-hidden="true">
                              {series.toUpperCase()}
                            </span>
                            <span
                              className="zn-ct__track"
                              role="img"
                              aria-label={`${seriesLabel} · ${zone} · ${formatMinutes(minutes)}`}
                            >
                              <span
                                className="zn-ct__fill"
                                data-series={series}
                                style={{ "--w": `${pct}%` } as CSSProperties}
                              />
                            </span>
                            <span className="zn-ct__minutes">
                              {formatMinutes(minutes)}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })}

                  {/* The ramp orders the zones; it does not name them. */}
                  <div className="zn-ct__legend">
                    <ZoneScale />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Qualitative insights */}
            {results.insights.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{t("insights.title")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="zn-ct__insights">
                    {results.insights.map((insight, i) => (
                      <li key={i} className="zn-ct__insight" data-type={insight.type}>
                        {t(insight.key, insight.params)}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* What the model does not claim */}
            <Alert kind="warning" title={t("disclaimer.title")}>
              {t("disclaimer.text")} {t("disclaimer.variability")}
            </Alert>
          </section>
        )}

        {/* ── Save Dialog ────────────────────────────────────────────── */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("actions.save")}</DialogTitle>
              <DialogDescription>
                {t("saveDialog.description")}
              </DialogDescription>
            </DialogHeader>
            <div className="zn-ct__field">
              <label htmlFor="whatif-name" className="zn-label">
                {t("actions.scenarioName")}
              </label>
              <input
                id="whatif-name"
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                placeholder={t("saveDialog.placeholder")}
                className="zn-ct__input"
                autoFocus
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t("saveDialog.cancel")}</Button>
              </DialogClose>
              <Button onClick={handleSave} disabled={!saveName.trim()}>
                <Save size={15} />
                {t("actions.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Load Dialog ────────────────────────────────────────────── */}
        <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("actions.savedScenarios")}</DialogTitle>
            </DialogHeader>
            {savedScenarios.length === 0 ? (
              <p className="zn-body zn-body--sm zn-muted">
                {t("actions.noSaved")}
              </p>
            ) : (
              <ul className="zn-ct__saved">
                {savedScenarios.map((scenario) => (
                  <li key={scenario.id} className="zn-ct__saveditem">
                    <div className="zn-fill">
                      <span className="zn-ct__savedname zn-truncate">
                        {scenario.name}
                      </span>
                      <span className="zn-ct__saveddate">
                        {formatDate(new Date(scenario.savedAt))}
                      </span>
                    </div>
                    <div className="zn-cluster zn-fixed" style={{ "--gap": "var(--sp-2)" } as CSSProperties}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLoad(scenario)}
                      >
                        {t("actions.load")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t("actions.delete")}
                        onClick={() => setDeleteTarget(scenario.id)}
                      >
                        <Trash2 size={15} />
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
              <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
              <DialogDescription>
                {t("deleteDialog.description")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">{t("deleteDialog.cancel")}</Button>
              </DialogClose>
              <Button variant="destructive" onClick={confirmDelete}>
                <Trash2 size={15} />
                {t("actions.delete")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </>
  );
}
