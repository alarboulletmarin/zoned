import { useCallback, useMemo, useState } from "react";
import { Link, useParams, useNavigate, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft, Plus } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { EditorialTitle } from "@/components/editorial";
import { PlanWeeklyView } from "@/components/domain/PlanWeeklyView";
import { PlanWorkoutPanel } from "@/components/domain/PlanWorkoutPanel";
import { WeekPanel } from "@/components/weekly";
import { usePlan } from "@/hooks/usePlans";
import { useWorkouts } from "@/hooks";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import { useCrossDisciplineWorkouts } from "@/hooks/useCrossDisciplineWorkouts";
import {
  moveSession,
  deleteSessionFromPlan,
  addSessionToPlan,
  savePlan,
  getPlan,
} from "@/lib/planStorage";
import { generateWeek } from "@/lib/weekGenerator";
import { generatedWeekToSessions, planWeekToSlots } from "@/lib/weekToPlan";
import { usePickLang, useIsEnglish } from "@/lib/i18n-utils";
import type { AnyWorkoutTemplate } from "@/types";
import type { SessionType } from "@/types";
import type { DayIndex, WeekSettings } from "@/types/week";

const ACTIVITY_KEYS: Record<string, string> = {
  __activity_strength__: "strength",
  __activity_cycling__: "cycling",
  __activity_swimming__: "swimming",
  __activity_yoga__: "yoga",
  __activity_rest__: "rest",
  __activity_cross_training__: "cross_training",
};

