import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Flag,
  Clock,
  Utensils,
  Flame,
  Route,
  Brain,
  Heart,
  ChevronDown,
  ChevronUp,
  Save,
  Download,
  Trash2,
  Info,
  Plus,
} from "@/components/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { generateRacePlan, getDistanceLabelEn } from "@/lib/raceSimulator";
import type { RacePlan } from "@/lib/raceSimulator";
import { formatSplitTime, formatPaceDisplay } from "@/lib/splits";
import {
  getAllSimulations,
  saveSimulation,
  deleteSimulation,
} from "@/lib/raceSimStorage";
import type { SavedSimulation } from "@/lib/raceSimStorage";
import { useSettings } from "@/hooks/useSettings";
import {
  convertPace,
  convertDistance,
  getPaceUnit,
  getDistanceUnit,
} from "@/lib/units";
import { toast } from "sonner";
import { exportRaceSimToPDF } from "@/lib/export/raceSimPdf";
import { useIsEnglish, usePickLang, formatDate } from "@/lib/i18n-utils";

interface RaceOption {
  label: string;
  labelEn: string;
  value: string;
  distanceKm: number;
}

const RACE_OPTIONS: RaceOption[] = [
  { label: "5K", labelEn: "5K", value: "5", distanceKm: 5 },
  { label: "10K", labelEn: "10K", value: "10", distanceKm: 10 },
  {
    label: "Semi-marathon",
    labelEn: "Half Marathon",
    value: "21.1",
    distanceKm: 21.1,
  },
  { label: "Marathon", labelEn: "Marathon", value: "42.195", distanceKm: 42.195 },
];

const TIMELINE_COLORS: Record<string, string> = {
  prep: "text-blue-600 dark:text-blue-400",
  meal: "text-orange-600 dark:text-orange-400",
  warmup: "text-amber-600 dark:text-amber-400",
  race: "text-red-600 dark:text-red-400",
  nutrition: "text-green-600 dark:text-green-400",
  recovery: "text-purple-600 dark:text-purple-400",
};

