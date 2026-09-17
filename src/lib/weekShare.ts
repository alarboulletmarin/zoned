/**
 * Share a standalone week ("Ma semaine") as a URL, no backend involved.
 *
 * The week is serialized to a compact JSON payload and base64url-encoded. To
 * keep the link short, sessions are fixed-position tuples (no repeated JSON
 * keys) and the session type is an index into SESSION_TYPE_CODES. The
 * recipient opens /weeks/shared?d=…, sees a preview rendered from their own
 * workout catalog, and can add the week to their saved weeks. Sessions
 * reference catalog workout ids, so custom workouts the recipient doesn't
 * have are surfaced and skipped on import.
 */

import type { CrossTrainingIntensity, PlanSession, TrainingPlan, WeekCategory } from "@/types/plan";
import { WEEK_CATEGORIES } from "@/types/plan";
import { ACTIVITY_INTENSITIES, isActivitySession } from "@/lib/activitySession";
import { createEmptyWeekPlan } from "@/lib/weekToPlan";
import { decodePayload, encodePayload, shareUrl } from "@/lib/share/codec";
import { SESSION_TYPE_CODES } from "@/lib/share/codes";

/**
 * One shared session, a fixed-position tuple:
 *
 *   [day 0-6, workoutId, type code, minutes, key?, intensity?, precision?, tenths of km?]
 *
 * Positions after the fourth are optional and APPEND ONLY: a link decodes the
 * positions it has and treats the rest as absent, so links sent before a
 * position existed keep decoding. When a later position is written, every
 * earlier one is written too, with its "absent" value: key 0, intensity -1,
 * precision 0 (fixed). The positions:
 *
 * - intensity: an index into ACTIVITY_INTENSITIES, for an activity session;
 * - precision: 1 for a loose session, 0 for a fixed one;
 * - km: the target distance in tenths of a kilometre, a fixed session's.
 */
type SharedSessionTuple = [number, string, number, number, ...number[]];

export interface SharedWeekPayload {
  v: 1;
  /** Week name, as shared (single string, user weeks are single-language). */
  n: string;
  c?: WeekCategory;
  s: SharedSessionTuple[];
}

export function encodeSharedWeek(plan: TrainingPlan, name: string): string {
  const payload: SharedWeekPayload = {
    v: 1,
    n: name,
    ...(plan.config.weekCategory && { c: plan.config.weekCategory }),
    s: (plan.weeks[0]?.sessions ?? []).map((session): SharedSessionTuple => {
      const typeCode = Math.max(0, SESSION_TYPE_CODES.indexOf(session.sessionType));
      const base: SharedSessionTuple = [
        session.dayOfWeek,
        session.workoutId,
        typeCode,
        session.estimatedDurationMin,
      ];
      const intensityCode = session.intensity
        ? ACTIVITY_INTENSITIES.indexOf(session.intensity)
        : -1;
      const precisionCode = session.precision === "loose" ? 1 : 0;
      const tenths =
        session.targetDistanceKm && session.targetDistanceKm > 0
          ? Math.round(session.targetDistanceKm * 10)
          : 0;
      const tail = [session.isKeySession ? 1 : 0, intensityCode, precisionCode, tenths];
      const absent = [0, -1, 0, 0];
      // Drop the trailing "absent" positions, and nothing before them.
      let keep = tail.length;
      while (keep > 0 && tail[keep - 1] === absent[keep - 1]) keep--;
      return [...base, ...tail.slice(0, keep)] as SharedSessionTuple;
    }),
  };
  return encodePayload(payload);
}

export function sharedWeekUrl(plan: TrainingPlan, name: string): string {
  return shareUrl("/weeks/shared", encodeSharedWeek(plan, name));
}

export function decodeSharedWeek(encoded: string): SharedWeekPayload | null {
  const obj = decodePayload(encoded);
  if (!obj) return null;
  if (obj.v !== 1) return null;
  if (typeof obj.n !== "string" || obj.n.trim().length === 0) return null;
  if (!Array.isArray(obj.s)) return null;

  const sessions: SharedSessionTuple[] = [];
  for (const item of obj.s) {
    if (!Array.isArray(item)) return null;
    const [d, w, t, m, k, i, p, km] = item as unknown[];
    if (typeof d !== "number" || d < 0 || d > 6) return null;
    if (typeof w !== "string" || w.length === 0) return null;
    if (typeof t !== "number" || !SESSION_TYPE_CODES[t]) return null;
    if (typeof m !== "number" || !Number.isFinite(m) || m < 0) return null;
    // The optional positions are read leniently: a value that is not one of
    // the known codes counts as absent rather than sinking the whole link.
    const key = k === 1 ? 1 : 0;
    const intensity = typeof i === "number" && ACTIVITY_INTENSITIES[i] ? i : -1;
    const precision = p === 1 ? 1 : 0;
    const tenths =
      typeof km === "number" && Number.isFinite(km) && km > 0 ? Math.round(km) : 0;
    const tail = [key, intensity, precision, tenths];
    const absent = [0, -1, 0, 0];
    let keep = tail.length;
    while (keep > 0 && tail[keep - 1] === absent[keep - 1]) keep--;
    sessions.push([d, w, t, m, ...tail.slice(0, keep)]);
  }
  if (sessions.length === 0) return null;

  return {
    v: 1,
    n: obj.n,
    ...(WEEK_CATEGORIES.includes(obj.c as WeekCategory) && { c: obj.c as WeekCategory }),
    s: sessions,
  };
}

/** Payload sessions → plan sessions, Mon→Sun (no filtering, caller decides). */
export function sharedWeekSessions(payload: SharedWeekPayload): PlanSession[] {
  return payload.s
    .map(([d, w, t, m, k, i, p, km]): PlanSession => {
      const intensity: CrossTrainingIntensity | undefined =
        typeof i === "number" && i >= 0 ? ACTIVITY_INTENSITIES[i] : undefined;
      return {
        dayOfWeek: d,
        workoutId: w,
        sessionType: SESSION_TYPE_CODES[t],
        isKeySession: k === 1,
        estimatedDurationMin: m,
        ...(intensity && { intensity }),
        ...(p === 1 && { precision: "loose" as const }),
        ...(typeof km === "number" && km > 0 && { targetDistanceKm: km / 10 }),
      };
    })
    .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}

/** A shared session the recipient can hold: a catalog workout they have, or an activity. */
export function isSharedSessionKnown(workoutId: string, knownWorkoutIds: Set<string>): boolean {
  return isActivitySession(workoutId) || knownWorkoutIds.has(workoutId);
}

/**
 * Build a saveable week from a shared payload, keeping only sessions whose
 * workout exists in the recipient's catalog. Activities (`__activity_*`) have
 * no catalog entry to check and always travel: a bike commute is nobody's
 * custom workout.
 */
export function sharedWeekToPlan(
  payload: SharedWeekPayload,
  knownWorkoutIds: Set<string>,
): TrainingPlan {
  const plan = createEmptyWeekPlan(payload.n);
  if (payload.c) plan.config.weekCategory = payload.c;
  plan.weeks[0].sessions = sharedWeekSessions(payload).filter((s) =>
    isSharedSessionKnown(s.workoutId, knownWorkoutIds),
  );
  plan.config.daysPerWeek = Math.max(3, Math.min(7, plan.weeks[0].sessions.length));
  return plan;
}
