/**
 * StrengthExerciseList - Detailed exercise list for strength workout detail page
 *
 * Shows exercises grouped by phase (warmup/main/cooldown) with:
 * - Exercise name, sets x reps, rest, intensity badge, RPE
 * - Superset grouping
 * - Expandable form cues
 * - Muscle group badges
 */

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronUp } from "@/components/icons";
import { IntensityBadge } from "./IntensityBadge";
import { ExerciseImage } from "./ExerciseImage";
import { MuscleGroupBadges } from "./MuscleGroupBadge";
import { Skeleton } from "@/components/ui/skeleton";
import type { StrengthBlock, StrengthExercise } from "@/types/strength";
import { getExerciseById } from "@/data/strength";
import { usePickLang, usePickLangArray } from "@/lib/i18n-utils";

interface StrengthExerciseListProps {
  blocks: StrengthBlock[];
  phase: "warmup" | "main" | "cooldown";
  className?: string;
}

/** Resolved exercise data keyed by exerciseId */
type ExerciseMap = Map<string, StrengthExercise>;

export function StrengthExerciseList({ blocks, phase, className }: StrengthExerciseListProps) {
  const { t } = useTranslation("strength");
  const [exercises, setExercises] = useState<ExerciseMap>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadExercises() {
      const map = new Map<string, StrengthExercise>();
      const promises = blocks.map(async (block) => {
        const exercise = await getExerciseById(block.exerciseId);
        if (exercise && !cancelled) {
          map.set(block.exerciseId, exercise);
        }
      });
      await Promise.all(promises);
      if (!cancelled) {
        setExercises(map);
        setIsLoading(false);
      }
    }

    loadExercises();
    return () => { cancelled = true; };
  }, [blocks]);

  if (blocks.length === 0) return null;

  const phaseLabel = {
    warmup: t("detail.warmup"),
    main: t("detail.mainSet"),
    cooldown: t("detail.cooldown"),
  }[phase];

  // Group exercises by superset
  const groups = groupBySupersets(blocks);

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        {phaseLabel}
      </h4>

      {isLoading ? (
        <div className="space-y-2">
          {blocks.map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {groups.map((group, gi) => {
            if (group.length === 1) {
              return (
                <ExerciseItem
                  key={`${phase}-${gi}`}
                  block={group[0]}
                  exercise={exercises.get(group[0].exerciseId)}
                  t={t}
                />
              );
            }

            // Superset group
            return (
              <div
                key={`${phase}-ss-${gi}`}
                className="border border-dashed border-primary/30 rounded-lg p-2 space-y-2"
              >
                <div className="text-xs font-semibold text-primary uppercase tracking-wide px-1">
                  {t("detail.superset")} {group[0].supersetGroup}
                </div>
                {group.map((block, bi) => (
                  <ExerciseItem
                    key={`${phase}-${gi}-${bi}`}
                    block={block}
                    exercise={exercises.get(block.exerciseId)}
                    t={t}
                  />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Group consecutive blocks with the same supersetGroup
 */
function groupBySupersets(blocks: StrengthBlock[]): StrengthBlock[][] {
  const groups: StrengthBlock[][] = [];
  let currentGroup: StrengthBlock[] = [];
  let currentSuperset: string | undefined;

  for (const block of blocks) {
    if (block.supersetGroup && block.supersetGroup === currentSuperset) {
      currentGroup.push(block);
    } else {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [block];
      currentSuperset = block.supersetGroup;
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

interface ExerciseItemProps {
  block: StrengthBlock;
  exercise?: StrengthExercise;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

function ExerciseItem({ block, exercise, t }: ExerciseItemProps) {
  const [showFormCues, setShowFormCues] = useState(false);
  const toggleFormCues = useCallback(() => setShowFormCues((prev) => !prev), []);
  const pickLang = usePickLang();
  const pickLangArray = usePickLangArray();

  const name = exercise
    ? pickLang(exercise, "name")
    : block.exerciseId;

  const repsDisplay = typeof block.reps === "string"
    ? `${block.reps} ${t("detail.hold")}`
    : block.reps;

  const formCues = exercise
    ? pickLangArray<string>(exercise, "formCues")
    : [];

  return (
    <div className="p-3 rounded-lg bg-muted/50 space-y-2">
      {/* Main layout: images beside details on sm+, stacked on mobile */}
      <div className="flex gap-3">
        {/* Exercise images (A -> B) — hidden on mobile, shown sm+ */}
        <div className="shrink-0 hidden sm:block">
          <ExerciseImage
            imageSlug={exercise?.imageSlug}
            exerciseName={name}
            size="md"
          />
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header row: name + sets x reps */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-tight">{name}</p>
              {exercise?.isUnilateral && (
                <span className="text-[10px] text-muted-foreground">
                  ({t("detail.perSide")})
                </span>
              )}
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-mono font-bold">
                {block.sets}x{repsDisplay}
              </span>
              <div className="text-[10px] text-muted-foreground">
                {t("detail.rest")}: {block.restBetweenSets}
              </div>
            </div>
          </div>

          {/* Metadata row: intensity badge + RPE + notes */}
          <div className="flex items-center gap-2 flex-wrap">
            <IntensityBadge intensity={block.intensity} size="sm" />
            {block.rpe != null && (
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {t("detail.rpe")} {block.rpe}/10
              </span>
            )}
            {block.percentRM != null && (
              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {block.percentRM}% 1RM
              </span>
            )}
          </div>

          {/* Muscle groups */}
          {exercise && (
            <MuscleGroupBadges
              muscles={[...exercise.primaryMuscles, ...exercise.secondaryMuscles]}
              size="sm"
              max={4}
            />
          )}
        </div>
      </div>

      {/* Mobile-only: show images below header */}
      <div className="sm:hidden">
        <ExerciseImage
          imageSlug={exercise?.imageSlug}
          exerciseName={name}
          size="sm"
        />
      </div>

      {/* Notes */}
      {block.notes && (
        <p className="text-xs text-muted-foreground italic">
          {pickLang(block, "notes") || block.notes}
        </p>
      )}

      {/* Expandable form cues */}
      {formCues.length > 0 && (
        <div>
          <button
            type="button"
            onClick={toggleFormCues}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showFormCues ? (
              <ChevronUp className="size-3" />
            ) : (
              <ChevronDown className="size-3" />
            )}
            {t("detail.formCues")}
          </button>
          {showFormCues && (
            <ul className="mt-1.5 space-y-1 pl-4">
              {formCues.map((cue, i) => (
                <li
                  key={i}
                  className="text-xs text-muted-foreground pl-2 relative before:content-[''] before:absolute before:left-0 before:top-[7px] before:w-1 before:h-1 before:rounded-full before:bg-muted-foreground/50"
                >
                  {cue}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
