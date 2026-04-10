/**
 * MuscleMap - Visual body model showing targeted muscles
 *
 * Uses react-body-highlighter to render anterior and posterior views
 * with muscles highlighted based on the workout's exercise data.
 * Primary muscles are highlighted in a strong color, secondary in a lighter shade.
 */

import { lazy, Suspense, useMemo, useEffect, useState, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";
const Model = lazy(() => import("react-body-highlighter"));
import type { IExerciseData } from "react-body-highlighter";
import type { StrengthWorkoutTemplate, StrengthExercise, MuscleGroup } from "@/types/strength";
import { loadAllExercises } from "@/data/strength";
import { cn } from "@/lib/utils";

/** Subscribe to dark mode changes via MutationObserver on <html> */
function subscribeToDarkMode(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}
function getIsDark() {
  return document.documentElement.classList.contains("dark");
}

interface MuscleMapProps {
  workout: StrengthWorkoutTemplate;
  className?: string;
}

/**
 * Mapping from our MuscleGroup type to react-body-highlighter muscle names.
 *
 * The library accepts these muscle strings:
 * trapezius, upper-back, lower-back, chest, biceps, triceps, forearm,
 * back-deltoids, front-deltoids, abs, obliques, adductor, abductors,
 * hamstring, quadriceps, calves, gluteal, head, neck, knees,
 * left-soleus, right-soleus
 */
const MUSCLE_MAP: Record<MuscleGroup, string[]> = {
  quadriceps: ["quadriceps"],
  hamstrings: ["hamstring"],
  glutes: ["gluteal"],
  calves: ["calves", "left-soleus", "right-soleus"],
  core_anterior: ["abs"],
  core_lateral: ["obliques"],
  core_posterior: ["lower-back"],
  upper_back: ["upper-back", "trapezius"],
  shoulders: ["front-deltoids", "back-deltoids"],
  chest: ["chest"],
  hip_flexors: ["adductor"],
  adductors: ["adductor"],
};

export function MuscleMap({ workout, className }: MuscleMapProps) {
  const { t } = useTranslation("strength");
  const isDark = useSyncExternalStore(subscribeToDarkMode, getIsDark);
  const [exerciseMap, setExerciseMap] = useState<Map<string, StrengthExercise>>(new Map());

  useEffect(() => {
    loadAllExercises().then((exercises) => {
      const map = new Map<string, StrengthExercise>();
      for (const ex of exercises) map.set(ex.id, ex);
      setExerciseMap(map);
    });
  }, []);

  const modelData = useMemo(() => {
    if (exerciseMap.size === 0) return [];

    // Track how many times each muscle is targeted
    // Primary muscles add 2 to frequency, secondary add 1
    const muscleFrequency = new Map<string, number>();

    const allBlocks = [
      ...workout.warmupBlocks,
      ...workout.mainBlocks,
      ...workout.cooldownBlocks,
    ];

    for (const block of allBlocks) {
      const exercise = exerciseMap.get(block.exerciseId);
      if (!exercise) continue;

      for (const muscle of exercise.primaryMuscles) {
        const mappedMuscles = MUSCLE_MAP[muscle] || [];
        for (const m of mappedMuscles) {
          muscleFrequency.set(m, (muscleFrequency.get(m) || 0) + 2);
        }
      }
      for (const muscle of exercise.secondaryMuscles) {
        const mappedMuscles = MUSCLE_MAP[muscle] || [];
        for (const m of mappedMuscles) {
          muscleFrequency.set(m, (muscleFrequency.get(m) || 0) + 1);
        }
      }
    }

    // Build exercise data entries for the model
    // Group muscles by frequency level for coloring
    const data: IExerciseData[] = [];
    const maxFreq = Math.max(...muscleFrequency.values(), 1);

    // Create entries with frequency proportional to intensity
    // The library colors based on how many times a muscle appears across entries
    for (const [muscle, freq] of muscleFrequency) {
      // Normalize frequency to 1-3 range for color mapping
      const normalizedFreq = Math.max(1, Math.ceil((freq / maxFreq) * 3));
      data.push({
        name: t("detail.muscleMap"),
        muscles: [muscle as never],
        frequency: normalizedFreq,
      });
    }

    return data;
  }, [workout, exerciseMap, t]);

  if (modelData.length === 0) {
    return null;
  }

  return (
    <Suspense fallback={<div className="h-64 animate-pulse bg-muted rounded" />}>
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center justify-center gap-2">
          {/* Anterior (front) view */}
          <div className="flex-1 max-w-[140px]">
            <Model
              data={modelData}
              style={{ width: "100%", padding: "0" }}
              highlightedColors={["#fbbf24", "#f97316", "#ef4444"]}
              bodyColor={isDark ? "#404040" : "#d1d5db"}
              type="anterior"
            />
            <p className="text-[10px] text-muted-foreground text-center mt-1">
              {t("detail.front")}
            </p>
          </div>

          {/* Posterior (back) view */}
          <div className="flex-1 max-w-[140px]">
            <Model
              data={modelData}
              style={{ width: "100%", padding: "0" }}
              highlightedColors={["#fbbf24", "#f97316", "#ef4444"]}
              bodyColor={isDark ? "#404040" : "#d1d5db"}
              type="posterior"
            />
            <p className="text-[10px] text-muted-foreground text-center mt-1">
              {t("detail.back")}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#fbbf24" }} />
            {t("detail.lowIntensity")}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#f97316" }} />
            {t("detail.mediumIntensity")}
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: "#ef4444" }} />
            {t("detail.highIntensity")}
          </span>
        </div>
      </div>
    </Suspense>
  );
}
