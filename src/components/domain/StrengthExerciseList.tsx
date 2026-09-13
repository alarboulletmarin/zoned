/**
 * StrengthExerciseList - Detailed exercise list for strength workout detail page
 *
 * Shows exercises grouped by phase (warmup/main/cooldown) with:
 * - Exercise name, sets x reps, rest, intensity badge, RPE
 * - Superset grouping
 * - Expandable form cues
 * - Muscle group badges
 *
 * Paint: `src/styles/components/strength.css` (.zn-exercise / .zn-superset).
 */

import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { CSSProperties } from "react";
import { ChevronDown, ChevronUp } from "@/components/icons";
import { IntensityBadge } from "./IntensityBadge";
import { PhaseCard } from "./PhaseCard";
import { ExerciseImage } from "./ExerciseImage";
import { MuscleGroupBadges } from "./MuscleGroupBadge";
import { Skeleton } from "@/components/ui/skeleton";
import type { StrengthBlock, StrengthExercise } from "@/types/strength";
import { getExerciseById } from "@/data/strength";
import { usePickLang, usePickLangArray } from "@/lib/i18n-utils";

const STACK_SM = { "--gap": "var(--sp-5)" } as CSSProperties;

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
    <PhaseCard label={phaseLabel} className={className}>
      {isLoading ? (
        <div className="zn-stack" style={STACK_SM}>
          {blocks.map((_, i) => (
            <Skeleton key={i} className="zn-exercise__skeleton" />
          ))}
        </div>
      ) : (
        <div className="zn-stack" style={STACK_SM}>
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
              <div key={`${phase}-ss-${gi}`} className="zn-superset">
                <span className="zn-kicker zn-kicker--inline">
                  {t("detail.superset")} {group[0].supersetGroup}
                </span>
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
    </PhaseCard>
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
    <div className="zn-exercise">
      {/* Main layout: images beside details on sm+, stacked on mobile */}
      <div className="zn-row zn-row--start">
        {/* Exercise images (A -> B), hidden on mobile, shown sm+ */}
        <div className="zn-fixed zn-exercise__wide">
          <ExerciseImage
            imageSlug={exercise?.imageSlug}
            exerciseName={name}
            size="md"
          />
        </div>

        {/* Details */}
        <div className="zn-fill zn-stack" style={STACK_SM}>
          {/* Header row: name + sets x reps */}
          <div className="zn-row zn-row--start">
            <div className="zn-fill">
              <p className="zn-exercise__name">{name}</p>
              {exercise?.isUnilateral && (
                <span className="zn-exercise__aside">
                  ({t("detail.perSide")})
                </span>
              )}
            </div>
            <div className="zn-fixed">
              <span className="zn-exercise__dose">
                {block.sets}x{repsDisplay}
              </span>
              <span className="zn-exercise__rest">
                {t("detail.rest")}: {block.restBetweenSets}
              </span>
            </div>
          </div>

          {/* Metadata row: intensity badge + RPE + notes */}
          <div className="zn-cluster" style={{ "--gap": "var(--sp-3)" } as CSSProperties}>
            <IntensityBadge intensity={block.intensity} size="sm" />
            {block.rpe != null && (
              <span className="zn-exercise__chip">
                {t("detail.rpe")} {block.rpe}/10
              </span>
            )}
            {block.percentRM != null && (
              <span className="zn-exercise__chip">
                {block.percentRM}% 1RM
              </span>
            )}
          </div>

          {/* Muscle groups */}
          {exercise && (
            <MuscleGroupBadges
              muscles={exercise.primaryMuscles}
              secondary={exercise.secondaryMuscles}
              size="sm"
              max={4}
            />
          )}
        </div>
      </div>

      {/* Mobile-only: show images below header */}
      <div className="zn-exercise__narrow">
        <ExerciseImage
          imageSlug={exercise?.imageSlug}
          exerciseName={name}
          size="sm"
        />
      </div>

      {/* Notes */}
      {block.notes && (
        <p className="zn-exercise__note">
          {pickLang(block, "notes") || block.notes}
        </p>
      )}

      {/* Expandable form cues */}
      {formCues.length > 0 && (
        <div>
          <button
            type="button"
            onClick={toggleFormCues}
            className="zn-exercise__toggle"
          >
            {showFormCues ? (
              <ChevronUp size={13} />
            ) : (
              <ChevronDown size={13} />
            )}
            {t("detail.formCues")}
          </button>
          {showFormCues && (
            <ul className="zn-exercise__cues">
              {formCues.map((cue, i) => (
                <li key={i}>{cue}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
