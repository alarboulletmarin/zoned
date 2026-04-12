/**
 * Adaptive Replanning — Adjust future weeks based on completion data
 *
 * When users mark sessions as completed/skipped with RPE feedback,
 * this module adjusts future weeks to keep the plan on track.
 *
 * Rules (evidence-based):
 * - Skipped key session → shift that workout type to next week
 * - Low RPE (<5) on hard sessions → user adapting well, slight volume increase
 * - High RPE (>8) or skipped sessions → reduce next week volume
 * - >50% of a week missed → insert recovery week
 * - Adjustments only modify FUTURE weeks, never past ones
 *
 * References:
 * - Gabbett, T. (2016). ACWR for injury prevention
 * - Foster, C. (1998). Monitoring training load with RPE
 */

import type { TrainingPlan, PlanWeek } from "@/types/plan";

// ── Types ──────────────────────────────────────────────────────

export interface AdaptationResult {
  /** Whether any changes were made */
  adapted: boolean;
  /** Human-readable summary of changes */
  changes: AdaptationChange[];
}

export interface AdaptationChange {
  weekNumber: number;
  type: "volume_reduced" | "volume_increased" | "recovery_inserted" | "session_shifted";
  description: string;
  descriptionEn: string;
}

// ── Analysis helpers ────────────────────────────────────────────

interface WeekCompletionStats {
  totalSessions: number;
  completedSessions: number;
  skippedSessions: number;
  completionRate: number;
  avgRpe: number | null;
  skippedKeyTypes: string[];
}

function analyzeWeekCompletion(week: PlanWeek): WeekCompletionStats & { allResolved: boolean } {
  const sessions = week.sessions;
  const total = sessions.length;
  if (total === 0) {
    return { totalSessions: 0, completedSessions: 0, skippedSessions: 0, completionRate: 1, avgRpe: null, skippedKeyTypes: [], allResolved: true };
  }

  let completed = 0;
  let skipped = 0;
  let unresolved = 0;
  const rpeValues: number[] = [];
  const skippedKeyTypes: string[] = [];

  for (const s of sessions) {
    if (s.status === "completed") {
      completed++;
      if (s.rpe) rpeValues.push(s.rpe);
    } else if (s.status === "modified") {
      // A modified session still counts as completed for resolution purposes,
      // but contributes to fatigue analysis via its RPE and actual load.
      completed++;
      if (s.rpe) rpeValues.push(s.rpe);
    } else if (s.status === "skipped") {
      skipped++;
      if (s.isKeySession) {
        skippedKeyTypes.push(s.sessionType);
      }
    } else {
      // "planned" or undefined — session not yet resolved by user
      unresolved++;
    }
  }

  // Only count resolved sessions for completion rate
  // Don't penalize sessions the user hasn't marked yet
  const resolved = completed + skipped;
  const completionRate = resolved > 0 ? completed / resolved : 1;

  return {
    totalSessions: total,
    completedSessions: completed,
    skippedSessions: skipped,
    completionRate,
    avgRpe: rpeValues.length > 0 ? rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length : null,
    skippedKeyTypes,
    allResolved: unresolved === 0,
  };
}

// ── Main adaptation function ────────────────────────────────────

/**
 * Analyze completed weeks and suggest adjustments for future weeks.
 *
 * Call this after the user marks sessions in a week as completed/skipped.
 * Returns the modified plan and a list of changes made.
 *
 * @param plan - The full training plan
 * @param currentWeekNumber - The week that was just completed/updated
 * @returns Adaptation result with changes
 */
