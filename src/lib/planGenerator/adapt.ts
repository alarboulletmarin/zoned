/**
 * Adaptive Replanning — Adjust future weeks based on completion data
 *
 * When users mark sessions as completed/skipped with RPE feedback,
 * this module adjusts future weeks to keep the plan on track.
 *
 * v2 — Multi-week sliding-window analysis with preview support.
 *
 * Rules (evidence-based, mutually exclusive for the main rule):
 * 1. Acute fatigue: avgRpe > 8.5 current OR avgRpe > 8 on 2+ consecutive weeks
 *    → N+1 volume × 0.85, N+2 × 0.95
 * 2. Two consecutive weeks completion < 50%
 *    → N+1 converted to recovery (volume × 0.60)
 * 3. Single week completion < 50%
 *    → N+1 recovery (volume × 0.65)
 * 4. High RPE (>8 average) current week
 *    → N+1 volume × 0.90
 * 5. Low RPE (<5) + good completion (>=80%)
 *    → N+1 volume × 1.05 (cap 100%)
 *
 * Additive: missed key sessions noted for UI suggestion.
 *
 * Protections: taper, race week (last), and past weeks are never modified.
 *
 * References:
 * - Gabbett, T. (2016). ACWR for injury prevention
 * - Foster, C. (1998). Monitoring training load with RPE
 */

import type { TrainingPlan, PlanWeek, AutoChange } from "@/types/plan";

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

export interface AdaptationPreview {
  adapted: boolean;
  changes: AutoChange[];
  summary: string;
  summaryEn: string;
  updatedPlan: TrainingPlan;
}

// ── Analysis helpers ────────────────────────────────────────────

interface WeekCompletionStats {
  totalSessions: number;
  completedSessions: number;
  skippedSessions: number;
  completionRate: number;
  avgRpe: number | null;
  skippedKeyTypes: string[];
  allResolved: boolean;
}

function analyzeWeekCompletion(week: PlanWeek): WeekCompletionStats {
  const sessions = week.sessions;
  const total = sessions.length;
  if (total === 0) {
    return { totalSessions: 0, completedSessions: 0, skippedSessions: 0, completionRate: 1, avgRpe: null, skippedKeyTypes: [], allResolved: true };
  }

  let weightedCompleted = 0;
  let skipped = 0;
  let unresolved = 0;
  const rpeValues: number[] = [];
  const skippedKeyTypes: string[] = [];

  for (const s of sessions) {
    if (s.status === "completed") {
      weightedCompleted += 1;
      if (s.rpe) rpeValues.push(s.rpe);
    } else if (s.status === "modified") {
      // Modified session: weight by actual vs estimated duration
      let weight = 1.0;
      if (
        s.actualDurationMin != null &&
        s.estimatedDurationMin > 0 &&
        s.actualDurationMin < s.estimatedDurationMin * 0.7
      ) {
        weight = 0.7;
      }
      weightedCompleted += weight;
      if (s.rpe) rpeValues.push(s.rpe);
    } else if (s.status === "skipped") {
      skipped++;
      if (s.isKeySession) {
        skippedKeyTypes.push(s.sessionType);
      }
    } else {
      unresolved++;
    }
  }

  const resolved = weightedCompleted + skipped;
  const completionRate = resolved > 0 ? weightedCompleted / resolved : 1;

  return {
    totalSessions: total,
    completedSessions: Math.round(weightedCompleted), // integer for display
    skippedSessions: skipped,
    completionRate,
    avgRpe: rpeValues.length > 0 ? rpeValues.reduce((a, b) => a + b, 0) / rpeValues.length : null,
    skippedKeyTypes,
    allResolved: unresolved === 0,
  };
}

// ── Volume adjustment helper ───────────────────────────────────

function applyVolumeMultiplier(week: PlanWeek, multiplier: number, cap?: number): void {
  // Save originals if not already saved
  if (week._originalVolumePercent === undefined) {
    week._originalVolumePercent = week.volumePercent;
    week._originalTargetKm = week.targetKm;
    week._originalIsRecovery = week.isRecoveryWeek;
  }

  // Reset to original before applying (prevents stacking)
  week.volumePercent = week._originalVolumePercent;
  week.targetKm = week._originalTargetKm;
  week.isRecoveryWeek = week._originalIsRecovery ?? false;

  // Apply multiplier
  let newVolume = Math.round(week._originalVolumePercent * multiplier);
  if (cap !== undefined) {
    newVolume = Math.min(cap, newVolume);
  }
  week.volumePercent = newVolume;
  if (week._originalTargetKm != null) {
    week.targetKm = Math.round(week._originalTargetKm * multiplier);
  }
}

function makeRecoveryWeek(week: PlanWeek, multiplier: number): void {
  applyVolumeMultiplier(week, multiplier);
  week.isRecoveryWeek = true;
}

// ── Summary builder ────────────────────────────────────────────

