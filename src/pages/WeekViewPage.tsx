import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Link,
  useParams,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft, ChevronDown, Share, Sparkles, Settings, Loader2 } from "@/components/icons";
import { badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SEOHead } from "@/components/seo";
import { EditorialTitle } from "@/components/editorial";
import { PlanWeeklyView } from "@/components/domain/PlanWeeklyView";
import { PlanWorkoutPanel } from "@/components/domain/PlanWorkoutPanel";
import { PlanExportMenu } from "@/components/domain/PlanExportMenu";
import { ScanCard } from "@/components/domain";
import { WeekSummaryBar, WeekGeneratorPanel } from "@/components/weekly";
import { usePlan } from "@/hooks/usePlans";
import { useWorkouts } from "@/hooks";
import { useIsMobile } from "@/hooks/useIsMobile";
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
import { sharedWeekUrl } from "@/lib/weekShare";
import { generatedWeekToSessions, planWeekToSlots } from "@/lib/weekToPlan";
import { computeWeekStats } from "@/lib/weekStats";
import { buildScanSchedule } from "@/lib/scanSchedule";
import { usePickLang, useIsEnglish } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";
import type { AnyWorkoutTemplate } from "@/types";
import type { SessionType } from "@/types";
import { WEEK_CATEGORIES, type WeekCategory } from "@/types/plan";
import {
  DEFAULT_WEEK_SETTINGS,
  type DayIndex,
  type WeekSettings,
} from "@/types/week";

const ACTIVITY_KEYS: Record<string, string> = {
  __activity_strength__: "strength",
  __activity_cycling__: "cycling",
  __activity_swimming__: "swimming",
  __activity_yoga__: "yoga",
  __activity_rest__: "rest",
  __activity_cross_training__: "cross_training",
};

const WEEKDAYS: DayIndex[] = [0, 1, 2, 3, 4, 5, 6];