function CollapsibleSection({
  id,
  icon,
  title,
  defaultOpen,
  expanded,
  onToggle,
  children,
}: {
  id: string;
  icon: React.ReactNode;
  title: string;
  defaultOpen?: boolean;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  const isOpen = expanded[id] ?? (defaultOpen ?? true);
  return (
    <Card>
      <button onClick={() => onToggle(id)} className="w-full">
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="flex items-center gap-2 text-base">
            {icon}
            {title}
          </CardTitle>
          {isOpen ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </CardHeader>
      </button>
      {isOpen && <CardContent>{children}</CardContent>}
    </Card>
  );
}

export function RaceSimulatorPage() {
  const { t } = useTranslation("simulator");
  const { t: tCommon } = useTranslation("common");
  const isEn = useIsEnglish();
  const pick = usePickLang();
  const { settings } = useSettings();
  const unit = settings.unitSystem;

  const [selectedDistance, setSelectedDistance] = useState<string>("10");
  const [customDistance, setCustomDistance] = useState<string>("");
  const [hours, setHours] = useState<string>("0");
  const [minutes, setMinutes] = useState<string>("45");
  const [seconds, setSeconds] = useState<string>("0");
  const [startTime, setStartTime] = useState<string>("08:30");
  const [strategy, setStrategy] = useState<"even" | "negative" | "positive">(
    "even",
  );
  const [weight, setWeight] = useState<string>("");
  const [plan, setPlan] = useState<RacePlan | null>(null);
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>(
    [],
  );
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    setSavedSimulations(getAllSimulations());
  }, []);

  const isCustom = selectedDistance === "custom";
  const distanceKm = isCustom
    ? parseFloat(customDistance) || 0
    : parseFloat(selectedDistance);

  const totalTimeSeconds =
    (parseInt(hours) || 0) * 3600 +
    (parseInt(minutes) || 0) * 60 +
    (parseInt(seconds) || 0);

  const hasValidInput = distanceKm > 0 && totalTimeSeconds > 0;

  const distanceUnitLabel = getDistanceUnit(unit);
  const paceUnitLabel = getPaceUnit(unit);

  const toggleSection = useCallback((id: string) => {
    setExpandedSections((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  }, []);

  const handleGenerate = useCallback(() => {
    if (!hasValidInput) return;
    const result = generateRacePlan({
      distanceKm,
      targetTimeSeconds: totalTimeSeconds,
      startTime,
      strategy,
      bodyWeightKg: weight ? parseFloat(weight) : undefined,
    });
    setPlan(result);
    setCheckedItems({});
    setExpandedSections({});
  }, [hasValidInput, distanceKm, totalTimeSeconds, startTime, strategy, weight]);

  const handleSave = useCallback(() => {
    if (!plan) return;
    const label = isEn
      ? `${getDistanceLabelEn(plan.distanceKm)} - ${formatSplitTime(plan.targetTimeSeconds)}`
      : `${plan.distanceLabel} - ${formatSplitTime(plan.targetTimeSeconds)}`;
    const sim: SavedSimulation = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      label,
      input: {
        distanceKm: plan.distanceKm,
        targetTimeSeconds: plan.targetTimeSeconds,
        startTime,
        strategy,
        bodyWeightKg: weight ? parseFloat(weight) : undefined,
      },
    };
    try {
      saveSimulation(sim);
      setSavedSimulations(getAllSimulations());
      toast.success(t("saved.savedSuccess"));
    } catch {
      toast.error(t("saved.maxReached"));
    }
  }, [plan, isEn, startTime, strategy, weight, t]);

  const handleLoad = useCallback(
    (sim: SavedSimulation) => {
      const { input } = sim;
      const km = input.distanceKm;
      const matchingOption = RACE_OPTIONS.find(
        (opt) => Math.abs(opt.distanceKm - km) < 0.01,
      );
      if (matchingOption) {
        setSelectedDistance(matchingOption.value);
        setCustomDistance("");
      } else {
        setSelectedDistance("custom");
        setCustomDistance(km.toString());
      }
      const h = Math.floor(input.targetTimeSeconds / 3600);
      const m = Math.floor((input.targetTimeSeconds % 3600) / 60);
      const s = Math.round(input.targetTimeSeconds % 60);
      setHours(h.toString());
      setMinutes(m.toString());
      setSeconds(s.toString());
      setStartTime(input.startTime);
      setStrategy(input.strategy);
      setWeight(input.bodyWeightKg?.toString() ?? "");

      const result = generateRacePlan(input);
      setPlan(result);
      setCheckedItems({});
      setExpandedSections({});
    },
    [],
  );

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return;
    deleteSimulation(deleteTarget);
    setSavedSimulations(getAllSimulations());
    setDeleteTarget(null);
    toast.success(t("saved.deletedSuccess"));
  }, [deleteTarget, t]);

  const inputClassName =
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const smallInputClassName =
    "flex h-9 w-16 rounded-md border border-input bg-transparent px-2 py-1 text-sm text-center shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <>
      <SEOHead
        title={t("title")}
        description={t("description")}
        canonical="/race-simulator"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("title"),
            description: t("description"),
            url: "https://zoned.run/race-simulator",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: tCommon("calculators:raceSimulator.seoBreadcrumb") },
            ],
          },
        ]}
      />
      <div className="py-8 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground text-lg">{t("description")}</p>
        </div>

        {/* Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Route className="size-5" />
              {t("inputs.distance")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Distance */}
            <div className="space-y-2">
              <label htmlFor="sim-distance" className="text-sm font-medium">
                {t("inputs.distance")}
              </label>
              <select
                id="sim-distance"
                value={selectedDistance}
                onChange={(e) => setSelectedDistance(e.target.value)}
                className={inputClassName}
              >
                {RACE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {pick(opt, "label")}
                  </option>
                ))}
                <option value="custom">{t("inputs.custom")}</option>
              </select>
              {isCustom && (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="number"
                    min={0.5}
                    max={200}
                    step={0.1}
                    placeholder="15"
                    value={customDistance}
                    onChange={(e) => setCustomDistance(e.target.value)}
                    className="flex h-9 w-full max-w-[120px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <span className="text-sm text-muted-foreground">km</span>
                </div>
              )}
            </div>

            {/* Target time */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("inputs.targetTime")}
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className={smallInputClassName}
                  />
                  <span className="text-sm text-muted-foreground">h</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={minutes}
                    onChange={(e) => setMinutes(e.target.value)}
                    className={smallInputClassName}
                  />
                  <span className="text-sm text-muted-foreground">min</span>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={seconds}
                    onChange={(e) => setSeconds(e.target.value)}
                    className={smallInputClassName}
                  />
                  <span className="text-sm text-muted-foreground">s</span>
                </div>
              </div>
            </div>

            {/* Start time */}
            <div className="space-y-2">
              <label htmlFor="sim-start-time" className="text-sm font-medium">
                {t("inputs.startTime")}
              </label>
              <input
                id="sim-start-time"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={inputClassName}
              />
            </div>

            {/* Strategy */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("inputs.strategy")}
              </label>
              <div className="flex gap-2">
                {(
                  [
                    { value: "even", label: t("inputs.even"), desc: t("inputs.evenDesc") },
                    { value: "negative", label: t("inputs.negative"), desc: t("inputs.negativeDesc") },
                    { value: "positive", label: t("inputs.positive"), desc: t("inputs.positiveDesc") },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setStrategy(s.value)}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-md text-sm font-medium border transition-colors",
                      strategy === s.value
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent border-input hover:bg-muted",
                    )}
                    title={s.desc}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {strategy === "even" && t("inputs.evenDesc")}
                {strategy === "negative" && t("inputs.negativeDesc")}
                {strategy === "positive" && t("inputs.positiveDesc")}
              </p>
            </div>

            {/* Weight */}
            <div className="space-y-2">
              <label htmlFor="sim-weight" className="text-sm font-medium">
                {t("inputs.weight")}
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="sim-weight"
                  type="number"
                  min={30}
                  max={200}
                  step={0.5}
                  placeholder="70"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="flex h-9 w-full max-w-[120px] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <span className="text-sm text-muted-foreground">
                  {t("inputs.weightUnit")}
                </span>
              </div>
            </div>

            {/* Generate */}
            <Button
              onClick={handleGenerate}
              disabled={!hasValidInput}
              className="w-full"
            >
              <Flag className="size-4" />
              {t("inputs.generate")}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {plan && (
          <>
            {/* Timeline */}
            <CollapsibleSection
              id="timeline"
              icon={<Clock className="size-5" />}
              title={t("sections.timeline")}
              defaultOpen
              expanded={expandedSections}
              onToggle={toggleSection}
            >
              <div className="space-y-3">
                {plan.timeline.map((event, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="tabular-nums font-mono text-sm font-medium min-w-[3.5rem] shrink-0">
                      {event.time}
                    </span>
                    <span
                      className={cn(
                        "text-sm",
                        TIMELINE_COLORS[event.type] ?? "text-foreground",
                      )}
                    >
                      {pick(event, "label")}
                    </span>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Day Before Checklist */}
            {plan.dayBeforeChecklist.length > 0 && (
              <CollapsibleSection
                id="dayBefore"
                icon={<Flag className="size-5" />}
                title={t("sections.dayBefore")}
                defaultOpen
                expanded={expandedSections}
                onToggle={toggleSection}
              >
                <ul className="space-y-2">
                  {plan.dayBeforeChecklist.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={checkedItems[i] ?? false}
                        onChange={() =>
                          setCheckedItems((prev) => ({
                            ...prev,
                            [i]: !prev[i],
                          }))
                        }
                        className="mt-0.5 shrink-0"
                      />
                      <span
                        className={cn(
                          "text-sm",
                          checkedItems[i] &&
                            "line-through text-muted-foreground",
                        )}
                      >
                        {pick(item, "text")}
                      </span>
                    </li>
                  ))}
                </ul>
              </CollapsibleSection>
            )}

            {/* Morning */}
            <CollapsibleSection
              id="morning"
              icon={<Utensils className="size-5" />}
              title={t("sections.morning")}
              defaultOpen
              expanded={expandedSections}
              onToggle={toggleSection}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{t("labels.wakeUp")}:</span>
                  <span className="tabular-nums font-mono">
                    {plan.wakeUpTime}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{t("labels.breakfast")}:</span>
                  <span className="tabular-nums font-mono">
                    {plan.breakfast.time}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {pick(plan.breakfast, "description")}
                </p>
              </div>
            </CollapsibleSection>

            {/* Warm-up */}
            {plan.warmupExercises.length > 0 && (
              <CollapsibleSection
                id="warmup"
                icon={<Flame className="size-5" />}
                title={t("sections.warmup")}
                defaultOpen
                expanded={expandedSections}
                onToggle={toggleSection}
              >
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {t("labels.warmupStart")}:{" "}
                    <span className="tabular-nums font-mono font-medium text-foreground">
                      {plan.warmupStartTime}
                    </span>{" "}
                    ({plan.warmupDurationMin} min)
                  </p>
                  <ul className="space-y-2">
                    {plan.warmupExercises.map((ex, i) => (
                      <li key={i} className="text-sm">
                        <span className="font-medium">
                          {pick(ex, "name")}
                        </span>
                        <span className="text-muted-foreground">
                          {" "}
                          &mdash; {pick(ex, "description")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CollapsibleSection>
            )}

            {/* Race -- Splits */}
            <CollapsibleSection
              id="race"
              icon={<Route className="size-5" />}
              title={t("sections.race")}
              defaultOpen
              expanded={expandedSections}
              onToggle={toggleSection}
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">{t("labels.targetPace")}:</span>
                  <span className="tabular-nums font-mono">
                    {formatPaceDisplay(
                      convertPace(
                        plan.targetTimeSeconds / 60 / plan.distanceKm,
                        unit,
                      ),
                    )}
                    {paceUnitLabel}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-2 text-left font-medium">#</th>
                        <th className="py-2 px-2 text-left font-medium">
                          {t("labels.dist")}
                        </th>
                        <th className="py-2 px-2 text-left font-medium">
                          {t("labels.split")}
                        </th>
                        <th className="py-2 px-2 text-left font-medium">
                          {t("labels.pace")}
                        </th>
                        <th className="py-2 px-2 text-left font-medium">
                          {t("labels.cumulative")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {plan.splits.map((split) => {
                        const convertedPace = convertPace(
                          split.paceMinPerKm,
                          unit,
                        );
                        const displayDist =
                          split.distance < 0.999
                            ? convertDistance(split.distance, unit).toFixed(2)
                            : convertDistance(split.distance, unit).toFixed(
                                unit === "imperial" ? 2 : 0,
                              );
                        return (
                          <tr
                            key={split.index}
                            className="border-b last:border-b-0 hover:bg-muted/50"
                          >
                            <td className="py-2 px-2 tabular-nums text-muted-foreground">
                              {split.index}
                            </td>
                            <td className="py-2 px-2 tabular-nums">
                              {displayDist} {distanceUnitLabel}
                            </td>
                            <td className="py-2 px-2 tabular-nums">
                              {formatSplitTime(split.splitTimeSeconds)}
                            </td>
                            <td className="py-2 px-2 tabular-nums">
                              {formatPaceDisplay(convertedPace)}
                              {paceUnitLabel}
                            </td>
                            <td className="py-2 px-2 tabular-nums font-medium">
                              {formatSplitTime(split.cumulativeTimeSeconds)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t font-medium">
                        <td className="py-2 px-2">{t("labels.total")}</td>
                        <td className="py-2 px-2 tabular-nums">
                          {convertDistance(plan.distanceKm, unit).toFixed(
                            unit === "imperial" ? 2 : 1,
                          )}{" "}
                          {distanceUnitLabel}
                        </td>
                        <td className="py-2 px-2" />
                        <td className="py-2 px-2 tabular-nums">
                          {formatPaceDisplay(
                            convertPace(
                              plan.targetTimeSeconds / 60 / plan.distanceKm,
                              unit,
                            ),
                          )}
                          {paceUnitLabel}
                        </td>
                        <td className="py-2 px-2 tabular-nums font-bold">
                          {formatSplitTime(plan.targetTimeSeconds)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </CollapsibleSection>

            {/* Nutrition */}
            <CollapsibleSection
              id="nutrition"
              icon={<Utensils className="size-5" />}
              title={t("sections.nutrition")}
              defaultOpen
              expanded={expandedSections}
              onToggle={toggleSection}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">
                      {t("nutrition.carbsPerHour")}
                    </p>
                    <p className="text-lg font-semibold tabular-nums">
                      {plan.fuelingPlan.carbsPerHourG}g
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">
                      {t("nutrition.fluidPerHour")}
                    </p>
                    <p className="text-lg font-semibold tabular-nums">
                      {plan.fuelingPlan.fluidMlPerHour}ml
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">
                      {t("nutrition.gelCount")}
                    </p>
                    <p className="text-lg font-semibold tabular-nums">
                      {plan.fuelingPlan.gelCount}
                    </p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">
                      {t("nutrition.gelFrequency")}
                    </p>
                    <p className="text-lg font-semibold tabular-nums">
                      {plan.fuelingPlan.gelFrequencyMin > 0
                        ? t("nutrition.everyMin", {
                            min: plan.fuelingPlan.gelFrequencyMin,
                          })
                        : "—"}
                    </p>
                  </div>
                </div>
                {plan.fuelingPlan.tips.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">
                      {t("nutrition.tips")}
                    </p>
                    <ul className="space-y-1">
                      {plan.fuelingPlan.tips.map((tip, i) => (
                        <li
                          key={i}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <Info className="size-3.5 mt-0.5 shrink-0" />
                          {pick(tip, "text")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Mental Cues */}
            <CollapsibleSection
              id="mental"
              icon={<Brain className="size-5" />}
              title={t("sections.mental")}
              defaultOpen
              expanded={expandedSections}
              onToggle={toggleSection}
            >
              <div className="space-y-3">
                {plan.mentalCues.map((cue, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="tabular-nums text-xs font-medium bg-muted rounded-full px-2 py-0.5 shrink-0 mt-0.5">
                      {cue.fromKm}–{cue.toKm} {t("labels.km")}
                    </span>
                    <p className="text-sm">
                      {pick(cue, "text")}
                    </p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Recovery */}
            <CollapsibleSection
              id="recovery"
              icon={<Heart className="size-5" />}
              title={t("sections.recovery")}
              defaultOpen
              expanded={expandedSections}
              onToggle={toggleSection}
            >
              <div className="space-y-2">
                {plan.fuelingPlan.timeline
                  .filter((cp) => cp.timeMin >= plan.targetTimeSeconds / 60)
                  .map((cp, i) => (
                    <p key={i} className="text-sm">
                      {pick(cp, "action")}
                    </p>
                  ))}
              </div>
            </CollapsibleSection>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSave} variant="outline">
                <Save className="size-4" />
                {t("actions.save")}
              </Button>
              <Button
                onClick={async () => {
                  if (!plan) return;
                  try {
                    await exportRaceSimToPDF(plan, isEn);
                    toast.success(tCommon("calculators:raceSimulator.pdfExported"));
                  } catch {
                    toast.error(tCommon("calculators:raceSimulator.exportFailed"));
                  }
                }}
                variant="outline"
              >
                <Download className="size-4" />
                {t("actions.exportPdf")}
              </Button>
            </div>
          </>
        )}

        {/* Empty state */}
        {!plan && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Info className="size-4 shrink-0" />
            {t("empty")}
          </div>
        )}

        {/* Saved simulations */}
        {savedSimulations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Plus className="size-5" />
                {t("saved.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {savedSimulations.map((sim) => (
                  <li
                    key={sim.id}
                    className="flex items-center justify-between gap-2 rounded-md border p-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">
                        {sim.label}
                      </p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatDate(new Date(sim.createdAt))}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLoad(sim)}
                      >
                        {t("actions.load")}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteTarget(sim.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {tCommon("calculators:raceSimulator.deleteConfirm")}
              </DialogTitle>
              <DialogDescription>
                {tCommon("calculators:raceSimulator.deleteDescription")}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">
                  {tCommon("calculators:raceSimulator.cancel")}
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
