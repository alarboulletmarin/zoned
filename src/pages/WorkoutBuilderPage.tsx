import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Save, Trash2, Plus, ChevronDown, ChevronUp } from "@/components/icons";
import { Button } from "@/components/ui/button";
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

export function WorkoutBuilderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;

  const [workout, setWorkout] = useState<WorkoutTemplate>(() => {
    if (id) {
      const existing = getCustomWorkout(id);
      if (existing) return existing;
    }
    return createEmptyWorkout();
  });

  const [collapsed, setCollapsed] = useState<Record<SectionKey, boolean>>({
    warmup: false,
    main: false,
    cooldown: false,
  });

  // Redirect to the correct URL if creating a new workout
  useEffect(() => {
    if (!id && workout.id) {
      navigate(`/workout/builder/${workout.id}`, { replace: true });
    }
  }, [id, workout.id, navigate]);

  const canSave = workout.name.trim().length > 0;

  const handleSave = useCallback(() => {
    if (!canSave) return;
    try {
      // Update duration estimate
      const totalMin =
        (workout.warmupTemplate?.reduce((s, b) => s + (b.durationMin || 0), 0) || 0) +
        workout.mainSetTemplate.reduce((s, b) => s + (b.durationMin || 0) * (b.repetitions || 1), 0) +
        (workout.cooldownTemplate?.reduce((s, b) => s + (b.durationMin || 0), 0) || 0);
      const updated = {
        ...workout,
        typicalDuration: { min: Math.max(totalMin - 5, 0), max: totalMin + 5 },
      };
      saveCustomWorkout(updated);
      setWorkout(updated);
      toast.success(isEn ? "Workout saved" : "Séance sauvegardée");
    } catch {
      toast.error(isEn ? "Maximum 20 custom workouts reached" : "Maximum de 20 séances personnalisées atteint");
    }
  }, [workout, canSave, isEn]);

  const handleDelete = useCallback(() => {
    deleteCustomWorkout(workout.id);
    toast.success(isEn ? "Workout deleted" : "Séance supprimée");
    navigate("/library");
  }, [workout.id, isEn, navigate]);

  const updateBlocks = useCallback((section: SectionKey, blocks: WorkoutBlock[]) => {
    const key = section === "warmup" ? "warmupTemplate" : section === "main" ? "mainSetTemplate" : "cooldownTemplate";
    setWorkout((prev) => ({ ...prev, [key]: blocks }));
  }, []);

  const getBlocks = (section: SectionKey): WorkoutBlock[] => {
    if (section === "warmup") return workout.warmupTemplate || [];
    if (section === "main") return workout.mainSetTemplate;
    return workout.cooldownTemplate || [];
  };

  const addBlock = useCallback((section: SectionKey) => {
    const blocks = getBlocks(section);
    updateBlocks(section, [...blocks, { ...EMPTY_BLOCK }]);
  }, [workout]);

  const removeBlock = useCallback((section: SectionKey, index: number) => {
    const blocks = getBlocks(section);
    updateBlocks(section, blocks.filter((_, i) => i !== index));
  }, [workout]);

  const updateBlock = useCallback((section: SectionKey, index: number, block: WorkoutBlock) => {
    const blocks = [...getBlocks(section)];
    blocks[index] = block;
    updateBlocks(section, blocks);
  }, [workout]);

  const moveBlock = useCallback((section: SectionKey, from: number, to: number) => {
    const blocks = [...getBlocks(section)];
    const [moved] = blocks.splice(from, 1);
    blocks.splice(to, 0, moved);
    updateBlocks(section, blocks);
  }, [workout]);

  const toggleCollapse = (key: SectionKey) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Check if this workout is already saved
  const isSaved = useMemo(() => {
    return getCustomWorkouts().some((w) => w.id === workout.id);
  }, [workout.id]);

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
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
          <input
            type="text"
            value={workout.name}
            onChange={(e) => setWorkout((prev) => ({ ...prev, name: e.target.value, nameEn: e.target.value }))}
            placeholder={isEn ? "Workout name..." : "Nom de la séance..."}
            className="text-2xl font-bold bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none pb-1 transition-colors w-full"
          />
          <div className="flex gap-2 shrink-0">
            <Button onClick={handleSave} disabled={!canSave} size="sm">
              <Save className="size-4" />
              {isEn ? "Save" : "Sauvegarder"}
            </Button>
            {isSaved && <ExportMenu workout={workout} />}
            {isSaved && (
              <Button variant="ghost" size="icon-sm" onClick={handleDelete} className="text-destructive">
                <Trash2 className="size-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Warning */}
        <p className="text-xs text-muted-foreground">
          {isEn
            ? "Custom workouts are stored locally in your browser. Export your data regularly from Settings."
            : "Les séances personnalisées sont stockées dans votre navigateur. Exportez vos données régulièrement depuis les Paramètres."}
        </p>

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
