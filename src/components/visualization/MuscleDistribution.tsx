/**
 * MuscleDistribution - Shows which muscles are targeted and how much
 *
 * Similar to ZoneDistribution but for strength workouts.
 * Calculates approximate time per muscle group across all blocks.
 */

import { useMemo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { StrengthWorkoutTemplate, StrengthExercise, MuscleGroup } from "@/types/strength";
import { loadAllExercises } from "@/data/strength";
import { cn } from "@/lib/utils";

interface MuscleDistributionProps {
  workout: StrengthWorkoutTemplate;
  className?: string;
}

interface MuscleBreakdown {
  muscle: MuscleGroup;
  label: string;
  sets: number;
  percent: number;
  isPrimary: boolean;
}

const MUSCLE_COLORS: Record<MuscleGroup, string> = {
  quadriceps: "var(--muscle-quadriceps)",
  hamstrings: "var(--muscle-hamstrings)",
  calves: "var(--muscle-calves)",
  glutes: "var(--muscle-glutes)",
  hip_flexors: "var(--muscle-hip_flexors)",
  adductors: "var(--muscle-adductors)",
  core_anterior: "var(--muscle-core_anterior)",
  core_lateral: "var(--muscle-core_lateral)",
  core_posterior: "var(--muscle-core_posterior)",
  upper_back: "var(--muscle-upper_back)",
  shoulders: "var(--muscle-shoulders)",
  chest: "var(--muscle-chest)",
};

export function MuscleDistribution({ workout, className }: MuscleDistributionProps) {
  const { t } = useTranslation("strength");
  const [exerciseMap, setExerciseMap] = useState<Map<string, StrengthExercise>>(new Map());

  useEffect(() => {
    loadAllExercises().then((exercises) => {
      const map = new Map<string, StrengthExercise>();
      for (const ex of exercises) map.set(ex.id, ex);
      setExerciseMap(map);
    });
  }, []);

  const breakdown = useMemo(() => {
    if (exerciseMap.size === 0) return [];

    // Count sets per muscle group (primary muscles count full, secondary half)
    const muscleSets = new Map<MuscleGroup, { primary: number; secondary: number }>();
    const allBlocks = [
      ...workout.warmupBlocks,
      ...workout.mainBlocks,
      ...workout.cooldownBlocks,
    ];

    for (const block of allBlocks) {
      const exercise = exerciseMap.get(block.exerciseId);
      if (!exercise) continue;

      for (const muscle of exercise.primaryMuscles) {
        const existing = muscleSets.get(muscle) || { primary: 0, secondary: 0 };
        existing.primary += block.sets;
        muscleSets.set(muscle, existing);
      }
      for (const muscle of exercise.secondaryMuscles) {
        const existing = muscleSets.get(muscle) || { primary: 0, secondary: 0 };
        existing.secondary += block.sets;
        muscleSets.set(muscle, existing);
      }
    }

    // Calculate weighted score (primary sets count 1x, secondary 0.5x)
    const entries: MuscleBreakdown[] = [];
    let maxScore = 0;

    for (const [muscle, { primary, secondary }] of muscleSets) {
      const score = primary + secondary * 0.5;
      if (score > maxScore) maxScore = score;
      entries.push({
        muscle,
        label: t(`muscles.${muscle}`),
        sets: primary + secondary,
        percent: 0, // computed below
        isPrimary: primary > 0,
      });
    }

    // Normalize to percentages relative to the most targeted muscle
    for (const entry of entries) {
      const score =
        (muscleSets.get(entry.muscle)?.primary || 0) +
        (muscleSets.get(entry.muscle)?.secondary || 0) * 0.5;
      entry.percent = maxScore > 0 ? (score / maxScore) * 100 : 0;
    }

    // Sort: primary muscles first, then by percent descending
    entries.sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return b.percent - a.percent;
    });

    return entries;
  }, [workout, exerciseMap, t]);

  if (breakdown.length === 0) {
    return null;
  }

  const totalSets = [...new Set(
    [...workout.warmupBlocks, ...workout.mainBlocks, ...workout.cooldownBlocks]
  )].reduce((sum, b) => sum + b.sets, 0);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="space-y-2">
        {breakdown.map((item) => (
          <div key={item.muscle} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className={cn("font-medium", !item.isPrimary && "text-muted-foreground")}>
                {item.label}
                {!item.isPrimary && (
                  <span className="ml-1 text-[10px] text-muted-foreground/70">
                    ({t("detail.secondary")})
                  </span>
                )}
              </span>
              <span className="text-muted-foreground">
                {item.sets} {t("detail.sets")}
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${item.percent}%`,
                  backgroundColor: MUSCLE_COLORS[item.muscle],
                  opacity: item.isPrimary ? 1 : 0.6,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="text-xs text-muted-foreground text-center pt-2 border-t">
        Total: {totalSets} {t("detail.totalSets")}
      </div>
    </div>
  );
}
