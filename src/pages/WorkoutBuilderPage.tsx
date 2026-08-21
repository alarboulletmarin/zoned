import { useState, useCallback, useReducer, useRef, useEffect, useMemo } from "react";
import { usePageHint } from "@/hooks/usePageHint";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Save, Trash2, Plus, ChevronDown, ChevronUp, ArrowRight, Download, Upload, Undo2, Redo2, Share } from "@/components/icons";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SEOHead } from "@/components/seo";
import { Input } from "@/components/ui/input";
import { WorkoutStepListEditor } from "@/components/domain/contribute/WorkoutStepListEditor";
import { WorkoutParameterPanel } from "@/components/domain/WorkoutParameterPanel";
import { SessionTimeline } from "@/components/visualization/SessionTimeline";
import { SessionIntensityBar } from "@/components/visualization/ZoneDistribution";
import { transformSessionBlocks } from "@/components/visualization/transforms";
import { useIsEnglish } from "@/lib/i18n-utils";
import { PageLoader } from "@/components/ui/page-loader";
import { getStructuredWorkoutDurationMinutes, getWorkoutPhaseSteps, normalizeWorkoutStructureSource, replaceWorkoutPhaseSteps } from "@/lib/workoutStructure";
import { isMac } from "@/lib/platform";
import { ExportMenu } from "@/components/domain/ExportMenu";
import { FavoriteButton } from "@/components/domain/FavoriteButton";
import { useFavorites } from "@/hooks";
import { toast } from "sonner";
import { sharedWorkoutUrl } from "@/lib/share/workoutShare";
import {
  getCustomWorkout,
  getCustomWorkouts,
  saveCustomWorkout,
  deleteCustomWorkout,
  createEmptyWorkout,
  exportWorkoutsToJSON,
  importWorkoutsFromJSON,
} from "@/lib/customWorkoutStorage";
import {
  applyAdjustments,
  createAdjustedCopy,
  getAdjustableParams,
  mergeParamBounds,
  widenParamTo,
} from "@/lib/workoutAdjust";
import { getWorkoutById } from "@/data/workouts";
import { isRunningWorkout } from "@/lib/workoutTemplate";
import type { WorkoutTemplate, WorkoutStep } from "@/types";

type SectionKey = "warmup" | "main" | "cooldown";

/**
 * Above this share of the session spent in Z4 or above, the side column raises
 * the mockup's "Vérification" note. 35 % is roughly a 20-minute threshold block
 * inside a one-hour session — past that, a weekday session is a race effort.
 */
const HIGH_INTENSITY_THRESHOLD = 35;

/**
 * One action row of the side column: a filet, mono small caps, no chrome.
 * Written so it also survives being merged onto a `Button` (the export menu's
 * trigger), whose own padding, weight and border it has to undo.
 */
const SIDE_ROW =
  "flex w-full h-auto items-center justify-start gap-3 rounded-none border-0 border-b border-filet bg-transparent px-0 has-[>svg]:px-0 py-3 font-mono text-[11px] font-normal tracking-[0.1em] uppercase text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground hover:shadow-none disabled:pointer-events-none disabled:opacity-40";

// ── List view (no id param) ──────────────────────────────────────────

