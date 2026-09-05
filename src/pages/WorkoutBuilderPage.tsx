import { useState, useCallback, useReducer, useRef, useEffect, useMemo, type CSSProperties } from "react";
import { usePageHint } from "@/hooks/usePageHint";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Save, Trash2, Plus, ChevronDown, ChevronUp, ArrowRight, ArrowLeft, Download, Upload, Undo2, Redo2, Share } from "@/components/icons";
import { useUndoRedo } from "@/hooks/useUndoRedo";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SEOHead } from "@/components/seo";
import { WorkoutStepListEditor } from "@/components/domain/contribute/WorkoutStepListEditor";
import { WorkoutParameterPanel } from "@/components/domain/WorkoutParameterPanel";
import { SessionTimeline } from "@/components/visualization/SessionTimeline";
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

  const createDraft = useCallback(() => {
    const w = createEmptyWorkout();
    navigate(`/workout/builder/${w.id}`, { state: { fresh: true } });
  }, [navigate]);

  return (
    <>
      <SEOHead
        noindex
        title={t("calculators:workoutBuilder.myWorkouts")}
        canonical="/workout/builder"
      />

      <div className="zn-disc">
        {/* 1 — what is stored here, counted */}
        <section
          className="zn-disc__head zn-stack"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <span className="zn-kicker">
            {t("calculators:workoutBuilder.listKicker", { count: workouts.length })}
          </span>
          <h1 className="zn-display" data-level="2">
            {t("calculators:workoutBuilder.myWorkouts")}
          </h1>
          <p className="zn-body zn-body--lead zn-disc__lede">
            {t("calculators:workoutBuilder.listSubtitle")}
          </p>

          <div className="zn-cluster zn-disc__headactions">
            {/* The screen's one vermillon fill */}
            <Button onClick={createDraft}>
              <Plus size={17} />
              {t("calculators:workoutBuilder.create")}
            </Button>
            {/* Driven by the button next to it — kept out of the tab order,
                exactly as the `hidden` class it replaces did. */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              hidden
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={15} />
              {t("calculators:workoutBuilder.import")}
            </Button>
            {workouts.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleExportAll}>
                <Download size={15} />
                {t("calculators:workoutBuilder.exportAll")}
              </Button>
            )}
          </div>
        </section>

        {/* 2 — the drafts */}
        <section className="zn-disc__results">
          {workouts.length === 0 ? (
            <EmptyState
              variant="not-started"
              icon={Plus}
              title={t("calculators:workoutBuilder.noWorkoutsYet")}
              description={t("calculators:workoutBuilder.noWorkoutsDescription")}
              action={
                <Button variant="outline" onClick={createDraft}>
                  <Plus size={17} />
                  {t("calculators:workoutBuilder.create")}
                </Button>
              }
            />
          ) : (
            <div className="zn-build__list">
              {workouts.map((w) => {
                const totalMin = getStructuredWorkoutDurationMinutes(w);
                const mainStepCount = getWorkoutPhaseSteps(w, "main").length;
                return (
                  <div key={w.id} className="zn-build__row">
                    <Link
                      to={`/workout/builder/${w.id}`}
                      className="zn-build__rowlink"
                    >
                      <span
                        className="zn-stack zn-fill"
                        style={{ "--gap": "var(--sp-2)" } as CSSProperties}
                      >
                        <span className="zn-build__rowname">
                          {w.name || t("calculators:workoutBuilder.untitled")}
                        </span>
                        <span className="zn-mono zn-faint">
                          ~{formatDurationMinutes(totalMin)} · {mainStepCount}{" "}
                          {t("calculators:workoutBuilder.blocks")}
                        </span>
                      </span>
                      <ArrowRight size={16} className="zn-fixed zn-faint" />
                    </Link>
                    <FavoriteButton workoutId={w.id} size="sm" />
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleExportOne(w)}
                      aria-label={t("calculators:workoutBuilder.exportLabel")}
                    >
                      <Download size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => setDeleteTarget(w.id)}
                      aria-label={t("calculators:workoutBuilder.deleteLabel")}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
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
              <Trash2 size={17} />
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

  const sections: { key: SectionKey; label: string }[] = [
    { key: "warmup", label: t("calculators:workoutBuilder.warmup") },
    { key: "main", label: t("calculators:workoutBuilder.mainSet") },
    { key: "cooldown", label: t("calculators:workoutBuilder.cooldown") },
  ];

  return (
    <>
      <SEOHead
        noindex
        title={t("calculators:workoutBuilder.builderTitle")}
        canonical="/workout/builder"
      />

      <div className="zn-disc">
        {/* 1 — the draft, named in place */}
        <section
          className="zn-disc__head zn-stack"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <Button variant="link" asChild>
            <Link to="/workout/builder">
              <ArrowLeft size={16} />
              {t("calculators:workoutBuilder.myWorkouts")}
            </Link>
          </Button>

          <span className="zn-kicker">
            {t("calculators:workoutBuilder.editorKicker")}
          </span>

          <input
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
            aria-label={t("calculators:workoutBuilder.namePlaceholder")}
            className="zn-build__name"
          />

          <div className="zn-row" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
            <span className="zn-mono zn-faint">
              ~{totalMin} min · {blockCount} {t("calculators:workoutBuilder.blocks")}
            </span>
            {isSaved && <FavoriteButton workoutId={workout.id} />}
          </div>

          <div className="zn-build__actions zn-disc__headactions">
            {/* The screen's one vermillon fill */}
            <Button onClick={handleSave} disabled={!canSave}>
              <Save size={17} />
              {t("calculators:workoutBuilder.save")}
            </Button>
            <div className="zn-row" style={{ "--gap": "var(--sp-2)" } as CSSProperties}>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={undo}
                disabled={!canUndo}
                aria-label={t("calculators:workoutBuilder.undo", "Annuler")}
                title={t("calculators:workoutBuilder.undo", "Annuler") + (isMac ? " (⌘Z)" : " (Ctrl+Z)")}
              >
                <Undo2 size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={redo}
                disabled={!canRedo}
                aria-label={t("calculators:workoutBuilder.redo", "Rétablir")}
                title={t("calculators:workoutBuilder.redo", "Rétablir") + (isMac ? " (⇧⌘Z)" : " (Ctrl+Shift+Z)")}
              >
                <Redo2 size={16} />
              </Button>
            </div>
            <Button variant="outline" onClick={handleShare} disabled={!canSave}>
              <Share size={17} />
              {t("calculators:workoutBuilder.shareLink")}
            </Button>
            {isSaved && <ExportMenu workout={workout} />}
            {isSaved && (
              <Button
                variant="outline"
                onClick={() => {
                  exportWorkoutsToJSON([workout]);
                  toast.success(t("calculators:workoutBuilder.workoutExported"));
                }}
              >
                <Download size={17} />
                JSON
              </Button>
            )}
            {isSaved && (
              <Button
                variant="outline-primary"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 size={17} />
                {t("calculators:workoutBuilder.delete")}
              </Button>
            )}
          </div>
        </section>

        {/* 2 — the profile the numbers below produce */}
        <section className="zn-disc__group">
          <div className="zn-build__preview">
            <span className="zn-kicker zn-kicker--inline">
              {t("calculators:workoutBuilder.preview")}
            </span>
            <SessionTimeline workout={workout} />
          </div>

          <WorkoutParameterPanel
            params={params}
            onPreview={previewParam}
            onCommit={commitParam}
          />
        </section>

        {/* 3 — one phase per band */}
        <section className="zn-disc__group">
          {sections.map(({ key, label }) => {
            const steps = getSteps(key);
            const isCollapsed = collapsed[key];
            return (
              <div key={key} className="zn-build__section">
                <button
                  type="button"
                  onClick={() => toggleCollapse(key)}
                  className="zn-build__sectionhead"
                  aria-expanded={!isCollapsed}
                  aria-controls={`builder-${key}`}
                >
                  {isCollapsed ? (
                    <ChevronDown className="zn-build__chevron" />
                  ) : (
                    <ChevronUp className="zn-build__chevron" />
                  )}
                  <span className="zn-title zn-fill" data-level="4">
                    {label}
                  </span>
                  <span className="zn-mono zn-faint">
                    {t("calculators:workoutBuilder.sectionCount", {
                      count: steps.length,
                    })}
                  </span>
                </button>

                <div id={`builder-${key}`} hidden={isCollapsed}>
                  <div className="zn-build__steps">
                    <WorkoutStepListEditor
                      steps={steps}
                      onChange={(nextSteps) => updateSteps(key, nextSteps)}
                      label={label}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </section>
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
              <Trash2 size={17} />
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