function buildSummary(changes: AutoChange[]): { summary: string; summaryEn: string } {
  if (changes.length === 0) return { summary: "", summaryEn: "" };

  const volumeChanges = changes.filter(c => c.kind === "volume_adjusted");
  const recoveryChanges = changes.filter(c => c.kind === "recovery_inserted");
  const missedChanges = changes.filter(c => c.kind === "unplaced");

  const parts: string[] = [];
  const partsEn: string[] = [];

  if (recoveryChanges.length > 0) {
    const weeks = recoveryChanges.map(c => c.weekNumber).join(", ");
    parts.push(`Semaine(s) ${weeks} convertie(s) en récupération`);
    partsEn.push(`Week(s) ${weeks} converted to recovery`);
  }

  if (volumeChanges.length > 0) {
    const fatigueChanges = volumeChanges.filter(c => c.reason === "fatigue");
    const capacityChanges = volumeChanges.filter(c => c.reason === "capacity");
    if (fatigueChanges.length > 0) {
      const weeks = fatigueChanges.map(c => c.weekNumber).join(", ");
      parts.push(`Volume réduit semaine(s) ${weeks} (fatigue détectée)`);
      partsEn.push(`Volume reduced week(s) ${weeks} (fatigue detected)`);
    }
    if (capacityChanges.length > 0) {
      const weeks = capacityChanges.map(c => c.weekNumber).join(", ");
      parts.push(`Volume augmenté semaine(s) ${weeks} (bonne adaptation)`);
      partsEn.push(`Volume increased week(s) ${weeks} (good adaptation)`);
    }
  }

  if (missedChanges.length > 0) {
    parts.push(`${missedChanges.length} séance(s) clé(s) manquée(s) à reprogrammer`);
    partsEn.push(`${missedChanges.length} key session(s) missed — consider rescheduling`);
  }

  return {
    summary: parts.join(". ") + ".",
    summaryEn: partsEn.join(". ") + ".",
  };
}

// ── Main adaptation function (pure, no mutation) ───────────────

/**
 * Compute adaptation preview without mutating the plan.
 * Returns a cloned plan with adjustments + summary.
 */