export function adaptPlan(
  plan: TrainingPlan,
  currentWeekNumber: number,
): AdaptationResult {
  const changes: AdaptationChange[] = [];
  const currentWeek = plan.weeks.find(w => w.weekNumber === currentWeekNumber);
  if (!currentWeek) return { adapted: false, changes: [] };

  const stats = analyzeWeekCompletion(currentWeek);

  // Only adapt once ALL sessions in the week are resolved (completed or skipped).
  // Don't trigger on partial data — the user might still be marking sessions.
  if (!stats.allResolved) return { adapted: false, changes: [] };

  // Safety: need at least some data
  const hasData = stats.completedSessions + stats.skippedSessions > 0;
  if (!hasData) return { adapted: false, changes: [] };

  // Find future weeks (after currentWeekNumber, not recovery or taper)
  const futureWeeks = plan.weeks.filter(
    w => w.weekNumber > currentWeekNumber && w.phase !== "taper"
  );
  if (futureWeeks.length === 0) return { adapted: false, changes: [] };

  const nextWeek = futureWeeks[0];

  // Save original values before any modification (for undo/recalculation)
  if (nextWeek._originalVolumePercent === undefined) {
    nextWeek._originalVolumePercent = nextWeek.volumePercent;
    nextWeek._originalTargetKm = nextWeek.targetKm;
    nextWeek._originalIsRecovery = nextWeek.isRecoveryWeek;
  }

  // Always reset to original before applying new adaptation
  // This prevents stacking reductions on recalculation
  nextWeek.volumePercent = nextWeek._originalVolumePercent;
  nextWeek.targetKm = nextWeek._originalTargetKm;
  nextWeek.isRecoveryWeek = nextWeek._originalIsRecovery ?? false;

  // ── Rule 1: >50% sessions skipped → convert next week to recovery
  if (stats.completionRate < 0.5 && stats.totalSessions >= 2) {
    nextWeek.isRecoveryWeek = true;
    nextWeek.volumePercent = Math.round(nextWeek._originalVolumePercent * 0.65);
    if (nextWeek._originalTargetKm) {
      nextWeek.targetKm = Math.round(nextWeek._originalTargetKm * 0.65);
    }
    changes.push({
      weekNumber: nextWeek.weekNumber,
      type: "recovery_inserted",
      description: `Semaine ${nextWeek.weekNumber} convertie en récupération (trop de séances manquées)`,
      descriptionEn: `Week ${nextWeek.weekNumber} converted to recovery (too many missed sessions)`,
    });
  }

  // ── Rule 2: High RPE (>8 average) → reduce next week volume by 10%
  else if (stats.avgRpe !== null && stats.avgRpe > 8) {
    const reduction = 0.90;
    nextWeek.volumePercent = Math.round(nextWeek._originalVolumePercent * reduction);
    if (nextWeek._originalTargetKm) {
      nextWeek.targetKm = Math.round(nextWeek._originalTargetKm * reduction);
    }
    changes.push({
      weekNumber: nextWeek.weekNumber,
      type: "volume_reduced",
      description: `Volume semaine ${nextWeek.weekNumber} réduit de 10% (effort perçu élevé : RPE ${stats.avgRpe.toFixed(1)})`,
      descriptionEn: `Week ${nextWeek.weekNumber} volume reduced by 10% (high perceived effort: RPE ${stats.avgRpe.toFixed(1)})`,
    });
  }

  // ── Rule 3: Low RPE (<5 average) on completed sessions → slight increase
  else if (stats.avgRpe !== null && stats.avgRpe < 5 && stats.completionRate >= 0.8) {
    const increase = 1.05;
    nextWeek.volumePercent = Math.min(100, Math.round(nextWeek._originalVolumePercent * increase));
    if (nextWeek._originalTargetKm) {
      nextWeek.targetKm = Math.round(nextWeek._originalTargetKm * increase);
    }
    changes.push({
      weekNumber: nextWeek.weekNumber,
      type: "volume_increased",
      description: `Volume semaine ${nextWeek.weekNumber} augmenté de 5% (bonne adaptation : RPE ${stats.avgRpe.toFixed(1)})`,
      descriptionEn: `Week ${nextWeek.weekNumber} volume increased by 5% (good adaptation: RPE ${stats.avgRpe.toFixed(1)})`,
    });
  }

  // ── Rule 4: Skipped key sessions → try to shift type to next week
  // (Only if next week has easy slots that could become key)
  if (stats.skippedKeyTypes.length > 0 && !nextWeek.isRecoveryWeek) {
    // Just note it — actual session swap requires the full workout library
    // which we don't have access to here. The UI can suggest it.
    for (const skippedType of stats.skippedKeyTypes) {
      changes.push({
        weekNumber: nextWeek.weekNumber,
        type: "session_shifted",
        description: `Séance ${skippedType} manquée — pensez à l'inclure semaine ${nextWeek.weekNumber}`,
        descriptionEn: `Missed ${skippedType} session — consider including it in week ${nextWeek.weekNumber}`,
      });
    }
  }

  return {
    adapted: changes.length > 0,
    changes,
  };
}

/**
 * Get completion statistics for the entire plan.
 * Useful for displaying progress in the plan view.
 */
export function getPlanCompletionStats(plan: TrainingPlan): {
  totalSessions: number;
  completed: number;
  skipped: number;
  planned: number;
  completionRate: number;
  avgRpe: number | null;
} {
  let totalSessions = 0;
  let completed = 0;
  let skipped = 0;
  const rpeValues: number[] = [];

  for (const week of plan.weeks) {
    for (const session of week.sessions) {
      totalSessions++;
      if (session.status === "completed" || session.status === "modified") {
        completed++;
        if (session.rpe) rpeValues.push(session.rpe);
      } else if (session.status === "skipped") {
        skipped++;
      }
    }
  }

  return {
    totalSessions,
    completed,
    skipped,
    planned: totalSessions - completed - skipped,
    completionRate: totalSessions > 0 ? completed / totalSessions : 0,
    avgRpe: rpeValues.length > 0 ? rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length : null,
  };
}
