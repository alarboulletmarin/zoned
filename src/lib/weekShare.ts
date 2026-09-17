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
 * One shared session, [day 0-6, workoutId, type code, minutes, key session?,
 * intensity code?]. The sixth slot only exists for an activity session
 * (`__activity_*`) carrying a planned effort; it is an index into
 * ACTIVITY_INTENSITIES. Links sent before it existed decode unchanged, a
 * missing slot is "absent", and the key-session slot is then written 0 so the
 * positions stay fixed.
 */
type SharedSessionTuple =
  | [number, string, number, number]
  | [number, string, number, number, 1]
  | [number, string, number, number, 0 | 1, number];

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
      if (intensityCode >= 0) {
        return [...base, session.isKeySession ? 1 : 0, intensityCode] as SharedSessionTuple;
      }
      return session.isKeySession ? [...base, 1] as SharedSessionTuple : base;
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
    const [d, w, t, m, k, i] = item as unknown[];
    if (typeof d !== "number" || d < 0 || d > 6) return null;
    if (typeof w !== "string" || w.length === 0) return null;
    if (typeof t !== "number" || !SESSION_TYPE_CODES[t]) return null;
    if (typeof m !== "number" || !Number.isFinite(m) || m < 0) return null;
    if (typeof i === "number" && ACTIVITY_INTENSITIES[i]) {
      sessions.push([d, w, t, m, k === 1 ? 1 : 0, i]);
    } else {
      sessions.push(k === 1 ? [d, w, t, m, 1] : [d, w, t, m]);
    }
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
    .map(([d, w, t, m, k, i]): PlanSession => {
      const intensity: CrossTrainingIntensity | undefined =
        typeof i === "number" ? ACTIVITY_INTENSITIES[i] : undefined;
      return {
        dayOfWeek: d,
        workoutId: w,
        sessionType: SESSION_TYPE_CODES[t],
        isKeySession: k === 1,
        estimatedDurationMin: m,
        ...(intensity && { intensity }),
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
