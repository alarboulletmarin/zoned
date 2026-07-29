/**
 * Accessors for the workout union (`AnyWorkoutTemplate`).
 *
 * Running and strength templates name their phases differently: running uses
 * `warmupTemplate` / `mainSetTemplate` / `cooldownTemplate` holding
 * `WorkoutBlock`s (zone + duration), strength uses
 * `warmupBlocks` / `mainBlocks` / `cooldownBlocks` holding `StrengthBlock`s
 * (exercise + sets + reps). The names stay different on purpose: the block
 * shapes are not interchangeable, so identical field names would advertise a
 * substitutability that does not exist. See the note on `AnyWorkoutTemplate`
 * in `@/types`.
 *
 * `getWorkoutPhaseBlocks` lives here because it is the one accessor that has to
 * know both namings; `export/planPdf.ts` walks a whole workout through it
 * rather than casting. The guards are re-exported alongside it so such a caller
 * needs a single import, but `@/types` remains their home and most consumers
 * import them from there; this module is a convenience, not a chokepoint.
 */

import type {
  AnyWorkoutTemplate,
  WorkoutBlock,
  WorkoutPhaseKey,
  WorkoutTemplate,
} from "@/types";
import { isRunningWorkout, isStrengthWorkout } from "@/types";
import type { StrengthBlock, StrengthWorkoutTemplate } from "@/types/strength";

// Re-exported so callers never need "@/types" as well just to narrow a
// workout. `WorkoutPhaseKey` is the phase vocabulary shared with
// `workoutStructure.ts` and `StrengthExerciseList`. Do not declare a twin.
export { isRunningWorkout, isStrengthWorkout };
export type { WorkoutPhaseKey };

/** Phases in rendering order. Use it to walk a whole workout. */
export const WORKOUT_PHASES: readonly WorkoutPhaseKey[] = ["warmup", "main", "cooldown"];

const RUNNING_PHASE_FIELD = {
  warmup: "warmupTemplate",
  main: "mainSetTemplate",
  cooldown: "cooldownTemplate",
} as const satisfies Record<WorkoutPhaseKey, keyof WorkoutTemplate>;

const STRENGTH_PHASE_FIELD = {
  warmup: "warmupBlocks",
  main: "mainBlocks",
  cooldown: "cooldownBlocks",
} as const satisfies Record<WorkoutPhaseKey, keyof StrengthWorkoutTemplate>;

/**
 * Blocks of one phase.
 *
 * Overloaded so a caller that has already narrowed gets the concrete block
 * type back (`getWorkoutPhaseBlocks(runningTemplate, "main")` is
 * `WorkoutBlock[]`, no cast), while a caller holding the raw union gets the
 * union of arrays and must narrow before touching a block, which is the point.
 *
 * Returns `[]` when the phase is absent: catalogue entries may ship without a
 * warmup or a cooldown.
 */
export function getWorkoutPhaseBlocks(w: WorkoutTemplate, phase: WorkoutPhaseKey): WorkoutBlock[];
export function getWorkoutPhaseBlocks(w: StrengthWorkoutTemplate, phase: WorkoutPhaseKey): StrengthBlock[];
export function getWorkoutPhaseBlocks(
  w: AnyWorkoutTemplate,
  phase: WorkoutPhaseKey,
): WorkoutBlock[] | StrengthBlock[];
export function getWorkoutPhaseBlocks(
  w: AnyWorkoutTemplate,
  phase: WorkoutPhaseKey,
): WorkoutBlock[] | StrengthBlock[] {
  return isStrengthWorkout(w)
    ? w[STRENGTH_PHASE_FIELD[phase]] ?? []
    : w[RUNNING_PHASE_FIELD[phase]] ?? [];
}
