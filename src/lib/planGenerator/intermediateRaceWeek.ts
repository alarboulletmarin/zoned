/**
 * Intermediate Race Week — Overlay module for intermediate race goals
 *
 * Applies volume adjustments, session modifications, and metadata
 * to weeks that contain intermediate race events.
 *
 * The overlay model mutates weeks in place after the main generation loop,
 * similar to how strengthIntegration.ts works.
 *
 * Priority levels:
 *   A: Real race — mini-taper (pre-race week), race week, recovery (post-race)
 *   B: Preparation race — moderate lightening, no break in progression
 *   C: Tune-up — minimal disruption, race replaces a quality session
 *
 * Post-race coaching (P6-P10):
 *   After long races (>= semi / 21.1km), the overlay enforces:
 *   - S+1: recovery week, key sessions converted to easy endurance, long run capped at 60%
 *   - S+2: 90% volume, long run capped at 80% (gradual return)
 *   - Volume spike smoothing: max 15% increase week-to-week after race adjustments
 */

import type { IntermediateGoal, PlanWeek, PlanSession, AssistedPlanConfig, RacePriority } from "@/types/plan";
import { RACE_DISTANCE_META } from "@/types/plan";
import type { WorkoutTemplate } from "@/types";
import { INTERMEDIATE_RACE_VOLUME, OPENER_DAYS_BEFORE_RACE } from "./constants";
import { sortIntermediateGoals, intermediateGoalToWeekNumber } from "@/lib/intermediateGoalValidation";

// ── Effective priority ────────────────────────────────────────────

/**
 * Compute effective priority: a long-distance race should never be treated
 * as a low-priority event. The user's chosen priority is a FLOOR for short races,
 * but distance can UPGRADE it.
 *
 * Rules:
 * - distance >= 21.1km (semi+): effective priority = always A
 * - distance >= 10km: effective priority = at least B
 * - distance < 10km: use user's chosen priority as-is
 */
export function computeEffectivePriority(goal: IntermediateGoal): RacePriority {
  const distanceKm = RACE_DISTANCE_META[goal.raceDistance]?.distanceKm ?? 10;
  if (distanceKm >= 21.1) return "A";
  if (distanceKm >= 10) {
    return goal.priority === "C" ? "B" : goal.priority;
  }
  return goal.priority;
}

// ── Main orchestrator ─────────────────────────────────────────────

/**
 * Apply intermediate race modifications to generated weeks (overlay model).
 * Mutates `weeks` in place.
 */