function WorkoutListView() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const workouts = getCustomWorkouts();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { removeFavorite } = useFavorites();

  const handleDelete = useCallback((id: string) => {
    deleteCustomWorkout(id);
    removeFavorite(id);
    setDeleteTarget(null);
    forceUpdate();
    toast.success(t("calculators:workoutBuilder.workoutDeleted"));
  }, [t, removeFavorite]);

  const handleExportAll = useCallback(() => {
    if (workouts.length === 0) return;
    exportWorkoutsToJSON(workouts);
    toast.success(t("calculators:workoutBuilder.workoutsExported", { count: workouts.length }));
  }, [workouts, t]);

  const handleExportOne = useCallback((workout: WorkoutTemplate) => {
    exportWorkoutsToJSON([workout]);
    toast.success(t("calculators:workoutBuilder.workoutExported"));
  }, [t]);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await importWorkoutsFromJSON(file);
      forceUpdate();
      toast.success(t("calculators:workoutBuilder.workoutsImported", { count }));
    } catch {
      toast.error(t("calculators:workoutBuilder.invalidFile"));
    }
    // Reset input so same file can be re-imported
    e.target.value = "";
  }, [t]);

  return (
    <>
      <SEOHead
        noindex
        title={t("calculators:workoutBuilder.myWorkouts")}
        canonical="/workout/builder"
      />
      <div className="py-6 md:py-8 max-w-3xl mx-auto space-y-6">
        <div className="mb-8 border-t border-filet pt-5 md:pt-6">
          <div className="flex items-end justify-between gap-3 mb-5">
            <div>
              <p className="font-mono text-[10px] md:text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
                {t("common:nav.library")}
              </p>
              <h1 className="font-sans font-bold uppercase leading-[0.9] tracking-[-0.05em] text-[32px] sm:text-[40px] md:text-[48px] mt-2">
                {t("calculators:workoutBuilder.myWorkouts")}
              </h1>
              <p className="font-mono text-xs text-muted-foreground mt-2">
                {t("calculators:workoutBuilder.listSubtitle")}
              </p>
            </div>
            <Button
              className="px-5 py-2.5 h-auto"
              onClick={() => {
                const w = createEmptyWorkout();
                navigate(`/workout/builder/${w.id}`, { state: { fresh: true } });
              }}
            >
              <Plus className="size-4 mr-1" />
              {t("calculators:workoutBuilder.create")}
            </Button>
          </div>

          {/* Import / Export all actions */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="size-4 mr-1.5" />
              {t("calculators:workoutBuilder.import")}
            </Button>
            {workouts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAll}
              >
                <Download className="size-4 mr-1.5" />
                {t("calculators:workoutBuilder.exportAll")}
              </Button>
            )}
          </div>
        </div>

        {workouts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-2">{t("calculators:workoutBuilder.noWorkoutsYet")}</p>
            <p className="text-sm">{t("calculators:workoutBuilder.createFirst")}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map((w) => {
              const totalMin = getStructuredWorkoutDurationMinutes(w);
              const mainStepCount = getWorkoutPhaseSteps(w, "main").length;
              return (
                <div
                  key={w.id}
                  className="group relative bg-card hover:shadow-[4px_4px_0_var(--shadow-hard)] transition-shadow duration-150 ease-out"
                >
                  <Link
                    to={`/workout/builder/${w.id}`}
                    className="block p-4 pr-20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FavoriteButton workoutId={w.id} size="sm" />
                        <div>
                          <h3 className="font-sans font-bold uppercase tracking-tight">{w.name || t("calculators:workoutBuilder.untitled")}</h3>
                          <p className="font-mono text-xs text-muted-foreground mt-0.5">
                            ~{formatDurationMinutes(totalMin)} · {mainStepCount} {t("calculators:workoutBuilder.blocks")}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </div>
                  </Link>
                  <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleExportOne(w)}
                      className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      aria-label={t("calculators:workoutBuilder.exportLabel")}
                    >
                      <Download className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(w.id)}
                      className="p-1.5 text-destructive/70 hover:text-destructive hover:bg-destructive/10 active:text-destructive transition-colors"
                      aria-label={t("calculators:workoutBuilder.deleteLabel")}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("calculators:workoutBuilder.deleteConfirm")}
            </DialogTitle>
            <DialogDescription>
              {t("calculators:workoutBuilder.deleteDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {t("calculators:workoutBuilder.cancel")}
            </Button>
            <Button variant="destructive" onClick={() => deleteTarget && handleDelete(deleteTarget)}>
              <Trash2 className="size-4" />
              {t("calculators:workoutBuilder.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Seed resolution ──────────────────────────────────────────────────

/** A blank draft under the id the URL asked for. */
function emptyDraft(workoutId: string): WorkoutTemplate {
  return normalizeWorkoutStructureSource({ ...createEmptyWorkout(), id: workoutId });
}

/**
 * What the editor opens on. Three cases: an already-saved custom workout, a
 * copy adapted from a catalogue workout (`?from=`, issue #130), or a blank
 * draft.
 *
 * The adapted copy is resolved here rather than inside the editor because the
 * catalogue loads asynchronously, and `useUndoRedo` reads its initial value
 * once: seeding it late would leave the first history entry empty and flash a
 * blank editor. Nothing is written to storage until the user saves, and the id
 * lives in the URL, so a reload rebuilds the same copy.
 */
function WorkoutEditorGate({ workoutId, sourceId }: { workoutId: string; sourceId?: string }) {
  const [seed, setSeed] = useState<WorkoutTemplate | null>(() => {
    const existing = getCustomWorkout(workoutId);
    if (existing) return normalizeWorkoutStructureSource(existing);
    return sourceId ? null : emptyDraft(workoutId);
  });

  useEffect(() => {
    if (seed || !sourceId) return;

    let cancelled = false;
    getWorkoutById(sourceId)
      .then((source) => {
        if (cancelled) return;
        setSeed(
          source && isRunningWorkout(source)
            ? normalizeWorkoutStructureSource(createAdjustedCopy(source, workoutId))
            : emptyDraft(workoutId),
        );
      })
      .catch(() => {
        if (!cancelled) setSeed(emptyDraft(workoutId));
      });

    return () => {
      cancelled = true;
    };
  }, [seed, sourceId, workoutId]);

  if (!seed) return <PageLoader />;

  return <WorkoutEditorView initialWorkout={seed} />;
}

// ── Editor view (with id param) ──────────────────────────────────────

function WorkoutEditorView({ initialWorkout }: { initialWorkout: WorkoutTemplate }) {
  usePageHint("workout-builder", "hints.workoutBuilder.title", "hints.workoutBuilder.description");
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  const {
    present: workout,
    set: setWorkoutHistory,
    replace: replaceWorkoutHistory,
    reset: resetWorkoutHistory,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<WorkoutTemplate>(initialWorkout);

  const setWorkout = useCallback(
    (action: WorkoutTemplate | ((prev: WorkoutTemplate) => WorkoutTemplate)) => {
      isDirtyRef.current = true;
      setWorkoutHistory(action);
    },
    [setWorkoutHistory],
  );

  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    warmup: false,
    main: false,
    cooldown: false,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isDirtyRef = useRef(false);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirtyRef.current) {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const canSave = workout.name.trim().length > 0;

  const handleSave = useCallback(() => {
    if (!canSave) return;
    try {
      const totalMin = getStructuredWorkoutDurationMinutes(workout);
      const updated = {
        ...workout,
        typicalDuration: { min: Math.max(totalMin - 5, 0), max: totalMin + 5 },
      };
      saveCustomWorkout(updated);
      resetWorkoutHistory(updated);
      isDirtyRef.current = false;
      setIsSaved(true);
      toast.success(t("calculators:workoutBuilder.workoutSaved"));
    } catch {
      toast.error(t("calculators:workoutBuilder.maxReached"));
    }
  }, [workout, canSave, t, navigate]);

  // Everything the link needs lives in the URL, so an unsaved draft shares fine.
  const handleShare = useCallback(async () => {
    if (!canSave) return;
    const url = sharedWorkoutUrl(workout);
    if (navigator.share) {
      try {
        await navigator.share({ title: workout.name, url });
      } catch {
        // Share sheet dismissed — nothing to do.
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success(t("common:share.toast.linkCopied"));
  }, [workout, canSave, t]);

  const handleDelete = useCallback(() => {
    deleteCustomWorkout(workout.id);
    toast.success(t("calculators:workoutBuilder.workoutDeleted"));
    navigate("/workout/builder");
  }, [workout.id, t, navigate]);

  const getSteps = (section: SectionKey): WorkoutStep[] => {
    return getWorkoutPhaseSteps(workout, section);
  };

  const updateSteps = useCallback((section: SectionKey, steps: WorkoutStep[]) => {
    setWorkout((prev) => replaceWorkoutPhaseSteps(prev, section, steps));
  }, [setWorkout]);

  // ── Bounded parameters, for a draft adapted from the catalogue ──
  // Bounds are read once from the seed so a scale cannot move under the
  // cursor; only the values track the draft. A workout built from scratch has
  // no source to bound it, and gets the step editor alone.
  const baseParams = useMemo(
    () => (initialWorkout.sourceWorkoutId ? getAdjustableParams(initialWorkout) : []),
    [initialWorkout],
  );
  const params = useMemo(
    () => (baseParams.length > 0 ? mergeParamBounds(getAdjustableParams(workout), baseParams) : []),
    [workout, baseParams],
  );

  // A drag renders every frame but lands in history once, on release, built
  // from where the gesture started — otherwise one slider sweep evicts the
  // whole undo stack.
  const preDragRef = useRef<WorkoutTemplate | null>(null);

  const previewParam = useCallback((paramId: string, value: number) => {
    if (!preDragRef.current) preDragRef.current = workout;
    isDirtyRef.current = true;
    replaceWorkoutHistory(applyAdjustments(workout, { [paramId]: value }, params));
  }, [workout, params, replaceWorkoutHistory]);

  // A typed value may land outside the recommendation; admitting it means
  // opening that parameter's range first, or `applyAdjustments` would clamp it
  // straight back and the field would look broken.
  const commitParam = useCallback((paramId: string, value: number) => {
    const base = preDragRef.current ?? workout;
    preDragRef.current = null;
    const admitted = params.map((param) =>
      param.id === paramId ? widenParamTo(param, value) : param,
    );
    setWorkout(applyAdjustments(base, { [paramId]: value }, admitted));
  }, [workout, params, setWorkout]);

  const toggleCollapse = (key: SectionKey) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [isSaved, setIsSaved] = useState(() => getCustomWorkouts().some((w) => w.id === workout.id));

  const totalMin = getStructuredWorkoutDurationMinutes(workout);

  const blockCount =
    getSteps("warmup").length +
    getSteps("main").length +
    getSteps("cooldown").length;

  // The side column reads the same transform the timeline does, so the split
  // bar, the percentages and the warning can never disagree with the preview.
  // `transformSessionBlocks` resolves zone labels through the active language,
  // which the memo has to depend on — same reason as in `ZoneDistribution`.
  const isEnglish = useIsEnglish();
  const { zoneBreakdown } = useMemo(
    () => transformSessionBlocks(workout),
    [workout, isEnglish],
  );

  const highIntensityPercent = useMemo(
    () =>
      Math.round(
        zoneBreakdown
          .filter((item) => item.zone != null && item.zone >= 4)
          .reduce((sum, item) => sum + item.percent, 0),
      ),
    [zoneBreakdown],
  );

  const sections: { key: SectionKey; label: string; color: string }[] = [
    { key: "warmup", label: t("calculators:workoutBuilder.warmup"), color: "text-zone-2" },
    { key: "main", label: t("calculators:workoutBuilder.mainSet"), color: "text-zone-5" },
    { key: "cooldown", label: t("calculators:workoutBuilder.cooldown"), color: "text-zone-1" },
  ];

  return (
    <>
      <SEOHead
        noindex
        title={t("calculators:workoutBuilder.builderTitle")}
        canonical="/workout/builder"
      />

      <div className="py-6 md:py-8 max-w-6xl mx-auto">
        {/* Header — title left, the three verbs of the mockup on the right */}
        <div className="border-t border-filet pt-5 md:pt-6">
          <Link
            to="/workout/builder"
            className="font-mono text-xs tracking-[0.06em] uppercase text-muted-foreground hover:text-foreground transition-colors inline-block mb-4"
          >
            {t("calculators:workoutBuilder.backToList")}
          </Link>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-filet pb-5">
            <div className="min-w-0">
              <h1 className="font-sans font-bold uppercase leading-[0.9] tracking-[-0.05em] text-[32px] sm:text-[38px] md:text-[44px]">
                {t("calculators:workoutBuilder.builderTitle")}
              </h1>
              <div className="flex items-center gap-3 font-mono text-[11px] text-muted-foreground mt-2">
                <span>{t("calculators:workoutBuilder.draftSubtitle")}</span>
                {isSaved && <FavoriteButton workoutId={workout.id} />}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={undo}
                disabled={!canUndo}
                aria-label={t("calculators:workoutBuilder.undo")}
                title={t("calculators:workoutBuilder.undo") + (isMac ? " (⌘Z)" : " (Ctrl+Z)")}
              >
                <Undo2 className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={redo}
                disabled={!canRedo}
                aria-label={t("calculators:workoutBuilder.redo")}
                title={t("calculators:workoutBuilder.redo") + (isMac ? " (⇧⌘Z)" : " (Ctrl+Shift+Z)")}
              >
                <Redo2 className="size-4" />
              </Button>
              <Button
                variant="accent"
                className="ml-2"
                onClick={handleSave}
                disabled={!canSave}
              >
                <Save className="size-4 mr-2" />
                {t("calculators:workoutBuilder.save")}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px] items-start mt-6 md:mt-8">
          {/* ── Editor column ── */}
          <div className="min-w-0 space-y-6">
            <div>
              <label
                htmlFor="workout-name"
                className="block font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground mb-2"
              >
                {t("calculators:workoutBuilder.nameLabel")}
              </label>
              <Input
                id="workout-name"
                type="text"
                value={workout.name}
                onChange={(e) => setWorkout((prev) => ({
                  ...prev,
                  name: e.target.value,
                  // The builder is single-language (#67), so it mirrors the name
                  // into its English twin. A workout adapted from the catalogue
                  // arrives with a real translation, though, and mirroring would
                  // destroy it on the first keystroke — so mirror only while the
                  // two are already the same, i.e. a workout built from scratch.
                  nameEn: prev.nameEn === prev.name ? e.target.value : prev.nameEn,
                }))}
                placeholder={t("calculators:workoutBuilder.namePlaceholder")}
              />
            </div>

            <WorkoutParameterPanel
              params={params}
              onPreview={previewParam}
              onCommit={commitParam}
            />

            {/* Sections */}
            {sections.map(({ key, label, color }) => {
              const steps = getSteps(key);
              const isCollapsed = collapsed[key];
              return (
                <div key={key} className="border-t border-filet pt-5">
                  <button
                    type="button"
                    onClick={() => toggleCollapse(key)}
                    className="flex items-center gap-3 w-full text-left"
                  >
                    {isCollapsed ? <ChevronDown className="size-4 shrink-0" /> : <ChevronUp className="size-4 shrink-0" />}
                    <h2 className={`font-sans font-bold uppercase tracking-[-0.02em] text-lg ${color}`}>{label}</h2>
                    <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
                      {steps.length} {t("calculators:workoutBuilder.blocks")}
                    </span>
                  </button>

                  {!isCollapsed && (
                    <div className="mt-4">
                      <WorkoutStepListEditor
                        steps={steps}
                        onChange={(nextSteps) => updateSteps(key, nextSteps)}
                        label={label}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Live side column ── */}
          <aside className="border-2 border-foreground bg-background p-5 space-y-6 lg:sticky lg:top-20">
            <div>
              <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                {t("calculators:workoutBuilder.preview")}
              </p>
              <div className="mt-3">
                <SessionTimeline workout={workout} />
              </div>
              <p className="font-mono text-xs text-muted-foreground mt-3">
                {formatDurationMinutes(totalMin)} · {blockCount} {t("calculators:workoutBuilder.blocks")}
              </p>
              {zoneBreakdown.length > 0 && (
                <>
                  <SessionIntensityBar workout={workout} className="h-2.5 mt-3" />
                  <p className="font-mono text-[11px] text-muted-foreground mt-2">
                    {zoneBreakdown
                      .map((item) => `${Math.round(item.percent)} % ${item.zone != null ? `Z${item.zone}` : item.label}`)
                      .join(" · ")}
                  </p>
                </>
              )}
            </div>

            {/* Contextual check — a filet in Z3 orange, never a red alert box */}
            {(blockCount === 0 || highIntensityPercent > HIGH_INTENSITY_THRESHOLD) && (
              <div className="border-2 border-zone-3 p-4">
                <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-zone-3">
                  {t("calculators:workoutBuilder.check.title")}
                </p>
                <p className="text-sm leading-relaxed text-muted-foreground mt-2">
                  {blockCount === 0
                    ? t("calculators:workoutBuilder.check.empty")
                    : t("calculators:workoutBuilder.check.highIntensity", { percent: highIntensityPercent })}
                </p>
              </div>
            )}

            <div>
              <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                {t("calculators:workoutBuilder.afterSave")}
              </p>
              <div className="mt-3 flex flex-col">
                {isSaved && <ExportMenu workout={workout} className={SIDE_ROW} />}
                <button type="button" className={SIDE_ROW} onClick={handleShare} disabled={!canSave}>
                  <Share className="size-4" />
                  {t("calculators:workoutBuilder.shareByLink")}
                </button>
                {isSaved && (
                  <button
                    type="button"
                    className={SIDE_ROW}
                    onClick={() => {
                      exportWorkoutsToJSON([workout]);
                      toast.success(t("calculators:workoutBuilder.workoutExported"));
                    }}
                  >
                    <Download className="size-4" />
                    {t("calculators:workoutBuilder.exportJson")}
                  </button>
                )}
                {isSaved && (
                  <button
                    type="button"
                    className={`${SIDE_ROW} text-destructive hover:text-destructive`}
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="size-4" />
                    {t("calculators:workoutBuilder.delete")}
                  </button>
                )}
              </div>
              {!isSaved && (
                <p className="font-mono text-[11px] text-muted-foreground mt-3">
                  {t("calculators:workoutBuilder.saveToExport")}
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("calculators:workoutBuilder.deleteConfirm")}
            </DialogTitle>
            <DialogDescription>
              {t("calculators:workoutBuilder.deleteDescription")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              {t("calculators:workoutBuilder.cancel")}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="size-4" />
              {t("calculators:workoutBuilder.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Route dispatcher ─────────────────────────────────────────────────

export function WorkoutBuilderPage() {
  const { id } = useParams<{ id: string }>();
  // `?from=` carries the catalogue workout an Adjust action came from.
  const [searchParams] = useSearchParams();

  if (!id) {
    return <WorkoutListView />;
  }

  return <WorkoutEditorGate workoutId={id} sourceId={searchParams.get("from") ?? undefined} />;
}
