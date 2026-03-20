import { useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Save, Trash2, Plus, ChevronDown, ChevronUp, ArrowRight, MoreHorizontal } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  const workouts = getCustomWorkouts();

  return (
    <>
      <SEOHead
        noindex
        title={isEn ? "My Workouts" : "Mes séances"}
        canonical="/workout/builder"
      />
      <div className="py-8 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{isEn ? "My Workouts" : "Mes séances"}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isEn
                ? "Custom workouts are stored locally in your browser."
                : "Les séances personnalisées sont stockées dans votre navigateur."}
            </p>
          </div>
          <Button onClick={() => {
            const w = createEmptyWorkout();
            navigate(`/workout/builder/${w.id}`, { state: { fresh: true } });
          }}>
            <Plus className="size-4" />
            {isEn ? "New workout" : "Nouvelle séance"}
          </Button>
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
                <Link
                  key={w.id}
                  to={`/workout/builder/${w.id}`}
                  className="block rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{w.name || (isEn ? "Untitled" : "Sans titre")}</h3>
                      <p className="text-sm text-muted-foreground">
                        ~{totalMin}min · {w.mainSetTemplate.length} {isEn ? "blocks" : "blocs"}
                      </p>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

// ── Editor view (with id param) ──────────────────────────────────────

function WorkoutEditorView({ workoutId }: { workoutId: string }) {
  const navigate = useNavigate();
  const { i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;

  const [workout, setWorkout] = useState<WorkoutTemplate>(() => {
    const existing = getCustomWorkout(workoutId);
    if (existing) return existing;
    const fresh = createEmptyWorkout();
    return { ...fresh, id: workoutId };
  });

  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    warmup: false,
    main: false,
    cooldown: false,
  });

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
      toast.success(isEn ? "Workout saved" : "Séance sauvegardée");
      navigate("/workout/builder");
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
  }, []);

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

  const isSaved = useMemo(() => getCustomWorkouts().some((w) => w.id === workout.id), [workout.id]);

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
        <div className="space-y-4">
          <Link
            to="/workout/builder"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isEn ? "← My workouts" : "← Mes séances"}
          </Link>
          <input
            type="text"
            value={workout.name}
            onChange={(e) => setWorkout((prev) => ({ ...prev, name: e.target.value, nameEn: e.target.value }))}
            placeholder={isEn ? "Workout name..." : "Nom de la séance..."}
            className="block w-full text-2xl font-bold bg-transparent border-none focus:outline-none placeholder:text-muted-foreground/40"
          />
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-full">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    {isEn ? "Delete workout" : "Supprimer la séance"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>~{totalMin} min</span>
          <span>{blockCount} {isEn ? "blocks" : "blocs"}</span>
          <span>{workout.mainSetTemplate.length} {isEn ? "in main set" : "dans le corps"}</span>
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
