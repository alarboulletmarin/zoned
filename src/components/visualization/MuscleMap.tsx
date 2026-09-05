/**
 * MuscleMap - Visual body model showing targeted muscles
 *
 * Uses react-body-highlighter to render anterior and posterior views
 * with muscles highlighted based on the workout's exercise data.
 * Primary muscles are highlighted in a strong color, secondary in a lighter shade.
 */

import { lazy, Suspense, useMemo, useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
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
 * Heatmap intensity ramp for the body model — yellow → orange → red.
 * Centralised here because react-body-highlighter renders raw SVG fill
 * attributes that don't resolve CSS custom properties; if the design
 * system needs to reskin these via a token, this list is the single
 * point of change. Body bg colors mirror Tailwind neutral-700/300.
 */
const MUSCLE_HEATMAP_RAMP: [string, string, string] = ["#fbbf24", "#f97316", "#ef4444"];
const BODY_BG_DARK = "#404040";
const BODY_BG_LIGHT = "#d1d5db";

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
    <Suspense fallback={<div className="zn-skeleton zn-musclemap__loading" />}>
      <div className={cn("zn-musclemap", className)}>
        <div className="zn-musclemap__views">
          {/* Anterior (front) view */}
          <div className="zn-musclemap__view">
            <Model
              data={modelData}
              style={{ width: "100%", padding: "0" }}
              highlightedColors={MUSCLE_HEATMAP_RAMP}
              bodyColor={isDark ? BODY_BG_DARK : BODY_BG_LIGHT}
              type="anterior"
            />
            <p className="zn-musclemap__caption">
              {t("detail.front")}
            </p>
          </div>

          {/* Posterior (back) view */}
          <div className="zn-musclemap__view">
            <Model
              data={modelData}
              style={{ width: "100%", padding: "0" }}
              highlightedColors={MUSCLE_HEATMAP_RAMP}
              bodyColor={isDark ? BODY_BG_DARK : BODY_BG_LIGHT}
              type="posterior"
            />
            <p className="zn-musclemap__caption">
              {t("detail.back")}
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="zn-musclemap__legend">
          <span className="zn-musclemap__key">
            <span className="zn-musclemap__swatch" style={{ "--fill": MUSCLE_HEATMAP_RAMP[0] } as CSSProperties} />
            {t("detail.lowIntensity")}
          </span>
          <span className="zn-musclemap__key">
            <span className="zn-musclemap__swatch" style={{ "--fill": MUSCLE_HEATMAP_RAMP[1] } as CSSProperties} />
            {t("detail.mediumIntensity")}
          </span>
          <span className="zn-musclemap__key">
            <span className="zn-musclemap__swatch" style={{ "--fill": MUSCLE_HEATMAP_RAMP[2] } as CSSProperties} />
            {t("detail.highIntensity")}
          </span>
        </div>
      </div>
    </Suspense>
  );
}
