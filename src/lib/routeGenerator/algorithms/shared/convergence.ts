/**
 * Iterative correction loop shared by the loop and out-and-back
 * algorithms. Both used to carry their own copy of the same code:
 *
 *     while (attempts < MAX) {
 *       const trace = await routeOnce(state);
 *       const ratio = trace.distanceM / targetM;
 *       if (Math.abs(ratio - 1) <= TOLERANCE) break;
 *       state = refine(state, ratio);
 *       attempts += 1;
 *     }
 *
 * Centralizing it here means a tweak to the damping factor or the
 * tolerance only has to land in one place, and the magic constants
 * live next to the function that uses them.
 */

import type { BrouterTraceResult } from "../../routing";
import { DISTANCE_TOLERANCE, MAX_ADJUSTMENT_ATTEMPTS } from "../../constants";

/**
 * Damping factor applied to the ratio-based correction. A value of 1
 * would over-shoot (Brouter never returns exactly the requested length
 * because route geometry varies non-linearly with waypoint distance),
 * 0.7 was tuned empirically to converge in 1-2 passes for urban routes
 * and 3-4 in rural areas. Lower => more passes but more stable, higher
 * => fewer passes but oscillation risk near tolerance boundaries.
 */
export const CORRECTION_DAMPING = 0.7;

/**
 * Compute the next correction multiplier for a routed trace that came
 * back at `ratio = trace.distanceM / targetM`. A perfect trace has
 * `ratio = 1` (correction = 1, no change). A trace 20% too long has
 * `ratio = 1.2`, meaning the user state should be shrunk by ~14%
 * (`1 + (1/1.2 - 1) × 0.7 ≈ 0.88`).
 */
export function dampedRatioCorrection(
  ratio: number,
  damping: number = CORRECTION_DAMPING,
): number {
  return 1 + (1 / ratio - 1) * damping;
}

export interface ConvergeArgs<State> {
  /** Initial state — typically the first guess of waypoints / radius. */
  initial: State;
  /** Route Brouter once for the given state and return the trace. */
  routeOnce: (state: State) => Promise<BrouterTraceResult>;
  /**
   * Compute the next state from the current one and the routed ratio.
   * Free to ignore the ratio entirely and return a different selection
   * (e.g. POI loop refines the *target radius* used for the next
   * waypoint pick).
   */
  refine: (state: State, ratio: number) => State;
  /** Target routed distance in meters. */
  targetM: number;
  /** Max number of correction passes. Defaults to {@link MAX_ADJUSTMENT_ATTEMPTS}. */
  maxAttempts?: number;
  /** Acceptable ratio band around 1. Defaults to {@link DISTANCE_TOLERANCE}. */
  tolerance?: number;
}

export interface ConvergeResult<State> {
  /** The trace from the final pass — never null when `routeOnce` resolved. */
  trace: BrouterTraceResult;
  /** Final state after refinements. */
  finalState: State;
  /** Number of refinement passes that ran (0 = first attempt was good). */
  attempts: number;
  /** True when the final ratio was within `tolerance`. */
  withinTolerance: boolean;
}

/**
 * Run the correction loop. Calls `routeOnce` up to `maxAttempts` times,
 * checking the routed distance against `targetM` after each call. The
 * loop short-circuits as soon as the ratio is within tolerance.
 *
 * If `routeOnce` throws (network error, AbortSignal), the rejection
 * propagates — the caller is responsible for fallback strategies.
 */
export async function convergeWithCorrection<State>(
  args: ConvergeArgs<State>,
): Promise<ConvergeResult<State>> {
  const {
    initial,
    routeOnce,
    refine,
    targetM,
    maxAttempts = MAX_ADJUSTMENT_ATTEMPTS,
    tolerance = DISTANCE_TOLERANCE,
  } = args;

  let state: State = initial;
  let trace: BrouterTraceResult | null = null;
  let attempts = 0;

  while (attempts < maxAttempts) {
    trace = await routeOnce(state);
    const ratio = trace.distanceM / targetM;
    if (Math.abs(ratio - 1) <= tolerance) break;
    state = refine(state, ratio);
    attempts += 1;
  }

  if (!trace) {
    throw new Error("convergeWithCorrection: routeOnce never produced a trace");
  }

  return {
    trace,
    finalState: state,
    attempts,
    withinTolerance: Math.abs(trace.distanceM / targetM - 1) <= tolerance,
  };
}