export function applyIntermediateRaces(
  weeks: PlanWeek[],
  config: AssistedPlanConfig,
  allWorkouts: WorkoutTemplate[],
): void {
  const goals = sortIntermediateGoals(config.intermediateGoals ?? []);
  if (goals.length === 0) return;

  const planStartDate = config.startDate ?? config.createdAt;
  const adjustedWeeks = new Set<number>();

  for (const goal of goals) {
    const weekNumber = intermediateGoalToWeekNumber(goal.raceDate, planStartDate);
    const weekIdx = weeks.findIndex(w => w.weekNumber === weekNumber);
    if (weekIdx < 0) continue; // Week not found (goal outside plan range)

    const effectivePriority = computeEffectivePriority(goal);
    const goalDistanceKm = RACE_DISTANCE_META[goal.raceDistance]?.distanceKm ?? 10;

    // Pre-race adjustment (priority A and B only)
    if (
      (effectivePriority === "A" || effectivePriority === "B") &&
      weekIdx > 0 &&
      !adjustedWeeks.has(weeks[weekIdx - 1].weekNumber)
    ) {
      applyPreRaceAdjustment(weeks, weekIdx - 1, effectivePriority, adjustedWeeks, goalDistanceKm);
    }

    // Race week
    applyIntermediateRaceToWeek(weeks[weekIdx], goal, effectivePriority, allWorkouts, config.runnerLevel);
    adjustedWeeks.add(weeks[weekIdx].weekNumber);

    // Post-race adjustment (priority A and B only)
    if (
      (effectivePriority === "A" || effectivePriority === "B") &&
      weekIdx < weeks.length - 1
    ) {
      const nextWeekNumber = weeks[weekIdx + 1].weekNumber;
      if (adjustedWeeks.has(nextWeekNumber)) {
        // Overlap case: take the minimum volumePercent
        const volumeConfig = INTERMEDIATE_RACE_VOLUME[effectivePriority];
        const wouldApply = Math.round(weeks[weekIdx + 1].volumePercent * volumeConfig.postRaceWeekPct);
        weeks[weekIdx + 1].volumePercent = Math.min(weeks[weekIdx + 1].volumePercent, wouldApply);
        if (weeks[weekIdx + 1].targetKm) {
          weeks[weekIdx + 1].targetKm = Math.round(
            weeks[weekIdx + 1].targetKm! * volumeConfig.postRaceWeekPct,
          );
        }
      } else {
        applyPostRaceAdjustment(weeks, weekIdx + 1, effectivePriority, adjustedWeeks, goalDistanceKm);
      }
    }

    // S+2 adjustment for long races (>= semi): gradual return, not instant full volume
    if (goalDistanceKm >= 21.1 && weekIdx + 2 < weeks.length) {
      const s2Idx = weekIdx + 2;
      const s2Week = weeks[s2Idx];
      if (!adjustedWeeks.has(s2Week.weekNumber)) {
        if (s2Week._originalVolumePercent === undefined) {
          s2Week._originalVolumePercent = s2Week.volumePercent;
          s2Week._originalTargetKm = s2Week.targetKm;
        }
        // S+2: 90% volume, long run capped at 80%
        s2Week.volumePercent = Math.round(s2Week.volumePercent * 0.90);
        if (s2Week.targetKm) {
          s2Week.targetKm = Math.round(s2Week.targetKm * 0.90);
        }
        if (s2Week.targetLongRunKm) {
          s2Week.targetLongRunKm = Math.round(s2Week.targetLongRunKm * 0.80);
        }
        adjustedWeeks.add(s2Week.weekNumber);
      }
    }
  }

  // Final pass: smooth volume spikes after intermediate race adjustments.
  // Only targets the transition from adjusted block back to unadjusted weeks
  // (prevents 35%+ jumps from post-race recovery back to full volume).
  // Does NOT override intentional overlay decisions between two adjusted weeks.
  for (let i = 1; i < weeks.length; i++) {
    const prev = weeks[i - 1];
    const curr = weeks[i];
    // Skip if current week is itself an intermediate race or taper
    if (curr.intermediateRace || curr.phase === "taper") continue;
    // Only smooth the edge: previous week was adjusted, current week was NOT
    // (both adjusted = intentional overlay transition, don't override)
    if (!adjustedWeeks.has(prev.weekNumber) || adjustedWeeks.has(curr.weekNumber)) continue;

    // Max 15% volume increase week-to-week after race adjustments
    const maxVolume = Math.round(prev.volumePercent * 1.15);
    if (curr.volumePercent > maxVolume) {
      if (curr._originalVolumePercent === undefined) {
        curr._originalVolumePercent = curr.volumePercent;
        curr._originalTargetKm = curr.targetKm;
      }
      curr.volumePercent = maxVolume;
      if (curr.targetKm && curr._originalTargetKm) {
        const ratio = maxVolume / curr._originalVolumePercent;
        curr.targetKm = Math.round(curr._originalTargetKm * ratio);
      }
    }
  }
}

// ── Race week application ─────────────────────────────────────────

