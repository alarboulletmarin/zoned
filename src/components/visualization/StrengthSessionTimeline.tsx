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

import { useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { StrengthWorkoutTemplate, StrengthBlock, StrengthExercise } from "@/types/strength";
import { loadAllExercises } from "@/data/strength";
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
  const { t, i18n } = useTranslation("strength");
  const isEn = i18n.language?.startsWith("en") ?? false;
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
      <div className={cn("rounded-lg bg-muted/50 p-4 text-center", className)}>
        <p className="text-sm text-muted-foreground italic">
          {t("detail.loadingExercises")}
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn("w-full", className)}>
        {/* Summary bar */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
          <span className="font-medium text-foreground">
            {totalExercises} {t("detail.totalExercises")}
          </span>
          <span>{totalSets} {t("detail.totalSets")}</span>
          <span>{t("detail.estimatedDuration", { minutes: totalMinutes })}</span>
        </div>

        {/* Timeline bar */}
        <div
          className="relative flex items-end h-32 md:h-44 rounded-xl overflow-hidden"
          style={{ backgroundColor: "color-mix(in srgb, var(--muted) 40%, transparent)" }}
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
                    className={cn(
                      "relative transition-all duration-200 cursor-pointer rounded-t-sm",
                      "hover:brightness-110 hover:z-10",
                      isHovered && "brightness-110"
                    )}
                    style={{
                      width: `${segment.widthPercent}%`,
                      height: `${heightPercent}%`,
                      backgroundColor: segment.color,
                      marginLeft: index > 0 ? "2px" : undefined,
                      borderLeft: isPhaseChange
                        ? "3px solid rgba(0,0,0,0.3)"
                        : undefined,
                    }}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() =>
                      setOpenTooltipIndex(openTooltipIndex === index ? null : index)
                    }
                  >
                    {/* Hover label */}
                    {isHovered && segment.widthPercent > 4 && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap z-20 pointer-events-none">
                        {segment.exerciseName}
                      </div>
                    )}

                    {/* Superset indicator */}
                    {segment.supersetGroup && (
                      <div
                        className="absolute inset-x-0 top-0 h-1.5"
                        style={{
                          background: "linear-gradient(90deg, transparent 40%, hsl(var(--foreground)/0.3) 50%, transparent 60%)",
                        }}
                      />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{segment.exerciseName}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span
                        className="inline-block w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: segment.color }}
                      />
                      <span className="capitalize">{t(`detail.${segment.phase === "main" ? "mainSet" : segment.phase}`)}</span>
                      <span className="font-mono">
                        {segment.sets}x{segment.reps}
                      </span>
                    </div>
                    {segment.supersetGroup && (
                      <p className="text-xs text-muted-foreground">
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
        <div className="flex justify-between text-xs text-muted-foreground mt-3 px-1">
          <span>{t("detail.warmup")}</span>
          <span className="font-mono font-bold text-foreground">
            ~{totalMinutes} min
          </span>
          <span>{t("detail.cooldown")}</span>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default StrengthSessionTimeline;
