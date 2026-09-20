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
import { toast } from "@/components/ui/toast";
import { ArrowLeft, ChevronDown, Plus, Share, Sparkles } from "@/components/icons";
import { badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { SEOHead } from "@/components/seo";
import { PlanWeeklyView, type WorkoutCardMeta } from "@/components/domain/PlanWeeklyView";
import { PlanWorkoutPanel } from "@/components/domain/PlanWorkoutPanel";
import {
  WeekSessionSheet,
  type WeekSessionSheetTarget,
} from "@/components/domain/WeekSessionSheet";
import { PlanExportMenu } from "@/components/domain/PlanExportMenu";
import { WeekShareDialog } from "@/components/share/WeekShareDialog";
import { ScanCard } from "@/components/domain";
import { WeekSummaryStrip, WeekGeneratorPanel } from "@/components/weekly";
import { usePlan } from "@/hooks/usePlans";
import { useWorkouts } from "@/hooks";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import { useCrossDisciplineWorkouts } from "@/hooks/useCrossDisciplineWorkouts";
import {
  duplicateSession,
  moveSession,
  deleteSessionFromPlan,
  savePlan,
  getPlan,
  getAllPlans,
  mergeWeekIntoPlan,
  type MergeWeekMode,
} from "@/lib/planStorage";
import {
  ACTIVITY_KINDS,
  activityKindOf,
  defaultActivityDraft,
  makeActivitySession,
} from "@/lib/activitySession";
import { loadCommutePattern } from "@/lib/athleteProfile";
import { generateWeek, redrawSlot } from "@/lib/weekGenerator";
import { getCustomWorkouts } from "@/lib/customWorkoutStorage";
import { getAnyWorkoutTss, getDrawDiscipline } from "@/lib/workoutFilters";
import type { PlanSession } from "@/types/plan";
import { sharedWeekUrl } from "@/lib/weekShare";
import {
  generatedWeekToSessions,
  kindForSessionType,
  planWeekToSlots,
  sessionFromWorkout,
  slotToSession,
} from "@/lib/weekToPlan";
import { computeWeekStats } from "@/lib/weekStats";
import {
  layerFor,
  loadTodayComposition,
  mondayOf,
  placeWeek,
  planWeekAt,
  removeLayer,
  saveTodayComposition,
  setLayerEnabled,
  type TodayComposition,
} from "@/lib/todayComposition";
import { isoDateOnly } from "@/lib/planDates";
import { buildScanSchedule } from "@/lib/scanSchedule";
import { usePickLang, useIsEnglish } from "@/lib/i18n-utils";
import type { AnyWorkoutTemplate } from "@/types";
import { getDominantZone, isStrengthWorkout } from "@/types";
import { WEEK_CATEGORIES, type WeekCategory } from "@/types/plan";
import {
  DEFAULT_WEEK_SETTINGS,
  type DayIndex,
  type WeekSettings,
  type WeekSlot,
} from "@/types/week";

const WEEKDAYS: DayIndex[] = [0, 1, 2, 3, 4, 5, 6];

/**
 * What the rail beside the board holds, if anything. The board is the
 * screen's object and takes the whole column by default; the generator and
 * the workout picker are tools, opened on demand and closed when done, so a
 * week composed by hand is never edited next to a form it does not use.
 */
type RailTool = "generate" | "add" | null;

/** The budgets the badge offers, in hours: the generator's own range. */
const BUDGET_HOURS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 12];