function applyIntermediateRaceToWeek(
  week: PlanWeek,
  goal: IntermediateGoal,
  effectivePriority: RacePriority,
  allWorkouts: WorkoutTemplate[],
  runnerLevel?: string,
): void {
  // 1. Determine race day from the actual race date (0=Mon...6=Sun)
  const raceDateObj = new Date(goal.raceDate + "T12:00:00"); // noon to avoid TZ edge cases
  const jsDay = raceDateObj.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const raceDay = jsDay === 0 ? 6 : jsDay - 1; // Convert to 0=Mon...6=Sun

  // 1b. Compute distance-based flags for session removal decisions
  const goalDistanceKm = RACE_DISTANCE_META[goal.raceDistance]?.distanceKm ?? 10;
  const isLongRace = goalDistanceKm >= 21.1;

  // 1c. Estimate race duration from distance + pace + runner level
  const estimatedDuration = estimateRaceDurationMin(goal, goalDistanceKm, runnerLevel);

  // 2. Create intermediate race session
  const raceSession: PlanSession = {
    dayOfWeek: raceDay,
    workoutId: "__intermediate_race__",
    sessionType: "race_specific",
    isKeySession: true,
    estimatedDurationMin: estimatedDuration,
    targetDistanceKm: goalDistanceKm,
    notes: `Course interm\u00e9diaire \u2014 ${goal.raceName || goal.raceDistance}`,
    notesEn: `Intermediate race \u2014 ${goal.raceName || goal.raceDistance}`,
  };

  // 3. Remove conflicting sessions
  if (effectivePriority === "A" || isLongRace) {
    // Aggressive removal: long race or A-priority — remove long run, race-day session, all key sessions
    week.sessions = week.sessions.filter(s => {
      if (s.sessionType === "long_run") return false;
      if (s.dayOfWeek === raceDay) return false;
      return true;
    });
    // Remove one remaining key session (keep easy/recovery that are 3+ days from race)
    const keyIdx = week.sessions.findIndex(s => s.isKeySession);
    if (keyIdx >= 0) {
      week.sessions.splice(keyIdx, 1);
    }
    // Keep easy/recovery sessions only if 3+ days from race day
    week.sessions = week.sessions.filter(s => {
      const dist = Math.min(
        Math.abs(s.dayOfWeek - raceDay),
        7 - Math.abs(s.dayOfWeek - raceDay),
      );
      return dist >= 3 || (!s.isKeySession && s.sessionType === "recovery");
    });
  } else if (effectivePriority === "B") {
    // Moderate removal: remove long run and race-day session
    week.sessions = week.sessions.filter(s => {
      if (s.sessionType === "long_run") return false;
      if (s.dayOfWeek === raceDay) return false;
      return true;
    });
    // Keep key sessions that are 3+ days before race
    week.sessions = week.sessions.filter(s => {
      if (!s.isKeySession) return true;
      const daysBefore = (raceDay - s.dayOfWeek + 7) % 7;
      return daysBefore >= 3;
    });
  } else {
    // Priority C: remove only the session on raceDay, or one key session if nothing on raceDay
    const onRaceDay = week.sessions.findIndex(s => s.dayOfWeek === raceDay);
    if (onRaceDay >= 0) {
      week.sessions.splice(onRaceDay, 1);
    } else {
      // No session on raceDay — remove one key session
      const keyIdx = week.sessions.findIndex(s => s.isKeySession);
      if (keyIdx >= 0) {
        week.sessions.splice(keyIdx, 1);
      }
    }
  }

  // 3b. Clear long run target when long run was removed from this week
  const hasLongRun = week.sessions.some(s => s.sessionType === "long_run");
  if (!hasLongRun) {
    week.targetLongRunKm = 0;
  }

  // 4. Add the race session
  week.sessions.push(raceSession);

  // 5. Add opener session for priority A, or B with long race distance
  if (effectivePriority === "A" || (effectivePriority === "B" && isLongRace)) {
    const openerDay = (raceDay - OPENER_DAYS_BEFORE_RACE + 7) % 7;
    const hasSessionOnOpenerDay = week.sessions.some(s => s.dayOfWeek === openerDay);

    if (!hasSessionOnOpenerDay) {
      const openerWorkout = findOpenerWorkout(allWorkouts);
      if (openerWorkout) {
        week.sessions.push({
          dayOfWeek: openerDay,
          workoutId: openerWorkout.id,
          sessionType: "recovery",
          isKeySession: false,
          estimatedDurationMin: 25,
          notes: "Activation pr\u00e9-course : footing l\u00e9ger + quelques acc\u00e9l\u00e9rations",
          notesEn: "Pre-race activation: easy jog + a few strides",
        });
      }
    }
  }

  // 6. Apply volume adjustments (using effective priority for volume config)
  // targetKm covers training sessions only — race distance is added on top
  const volumeConfig = INTERMEDIATE_RACE_VOLUME[effectivePriority];
  week.volumePercent = Math.round(week.volumePercent * volumeConfig.raceWeekPct);
  if (week.targetKm) {
    week.targetKm = Math.round(week.targetKm * volumeConfig.raceWeekPct) + goalDistanceKm;
  }

  // 7. Set metadata (preserve user's declared priority, not effective)
  week.intermediateRace = goal;
  const label = goal.raceName || goal.raceDistance;
  week.weekLabel = `Course interm\u00e9diaire \u2014 ${label}`;
  week.weekLabelEn = `Intermediate race \u2014 ${label}`;

  // 8. Sort sessions by dayOfWeek
  week.sessions.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}

// ── Pre/post race adjustments ─────────────────────────────────────