export function WeekViewPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation(["library", "plan", "common"]);
  const pick = usePickLang();
  const isEn = useIsEnglish();
  const navigate = useNavigate();
  const { plan, isLoading, reload } = usePlan(id);

  const { workouts: running } = useWorkouts();
  const { workouts: strength } = useStrengthWorkouts();
  const { workouts: cycling } = useCrossDisciplineWorkouts("cycling");
  const { workouts: swimming } = useCrossDisciplineWorkouts("swimming");
  const catalog: AnyWorkoutTemplate[] = useMemo(
    () => [...running, ...cycling, ...swimming, ...strength],
    [running, cycling, swimming, strength],
  );
  const byId = useMemo(() => {
    const m = new Map<string, AnyWorkoutTemplate>();
    for (const w of catalog) m.set(w.id, w);
    return m;
  }, [catalog]);

  const workoutNames = useMemo(() => {
    const names: Record<string, string> = {};
    for (const w of catalog) names[w.id] = pick(w, "name");
    for (const [aid, key] of Object.entries(ACTIVITY_KEYS)) {
      names[aid] = t(`plan:activity.${key}`, { defaultValue: key });
    }
    return names;
  }, [catalog, pick, t]);

  const [showPanel, setShowPanel] = useState(false);
  const [addTarget, setAddTarget] = useState<{ day: number } | null>(null);
  const [name, setName] = useState<string | null>(null);

  const slots = useMemo(
    () => planWeekToSlots(plan?.weeks[0], byId),
    [plan, byId],
  );

  const handleMove = useCallback(
    (_fromWeek: number, fromIndex: number, _toWeek: number, toDay: number) => {
      if (!plan) return;
      if (moveSession(plan.id, 1, fromIndex, 1, toDay)) reload();
      else toast.error(t("plan:view.sessionMoveFailed"));
    },
    [plan, reload, t],
  );

  const handleDelete = useCallback(
    (_weekNumber: number, sessionIndex: number) => {
      if (!plan) return;
      if (deleteSessionFromPlan(plan.id, 1, sessionIndex)) reload();
    },
    [plan, reload],
  );

  const handleAddToDay = useCallback((_weekNumber: number, day: number) => {
    setAddTarget({ day });
    setShowPanel(true);
  }, []);

  const handleWorkoutAdd = useCallback(
    async (workoutId: string, _weekNumber: number, day: number) => {
      if (!plan) return;
      const activity = workoutId.match(/^__activity_(\w+)__$/);
      if (activity) {
        const fresh = getPlan(plan.id);
        if (!fresh) return;
        fresh.weeks[0].sessions.push({
          dayOfWeek: day,
          workoutId,
          sessionType: activity[1] as SessionType,
          isKeySession: false,
          estimatedDurationMin: 0,
        });
        fresh.weeks[0].sessions.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
        savePlan(fresh);
        reload();
        return;
      }
      if (await addSessionToPlan(plan.id, 1, workoutId, day)) reload();
    },
    [plan, reload],
  );

  const handleSessionClick = useCallback(
    (_weekNumber: number, _sessionIndex: number, workoutId: string) => {
      if (!workoutId.startsWith("__")) navigate(`/workout/${workoutId}`);
    },
    [navigate],
  );

  const handleGenerate = useCallback(
    (settings: WeekSettings) => {
      if (!plan || catalog.length === 0) return;
      const generated = generateWeek(settings, catalog);
      const fresh = getPlan(plan.id);
      if (!fresh) return;
      fresh.weeks[0].sessions = generatedWeekToSessions(generated);
      fresh.config.longRunDay = settings.longRunDay;
      savePlan(fresh);
      reload();
      toast.success(t("library:weekly.toast.generated", { defaultValue: "Semaine générée" }));
    },
    [plan, catalog, reload, t],
  );

  const handleRename = useCallback(
    (value: string) => {
      if (!plan) return;
      const fresh = getPlan(plan.id);
      if (!fresh) return;
      fresh.config.planName = value;
      fresh.name = value;
      fresh.nameEn = value;
      savePlan(fresh);
      reload();
    },
    [plan, reload],
  );

  if (isLoading) return null;
  if (!plan) return <Navigate to="/weeks" replace />;
  // A regular (multi-week) plan should use the full plan editor.
  if (!plan.config.isSingleWeek) return <Navigate to={`/plan/${plan.id}`} replace />;

  const displayName = name ?? pick(plan, "name");

  return (
    <>
      <SEOHead noindex title={displayName} canonical={`/weeks/${plan.id}`} />
      <div className="py-8 space-y-5">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/weeks">
            <ArrowLeft className="mr-2 size-4" />
            {t("library:weekly.list.title")}
          </Link>
        </Button>

        <input
          value={displayName}
          onChange={(e) => setName(e.target.value)}
          onBlur={(e) => handleRename(e.target.value.trim() || displayName)}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          aria-label={t("library:weekly.generate.namePlaceholder")}
          className="w-full bg-transparent text-2xl sm:text-3xl font-semibold italic focus:outline-none focus:ring-2 focus:ring-primary rounded-md px-1 -mx-1"
        />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Calendar editor */}
          <div className="min-w-0 space-y-4 lg:flex lg:flex-col">
            <div className="flex items-center justify-between gap-2">
              <EditorialTitle as="h2" size="md" className="sr-only">
                {displayName}
              </EditorialTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAddTarget(null);
                  setShowPanel((v) => !v);
                }}
              >
                <Plus className="size-4" />
                {t("plan:view.addWorkout", { defaultValue: "Add workout" })}
              </Button>
            </div>

            <div className="flex gap-4 lg:flex-1 lg:min-h-0">
              <div className="flex-1 min-w-0 lg:flex lg:flex-col">
                <PlanWeeklyView
                  plan={plan}
                  workoutNames={workoutNames}
                  currentWeek={1}
                  initialWeek={1}
                  isEn={isEn}
                  onSessionClick={handleSessionClick}
                  onSessionMove={handleMove}
                  onSessionDelete={handleDelete}
                  onWorkoutAdd={handleWorkoutAdd}
                  onAddToDay={handleAddToDay}
                  singleWeek
                />
              </div>
              {showPanel && (
                <div className="hidden md:block w-[280px] lg:w-[300px] shrink-0">
                  <div className="sticky top-20">
                    <PlanWorkoutPanel
                      isOpen={showPanel}
                      onClose={() => setShowPanel(false)}
                      inline
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Week panel: generator + live 80/20 stats */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <WeekPanel
              slots={slots}
              defaultLongRunDay={(plan.config.longRunDay ?? 5) as DayIndex}
              onGenerate={handleGenerate}
            />
          </aside>
        </div>
      </div>

      {/* Mobile bottom-sheet picker (tap to place on the chosen day) */}
      <PlanWorkoutPanel
        isOpen={showPanel}
        onClose={() => {
          setShowPanel(false);
          setAddTarget(null);
        }}
        onSelectWorkout={
          addTarget
            ? (workoutId) => {
                handleWorkoutAdd(workoutId, 1, addTarget.day);
                setAddTarget(null);
              }
            : undefined
        }
      />
    </>
  );
}
