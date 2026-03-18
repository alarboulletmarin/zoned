import { useState, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Zap,
  Timer,
  Route,
  Flag,
  Calendar,
  Target,
  Mountain,
  CheckIcon,
  Loader2,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { useCreatePlan } from "@/hooks/usePlans";
import { loadUserZonePrefs } from "@/lib/zones";
import {
  RACE_DISTANCE_META,
  type RaceDistance,
  type PlanConfig,
} from "@/types/plan";
import type { Difficulty, UserZonePreferences } from "@/types";
import { DIFFICULTY_META } from "@/types";

// ── Constants ────────────────────────────────────────────────────────

const TOTAL_STEPS = 7;
const MIN_WEEKS = 8;
const WARN_WEEKS = 24;

const DAYS_PER_WEEK_OPTIONS = [3, 4, 5, 6] as const;

const RACE_DISTANCE_ICONS: Record<RaceDistance, React.ReactNode> = {
  "5K": <Zap className="size-6 text-primary" />,
  "10K": <Timer className="size-6 text-primary" />,
  semi: <Route className="size-6 text-primary" />,
  marathon: <Flag className="size-6 text-primary" />,
  trail_short: <Mountain className="size-6 text-primary" />,
  trail: <Mountain className="size-6 text-primary" />,
  ultra: <Mountain className="size-6 text-primary" />,
};

// ── Helpers ──────────────────────────────────────────────────────────

function calculateWeeks(raceDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const race = new Date(raceDate);
  const diffMs = race.getTime() - now.getTime();
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
}

function suggestLevel(vma: number): Difficulty {
  if (vma < 12) return "beginner";
  if (vma <= 15) return "intermediate";
  if (vma <= 18) return "advanced";
  return "elite";
}

function formatPace(totalSeconds: number): string {
  const min = Math.floor(totalSeconds / 60);
  const sec = Math.round(totalSeconds % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

function parsePaceToSeconds(paceStr: string): number | null {
  const match = paceStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const min = parseInt(match[1], 10);
  const sec = parseInt(match[2], 10);
  if (sec >= 60) return null;
  return min * 60 + sec;
}

function estimateFinishTime(
  paceSecondsPerKm: number,
  distanceKm: number
): string {
  const totalSeconds = paceSecondsPerKm * distanceKm;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);
  if (hours > 0) {
    return `${hours}h${minutes.toString().padStart(2, "0")}min${seconds.toString().padStart(2, "0")}s`;
  }
  return `${minutes}min${seconds.toString().padStart(2, "0")}s`;
}

function generateId(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Form state type ──────────────────────────────────────────────────

interface FormState {
  raceDistance: RaceDistance | null;
  raceDate: string;
  raceName: string;
  runnerLevel: Difficulty | null;
  daysPerWeek: number;
  longRunDay: number;
  targetPace: string;
  elevationGain: string;
}

// ── Component ────────────────────────────────────────────────────────

export function PlanCreatePage() {
  const { i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const navigate = useNavigate();
  const { createPlan, isGenerating, error, canCreate } = useCreatePlan();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [form, setForm] = useState<FormState>({
    raceDistance: null,
    raceDate: "",
    raceName: "",
    runnerLevel: null,
    daysPerWeek: 4,
    longRunDay: 6,
    targetPace: "",
    elevationGain: "",
  });

  // Load user zone preferences for VMA suggestion
  const userPrefs: UserZonePreferences | null = useMemo(
    () => loadUserZonePrefs(),
    []
  );

  // ── Navigation ───────────────────────────────────────────────────

  const goForward = useCallback(() => {
    setDirection("forward");
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }, []);

  const goBack = useCallback(() => {
    setDirection("backward");
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  // ── Derived values ───────────────────────────────────────────────

  const weeksCount = useMemo(
    () => (form.raceDate ? calculateWeeks(form.raceDate) : 0),
    [form.raceDate]
  );

  const minWeeksForDistance = useMemo(() => {
    if (form.raceDistance === "ultra") return 12;
    if (form.raceDistance === "trail" || form.raceDistance === "trail_short") return 10;
    return MIN_WEEKS; // 8
  }, [form.raceDistance]);

  const dateValid = weeksCount >= minWeeksForDistance && weeksCount <= WARN_WEEKS;
  const dateTooLong = weeksCount > WARN_WEEKS;

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + minWeeksForDistance * 7);
    return d.toISOString().split("T")[0];
  }, [minWeeksForDistance]);

  const paceSeconds = useMemo(
    () => parsePaceToSeconds(form.targetPace),
    [form.targetPace]
  );

  const suggestedLevel = useMemo(
    () => (userPrefs?.vma ? suggestLevel(userPrefs.vma) : null),
    [userPrefs]
  );

  // ── Submit handler ───────────────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    if (!form.raceDistance || !form.runnerLevel || !form.raceDate) return;

    const config: PlanConfig = {
      id: generateId(),
      raceDistance: form.raceDistance,
      raceDate: form.raceDate,
      raceName: form.raceName || undefined,
      runnerLevel: form.runnerLevel,
      daysPerWeek: form.daysPerWeek,
      longRunDay: form.longRunDay,
      vma: userPrefs?.vma,
      targetPaceMinKm: paceSeconds ? paceSeconds / 60 : undefined,
      elevationGain: form.elevationGain
        ? parseInt(form.elevationGain, 10)
        : undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      const plan = await createPlan(config);
      navigate(`/plan/${plan.id}`);
    } catch {
      // Error is exposed via the hook's error state
    }
  }, [form, userPrefs, paceSeconds, createPlan, navigate]);

  // ── Step indicator ───────────────────────────────────────────────

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
        <span>
          {isEn ? "Step" : "Étape"} {step}/{TOTAL_STEPS}
        </span>
        {step > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={goBack}
            className="h-auto p-0 hover:bg-transparent"
          >
            <ArrowLeft className="size-4 mr-1" />
            {isEn ? "Back" : "Retour"}
          </Button>
        )}
      </div>
      {/* Dot indicators */}
      <div className="flex items-center gap-2 justify-center">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
          <div
            key={s}
            className={cn(
              "size-2.5 rounded-full transition-all duration-300",
              s === step
                ? "bg-primary scale-125"
                : s < step
                  ? "bg-primary/50"
                  : "bg-muted-foreground/25"
            )}
          />
        ))}
      </div>
    </div>
  );

  // ── Step 1: Race Distance ────────────────────────────────────────

  const renderStep1 = () => (
    <div
      className={cn(
        "space-y-4",
        direction === "forward"
          ? "animate-slide-in-right"
          : "animate-slide-in-left"
      )}
    >
      <div className="text-center mb-6">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Target className="size-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">
          {isEn ? "Choose your distance" : "Choisissez votre distance"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isEn
            ? "Which race are you training for?"
            : "Pour quelle course vous entraînez-vous ?"}
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(Object.keys(RACE_DISTANCE_META) as RaceDistance[]).map((dist) => {
          const meta = RACE_DISTANCE_META[dist];
          return (
            <Card
              key={dist}
              interactive
              className={cn(
                "cursor-pointer transition-all duration-200",
                form.raceDistance === dist && "ring-2 ring-primary"
              )}
              onClick={() => {
                setForm((f) => ({ ...f, raceDistance: dist }));
                goForward();
              }}
            >
              <CardContent className="p-6 flex items-center gap-4">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {RACE_DISTANCE_ICONS[dist]}
                </div>
                <div>
                  <div className="font-medium text-lg">
                    {isEn ? meta.labelEn : meta.label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {meta.distanceKm} km
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  // ── Step 2: Race Date ────────────────────────────────────────────

  const renderStep2 = () => (
    <div
      className={cn(
        "space-y-4",
        direction === "forward"
          ? "animate-slide-in-right"
          : "animate-slide-in-left"
      )}
    >
      <div className="text-center mb-6">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Calendar className="size-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">
          {isEn ? "When is the race?" : "Quand a lieu la course ?"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isEn
            ? `At least ${minWeeksForDistance} weeks from now`
            : `Au minimum ${minWeeksForDistance} semaines à partir d'aujourd'hui`}
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <input
            type="date"
            min={minDate}
            value={form.raceDate}
            onChange={(e) =>
              setForm((f) => ({ ...f, raceDate: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter" && dateValid) goForward();
            }}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {form.raceDate && dateValid && (
            <p className="text-sm text-muted-foreground text-center">
              {weeksCount}{" "}
              {isEn ? "weeks of preparation" : "semaines de préparation"}
            </p>
          )}

          {form.raceDate && !dateValid && (
            <p className="text-sm text-destructive text-center">
              {isEn
                ? `Too close! You need at least ${minWeeksForDistance} weeks.`
                : `Trop proche ! Il faut au moins ${minWeeksForDistance} semaines.`}
            </p>
          )}

          {form.raceDate && dateTooLong && (
            <p className="text-sm text-destructive text-center">
              {isEn
                ? "Over 24 weeks is not supported. Choose a closer date."
                : "Plus de 24 semaines n'est pas possible. Choisissez une date plus proche."}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={goForward} disabled={!dateValid}>
          {isEn ? "Continue" : "Continuer"}
        </Button>
      </div>
    </div>
  );

  // ── Step 3: Race Name (optional) ─────────────────────────────────

  const renderStep3 = () => (
    <div
      className={cn(
        "space-y-4",
        direction === "forward"
          ? "animate-slide-in-right"
          : "animate-slide-in-left"
      )}
    >
      <div className="text-center mb-6">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Flag className="size-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">
          {isEn ? "Name your race" : "Nom de la course"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isEn ? "Optional - you can skip this step" : "Optionnel - vous pouvez passer cette étape"}
        </p>
      </div>

      <Card>
        <CardContent className="p-6">
          <input
            type="text"
            value={form.raceName}
            onChange={(e) =>
              setForm((f) => ({ ...f, raceName: e.target.value }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") goForward();
            }}
            placeholder={
              isEn ? "e.g. Paris Marathon" : "ex. Marathon de Paris"
            }
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            maxLength={100}
          />
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={goForward}>
          {isEn ? "Skip" : "Passer"}
        </Button>
        <Button onClick={goForward}>
          {isEn ? "Continue" : "Continuer"}
        </Button>
      </div>
    </div>
  );

  // ── Step 4: Runner Level ─────────────────────────────────────────

  const renderStep4 = () => {
    const levels: Difficulty[] = [
      "beginner",
      "intermediate",
      "advanced",
      "elite",
    ];

    return (
      <div
        className={cn(
          "space-y-4",
          direction === "forward"
            ? "animate-slide-in-right"
            : "animate-slide-in-left"
        )}
      >
        <div className="text-center mb-6">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Target className="size-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">
            {isEn ? "Your running level" : "Votre niveau de course"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isEn
              ? "This determines workout intensity"
              : "Cela détermine l'intensité des séances"}
          </p>
        </div>

        {userPrefs?.vma && suggestedLevel && (
          <div className="rounded-lg border bg-primary/5 p-3 text-sm text-center">
            {isEn
              ? `Based on your VMA of ${userPrefs.vma} km/h, we suggest the `
              : `Basé sur votre VMA de ${userPrefs.vma} km/h, nous suggérons le niveau `}
            <span className="font-semibold">
              {isEn
                ? DIFFICULTY_META[suggestedLevel].labelEn
                : DIFFICULTY_META[suggestedLevel].label}
            </span>
            {isEn ? " level" : ""}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {levels.map((level) => {
            const meta = DIFFICULTY_META[level];
            const isSuggested = level === suggestedLevel;
            return (
              <Card
                key={level}
                interactive
                className={cn(
                  "cursor-pointer transition-all duration-200",
                  form.runnerLevel === level && "ring-2 ring-primary",
                  isSuggested &&
                    form.runnerLevel !== level &&
                    "border-primary/40"
                )}
                onClick={() => {
                  setForm((f) => ({ ...f, runnerLevel: level }));
                  goForward();
                }}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-primary">
                      {meta.level}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-lg">
                      {isEn ? meta.labelEn : meta.label}
                    </div>
                    {isSuggested && (
                      <div className="text-xs text-primary">
                        {isEn ? "Suggested" : "Suggéré"}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  // ── Step 5: Training Configuration ───────────────────────────────

  const renderStep5 = () => (
    <div
      className={cn(
        "space-y-4",
        direction === "forward"
          ? "animate-slide-in-right"
          : "animate-slide-in-left"
      )}
    >
      <div className="text-center mb-6">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Calendar className="size-8 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">
          {isEn ? "Training schedule" : "Planning d'entraînement"}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isEn
            ? "How many sessions per week?"
            : "Combien de séances par semaine ?"}
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Days per week */}
          <div>
            <label className="text-sm font-medium mb-3 block">
              {isEn ? "Sessions per week" : "Séances par semaine"}
            </label>
            <div className="flex gap-2">
              {DAYS_PER_WEEK_OPTIONS.map((n) => (
                <Button
                  key={n}
                  variant={form.daysPerWeek === n ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setForm((f) => ({ ...f, daysPerWeek: n }))}
                >
                  {n}
                </Button>
              ))}
            </div>
          </div>

        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={goForward}>
          {isEn ? "Continue" : "Continuer"}
        </Button>
      </div>
    </div>
  );

  // ── Step 6: Pace & Elevation (optional) ──────────────────────────

  const renderStep6 = () => {
    const distanceKm = form.raceDistance
      ? RACE_DISTANCE_META[form.raceDistance].distanceKm
      : 0;

    return (
      <div
        className={cn(
          "space-y-4",
          direction === "forward"
            ? "animate-slide-in-right"
            : "animate-slide-in-left"
        )}
      >
        <div className="text-center mb-6">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mountain className="size-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">
            {isEn ? "Pace & Elevation" : "Allure & Dénivelé"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isEn
              ? "Optional - you can skip this step"
              : "Optionnel - vous pouvez passer cette étape"}
          </p>
          {(form.raceDistance === "trail_short" || form.raceDistance === "trail" || form.raceDistance === "ultra") && (
            <p className="text-sm text-primary text-center mt-2">
              {isEn
                ? "Elevation data is important for trail-specific training"
                : "Le dénivelé est important pour un entraînement trail adapté"}
            </p>
          )}
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Target pace */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {isEn ? "Target pace (min/km)" : "Allure cible (min/km)"}
              </label>
              <input
                type="text"
                value={form.targetPace}
                onChange={(e) =>
                  setForm((f) => ({ ...f, targetPace: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (paceSeconds || !form.targetPace)) goForward();
                }}
                placeholder="5:30"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {paceSeconds && distanceKm > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {isEn ? "Estimated finish: " : "Temps estimé : "}
                  <span className="font-medium">
                    {estimateFinishTime(paceSeconds, distanceKm)}
                  </span>
                </p>
              )}
              {form.targetPace && !paceSeconds && (
                <p className="text-sm text-destructive mt-2">
                  {isEn
                    ? "Format: MM:SS (e.g. 5:30)"
                    : "Format : MM:SS (ex. 5:30)"}
                </p>
              )}
            </div>

            {/* Elevation gain */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {isEn ? "Elevation gain (m)" : "Dénivelé positif (m)"}
              </label>
              <input
                type="number"
                value={form.elevationGain}
                onChange={(e) =>
                  setForm((f) => ({ ...f, elevationGain: e.target.value }))
                }
                placeholder={isEn ? "e.g. 350" : "ex. 350"}
                min={0}
                max={10000}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={goForward}>
            {isEn ? "Skip" : "Passer"}
          </Button>
          <Button
            onClick={goForward}
            disabled={
              form.targetPace !== "" && !paceSeconds
            }
          >
            {isEn ? "Continue" : "Continuer"}
          </Button>
        </div>
      </div>
    );
  };

  // ── Step 7: Summary & Generate ───────────────────────────────────

  const renderStep7 = () => {
    const distMeta = form.raceDistance
      ? RACE_DISTANCE_META[form.raceDistance]
      : null;
    const levelMeta = form.runnerLevel
      ? DIFFICULTY_META[form.runnerLevel]
      : null;
    const distanceKm = distMeta?.distanceKm ?? 0;

    return (
      <div
        className={cn(
          "space-y-4",
          direction === "forward"
            ? "animate-slide-in-right"
            : "animate-slide-in-left"
        )}
      >
        <div className="text-center mb-6">
          <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CheckIcon className="size-8 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">
            {isEn ? "Summary" : "Récapitulatif"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isEn
              ? "Review your selections before generating"
              : "Vérifiez vos choix avant de générer le plan"}
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-3">
            {/* Distance */}
            <SummaryRow
              label={isEn ? "Distance" : "Distance"}
              value={
                distMeta
                  ? `${isEn ? distMeta.labelEn : distMeta.label} (${distMeta.distanceKm} km)`
                  : "-"
              }
            />
            {/* Race date */}
            <SummaryRow
              label={isEn ? "Race date" : "Date de course"}
              value={
                form.raceDate
                  ? `${new Date(form.raceDate).toLocaleDateString(
                      isEn ? "en-US" : "fr-FR",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )} (${weeksCount} ${isEn ? "weeks" : "sem."})`
                  : "-"
              }
            />
            {/* Race name */}
            {form.raceName && (
              <SummaryRow
                label={isEn ? "Race name" : "Nom de la course"}
                value={form.raceName}
              />
            )}
            {/* Level */}
            <SummaryRow
              label={isEn ? "Level" : "Niveau"}
              value={
                levelMeta
                  ? isEn
                    ? levelMeta.labelEn
                    : levelMeta.label
                  : "-"
              }
            />
            {/* Days */}
            <SummaryRow
              label={isEn ? "Sessions/week" : "Séances/semaine"}
              value={`${form.daysPerWeek}`}
            />
            {/* Pace */}
            {paceSeconds && (
              <SummaryRow
                label={isEn ? "Target pace" : "Allure cible"}
                value={`${formatPace(paceSeconds)}/km → ${estimateFinishTime(paceSeconds, distanceKm)}`}
              />
            )}
            {/* Elevation */}
            {form.elevationGain && (
              <SummaryRow
                label={isEn ? "Elevation" : "Dénivelé"}
                value={`${form.elevationGain} m D+`}
              />
            )}
          </CardContent>
        </Card>

        {!canCreate && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive text-center">
            {isEn ? "You've reached the limit of 5 plans. " : "Limite de 5 plans atteinte. "}
            <Link to="/plans" className="underline font-medium">
              {isEn ? "Delete an existing plan" : "Supprimer un plan existant"}
            </Link>
          </div>
        )}

        {error && canCreate && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive text-center">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={isGenerating || !canCreate}
            className="w-full sm:w-auto"
          >
            {isGenerating ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                {isEn ? "Generating..." : "Génération en cours..."}
              </>
            ) : (
              <>
                {isEn ? "Generate plan" : "Générer le plan"}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  // ── Render ───────────────────────────────────────────────────────

  return (
    <>
      <SEOHead
        title={isEn ? "Create Training Plan" : "Créer un plan d'entraînement"}
        description={
          isEn
            ? "Create a personalized running training plan for your next race."
            : "Créez un plan d'entraînement personnalisé pour votre prochaine course."
        }
        canonical="/plan/create"
      />
      <div className="py-8">
        <div className="max-w-2xl mx-auto">
          {renderStepIndicator()}
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
          {step === 6 && renderStep6()}
          {step === 7 && renderStep7()}
        </div>
      </div>
    </>
  );
}

// ── Helper component ─────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
