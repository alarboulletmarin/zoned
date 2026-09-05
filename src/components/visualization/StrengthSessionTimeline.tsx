/**
 * StrengthSessionTimeline - Horizontal bar visualization for strength sessions
 *
 * Similar concept to SessionTimeline but for strength workouts:
 * - Each exercise = a segment
 * - Width proportional to estimated time (sets x reps x ~3s + rest)
 * - Colored by primary muscle group
 * - Warmup/main/cooldown separated by borders
 * - Summary bar with exercise count, total sets, total duration
 */

import { useState, useMemo, useEffect, type CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { StrengthWorkoutTemplate, StrengthBlock, StrengthExercise } from "@/types/strength";
import { loadAllExercises } from "@/data/strength";
import { useIsEnglish } from "@/lib/i18n-utils";
import { MUSCLE_COLORS } from "@/components/domain/MuscleGroupBadge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface StrengthSessionTimelineProps {
  workout: StrengthWorkoutTemplate;
  className?: string;
}

interface TimelineExerciseSegment {
  id: string;
  phase: "warmup" | "main" | "cooldown";
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number | string;
  estimatedMinutes: number;
  widthPercent: number;
  color: string;
  supersetGroup?: string;
}

/**
 * Estimate exercise duration in minutes.
 * - Numeric reps: sets x reps x 3s (tempo) + rest between sets
 * - String reps like "30s": sets x parsed seconds + rest
 */
function estimateExerciseDuration(block: StrengthBlock): number {
  const restSeconds = parseRestToSeconds(block.restBetweenSets);

  let repDurationSeconds: number;
  if (typeof block.reps === "number") {
    repDurationSeconds = block.reps * 3; // ~3s per rep
  } else {
    // Parse strings like "30s", "45s", "1min"
    repDurationSeconds = parseTimeString(block.reps);
  }

  const totalWorkSeconds = block.sets * repDurationSeconds;
  const totalRestSeconds = (block.sets - 1) * restSeconds;
  return (totalWorkSeconds + totalRestSeconds) / 60;
}

function parseRestToSeconds(rest: string): number {
  const minMatch = rest.match(/(\d+)\s*min/);
  if (minMatch) return parseInt(minMatch[1]) * 60;
  const secMatch = rest.match(/(\d+)\s*s/);
  if (secMatch) return parseInt(secMatch[1]);
  return 60; // default 60s
}

function parseTimeString(time: string): number {
  const minMatch = time.match(/(\d+)\s*min/);
  if (minMatch) return parseInt(minMatch[1]) * 60;
  const secMatch = time.match(/(\d+)\s*s/);
  if (secMatch) return parseInt(secMatch[1]);
  return 30; // default 30s
}

/**
 * Height based on intensity: mobility=30%, endurance=45%, hypertrophy=60%, strength=80%, power=100%
 */
function getIntensityHeight(block: StrengthBlock): number {
  const heights: Record<string, number> = {
    mobility: 30,
    endurance: 45,
    hypertrophy: 60,
    strength: 80,
    power: 100,
  };
  return heights[block.intensity] ?? 50;
}