export function computeAdaptation(
  plan: TrainingPlan,
  currentWeekNumber: number,
): AdaptationPreview {
  const noChange: AdaptationPreview = {
    adapted: false,
    changes: [],
    summary: "",
    summaryEn: "",
    updatedPlan: plan,
  };

  const draft = structuredClone(plan);
  const changes: AutoChange[] = [];

  // ── Analyze sliding window (up to 3 weeks) ──────────────────

  const windowStart = Math.max(1, currentWeekNumber - 2);
  const windowWeeks: { weekNumber: number; stats: WeekCompletionStats }[] = [];

  for (let wn = windowStart; wn <= currentWeekNumber; wn++) {
    const week = draft.weeks.find(w => w.weekNumber === wn);
    if (!week) continue;
    const stats = analyzeWeekCompletion(week);
    if (stats.allResolved && (stats.completedSessions + stats.skippedSessions) > 0) {
      windowWeeks.push({ weekNumber: wn, stats });
    }
  }

  // Must have the current week resolved
  const currentEntry = windowWeeks.find(e => e.weekNumber === currentWeekNumber);
  if (!currentEntry) return noChange;

  const currentStats = currentEntry.stats;

  // ── Find modifiable future weeks ─────────────────────────────

  const futureWeeks = draft.weeks.filter(
    w => w.weekNumber > currentWeekNumber && w.phase !== "taper" && w.weekNumber < draft.totalWeeks,
  );
  if (futureWeeks.length === 0) return noChange;

  const nextWeek = futureWeeks[0];
  const nextNextWeek = futureWeeks.length > 1 ? futureWeeks[1] : null;

  // ── Consecutive-weeks helpers ────────────────────────────────

  // Check for 2+ consecutive high-RPE weeks in the window
  let consecutiveHighRpe = 0;
  for (const entry of windowWeeks) {
    if (entry.stats.avgRpe !== null && entry.stats.avgRpe > 8) {
      consecutiveHighRpe++;
    } else {
      consecutiveHighRpe = 0;
    }
  }

  // Check for 2+ consecutive low-completion weeks in the window
  let consecutiveLowCompletion = 0;
  for (const entry of windowWeeks) {
    if (entry.stats.completionRate < 0.5 && entry.stats.totalSessions >= 2) {
      consecutiveLowCompletion++;
    } else {
      consecutiveLowCompletion = 0;
    }
  }

  // ── Rule evaluation (mutually exclusive for main rule) ───────

  let mainRuleApplied = false;

  // Rule 1: Acute fatigue
  const acuteFatigueCurrent = currentStats.avgRpe !== null && currentStats.avgRpe > 8.5;
  const acuteFatigueConsecutive = consecutiveHighRpe >= 2;

  if (acuteFatigueCurrent || acuteFatigueConsecutive) {
    applyVolumeMultiplier(nextWeek, 0.85);
    changes.push({
      kind: "volume_adjusted",
      weekNumber: nextWeek.weekNumber,
      reason: "fatigue",
    });

    if (nextNextWeek) {
      applyVolumeMultiplier(nextNextWeek, 0.95);
      changes.push({
        kind: "volume_adjusted",
        weekNumber: nextNextWeek.weekNumber,
        reason: "fatigue",
      });
    }

    mainRuleApplied = true;
  }

  // Rule 2: Two consecutive weeks completion < 50%
  if (!mainRuleApplied && consecutiveLowCompletion >= 2) {
    makeRecoveryWeek(nextWeek, 0.60);
    changes.push({
      kind: "recovery_inserted",
      weekNumber: nextWeek.weekNumber,
      reason: "fatigue",
    });
    mainRuleApplied = true;
  }

  // Rule 3: Single week completion < 50% (current only)
  if (
    !mainRuleApplied &&
    currentStats.completionRate < 0.5 &&
    currentStats.totalSessions >= 2
  ) {
    makeRecoveryWeek(nextWeek, 0.65);
    changes.push({
      kind: "recovery_inserted",
      weekNumber: nextWeek.weekNumber,
      reason: "fatigue",
    });
    mainRuleApplied = true;
  }

  // Rule 4: High RPE (>8 average) current week only (not acute fatigue)
  if (
    !mainRuleApplied &&
    currentStats.avgRpe !== null &&
    currentStats.avgRpe > 8
  ) {
    applyVolumeMultiplier(nextWeek, 0.90);
    changes.push({
      kind: "volume_adjusted",
      weekNumber: nextWeek.weekNumber,
      reason: "fatigue",
    });
    mainRuleApplied = true;
  }

  // Rule 5: Low RPE (<5) + good completion (>=80%)
  if (
    !mainRuleApplied &&
    currentStats.avgRpe !== null &&
    currentStats.avgRpe < 5 &&
    currentStats.completionRate >= 0.8
  ) {
    applyVolumeMultiplier(nextWeek, 1.05, 100);
    changes.push({
      kind: "volume_adjusted",
      weekNumber: nextWeek.weekNumber,
      reason: "capacity",
    });
    mainRuleApplied = true;
  }

  // ── Additive: missed key sessions ────────────────────────────

  if (currentStats.skippedKeyTypes.length > 0 && !nextWeek.isRecoveryWeek) {
    for (const skippedType of currentStats.skippedKeyTypes) {
      changes.push({
        kind: "unplaced",
        weekNumber: nextWeek.weekNumber,
        workoutId: skippedType,
        reason: "missed_key",
      });
    }
  }

  // ── Build result ─────────────────────────────────────────────

  if (changes.length === 0) return noChange;

  const { summary, summaryEn } = buildSummary(changes);

  return {
    adapted: true,
    changes,
    summary,
    summaryEn,
    updatedPlan: draft,
  };
}

// ── Legacy wrapper (mutates plan in place) ─────────────────────

/**
 * Legacy wrapper: applies adaptation directly to the plan (mutates).
 * Used by existing code until migrated to preview flow.
 */
export function adaptPlan(
  plan: TrainingPlan,
  currentWeekNumber: number,
): AdaptationResult {
  const preview = computeAdaptation(plan, currentWeekNumber);
  if (!preview.adapted) return { adapted: false, changes: [] };

  // Apply changes from the preview clone back to the mutable plan
  for (const draftWeek of preview.updatedPlan.weeks) {
    const targetWeek = plan.weeks.find(w => w.weekNumber === draftWeek.weekNumber);
    if (!targetWeek) continue;
    targetWeek.volumePercent = draftWeek.volumePercent;
    targetWeek.targetKm = draftWeek.targetKm;
    targetWeek.isRecoveryWeek = draftWeek.isRecoveryWeek;
    targetWeek._originalVolumePercent = draftWeek._originalVolumePercent;
    targetWeek._originalTargetKm = draftWeek._originalTargetKm;
    targetWeek._originalIsRecovery = draftWeek._originalIsRecovery;
  }

  // Convert AutoChange[] to AdaptationChange[] for backward compat
  const legacyChanges: AdaptationChange[] = preview.changes.map(c => ({
    weekNumber: c.weekNumber,
    type: c.kind === "volume_adjusted"
      ? (c.reason === "capacity" ? "volume_increased" : "volume_reduced")
      : c.kind === "recovery_inserted"
        ? "recovery_inserted"
        : "session_shifted",
    description: `Semaine ${c.weekNumber} adaptée`,
    descriptionEn: `Week ${c.weekNumber} adapted`,
  }));

  return { adapted: true, changes: legacyChanges };
}

// ── Plan-level stats (unchanged) ───────────────────────────────

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
