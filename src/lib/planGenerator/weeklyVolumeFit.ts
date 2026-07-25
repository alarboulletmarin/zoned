/**
 * Weekly Volume Fit — align the sessions actually built with the volume model
 *
 * The volume model (volume.ts) plans a weekly km progression, but sessions come
 * from a fixed workout catalogue whose durations have nothing to do with it.
 * Without this step the delivered plan drifts from the model by 2x to 4x, the
 * progression stops being monotonic, and purpose multipliers (beginner start,
 * return from injury) have no effect on what the runner actually runs.
 *
 * Long runs and key sessions are structural and left untouched. The easy and
 * recovery runs absorb the difference, which is what a coach adjusts in practice.
 */

import type { PlanSession } from "@/types/plan";

/** An easy run below this is not worth scheduling */
const MIN_EASY_KM = 3;
/** Absolute ceiling for a single easy run, overridden for high-volume weeks */
const MIN_MAX_EASY_KM = 18;
/**
 * How far a session may be stretched past its own reference duration.
 * Without it, absorbing a 70km week into three easy runs turned a 20-minute
 * "Double récup (matin)" into a 142-minute outing — the volume matched the
 * model, but the session no longer resembled the one that was prescribed.
 */
const MAX_STRETCH = 1.3;
const MAX_SHRINK = 0.7;

/** Reference duration bounds per workout id, used to keep sessions recognisable */
export type DurationBounds = (workoutId: string) => { min: number; max: number } | undefined;

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function roundHalf(km: number): number {
  return Math.round(km * 2) / 2;
}

/**
 * Stretch or shrink the easy/recovery runs of a week so its total distance
 * lands on targetKm. Mutates the sessions in place.
 *
 * @param sessions - the week's sessions, already built
 * @param targetKm - weekly km from the volume model
 * @param easyPaceMinKm - average easy pace, used to restate durations
 * @param bounds - optional per-workout reference durations, keeps sessions recognisable
 */
export function fitWeeklyVolume(
  sessions: PlanSession[],
  targetKm: number,
  easyPaceMinKm: number,
  bounds?: DurationBounds,
): void {
  if (targetKm <= 0 || easyPaceMinKm <= 0) return;

  const adjustable = sessions.filter(
    (s) =>
      !s.isKeySession &&
      s.sessionType !== "long_run" &&
      !s.workoutId.startsWith("__") &&
      (s.targetDistanceKm ?? 0) > 0,
  );
  if (adjustable.length === 0) return;

  const adjustableSet = new Set(adjustable);
  const fixedKm = sessions
    .filter((s) => !adjustableSet.has(s))
    .reduce((sum, s) => sum + (s.targetDistanceKm ?? 0), 0);
  const adjustableKm = adjustable.reduce((sum, s) => sum + (s.targetDistanceKm ?? 0), 0);
  if (adjustableKm <= 0) return;

  // A single easy run should never carry a quarter of a big week on its own
  const maxEasyKm = Math.max(MIN_MAX_EASY_KM, targetKm * 0.25);

  // Per-session km window: a session stays within reach of its own reference
  // duration, so the week's volume never rewrites what the session is.
  const windowOf = (s: PlanSession): { lo: number; hi: number } => {
    const ref = bounds?.(s.workoutId);
    if (!ref) return { lo: MIN_EASY_KM, hi: maxEasyKm };
    const lo = Math.max(MIN_EASY_KM, (ref.min * MAX_SHRINK) / easyPaceMinKm);
    const hi = Math.min(maxEasyKm, (ref.max * MAX_STRETCH) / easyPaceMinKm);
    return lo <= hi ? { lo, hi } : { lo: hi, hi: lo };
  };

  // What the easy runs need to cover for the week to hit its target
  const desiredAdjustableKm = targetKm - fixedKm;
  const scale = desiredAdjustableKm / adjustableKm;

  const assigned = new Map<PlanSession, number>();
  for (const s of adjustable) {
    const { lo, hi } = windowOf(s);
    assigned.set(s, clamp((s.targetDistanceKm ?? 0) * scale, lo, hi));
  }

  // Second pass: redistribute what clamping left over onto the sessions that
  // still have room, so weeks at the extremes still converge.
  const totalAssigned = [...assigned.values()].reduce((a, b) => a + b, 0);
  let residual = desiredAdjustableKm - totalAssigned;
  if (Math.abs(residual) > 0.5) {
    const room = adjustable.filter((s) => {
      const km = assigned.get(s) ?? 0;
      const { lo, hi } = windowOf(s);
      return residual > 0 ? km < hi : km > lo;
    });
    for (const s of room) {
      const km = assigned.get(s) ?? 0;
      const { lo, hi } = windowOf(s);
      const share = residual / room.length;
      const next = clamp(km + share, lo, hi);
      residual -= next - km;
      assigned.set(s, next);
    }
  }

  for (const s of adjustable) {
    const km = roundHalf(assigned.get(s) ?? 0);
    const previousKm = s.targetDistanceKm ?? 0;
    const durationMin = Math.max(20, Math.round(km * easyPaceMinKm));

    s.targetDistanceKm = km;
    s.estimatedDurationMin = durationMin;
    s.targetDurationMin = durationMin;
    // Load scales with duration at unchanged intensity
    if (s.loadScore && previousKm > 0) {
      s.loadScore = Math.round((s.loadScore * (km / previousKm)) * 10) / 10;
    }
  }

  // Third pass: the easy runs alone cannot always close the gap once their own
  // duration windows bind. Nudge the key sessions within a narrow band so the
  // week still lands near target — a week that overshoots by 30% reads as a
  // volume spike to the runner and to the audit.
  const fittedKm = sessions.reduce((sum, s) => sum + (s.targetDistanceKm ?? 0), 0);
  const finalResidual = targetKm - fittedKm;
  if (Math.abs(finalResidual) > targetKm * 0.08) {
    nudgeKeySessions(sessions, finalResidual);
  }
}

/** Widest deviation allowed on a key session — beyond this the workout changes nature */
const KEY_SESSION_BAND = 0.2;

/**
 * Spread a leftover distance over the week's key sessions, capped at
 * KEY_SESSION_BAND of each one. The long run and race markers stay untouched.
 */
function nudgeKeySessions(sessions: PlanSession[], residualKm: number): void {
  const keys = sessions.filter(
    (s) => s.isKeySession && !s.workoutId.startsWith("__") && (s.targetDistanceKm ?? 0) > 0,
  );
  if (keys.length === 0) return;

  let remaining = residualKm;
  for (const s of keys) {
    const km = s.targetDistanceKm ?? 0;
    const share = remaining / keys.length;
    const next = clamp(km + share, km * (1 - KEY_SESSION_BAND), km * (1 + KEY_SESSION_BAND));
    const applied = roundHalf(next);
    remaining -= applied - km;

    const ratio = km > 0 ? applied / km : 1;
    s.targetDistanceKm = applied;
    // Key sessions are not run at easy pace, so scale their duration by the
    // same ratio instead of restating it from the easy pace.
    s.estimatedDurationMin = Math.max(20, Math.round(s.estimatedDurationMin * ratio));
    s.targetDurationMin = Math.max(20, Math.round((s.targetDurationMin ?? s.estimatedDurationMin) * ratio));
    if (s.loadScore) s.loadScore = Math.round(s.loadScore * ratio * 10) / 10;
  }
}