export function StrengthSessionTimeline({ workout, className }: StrengthSessionTimelineProps) {
  const { t } = useTranslation("strength");
  const isEn = useIsEnglish();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [openTooltipIndex, setOpenTooltipIndex] = useState<number | null>(null);
  const [exerciseMap, setExerciseMap] = useState<Map<string, StrengthExercise>>(new Map());

  // Load exercises for name resolution
  useEffect(() => {
    loadAllExercises().then((exercises) => {
      const map = new Map<string, StrengthExercise>();
      for (const ex of exercises) {
        map.set(ex.id, ex);
      }
      setExerciseMap(map);
    });
  }, []);

  const { segments, totalMinutes, totalSets, totalExercises } = useMemo(() => {
    const allPhases: { phase: "warmup" | "main" | "cooldown"; blocks: StrengthBlock[] }[] = [
      { phase: "warmup", blocks: workout.warmupBlocks },
      { phase: "main", blocks: workout.mainBlocks },
      { phase: "cooldown", blocks: workout.cooldownBlocks },
    ];

    const segs: TimelineExerciseSegment[] = [];
    let total = 0;
    let sets = 0;

    for (const { phase, blocks } of allPhases) {
      for (const block of blocks) {
        const est = estimateExerciseDuration(block);
        const exercise = exerciseMap.get(block.exerciseId);
        const primaryMuscle = exercise?.primaryMuscles[0];
        const color = primaryMuscle ? MUSCLE_COLORS[primaryMuscle] : "var(--muted-foreground)";

        segs.push({
          id: `${phase}-${block.exerciseId}-${segs.length}`,
          phase,
          exerciseId: block.exerciseId,
          exerciseName: exercise
            ? (isEn ? exercise.nameEn : exercise.name)
            : block.exerciseId,
          sets: block.sets,
          reps: block.reps,
          estimatedMinutes: est,
          widthPercent: 0, // computed below
          color,
          supersetGroup: block.supersetGroup,
        });
        total += est;
        sets += block.sets;
      }
    }

    // Compute widths as percent of total
    for (const seg of segs) {
      seg.widthPercent = total > 0 ? (seg.estimatedMinutes / total) * 100 : 0;
    }

    return {
      segments: segs,
      totalMinutes: Math.round(total),
      totalSets: sets,
      totalExercises: segs.length,
    };
  }, [workout, exerciseMap, isEn]);

  if (segments.length === 0) {
    return (
      <div className={cn("zn-viz-empty", className)}>
        <p className="zn-viz-empty__text">
          {t("detail.loadingExercises")}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn("zn-timeline", className)}>
        {/* Summary bar */}
        <div className="zn-timeline__summary">
          <strong>
            {totalExercises} {t("detail.totalExercises")}
          </strong>
          <span>{totalSets} {t("detail.totalSets")}</span>
          <span>{t("detail.estimatedDuration", { minutes: totalMinutes })}</span>
        </div>

        {/* Timeline bar */}
        <div
          className="zn-timeline__plot"
          data-size="sm"
          role="img"
          aria-label={t("detail.sessionTimeline")}
        >
          {segments.map((segment, index) => {
            const isHovered = hoveredIndex === index;
            const prevSegment = index > 0 ? segments[index - 1] : null;
            const isPhaseChange = prevSegment && prevSegment.phase !== segment.phase;

            // Find the corresponding block for intensity-based height
            const allBlocks = [
              ...workout.warmupBlocks,
              ...workout.mainBlocks,
              ...workout.cooldownBlocks,
            ];
            const block = allBlocks.find((b) => b.exerciseId === segment.exerciseId);
            const heightPercent = block ? getIntensityHeight(block) : 50;

            return (
              <Tooltip
                key={segment.id}
                open={openTooltipIndex === index}
                onOpenChange={(open) => {
                  if (open) setOpenTooltipIndex(index);
                  else if (openTooltipIndex === index) setOpenTooltipIndex(null);
                }}
              >
                <TooltipTrigger asChild>
                  <div
                    className="zn-timeline__seg"
                    data-phase-change={isPhaseChange || undefined}
                    data-hovered={isHovered || undefined}
                    style={
                      {
                        "--flex": segment.widthPercent,
                        "--h": `${heightPercent}%`,
                        "--fill": segment.color,
                      } as CSSProperties
                    }
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() =>
                      setOpenTooltipIndex(openTooltipIndex === index ? null : index)
                    }
                  >
                    {/* Hover label */}
                    {isHovered && segment.widthPercent > 4 && (
                      <div className="zn-timeline__flag">
                        {segment.exerciseName}
                      </div>
                    )}

                    {/* Superset indicator */}
                    {segment.supersetGroup && (
                      <div className="zn-timeline__superset" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <div className="zn-timeline__tip">
                    <p className="zn-timeline__tip-title">{segment.exerciseName}</p>
                    <div className="zn-timeline__tip-meta">
                      <span
                        className="zn-timeline__tip-dot"
                        style={{ "--fill": segment.color } as CSSProperties}
                      />
                      <span>{t(`detail.${segment.phase === "main" ? "mainSet" : segment.phase}`)}</span>
                      <span>
                        {segment.sets}x{segment.reps}
                      </span>
                    </div>
                    {segment.supersetGroup && (
                      <p className="zn-timeline__tip-note">
                        {t("detail.superset")} {segment.supersetGroup}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Phase labels */}
        <div className="zn-timeline__phases">
          <span>{t("detail.warmup")}</span>
          <strong>~{totalMinutes} min</strong>
          <span>{t("detail.cooldown")}</span>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default StrengthSessionTimeline;
