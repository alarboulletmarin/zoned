import { useState, useCallback, useReducer, useRef, useEffect } from "react";
import { usePageHint } from "@/hooks/usePageHint";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Save, Trash2, Plus, ChevronDown, ChevronUp, ArrowRight, Download, Upload } from "@/components/icons";
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
import { BlockEditor } from "@/components/domain/contribute/BlockEditor";
import { SessionTimeline } from "@/components/visualization/SessionTimeline";
import { ExportMenu } from "@/components/domain/ExportMenu";
import { toast } from "sonner";
import {
  getCustomWorkout,
  getCustomWorkouts,
  saveCustomWorkout,
  deleteCustomWorkout,
  createEmptyWorkout,
  exportWorkoutsToJSON,
  importWorkoutsFromJSON,
} from "@/lib/customWorkoutStorage";
import type { WorkoutTemplate, WorkoutBlock } from "@/types";

type SectionKey = "warmup" | "main" | "cooldown";

const EMPTY_BLOCK: WorkoutBlock = {
  description: "",
  durationMin: 5,
  zone: "Z2",
};

// ── List view (no id param) ──────────────────────────────────────────

function WorkoutListView() {
  const { i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const navigate = useNavigate();
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const workouts = getCustomWorkouts();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = useCallback((id: string) => {
    deleteCustomWorkout(id);
    setDeleteTarget(null);
    forceUpdate();
    toast.success(isEn ? "Workout deleted" : "Séance supprimée");
  }, [isEn]);

  const handleExportAll = useCallback(() => {
    if (workouts.length === 0) return;
    exportWorkoutsToJSON(workouts);
    toast.success(isEn ? `${workouts.length} workout(s) exported` : `${workouts.length} séance(s) exportée(s)`);
  }, [workouts, isEn]);

  const handleExportOne = useCallback((workout: WorkoutTemplate) => {
    exportWorkoutsToJSON([workout]);
    toast.success(isEn ? "Workout exported" : "Séance exportée");
  }, [isEn]);

  const handleImport = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const count = await importWorkoutsFromJSON(file);
      forceUpdate();
      toast.success(isEn ? `${count} workout(s) imported` : `${count} séance(s) importée(s)`);
    } catch {
      toast.error(isEn ? "Invalid file" : "Fichier invalide");
    }
    // Reset input so same file can be re-imported
    e.target.value = "";
  }, [isEn]);

  return (
    <>
      <SEOHead
        noindex
        title={isEn ? "My Workouts" : "Mes séances"}
        canonical="/workout/builder"
      />
      <div className="py-8 max-w-3xl mx-auto space-y-6">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{isEn ? "My Workouts" : "Mes séances"}</h1>
              <p className="text-muted-foreground mt-1">
                {isEn
                  ? "Custom workouts stored locally in your browser"
                  : "Séances personnalisées stockées dans votre navigateur"}
              </p>
            </div>
            <Button
              className="rounded-full px-5 py-2.5 h-auto font-bold"
              onClick={() => {
                const w = createEmptyWorkout();
                navigate(`/workout/builder/${w.id}`, { state: { fresh: true } });
              }}
            >
              <Plus className="size-4 mr-1" />
              {isEn ? "Create" : "Créer"}
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
              className="rounded-full"
            >
              <Upload className="size-4 mr-1.5" />
              {isEn ? "Import" : "Importer"}
            </Button>
            {workouts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAll}
                className="rounded-full"
              >
                <Download className="size-4 mr-1.5" />
                {isEn ? "Export all" : "Tout exporter"}
              </Button>
            )}
          </div>
        </div>

        {workouts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg mb-2">{isEn ? "No custom workouts yet" : "Aucune séance personnalisée"}</p>
            <p className="text-sm">{isEn ? "Create your first workout above" : "Créez votre première séance ci-dessus"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {workouts.map((w) => {
              const totalMin =
                (w.warmupTemplate?.reduce((s, b) => s + (b.durationMin || 0), 0) || 0) +
                w.mainSetTemplate.reduce((s, b) => s + (b.durationMin || 0) * (b.repetitions || 1), 0) +
                (w.cooldownTemplate?.reduce((s, b) => s + (b.durationMin || 0), 0) || 0);
              return (
                <div
                  key={w.id}
                  className="group relative rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <Link
                    to={`/workout/builder/${w.id}`}
                    className="block p-4 pr-20"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{w.name || (isEn ? "Untitled" : "Sans titre")}</h3>
                        <p className="text-sm text-muted-foreground">
                          ~{formatDurationMinutes(totalMin)} · {w.mainSetTemplate.length} {isEn ? "blocks" : "blocs"}
                        </p>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </div>
                  </Link>
                  <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleExportOne(w)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      aria-label={isEn ? "Export" : "Exporter"}
                    >
                      <Download className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(w.id)}
                      className="p-1.5 rounded-md text-destructive/70 hover:text-destructive hover:bg-destructive/10 active:text-destructive transition-colors"
                      aria-label={isEn ? "Delete" : "Supprimer"}
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
              {isEn ? "Delete this workout?" : "Supprimer cette séance ?"}
            </DialogTitle>
            <DialogDescription>
              {isEn
                ? "This action cannot be undone. The workout will be permanently deleted."
                : "Cette action est irréversible. La séance sera définitivement supprimée."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              {isEn ? "Cancel" : "Annuler"}
            </Button>
            <Button variant="destructive" onClick={() => deleteTarget && handleDelete(deleteTarget)}>
              <Trash2 className="size-4" />
              {isEn ? "Delete" : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ── Editor view (with id param) ──────────────────────────────────────

function WorkoutEditorView({ workoutId }: { workoutId: string }) {
  usePageHint("workout-builder", "hints.workoutBuilder.title", "hints.workoutBuilder.description");
  const navigate = useNavigate();
  const { i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;

  const [workout, setWorkoutRaw] = useState<WorkoutTemplate>(() => {
    const existing = getCustomWorkout(workoutId);
    if (existing) return existing;
    const fresh = createEmptyWorkout();
    return { ...fresh, id: workoutId };
  });
  const setWorkout: typeof setWorkoutRaw = useCallback((action) => {
    isDirtyRef.current = true;
    setWorkoutRaw(action);
  }, []);

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
      const totalMin =
        (workout.warmupTemplate?.reduce((s, b) => s + (b.durationMin || 0), 0) || 0) +
        workout.mainSetTemplate.reduce((s, b) => s + (b.durationMin || 0) * (b.repetitions || 1), 0) +
        (workout.cooldownTemplate?.reduce((s, b) => s + (b.durationMin || 0), 0) || 0);
      const updated = {
        ...workout,
        typicalDuration: { min: Math.max(totalMin - 5, 0), max: totalMin + 5 },
      };
      saveCustomWorkout(updated);
      setWorkoutRaw(updated);
      isDirtyRef.current = false;
      setIsSaved(true);
      toast.success(isEn ? "Workout saved" : "Séance sauvegardée");
    } catch {
      toast.error(isEn ? "Maximum 20 custom workouts reached" : "Maximum de 20 séances personnalisées atteint");
    }
  }, [workout, canSave, isEn, navigate]);

  const handleDelete = useCallback(() => {
    deleteCustomWorkout(workout.id);
    toast.success(isEn ? "Workout deleted" : "Séance supprimée");
    navigate("/workout/builder");
  }, [workout.id, isEn, navigate]);

  const getBlocks = (section: SectionKey): WorkoutBlock[] => {
    if (section === "warmup") return workout.warmupTemplate || [];
    if (section === "main") return workout.mainSetTemplate;
    return workout.cooldownTemplate || [];
  };

  const updateBlocks = useCallback((section: SectionKey, blocks: WorkoutBlock[]) => {
    const key = section === "warmup" ? "warmupTemplate" : section === "main" ? "mainSetTemplate" : "cooldownTemplate";
    setWorkout((prev) => ({ ...prev, [key]: blocks }));
  }, [setWorkout]);

  const addBlock = (section: SectionKey) => {
    updateBlocks(section, [...getBlocks(section), { ...EMPTY_BLOCK }]);
  };

  const removeBlock = (section: SectionKey, index: number) => {
    updateBlocks(section, getBlocks(section).filter((_, i) => i !== index));
  };

  const updateBlock = (section: SectionKey, index: number, block: WorkoutBlock) => {
    const blocks = [...getBlocks(section)];
    blocks[index] = block;
    updateBlocks(section, blocks);
  };

  const moveBlock = (section: SectionKey, from: number, to: number) => {
    const blocks = [...getBlocks(section)];
    const [moved] = blocks.splice(from, 1);
    blocks.splice(to, 0, moved);
    updateBlocks(section, blocks);
  };

  const toggleCollapse = (key: SectionKey) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const [isSaved, setIsSaved] = useState(() => getCustomWorkouts().some((w) => w.id === workout.id));

  const totalMin =
    (workout.warmupTemplate?.reduce((s, b) => s + (b.durationMin || 0), 0) || 0) +
    workout.mainSetTemplate.reduce((s, b) => s + (b.durationMin || 0) * (b.repetitions || 1), 0) +
    (workout.cooldownTemplate?.reduce((s, b) => s + (b.durationMin || 0), 0) || 0);

  const blockCount =
    (workout.warmupTemplate?.length || 0) +
    workout.mainSetTemplate.length +
    (workout.cooldownTemplate?.length || 0);

  const sections: { key: SectionKey; label: string; color: string }[] = [
    { key: "warmup", label: isEn ? "Warm-up" : "Échauffement", color: "text-zone-2" },
    { key: "main", label: isEn ? "Main set" : "Corps de séance", color: "text-zone-5" },
    { key: "cooldown", label: isEn ? "Cool-down" : "Retour au calme", color: "text-zone-1" },
  ];

  return (
    <>
      <SEOHead
        noindex
        title={isEn ? "Workout Builder" : "Créer une séance"}
        canonical="/workout/builder"
      />

      <div className="py-8 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/workout/builder"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-block mb-4"
          >
            {isEn ? "← My workouts" : "← Mes séances"}
          </Link>
          <input
            type="text"
            value={workout.name}
            onChange={(e) => setWorkout((prev) => ({ ...prev, name: e.target.value, nameEn: e.target.value }))}
            placeholder={isEn ? "Workout name..." : "Nom de la séance..."}
            className="block w-full text-2xl md:text-3xl font-bold bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/40 mb-1"
          />
          <p className="text-muted-foreground mb-6">
            ~{totalMin} min · {blockCount} {isEn ? "blocks" : "blocs"}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={handleSave}
              disabled={!canSave}
              className="rounded-full px-5 py-2.5 h-auto font-bold"
            >
              <Save className="size-4 mr-2" />
              {isEn ? "Save" : "Enregistrer"}
            </Button>
            {isSaved && <ExportMenu workout={workout} />}
            {isSaved && (
              <Button
                variant="outline"
                className="rounded-full px-5 py-2.5 h-auto font-bold"
                onClick={() => {
                  exportWorkoutsToJSON([workout]);
                  toast.success(isEn ? "Workout exported" : "Séance exportée");
                }}
              >
                <Download className="size-4 mr-2" />
                JSON
              </Button>
            )}
            {isSaved && (
              <Button
                variant="secondary"
                className="rounded-full px-5 py-2.5 h-auto font-bold text-destructive hover:text-destructive"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="size-4 mr-2" />
                {isEn ? "Delete" : "Supprimer"}
              </Button>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="rounded-lg border p-4 bg-card">
          <p className="text-xs text-muted-foreground mb-2">{isEn ? "Preview" : "Aperçu"}</p>
          <SessionTimeline workout={workout} />
        </div>

        {/* Sections */}
        {sections.map(({ key, label, color }) => {
          const blocks = getBlocks(key);
          const isCollapsed = collapsed[key];
          return (
            <div key={key} className="space-y-3">
              <button
                type="button"
                onClick={() => toggleCollapse(key)}
                className="flex items-center gap-2 w-full text-left"
              >
                {isCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
                <h2 className={`text-lg font-semibold ${color}`}>{label}</h2>
                <span className="text-xs text-muted-foreground">({blocks.length})</span>
              </button>

              {!isCollapsed && (
                <div className="space-y-3 pl-2">
                  {blocks.map((block, i) => (
                    <BlockEditor
                      key={`${key}-${i}`}
                      block={block}
                      onChange={(b) => updateBlock(key, i, b)}
                      onRemove={() => removeBlock(key, i)}
                      index={i}
                      canMoveUp={i > 0}
                      canMoveDown={i < blocks.length - 1}
                      onMoveUp={() => moveBlock(key, i, i - 1)}
                      onMoveDown={() => moveBlock(key, i, i + 1)}
                    />
                  ))}
                  <Button variant="outline" size="sm" onClick={() => addBlock(key)} className="w-full">
                    <Plus className="size-4" />
                    {isEn ? "Add block" : "Ajouter un bloc"}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEn ? "Delete this workout?" : "Supprimer cette séance ?"}
            </DialogTitle>
            <DialogDescription>
              {isEn
                ? "This action cannot be undone. The workout will be permanently deleted."
                : "Cette action est irréversible. La séance sera définitivement supprimée."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              {isEn ? "Cancel" : "Annuler"}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="size-4" />
              {isEn ? "Delete" : "Supprimer"}
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

  if (!id) {
    return <WorkoutListView />;
  }

  return <WorkoutEditorView workoutId={id} />;
}
