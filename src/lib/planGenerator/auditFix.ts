import type { TrainingPlan, PlanWeek } from "@/types/plan";
import type { PlanFinding } from "./audit";

/**
 * Apply an auto-fix for a specific audit finding.
 * Returns the modified plan (deep-cloned), or null if the fix cannot be applied.
 */
export function applyAuditFix(plan: TrainingPlan, finding: PlanFinding): TrainingPlan | null {
  const draft = JSON.parse(JSON.stringify(plan)) as TrainingPlan;
  const week = draft.weeks.find(w => w.weekNumber === finding.weekNumber);
  if (!week) return null;

  switch (finding.code) {
    case "KEY_SESSIONS_TOO_CLOSE":
      return fixKeySessionsTooClose(draft, week);
    case "KEY_SESSION_ADJACENT_LONG_RUN":
      return fixKeyAdjacentLongRun(draft, week);
    case "RECOVERY_WEEK_TOO_HARD":
      return fixRecoveryTooHard(draft, week);
    case "TAPER_WEEK_HEAVY":
      return fixTaperHeavy(draft, week);
    case "VOLUME_JUMP_TOO_LARGE":
      return fixVolumeJump(draft, week);
    default:
      return null;
  }
}

// ── Helpers ──────────────────────────────────────────────────────────

function circularDistance(a: number, b: number): number {
  return Math.min(Math.abs(a - b), 7 - Math.abs(a - b));
}

function findFreeDay(week: PlanWeek, avoidDays: number[], minDistance: number): number | null {
  const occupied = new Set(week.sessions.map(s => s.dayOfWeek));
  for (let candidate = 0; candidate <= 6; candidate++) {
    if (occupied.has(candidate)) continue;
    const tooClose = avoidDays.some(d => circularDistance(candidate, d) < minDistance);
    if (!tooClose) return candidate;
  }
  return null;
}

function sortSessions(week: PlanWeek): void {
  week.sessions.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}

// ── Fix implementations ─────────────────────────────────────────────

function fixKeySessionsTooClose(draft: TrainingPlan, week: PlanWeek): TrainingPlan | null {
  const keySessions = week.sessions.filter(
    s => s.isKeySession && s.workoutId !== "__race_day__" && s.workoutId !== "__intermediate_race__",
  );
  if (keySessions.length < 2) return null;

  // Find the first adjacent pair
  for (let a = 0; a < keySessions.length; a++) {
    for (let b = a + 1; b < keySessions.length; b++) {
      if (circularDistance(keySessions[a].dayOfWeek, keySessions[b].dayOfWeek) <= 1) {
        // Move the second one to a free day, avoiding all key sessions + long runs
        const avoidDays = week.sessions
          .filter(s => (s.isKeySession || s.sessionType === "long_run") && s !== keySessions[b])
          .map(s => s.dayOfWeek);
        const freeDay = findFreeDay(week, avoidDays, 2);
        if (freeDay === null) return null;
        keySessions[b].dayOfWeek = freeDay;
        sortSessions(week);
        return draft;
      }
    }
  }
  return null;
}

function fixKeyAdjacentLongRun(draft: TrainingPlan, week: PlanWeek): TrainingPlan | null {
  const keySessions = week.sessions.filter(
    s => s.isKeySession && s.workoutId !== "__race_day__" && s.workoutId !== "__intermediate_race__",
  );
  const longRuns = week.sessions.filter(s => s.sessionType === "long_run");

  for (const key of keySessions) {
    for (const lr of longRuns) {
      if (key === lr) continue;
      if (circularDistance(key.dayOfWeek, lr.dayOfWeek) <= 1) {
        // Move key session away from long run
        const avoidDays = [lr.dayOfWeek, ...keySessions.filter(k => k !== key).map(k => k.dayOfWeek)];
        const freeDay = findFreeDay(week, avoidDays, 2);
        if (freeDay === null) return null;
        key.dayOfWeek = freeDay;
        sortSessions(week);
        return draft;
      }
    }
  }
  return null;
}

function fixRecoveryTooHard(draft: TrainingPlan, week: PlanWeek): TrainingPlan {
  week.sessions = week.sessions.map(s => {
    if (s.isKeySession && s.workoutId !== "__race_day__" && s.workoutId !== "__intermediate_race__") {
      return {
        ...s,
        isKeySession: false,
        sessionType: "endurance" as const,
        estimatedDurationMin: Math.min(40, s.estimatedDurationMin),
      };
    }
    return s;
  });
  return draft;
}

function fixTaperHeavy(draft: TrainingPlan, week: PlanWeek): TrainingPlan {
  const targetVol = 65;
  const scale = targetVol / week.volumePercent;

  week.sessions = week.sessions.map(s => ({
    ...s,
    estimatedDurationMin: Math.max(15, Math.round(s.estimatedDurationMin * scale)),
  }));

  if (week.targetKm) {
    week.targetKm = Math.round(week.targetKm * scale);
  }
  if (week.targetLongRunKm) {
    week.targetLongRunKm = Math.round(week.targetLongRunKm * scale);
  }
  week.volumePercent = targetVol;
  return draft;
}

function fixVolumeJump(draft: TrainingPlan, week: PlanWeek): TrainingPlan | null {
  const weekIdx = draft.weeks.findIndex(w => w.weekNumber === week.weekNumber);
  if (weekIdx <= 0) return null;
  const prevWeek = draft.weeks[weekIdx - 1];

  const targetVol = Math.round(prevWeek.volumePercent * 1.15);
  if (targetVol >= week.volumePercent) return null; // no reduction needed

  const scale = targetVol / week.volumePercent;

  week.sessions = week.sessions.map(s => ({
    ...s,
    estimatedDurationMin: Math.max(15, Math.round(s.estimatedDurationMin * scale)),
  }));

  if (week.targetKm) {
    week.targetKm = Math.round(week.targetKm * scale);
  }
  if (week.targetLongRunKm) {
    week.targetLongRunKm = Math.round(week.targetLongRunKm * scale);
  }
  week.volumePercent = targetVol;
  return draft;
}