/** 2.5 prints "2,5" in French, "2.5" in English; whole hours print bare. */
function formatHours(h: number, isEn = false): string {
  return Number.isInteger(h) ? String(h) : isEn ? String(h) : String(h).replace(".", ",");
}

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
  // The sessions the builder made travel with the running catalog
  // (`useWorkouts` merges them), so a week can hold and name them.
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
    for (const { workoutId, kind } of ACTIVITY_KINDS) {
      names[workoutId] = t(`plan:activity.${kind}`, { defaultValue: kind });
    }
    return names;
  }, [catalog, pick, t]);

  const [railTool, setRailTool] = useState<RailTool>(null);
  const showPanel = railTool === "add";
  const [addTarget, setAddTarget] = useState<{ day: number } | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  /* Où la semaine est posée dans le cockpit, si elle l'est. La composition
     est une vue SUR les semaines, pas une propriété de la semaine, mais c'est
     ici qu'on la compose : le geste doit être à côté du nom, pas dans /today.
     Lue une fois, réécrite à chaque geste. */
  const [composition, setComposition] = useState<TodayComposition>(() => loadTodayComposition());
  const writeComposition = useCallback((next: TodayComposition) => {
    setComposition(next);
    saveTodayComposition(next);
  }, []);

  // The session whose sheet is open, by index: the sheet reads the session
  // off the plan at render time, so it never shows a stale copy.
  const [sheetIndex, setSheetIndex] = useState<number | null>(null);

  // Generator settings live in the page so the sticky "Generate" button (mobile)
  // and the WeekGeneratorPanel share the same state.
  const [settings, setSettings] = useState<WeekSettings>({
    ...DEFAULT_WEEK_SETTINGS,
    longRunDay: (plan?.config.longRunDay ?? 5) as DayIndex,
    targetVolumeH: plan?.config.targetVolumeH ?? DEFAULT_WEEK_SETTINGS.targetVolumeH,
  });
  // The plan arrives after the first render, so the initial state above only
  // holds the defaults: once, when it lands, the generator takes the week's
  // own long-run day and budget as its starting point.
  const seededRef = useRef(false);
  useEffect(() => {
    if (!plan || seededRef.current) return;
    seededRef.current = true;
    setSettings((s) => ({
      ...s,
      longRunDay: (plan.config.longRunDay ?? s.longRunDay) as DayIndex,
      targetVolumeH: plan.config.targetVolumeH ?? s.targetVolumeH,
    }));
  }, [plan]);

  // ── Draw animation state ─────────────────────────────────────────────────
  const [scanning, setScanning] = useState(false);
  // Per-day cycling workout shown during the scan.
  const [scanCells, setScanCells] = useState<Record<number, AnyWorkoutTemplate>>(
    {},
  );
  // Days the overlay covers. Every other day stays sharp and untouched, that
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
      /** Applies the result, called once, on the final tick. */
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
   * overlay grid could never stay aligned, the board is 7 columns on desktop
   * but 4 + 3 on mobile, so the scan lives where the content lives.
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
      else toast.failure(t("plan:view.sessionMoveFailed"));
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

  /**
   * A copy of the session, on the same day, right next to it: the week that
   * repeats a session twice is built by duplicating it and dragging the copy
   * to its day, rather than finding the workout in the catalog again.
   */
  const handleDuplicate = useCallback(
    (_weekNumber: number, sessionIndex: number) => {
      if (!plan) return;
      if (duplicateSession(plan.id, 1, sessionIndex) !== null) {
        reload();
        toast.success(t("library:weekly.toast.sessionDuplicated"));
      }
    },
    [plan, reload, t],
  );

  const handleAddToDay = useCallback((_weekNumber: number, day: number) => {
    setAddTarget({ day });
    setRailTool("add");
  }, []);

  const closePanel = useCallback(() => {
    setRailTool(null);
    setAddTarget(null);
  }, []);

  /* Every write of this page goes through here. A refused write is said,
     with its reason, and the caller stops rather than reloading a week that
     did not change: nine handlers used to call `savePlan` and look away. */
  const persist = useCallback(
    (fresh: NonNullable<ReturnType<typeof getPlan>>): boolean => {
      const saved = savePlan(fresh);
      if (!saved.ok) toast.failure(t("library:weekly.toast.saveFailed"), saved);
      return saved.ok;
    },
    [t],
  );

  /** Pushes a session on its day and saves; returns its index in the week. */
  const pushSession = useCallback(
    (session: PlanSession): number | null => {
      if (!plan) return null;
      const fresh = getPlan(plan.id);
      if (!fresh) return null;
      fresh.weeks[0].sessions.push(session);
      fresh.weeks[0].sessions.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
      if (!persist(fresh)) return null;
      reload();
      return fresh.weeks[0].sessions.indexOf(session);
    },
    [plan, reload, persist],
  );

  const handleWorkoutAdd = useCallback(
    (workoutId: string, _weekNumber: number, day: number) => {
      if (!plan) return;
      const activity = activityKindOf(workoutId);
      if (activity) {
        const pattern = loadCommutePattern();
        const session = makeActivitySession(
          activity.kind,
          day,
          defaultActivityDraft(activity.kind, pattern),
          pattern,
        );
        // It lands, and nothing else: a timed activity without a duration
        // is a card that weighs nothing yet, and it used to open its sheet
        // on the spot, on the duration field, which a phone answers with its
        // keyboard and a zoom. The duration is optional, and one tap away.
        pushSession(session);
        return;
      }
      const workout = byId.get(workoutId);
      if (!workout) return;
      pushSession(sessionFromWorkout(day, workout));
    },
    [plan, byId, pushSession, t],
  );

  // A session the builder just made, sent back with the day it was meant
  // for: it lands, and the state is cleared so a reload does not land it twice.
  const placeState = location.state as { placeWorkoutId?: string; day?: number } | null;
  const placedRef = useRef(false);
  useEffect(() => {
    if (!plan || placedRef.current || !placeState?.placeWorkoutId) return;
    const workout =
      byId.get(placeState.placeWorkoutId) ??
      getCustomWorkouts().find((w) => w.id === placeState.placeWorkoutId);
    if (!workout) return;
    placedRef.current = true;
    pushSession(sessionFromWorkout(placeState.day ?? 0, workout));
    navigate(location.pathname, { replace: true, state: null });
  }, [plan, byId, placeState, pushSession, navigate, location.pathname]);

  /** The builder, with the way back: the session it saves lands on `day`. */
  const handleCreateWorkout = useCallback(() => {
    if (!plan) return;
    navigate("/workout/builder", {
      state: { placeOn: { weekId: plan.id, day: addTarget?.day ?? 0 } },
    });
  }, [plan, addTarget, navigate]);

  // The sheet's target, read off the live plan.
  const sheetTarget = useMemo<WeekSessionSheetTarget | null>(() => {
    if (sheetIndex === null || !plan) return null;
    const session = plan.weeks[0].sessions[sheetIndex];
    if (!session) return null;
    return {
      sessionIndex: sheetIndex,
      session,
      workout: byId.get(session.workoutId) ?? null,
      name: workoutNames[session.workoutId] || session.workoutId,
    };
  }, [sheetIndex, plan, byId, workoutNames]);
  const commuteProfileMin = useMemo(
    () => (sheetTarget ? (loadCommutePattern()?.durationMin ?? null) : null),
    [sheetTarget],
  );

  const handleSessionClick = useCallback(
    (_weekNumber: number, sessionIndex: number) => {
      setSheetIndex(sessionIndex);
    },
    [],
  );

  const handleSheetSave = useCallback(
    (sessionIndex: number, next: PlanSession) => {
      if (!plan) return;
      const fresh = getPlan(plan.id);
      if (!fresh || !fresh.weeks[0].sessions[sessionIndex]) return;
      fresh.weeks[0].sessions[sessionIndex] = next;
      if (!persist(fresh)) return;
      setSheetIndex(null);
      reload();
    },
    [plan, reload, persist],
  );

  const handleSheetMove = useCallback(
    (sessionIndex: number, day: number) => {
      if (!plan) return;
      if (moveSession(plan.id, 1, sessionIndex, 1, day)) reload();
      else toast.failure(t("plan:view.sessionMoveFailed"));
    },
    [plan, reload, t],
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
            // The week now aims at what it was composed to.
            fresh.config.targetVolumeH = cfg.targetVolumeH;
            persist(fresh);
          }
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
      if (!persist(fresh)) return;
      reload();
    },
    [plan, reload, persist],
  );

  const handleUnlockAll = useCallback(() => {
    if (!plan) return;
    const fresh = getPlan(plan.id);
    if (!fresh) return;
    for (const session of fresh.weeks[0].sessions) delete session.locked;
    if (!persist(fresh)) return;
    reload();
  }, [plan, reload, persist]);

  /** Draw another workout for a single session, the rest of the week is kept. */
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
          persist(fresh);
        },
      });
    },
    [plan, catalog, byId, settings, scanning, runScan, t],
  );

  // Arriving from the "Générer une semaine" creation mode: surface the settings
  // so the user picks their parameters first, we never generate blindly.
  const didOpenSettingsRef = useRef(false);
  // The same 900px at which the generator rail folds away, below it the
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
      else setRailTool("generate");
      // Consumed: the state survives a reload of the same history entry,
      // and the generator reopened on every refresh of a week already built.
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [openSettingsOnMount, plan, railIsHidden, navigate, location.pathname]);

  const handleRename = useCallback(
    (value: string) => {
      if (!plan) return;
      const fresh = getPlan(plan.id);
      if (!fresh) return;
      fresh.config.planName = value;
      fresh.name = value;
      fresh.nameEn = value;
      if (!persist(fresh)) return;
      reload();
    },
    [plan, reload, persist],
  );

  /**
   * The week's own budget, chosen from the badge beside its category. The
   * generator starts from it next time, so the one figure lives in one place.
   */
  const handleTargetVolumeChange = useCallback(
    (value: string) => {
      if (!plan) return;
      const fresh = getPlan(plan.id);
      if (!fresh) return;
      const hours = value === "none" ? undefined : Number(value);
      if (hours === undefined) delete fresh.config.targetVolumeH;
      else fresh.config.targetVolumeH = hours;
      if (!persist(fresh)) return;
      if (hours !== undefined) setSettings((s) => ({ ...s, targetVolumeH: hours }));
      reload();
    },
    [plan, reload, persist],
  );

  // The budgets on offer, in hours, plus the week's own if it is not one of
  // them (a ready-made week can carry 2.5 h): the radio has to name what is
  // set, or the badge would show one figure and the list check another.
  const budgetOptions = useMemo(() => {
    const set = new Set<number>(BUDGET_HOURS);
    if (plan?.config.targetVolumeH != null) set.add(plan.config.targetVolumeH);
    return [...set].sort((a, b) => a - b);
  }, [plan?.config.targetVolumeH]);

  const handleCategoryChange = useCallback(
    (value: string) => {
      if (!plan) return;
      const fresh = getPlan(plan.id);
      if (!fresh) return;
      fresh.config.weekCategory =
        value === "none" ? undefined : (value as WeekCategory);
      if (!persist(fresh)) return;
      reload();
    },
    [plan, reload, persist],
  );

  if (isLoading) return null;
  if (!plan) return <Navigate to="/weeks" replace />;

  /* La couche de cette semaine : posée (ancrée sur un lundi), ou rien. Une
     semaine sans couche se montre encore dans le cockpit quand aucun plan
     n'est en cours (la règle de repli), mais elle n'est pas POSÉE, et le
     badge ne prétend pas qu'elle l'est. */
  const layer = layerFor(composition, plan.id);
  const placedOn = layer?.enabled && layer.anchor ? layer.anchor : null;
  const formatMonday = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(isEn ? "en-GB" : "fr-FR", {
      day: "numeric",
      month: "short",
    });
  };
  const thisMonday = mondayOf(new Date());
  const nextMonday = new Date(thisMonday);
  nextMonday.setDate(nextMonday.getDate() + 7);
  const handlePlace = (value: string) => {
    if (value === "none") {
      writeComposition(setLayerEnabled(composition, plan.id, false));
      toast.success(t("library:weekly.cockpit.toastRemoved"));
      return;
    }
    const on = value === "next" ? nextMonday : thisMonday;
    writeComposition(placeWeek(composition, plan.id, on));
    toast.success(t("library:weekly.cockpit.toastPlaced", { date: formatMonday(isoDateOnly(on)) }));
  };
  /* Le plan qui couvre la semaine où celle-ci est suivie, et sa semaine à
     lui : c'est là qu'elle peut s'ajouter. Le geste vivait dans la feuille du
     cockpit seulement ; quand on veut jouer avec un plan et une semaine, on
     est ICI, sur la semaine. */
  const displayName = name ?? pick(plan, "name");

  const mergeTarget = placedOn
    ? planWeekAt(getAllPlans(), (() => { const [y, m, d] = placedOn.split("-").map(Number); return new Date(y, m - 1, d); })())
    : null;
  const handleMerge = (mode: MergeWeekMode) => {
    if (!mergeTarget) return;
    const ok = mergeWeekIntoPlan(mergeTarget.plan.id, mergeTarget.weekNumber, plan.id, mode, {
      label: t("library:weekly.merge.label", { week: displayName, n: mergeTarget.weekNumber, lng: "fr" }),
      labelEn: t("library:weekly.merge.label", { week: displayName, n: mergeTarget.weekNumber, lng: "en" }),
    });
    if (!ok) {
      toast.error(t("library:weekly.merge.failed"));
      return;
    }
    // Ajoutée au plan, la semaine n'a plus à se lire à côté de lui.
    writeComposition(removeLayer(composition, plan.id));
    toast.success(t("library:weekly.merge.done"));
  };
  // A regular (multi-week) plan should use the full plan editor.
  if (!plan.config.isSingleWeek) return <Navigate to={`/plan/${plan.id}`} replace />;


  // The share button opens the image sheet; the link is one of its actions.
  const shareUrl = sharedWeekUrl(plan, displayName);

  /** The picker, aimed at the first rest day, or Monday. */
  const openAdd = () => {
    const taken = new Set(plan.weeks[0].sessions.map((s) => s.dayOfWeek));
    const day = WEEKDAYS.find((d) => !taken.has(d)) ?? 0;
    setAddTarget({ day });
    setRailTool("add");
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
      onClose={closePanel}
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

        <section className="zn-pw__band">
          {/* The board takes the whole column. A tool, the generator or the
              picker, opens a rail beside it, a column rather than an overlay,
              so it never covers the week being edited, and it closes when the
              tool is put away. Below 900px there is no rail: the dock carries
              the same two actions, and the tools open as sheets. */}
          <div className="zn-pw__editor" data-rail={railTool ?? undefined}>
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

                {/* What this week is (left): its category, and the volume it
                    aims at, two properties of the week set from two badges of
                    the same kind. What you can send it out as (right). */}
                <div
                  className="zn-cluster zn-cluster--split"
                  style={{ "--gap": "var(--sp-6)" } as CSSProperties}
                >
                  {/* Un cluster et non une rangée : le troisième badge porte
                      une date, et à 390 px les trois ne tiennent pas sur une
                      ligne, le dernier passe dessous au lieu de sortir de
                      l'écran. */}
                  <div
                    className="zn-cluster"
                    style={{ "--gap": "var(--sp-4)" } as CSSProperties}
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

                  {/* The budget: none, or so many hours. Without one the
                      summary prints the volume alone; with one it measures
                      the week against it. The generator writes its target
                      here when it composes the week. */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={badgeVariants({
                        variant: plan.config.targetVolumeH != null ? "secondary" : "outline",
                        className: "zn-pw__cat",
                      })}
                      aria-label={t("library:weekly.budget.label")}
                    >
                      {plan.config.targetVolumeH != null
                        ? t("library:weekly.budget.set", {
                            hours: formatHours(plan.config.targetVolumeH, isEn),
                          })
                        : t("library:weekly.budget.label")}
                      <ChevronDown size={13} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuRadioGroup
                        value={
                          plan.config.targetVolumeH != null
                            ? String(plan.config.targetVolumeH)
                            : "none"
                        }
                        onValueChange={handleTargetVolumeChange}
                      >
                        <DropdownMenuRadioItem value="none">
                          {t("library:weekly.budget.none")}
                        </DropdownMenuRadioItem>
                        {budgetOptions.map((h) => (
                          <DropdownMenuRadioItem key={h} value={String(h)}>
                            {t("library:weekly.budget.hours", { hours: formatHours(h, isEn) })}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  {/* Où la semaine est posée dans le cockpit : un troisième
                      badge de la même famille, parce que c'est la troisième
                      chose que la semaine EST. Cette semaine, la prochaine,
                      ou nulle part ; poser ailleurs se fait depuis la grille
                      du mois de /today, où l'on voit la semaine visée. */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={badgeVariants({
                        variant: placedOn ? "secondary" : "outline",
                        className: "zn-pw__cat",
                      })}
                      title={t("library:weekly.cockpit.label")}
                    >
                      {placedOn
                        ? t("library:weekly.cockpit.placed", { date: formatMonday(placedOn) })
                        : t("library:weekly.cockpit.place")}
                      <ChevronDown size={13} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuRadioGroup
                        value={
                          placedOn === isoDateOnly(thisMonday)
                            ? "this"
                            : placedOn === isoDateOnly(nextMonday)
                              ? "next"
                              : placedOn
                                ? "elsewhere"
                                : "none"
                        }
                        onValueChange={handlePlace}
                      >
                        <DropdownMenuRadioItem value="this">
                          {t("library:weekly.cockpit.thisWeek")}
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="next">
                          {t("library:weekly.cockpit.nextWeek")}
                        </DropdownMenuRadioItem>
                        <DropdownMenuRadioItem value="none">
                          {t("library:weekly.cockpit.remove")}
                        </DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                      {/* Suivie sur une semaine d'un plan, elle peut y entrer
                          pour de bon : le geste est ici, sous l'endroit où
                          elle est suivie, et demande en toutes lettres
                          ajouter ou remplacer. */}
                      {mergeTarget && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel>
                            {t("library:weekly.merge.into", {
                              plan: isEn ? mergeTarget.plan.nameEn : mergeTarget.plan.name,
                              n: mergeTarget.weekNumber,
                            })}
                          </DropdownMenuLabel>
                          <DropdownMenuItem onSelect={() => handleMerge("add")}>
                            {t("library:weekly.merge.add")}
                          </DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => handleMerge("replace")}>
                            {t("library:weekly.merge.replace")}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  </div>

                  <div
                    className="zn-row"
                    style={{ "--gap": "var(--sp-4)" } as CSSProperties}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShareOpen(true)}
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

                    {/* The two ways to fill the board, as toggles for the rail.
                        Adding by hand is the primary call; the draw is a tool
                        beside it. While the generator is open its own call
                        carries the screen's one accent, so "add" steps back
                        to the outline. Under 900px the dock holds the same
                        pair, in the thumb zone. */}
                    <div className="zn-pw__tools">
                      <Button
                        variant="outline"
                        size="sm"
                        aria-pressed={railTool === "generate"}
                        disabled={scanning}
                        onClick={() =>
                          railTool === "generate" ? closePanel() : setRailTool("generate")
                        }
                      >
                        <Sparkles size={15} />
                        {t("library:weekly.generate.actionShort")}
                      </Button>
                      <Button
                        variant={railTool === null ? "default" : "outline"}
                        size="sm"
                        aria-pressed={railTool === "add"}
                        disabled={scanning}
                        onClick={() => (railTool === "add" ? closePanel() : openAdd())}
                      >
                        <Plus size={15} />
                        {t("library:weekly.actions.addSession")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* The board is the object and the summary its consequence: it
                  folds to one strip, the figures, the verdict and a thumbnail
                  of the rhythm, and opens on demand. The full bar used to
                  take the first desktop screen entire, and the week began
                  below the fold. The ramp's legend is printed once, folded
                  under the board, which the board itself carries. */}
              <WeekSummaryStrip
                stats={stats}
                slots={slots}
                targetVolumeH={plan.config.targetVolumeH}
              />

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
                    onSessionDuplicate={handleDuplicate}
                    onToggleLock={handleToggleLock}
                    onRedraw={handleRedraw}
                    onWorkoutAdd={handleWorkoutAdd}
                    onAddToDay={handleAddToDay}
                    renderScanCell={renderScanCell}
                    singleWeek
                    tapOpensSession
                  />
                </div>
              </div>
            </div>

            {/* The rail, only while a tool is open: the workout picker while
                a session is being added, or the generator. */}
            {railTool !== null && (
              <aside className="zn-pw__rail">
                {showPanel ? (
                  <PlanWorkoutPanel
                    isOpen={showPanel}
                    onClose={closePanel}
                    inline
                    onCreateWorkout={handleCreateWorkout}
                  />
                ) : (
                  generatorPanel
                )}
              </aside>
            )}
          </div>
        </section>
      </div>

      {/* The dock, kept in the thumb zone where there is no rail. It carries
          the same pair as the toolbar above: adding a session takes the one
          vermillon fill, and the draw is one icon that opens its settings,
          whose own call generates. It used to be two icons, one that drew
          on the spot with settings nobody had seen and one that opened
          them, a second generator entry on a screen about composing. */}
      <div className="zn-pw__dock">
        <Button disabled={scanning} onClick={openAdd}>
          <Plus size={17} />
          {t("library:weekly.actions.addSession")}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSettingsOpen(true)}
          disabled={scanning}
          aria-label={t("library:weekly.generate.actionShort")}
          title={t("library:weekly.generate.actionShort")}
        >
          <Sparkles size={17} />
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

      {/* The week as an image, in four sizes, and its link. */}
      <WeekShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        shareUrl={shareUrl}
        subject={{
          plan,
          name: displayName,
          slots,
          stats,
          workoutNames,
          workoutMeta,
        }}
      />

      {/* The session's own sheet: how it counts, and the gestures. */}
      <WeekSessionSheet
        target={sheetTarget}
        commuteProfileMin={commuteProfileMin}
        onClose={() => setSheetIndex(null)}
        onSave={handleSheetSave}
        onView={(workoutId) => navigate(`/workout/${workoutId}`)}
        onRedraw={(index) => handleRedraw(1, index)}
        onToggleLock={(index) => handleToggleLock(1, index)}
        onMove={handleSheetMove}
        onDuplicate={(index) => handleDuplicate(1, index)}
        onDelete={(index) => handleDelete(1, index)}
      />

      {/* Mobile bottom-sheet picker (tap to place on the chosen day) */}
      <PlanWorkoutPanel
        isOpen={showPanel}
        onClose={closePanel}
        day={addTarget?.day}
        onDayChange={(day) => setAddTarget({ day })}
        onCreateWorkout={handleCreateWorkout}
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