function applyPreRaceAdjustment(
  weeks: PlanWeek[],
  weekIdx: number,
  priority: RacePriority,
  adjustedWeeks: Set<number>,
  goalDistanceKm: number,
): void {
  const week = weeks[weekIdx];
  const volumeConfig = INTERMEDIATE_RACE_VOLUME[priority];

  // Save originals for adaptation tracking
  if (week._originalVolumePercent === undefined) {
    week._originalVolumePercent = week.volumePercent;
    week._originalTargetKm = week.targetKm;
  }

  week.volumePercent = Math.round(week.volumePercent * volumeConfig.preRaceWeekPct);
  if (week.targetKm) {
    week.targetKm = Math.round(week.targetKm * volumeConfig.preRaceWeekPct);
  }

  // Cap long run: more aggressively for long races
  if (week.targetLongRunKm) {
    if (goalDistanceKm >= 21.1) {
      week.targetLongRunKm = Math.round(week.targetLongRunKm * 0.6);
    } else if (priority === "A") {
      week.targetLongRunKm = Math.round(week.targetLongRunKm * 0.7);
    }
  }

  // For long races (>= semi), convert key sessions to easy endurance in pre-race week too
  if (goalDistanceKm >= 21.1) {
    week.sessions = week.sessions.map(s => {
      if (s.isKeySession) {
        return {
          ...s,
          isKeySession: false,
          sessionType: "endurance" as const,
          estimatedDurationMin: Math.min(45, Math.round(s.estimatedDurationMin * 0.7)),
        };
      }
      return s;
    });
  }

  adjustedWeeks.add(week.weekNumber);
}

function applyPostRaceAdjustment(
  weeks: PlanWeek[],
  weekIdx: number,
  priority: RacePriority,
  adjustedWeeks: Set<number>,
  goalDistanceKm: number,
): void {
  const week = weeks[weekIdx];
  const volumeConfig = INTERMEDIATE_RACE_VOLUME[priority];

  if (week._originalVolumePercent === undefined) {
    week._originalVolumePercent = week.volumePercent;
    week._originalTargetKm = week.targetKm;
    week._originalIsRecovery = week.isRecoveryWeek;
  }

  // For priority A, convert to recovery week
  if (priority === "A") {
    week.isRecoveryWeek = true;
  }

  week.volumePercent = Math.round(week.volumePercent * volumeConfig.postRaceWeekPct);
  if (week.targetKm) {
    week.targetKm = Math.round(week.targetKm * volumeConfig.postRaceWeekPct);
  }

  // Cap long run based on intermediate race distance
  if (week.targetLongRunKm) {
    if (goalDistanceKm >= 21.1) {
      // After semi+: cap long run at 60% of target
      week.targetLongRunKm = Math.round(week.targetLongRunKm * 0.6);
    } else if (goalDistanceKm >= 10) {
      // After 10K+: cap long run at 80% of target
      week.targetLongRunKm = Math.round(week.targetLongRunKm * 0.8);
    }
  }

  // After long races (>= semi), convert key sessions to easy endurance
  if (goalDistanceKm >= 21.1) {
    week.sessions = week.sessions.map(s => {
      if (s.isKeySession) {
        return {
          ...s,
          isKeySession: false,
          sessionType: "endurance" as const,
          // Reduce duration to ~70% and cap at 45min
          estimatedDurationMin: Math.min(45, Math.round(s.estimatedDurationMin * 0.7)),
        };
      }
      return s;
    });
    // Force recovery week for long races regardless of priority
    week.isRecoveryWeek = true;
  }

  adjustedWeeks.add(week.weekNumber);
}

// ── Helpers ───────────────────────────────────────────────────────

/**
 * Estimate race duration from distance, race type, and runner level.
 * Uses target pace if provided, otherwise estimates from runner level
 * with a trail penalty for off-road distances.
 */
function estimateRaceDurationMin(
  goal: IntermediateGoal,
  distanceKm: number,
  runnerLevel?: string,
): number {
  // If user specified a target pace, use it directly
  if (goal.targetPaceMinKm && goal.targetPaceMinKm > 0) {
    return Math.round(distanceKm * goal.targetPaceMinKm);
  }

  // Estimate pace from runner level (min/km, road)
  const basePace: Record<string, number> = {
    beginner: 6.5,
    intermediate: 5.5,
    advanced: 4.75,
    elite: 4.0,
  };
  let pace = basePace[runnerLevel ?? "intermediate"] ?? 5.5;

  // Trail penalty: off-road races are slower due to terrain + elevation
  const isTrail = ["trail_short", "trail", "ultra"].includes(goal.raceDistance);
  if (isTrail) pace *= 1.25;

  return Math.round(distanceKm * pace);
}

function findOpenerWorkout(workouts: WorkoutTemplate[]): WorkoutTemplate | undefined {
  // Look for opener/shakeout tagged workouts
  const openers = workouts.filter(
    w => w.selectionCriteria.tags.some(t => ["opener", "shakeout", "race-prep"].includes(t)),
  );
  if (openers.length > 0) return openers[0];

  // Fallback: any light recovery workout
  return workouts.find(
    w => w.category === "recovery" &&
    w.selectionCriteria.relativeLoad === "light",
  );
}
