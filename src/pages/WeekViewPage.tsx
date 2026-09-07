import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
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
import { ZoneScale } from "@/components/visualization";
import { PlanWeeklyView, type WorkoutCardMeta } from "@/components/domain/PlanWeeklyView";
import { PlanWorkoutPanel } from "@/components/domain/PlanWorkoutPanel";
import { PlanExportMenu } from "@/components/domain/PlanExportMenu";
import { ScanCard } from "@/components/domain";
import { WeekSummaryBar, WeekGeneratorPanel } from "@/components/weekly";
import { usePlan } from "@/hooks/usePlans";
import { useWorkouts } from "@/hooks";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import { useCrossDisciplineWorkouts } from "@/hooks/useCrossDisciplineWorkouts";
import {
  moveSession,
  deleteSessionFromPlan,
  addSessionToPlan,
  savePlan,
  getPlan,
} from "@/lib/planStorage";
import { generateWeek, redrawSlot } from "@/lib/weekGenerator";
import { getAnyWorkoutTss, getDrawDiscipline } from "@/lib/workoutFilters";
import { sharedWeekUrl } from "@/lib/weekShare";
import {
  generatedWeekToSessions,
  kindForSessionType,
  planWeekToSlots,
  slotToSession,
} from "@/lib/weekToPlan";
import { computeWeekStats } from "@/lib/weekStats";
import { buildScanSchedule } from "@/lib/scanSchedule";
import { usePickLang, useIsEnglish } from "@/lib/i18n-utils";
import type { AnyWorkoutTemplate } from "@/types";
import { getDominantZone, isStrengthWorkout } from "@/types";
import type { SessionType } from "@/types";
import { WEEK_CATEGORIES, type WeekCategory } from "@/types/plan";
import {
  DEFAULT_WEEK_SETTINGS,
  type DayIndex,
  type WeekSettings,
  type WeekSlot,
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

  // Zone + load per workout: gives every card a meta line (Z2 · 1h05 · 62 TSS)
  // instead of a bare name floating in an empty column.
  const workoutMeta = useMemo(() => {
    const meta: Record<string, WorkoutCardMeta> = {};
    for (const w of catalog) {
      meta[w.id] = {
        zone: isStrengthWorkout(w) ? undefined : getDominantZone(w),
        tss: getAnyWorkoutTss(w),
      };
    }
    return meta;
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

  // ── Draw animation state ─────────────────────────────────────────────────
  const [scanning, setScanning] = useState(false);
  // Per-day cycling workout shown during the scan.
  const [scanCells, setScanCells] = useState<Record<number, AnyWorkoutTemplate>>(
    {},
  );
  // Days the overlay covers. Every other day stays sharp and untouched — that
  // is how a locked session, or a single re-roll, reads on screen.
  const [scanTargets, setScanTargets] = useState<Set<number>>(new Set());
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const boardRef = useRef<HTMLDivElement>(null);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);
  useEffect(() => clearTimeouts, [clearTimeouts]);

  /**
   * Run the slot-machine animation, then apply the change on the last tick.
   * Shared by "generate the week" (many cells) and "re-roll one session" (one).
   */
  const runScan = useCallback(
    (opts: {
      /** Days the overlay veils. */
      veiled: Set<number>;
      /** Days that flash random workouts (a subset of `veiled`). */
      cycling: number[];
      durationMs: number;
      /** Applies the result — called once, on the final tick. */
      onReveal: () => void;
    }) => {
      clearTimeouts();
      const roll = () =>
        setScanCells(
          Object.fromEntries(opts.cycling.map((d) => [d, sample(catalog)])),
        );

      setScanTargets(opts.veiled);
      roll();
      setScanning(true);

      const times = buildScanSchedule(opts.durationMs);
      times.forEach((at, i) => {
        const isLast = i === times.length - 1;
        timeoutsRef.current.push(
          setTimeout(() => {
            if (!isLast) {
              roll();
              return;
            }
            opts.onReveal();
            setScanning(false);
            setScanCells({});
            reload();
          }, at),
        );
      });
    },
    [catalog, clearTimeouts, reload],
  );

  /**
   * Draw animation, rendered by the board inside its own day cells. A separate
   * overlay grid could never stay aligned — the board is 7 columns on desktop
   * but 4 + 3 on mobile — so the scan lives where the content lives.
   * Days outside `scanTargets` return null and keep their real card on screen.
   */
  const renderScanCell = useCallback(
    (day: number) => {
      if (!scanning || !scanTargets.has(day)) return null;
      const w = scanCells[day];
      return w ? (
        <ScanCard workout={w} pick={pick} compact />
      ) : (
        <div className="zn-pw__scan" />
      );
    },
    [scanning, scanTargets, scanCells, pick],
  );

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

      // Locked sessions are carried over verbatim: the generator keeps their day
      // free, and their original plan session (notes, status…) is re-used below.
      const lockedSessions = plan.weeks[0].sessions.filter((s) => s.locked);
      const lockedDays = new Set(lockedSessions.map((s) => s.dayOfWeek));
      const lockedSlots: WeekSlot[] = lockedSessions.map((s) => ({
        day: s.dayOfWeek as DayIndex,
        kind: kindForSessionType(s.sessionType),
        workout: byId.get(s.workoutId) ?? null,
        locked: true,
      }));

      // Compute the real week up-front; reveal it on the final tick.
      const generated = generateWeek(cfg, catalog, { locked: lockedSlots });

      setSettingsOpen(false);
      // Immediate feedback: bring the board into view so the scan is always
      // visible (esp. mobile, where the trigger sits at the bottom).
      boardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

      runScan({
        // Locked days are left out of the overlay entirely: they stay on screen,
        // sharp and still, while everything else is redrawn.
        veiled: new Set(WEEKDAYS.filter((d) => !lockedDays.has(d))),
        cycling: generated.slots
          .filter((s) => s.workout && !lockedDays.has(s.day))
          .map((s) => s.day),
        durationMs: 800,
        onReveal: () => {
          const fresh = getPlan(plan.id);
          if (fresh) {
            fresh.weeks[0].sessions = [
              ...lockedSessions,
              ...generatedWeekToSessions(generated).filter(
                (s) => !lockedDays.has(s.dayOfWeek),
              ),
            ].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
            fresh.config.longRunDay = cfg.longRunDay;
            savePlan(fresh);
          }
          toast.success(t("library:weekly.toast.generated"));
        },
      });
    },
    [plan, catalog, byId, scanning, runScan, t],
  );

  // ── Lock / re-roll (issue #89) ────────────────────────────────────────────
  const lockedCount = useMemo(
    () => slots.filter((s) => s.locked).length,
    [slots],
  );

  const handleToggleLock = useCallback(
    (_weekNumber: number, sessionIndex: number) => {
      if (!plan) return;
      const fresh = getPlan(plan.id);
      const session = fresh?.weeks[0].sessions[sessionIndex];
      if (!fresh || !session) return;
      session.locked = !session.locked;
      savePlan(fresh);
      reload();
    },
    [plan, reload],
  );

  const handleUnlockAll = useCallback(() => {
    if (!plan) return;
    const fresh = getPlan(plan.id);
    if (!fresh) return;
    for (const session of fresh.weeks[0].sessions) delete session.locked;
    savePlan(fresh);
    reload();
  }, [plan, reload]);

  /** Draw another workout for a single session — the rest of the week is kept. */
  const handleRedraw = useCallback(
    (_weekNumber: number, sessionIndex: number) => {
      if (!plan || scanning) return;
      const session = plan.weeks[0].sessions[sessionIndex];
      if (!session || session.locked) return;

      const kind = kindForSessionType(session.sessionType);
      const current = byId.get(session.workoutId);
      const replacement = redrawSlot(settings, catalog, kind, {
        targetMin: session.estimatedDurationMin,
        excludeIds: plan.weeks[0].sessions.map((s) => s.workoutId),
        currentId: session.workoutId,
        discipline: current ? getDrawDiscipline(current) : undefined,
      });
      if (!replacement) {
        toast.error(t("library:weekly.toast.rerollEmpty"));
        return;
      }

      // Same slot-machine, scoped to this one day: the rest of the week stays
      // visible and untouched, so the re-roll reads as strictly local.
      runScan({
        veiled: new Set([session.dayOfWeek]),
        cycling: [session.dayOfWeek],
        durationMs: 450,
        onReveal: () => {
          const fresh = getPlan(plan.id);
          if (!fresh) return;
          fresh.weeks[0].sessions[sessionIndex] = slotToSession(
            session.dayOfWeek,
            kind,
            replacement,
          );
          savePlan(fresh);
          toast.success(t("library:weekly.toast.rerolled"));
        },
      });
    },
    [plan, catalog, byId, settings, scanning, runScan, t],
  );

  // Arriving from the "Générer une semaine" creation mode: surface the settings
  // so the user picks their parameters first — we never generate blindly.
  const didOpenSettingsRef = useRef(false);
  // The same 900px at which the generator rail folds away — below it the
  // settings live in the bottom sheet, so the query has to be the one the
  // stylesheet uses, not a different breakpoint that leaves a dead band.
  const railIsHidden = useMediaQuery("(max-width: 900px)");
  // The board hint describes a gesture, so it follows the input device rather
  // than the viewport: a tablet is wide enough to miss a width query but still
  // has no hover, and the quick-action buttons it would point at never appear.
  const canHover = useMediaQuery("(hover: hover) and (pointer: fine)");
  useEffect(() => {
    if (openSettingsOnMount && !didOpenSettingsRef.current && plan) {
      didOpenSettingsRef.current = true;
      if (railIsHidden) setSettingsOpen(true);
    }
  }, [openSettingsOnMount, plan, railIsHidden]);

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
      lockedCount={lockedCount}
      onUnlockAll={handleUnlockAll}
    />
  );

  return (
    <>
      <SEOHead noindex title={displayName} canonical={`/weeks/${plan.id}`} />

      <div className="zn-pw" data-dock="true">
        <Button variant="ghost" size="sm" asChild className="zn-pw__back">
          <Link to="/weeks">
            <ArrowLeft size={16} />
            {t("library:weekly.list.title")}
          </Link>
        </Button>

        <section className="zn-pw__band zn-pw__band--first">
          {/* The board takes the column; the generator is a rail beside it, so
              it never covers or compresses the week being edited. Below 900px
              the rail folds away and the dock carries the same two actions. */}
          <div className="zn-pw__editor">
            <div
              className="zn-stack"
              style={{ "--gap": "var(--sp-13)" } as CSSProperties}
            >
              <div
                className="zn-stack"
                style={{ "--gap": "var(--sp-6)" } as CSSProperties}
              >
                <h1 className="sr-only">{displayName}</h1>
                <input
                  value={displayName}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={(e) =>
                    handleRename(e.target.value.trim() || displayName)
                  }
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.target as HTMLInputElement).blur()
                  }
                  aria-label={t("library:weekly.generate.namePlaceholder")}
                  className="zn-pw__name"
                />

                {/* What kind of week this is (left), and what you can send it
                    out as (right). */}
                <div
                  className="zn-cluster zn-cluster--split"
                  style={{ "--gap": "var(--sp-6)" } as CSSProperties}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={badgeVariants({
                        variant: plan.config.weekCategory
                          ? "secondary"
                          : "outline",
                        className: "zn-pw__cat",
                      })}
                    >
                      {plan.config.weekCategory
                        ? t(
                            `library:weekly.prebuilt.category.${plan.config.weekCategory}`,
                          )
                        : t("library:weekly.category.label")}
                      <ChevronDown size={13} />
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

                  <div
                    className="zn-row"
                    style={{ "--gap": "var(--sp-4)" } as CSSProperties}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      aria-label={t("library:weekly.share.action")}
                    >
                      <Share size={15} />
                    </Button>
                    <PlanExportMenu
                      plan={plan}
                      workoutNames={workoutNames}
                      size="sm"
                      variant="outline"
                    />
                  </div>
                </div>
              </div>

              <WeekSummaryBar
                stats={stats}
                slots={slots}
                targetVolumeH={settings.targetVolumeH}
              />

              {/* The ramp orders the zones on the board but does not name them. */}
              <ZoneScale />

              <div>
                {/* The editing legend sits OUTSIDE the positioned wrapper below,
                    so the scan overlay covers the board and nothing else. Touch
                    has no hover, so its actions live in the tap menu instead. */}
                {weekIsPopulated && (
                  <p
                    className="zn-mono zn-pw__hint"
                    data-hidden={scanning ? "true" : undefined}
                  >
                    {canHover
                      ? t("library:weekly.boardHint")
                      : t("library:weekly.boardHintTouch")}
                  </p>
                )}
                <div ref={boardRef} className="zn-pw__board">
                  <PlanWeeklyView
                    plan={plan}
                    workoutNames={workoutNames}
                    workoutMeta={workoutMeta}
                    currentWeek={1}
                    initialWeek={1}
                    isEn={isEn}
                    onSessionClick={handleSessionClick}
                    onSessionMove={handleMove}
                    onSessionDelete={handleDelete}
                    onToggleLock={handleToggleLock}
                    onRedraw={handleRedraw}
                    onWorkoutAdd={handleWorkoutAdd}
                    onAddToDay={handleAddToDay}
                    renderScanCell={renderScanCell}
                    singleWeek
                  />
                </div>
              </div>
            </div>

            {/* The rail: the generator, or the workout picker while a session
                is being added. */}
            <aside className="zn-pw__rail">
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
        </section>
      </div>

      {/* The two actions the rail carries, kept in the thumb zone once it is
          gone. One vermillon fill: the draw. */}
      <div className="zn-pw__dock">
        {/* The short verb, not the rail's full call: the bar has 233px between
            the screen edge and the menu pill, and "Générer ma semaine" needs
            215 of them on its own — it clipped mid-word. */}
        <Button
          disabled={scanning}
          onClick={() => handleGenerate(settings)}
        >
          {scanning ? <Loader2 size={17} /> : <Sparkles size={17} />}
          {scanning
            ? t("library:weekly.generate.busy")
            : t("library:weekly.generate.actionShort")}
        </Button>
        {/* Icon only, like the two pills beside the call on a session's own
            dock: two labels do not fit in what the menu pill leaves. */}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSettingsOpen(true)}
          disabled={scanning}
          aria-label={t("library:weekly.actions.adjust")}
        >
          <Settings size={17} />
        </Button>
      </div>

      {/* The generator's parameters, as a bottom sheet, where the rail cannot
          fit. `bare` so the whole form lands without a scroll. */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="bottom">
          <SheetHeader>
            <SheetTitle>{t("library:weekly.generate.title")}</SheetTitle>
          </SheetHeader>
          <WeekGeneratorPanel
            settings={settings}
            onSettingsChange={setSettings}
            busy={scanning}
            onGenerate={handleGenerate}
            weekIsPopulated={weekIsPopulated}
            lockedCount={lockedCount}
            onUnlockAll={handleUnlockAll}
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