/** Pick a uniformly random element. */
function sample<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function WeekViewPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const openSettingsOnMount =
    (location.state as { openSettings?: boolean } | null)?.openSettings === true;
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
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Generator settings live in the page so the sticky "Generate" button (mobile)
  // and the WeekGeneratorPanel share the same state.
  const [settings, setSettings] = useState<WeekSettings>({
    ...DEFAULT_WEEK_SETTINGS,
    longRunDay: (plan?.config.longRunDay ?? 5) as DayIndex,
  });

  // ── Generation animation state ───────────────────────────────────────────
  const [scanning, setScanning] = useState(false);
  // Per-day cycling workout shown during the scan (only for target days).
  const [scanCells, setScanCells] = useState<Record<number, AnyWorkoutTemplate>>(
    {},
  );
  // Which days the generated week will populate (drives the overlay layout).
  const [scanTargets, setScanTargets] = useState<Set<number>>(new Set());
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);
  useEffect(() => clearTimeouts, [clearTimeouts]);

  const slots = useMemo(
    () => planWeekToSlots(plan?.weeks[0], byId),
    [plan, byId],
  );
  const stats = useMemo(() => computeWeekStats(slots), [slots]);
  const weekIsPopulated = stats.sessions > 0;

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

  // ── Animated generation ───────────────────────────────────────────────────
  const handleGenerate = useCallback(
    (cfg: WeekSettings) => {
      if (!plan || catalog.length === 0 || scanning) return;
      clearTimeouts();

      // Compute the real week up-front; reveal it on the final tick.
      const generated = generateWeek(cfg, catalog);
      const targets = new Set(
        generated.slots.filter((s) => s.workout).map((s) => s.day),
      );

      setScanTargets(targets);
      setScanCells({});
      setScanning(true);
      setSettingsOpen(false);
      // Immediate feedback: bring the board into view so the scan is always
      // visible (esp. mobile, where the trigger sits at the bottom).
      boardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

      const times = buildScanSchedule(800);
      times.forEach((at, i) => {
        const isLast = i === times.length - 1;
        timeoutsRef.current.push(
          setTimeout(() => {
            if (isLast) {
              const fresh = getPlan(plan.id);
              if (fresh) {
                fresh.weeks[0].sessions = generatedWeekToSessions(generated);
                fresh.config.longRunDay = cfg.longRunDay;
                savePlan(fresh);
              }
              setScanning(false);
              setScanCells({});
              reload();
              toast.success(
                t("library:weekly.toast.generated", {
                  defaultValue: "Semaine générée",
                }),
              );
            } else {
              // Cycle a fresh random workout into each target day cell.
              const next: Record<number, AnyWorkoutTemplate> = {};
              for (const day of targets) next[day] = sample(catalog);
              setScanCells(next);
            }
          }, at),
        );
      });
    },
    [plan, catalog, scanning, clearTimeouts, reload, t],
  );

  // Arriving from the "Générer une semaine" creation mode: surface the settings
  // so the user picks their parameters first — we never generate blindly.
  const didOpenSettingsRef = useRef(false);
  const isMobile = useIsMobile();
  useEffect(() => {
    if (openSettingsOnMount && !didOpenSettingsRef.current && plan) {
      didOpenSettingsRef.current = true;
      if (isMobile) setSettingsOpen(true);
    }
  }, [openSettingsOnMount, plan, isMobile]);

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

  const handleCategoryChange = useCallback(
    (value: string) => {
      if (!plan) return;
      const fresh = getPlan(plan.id);
      if (!fresh) return;
      fresh.config.weekCategory =
        value === "none" ? undefined : (value as WeekCategory);
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

  const handleShare = async () => {
    const url = sharedWeekUrl(plan, displayName);
    if (navigator.share) {
      try {
        await navigator.share({ title: displayName, url });
      } catch {
        // Share sheet dismissed — nothing to do.
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success(t("common:share.toast.linkCopied"));
  };

  const generatorPanel = (
    <WeekGeneratorPanel
      settings={settings}
      onSettingsChange={setSettings}
      busy={scanning}
      onGenerate={handleGenerate}
      weekIsPopulated={weekIsPopulated}
    />
  );

  return (
    <>
      <SEOHead noindex title={displayName} canonical={`/weeks/${plan.id}`} />
      <div className="py-8 space-y-5 pb-28 md:pb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/weeks">
            <ArrowLeft className="mr-2 size-4" />
            {t("library:weekly.list.title")}
          </Link>
        </Button>

        <div className="space-y-2">
          <input
            value={displayName}
            onChange={(e) => setName(e.target.value)}
            onBlur={(e) => handleRename(e.target.value.trim() || displayName)}
            onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
            aria-label={t("library:weekly.generate.namePlaceholder")}
            className="w-full min-w-0 bg-transparent text-2xl sm:text-3xl font-semibold italic focus:outline-none focus:ring-2 focus:ring-primary rounded-md px-1 -mx-1"
          />
          {/* Meta row: category badge (left) · share + export (right) */}
          <div className="flex items-center justify-between gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  badgeVariants({
                    variant: plan.config.weekCategory ? "secondary" : "outline",
                  }),
                  "cursor-pointer",
                  !plan.config.weekCategory && "text-muted-foreground",
                )}
              >
                {plan.config.weekCategory
                  ? t(`library:weekly.prebuilt.category.${plan.config.weekCategory}`)
                  : t("library:weekly.category.label")}
                <ChevronDown className="size-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuRadioGroup
                  value={plan.config.weekCategory ?? "none"}
                  onValueChange={handleCategoryChange}
                >
                  <DropdownMenuRadioItem value="none">
                    {t("library:weekly.category.none")}
                  </DropdownMenuRadioItem>
                  {WEEK_CATEGORIES.map((c) => (
                    <DropdownMenuRadioItem key={c} value={c}>
                      {t(`library:weekly.prebuilt.category.${c}`)}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                aria-label={t("library:weekly.share.action")}
              >
                <Share className="size-3.5" />
              </Button>
              <PlanExportMenu plan={plan} workoutNames={workoutNames} size="sm" />
            </div>
          </div>
        </div>

        {/* Compact summary strip above the board */}
        <WeekSummaryBar stats={stats} slots={slots} targetVolumeH={settings.targetVolumeH} />

        {/* Board (left) + always-visible generator (right, tablet/desktop) */}
        <div className="relative grid gap-6 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_340px]">
          {/* Board — kept full width, never compressed (picker sits in the column). */}
          <div ref={boardRef} className="relative min-w-0 scroll-mt-20">
            <EditorialTitle as="h2" size="md" className="sr-only">
              {displayName}
            </EditorialTitle>
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

            {/* Scan overlay during animated generation */}
            {scanning && (
              <div
                className="absolute inset-0 z-10 rounded-xl bg-background/70 backdrop-blur-sm p-2 sm:p-3"
                aria-hidden="true"
              >
                <div className="grid h-full grid-cols-4 gap-1.5 sm:gap-2 md:grid-cols-7">
                  {WEEKDAYS.map((day) => {
                    const isTarget = scanTargets.has(day);
                    const w = scanCells[day];
                    return (
                      <div
                        key={day}
                        className={cn(
                          "min-h-20",
                          day === 6 && "col-span-4 md:col-span-1",
                        )}
                      >
                        {isTarget && w ? (
                          <ScanCard
                            workout={w}
                            pick={pick}
                            className="h-full p-2.5"
                          />
                        ) : (
                          <div className="h-full rounded-xl border border-dashed border-border/60 bg-muted/30" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Right column: the always-visible generator — or, while adding a
              session, the workout picker. The picker lives in THIS column, so
              the board on the left is never covered or compressed. */}
          <aside className="hidden md:block md:sticky md:top-20 md:self-start">
            {showPanel ? (
              <PlanWorkoutPanel
                isOpen={showPanel}
                onClose={() => {
                  setShowPanel(false);
                  setAddTarget(null);
                }}
                inline
              />
            ) : (
              generatorPanel
            )}
          </aside>
        </div>
      </div>

      {/* Mobile sticky action bar (thumb zone) — hidden once the generator
          panel becomes a visible column (md+). */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex gap-2">
          <Button
            className="flex-1"
            disabled={scanning}
            onClick={() => handleGenerate(settings)}
          >
            {scanning ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {scanning
              ? t("library:weekly.generate.busy")
              : t("library:weekly.generate.action")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setSettingsOpen(true)}
            disabled={scanning}
          >
            <Settings className="size-4" />
            {t("library:weekly.actions.adjust")}
          </Button>
        </div>
      </div>

      {/* Mobile generator bottom-sheet ("Régler") — compact `bare` panel so the
          whole form fits without scrolling. */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[90vh] overflow-y-auto rounded-t-2xl px-4 pt-4 pb-6 md:hidden"
        >
          <SheetHeader className="p-0">
            <SheetTitle>{t("library:weekly.generate.title")}</SheetTitle>
          </SheetHeader>
          <WeekGeneratorPanel
            settings={settings}
            onSettingsChange={setSettings}
            busy={scanning}
            onGenerate={handleGenerate}
            weekIsPopulated={weekIsPopulated}
            bare
          />
        </SheetContent>
      </Sheet>

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
