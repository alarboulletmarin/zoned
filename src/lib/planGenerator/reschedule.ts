import type { TrainingPlan, PlanSession, PlanWeek, AutoChange } from "@/types/plan";
import { getPlanMonday, dateToWeekAndDay } from "@/lib/planDates";

// ── Public result type ────────────────────────────────────────────

export interface AutoRescheduleResult {
  updatedPlan: TrainingPlan;
  changes: AutoChange[];
  unplaced: PlanSession[];
}

// ── Main entry point ──────────────────────────────────────────────

/**
 * Pure, deterministic rescheduler.
 * Moves planned sessions off unavailable days within a sliding window.
 *
 * @param plan           - The plan to reschedule (not mutated).
 * @param fromWeekNumber - First week to consider (1-based).
 * @param windowWeeks    - How many weeks to scan (default 4).
 */
export function autoReschedule(
  plan: TrainingPlan,
  fromWeekNumber: number,
  windowWeeks = 4,
): AutoRescheduleResult {
  // 1. Deep-clone so we never mutate the input
  const draft = structuredClone(plan);

  const changes: AutoChange[] = [];
  const unplaced: PlanSession[] = [];

  // 2. Build blocked-day set from unavailabilities
  const blockedSet = buildBlockedSet(draft);

  // 3. Collect sessions that need moving (across the window)
  const lastWeek = fromWeekNumber + windowWeeks - 1;
  const toMove: { session: PlanSession; week: PlanWeek; weekNumber: number }[] = [];

  for (let wn = fromWeekNumber; wn <= lastWeek; wn++) {
    const week = draft.weeks.find((w) => w.weekNumber === wn);
    if (!week) continue;

    for (const session of week.sessions) {
      if (!shouldMove(session, blockedSet, wn)) continue;
      toMove.push({ session, week, weekNumber: wn });
    }
  }

  // 4. Sort by priority: key sessions first, then long_run, then the rest
  toMove.sort((a, b) => {
    if (a.session.isKeySession !== b.session.isKeySession) {
      return a.session.isKeySession ? -1 : 1;
    }
    if ((a.session.sessionType === "long_run") !== (b.session.sessionType === "long_run")) {
      return a.session.sessionType === "long_run" ? -1 : 1;
    }
    return 0;
  });

  // 5. Place each session
  for (const { session, week, weekNumber } of toMove) {
    const slot = findSlot(draft, blockedSet, weekNumber, session.dayOfWeek, fromWeekNumber, lastWeek, week, session);

    if (slot) {
      // Move the session
      const fromDay = session.dayOfWeek;
      removeSession(week, session);
      session.dayOfWeek = slot.day;

      const targetWeek = draft.weeks.find((w) => w.weekNumber === slot.weekNumber)!;
      targetWeek.sessions.push(session);

      changes.push({
        kind: "moved",
        weekNumber,
        fromDay,
        toWeekNumber: slot.weekNumber,
        toDay: slot.day,
        workoutId: session.workoutId,
        reason: "unavailability",
      });
    } else {
      // No slot found
      if (session.isKeySession) {
        unplaced.push({ ...session }); // snapshot before removal
        removeSession(week, session);
      } else {
        // Signal skip but leave in place
        changes.push({
          kind: "skipped",
          weekNumber,
          fromDay: session.dayOfWeek,
          workoutId: session.workoutId,
          reason: "unavailability",
        });
      }
    }
  }

  return { updatedPlan: draft, changes, unplaced };
}

// ── Internal helpers ──────────────────────────────────────────────

function buildBlockedSet(plan: TrainingPlan): Set<string> {
  const set = new Set<string>();
  const unavailabilities = plan.config.unavailabilities ?? [];
  if (unavailabilities.length === 0) return set;

  const planMonday = getPlanMonday(plan);

  for (const u of unavailabilities) {
    const [y, m, d] = u.date.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    const result = dateToWeekAndDay(planMonday, date);
    if (result) {
      set.add(`${result.weekNumber}-${result.dayOfWeek}`);
    }
  }
  return set;
}

function isBlocked(blockedSet: Set<string>, weekNumber: number, day: number): boolean {
  return blockedSet.has(`${weekNumber}-${day}`);
}

function isOccupied(plan: TrainingPlan, weekNumber: number, day: number): boolean {
  const week = plan.weeks.find((w) => w.weekNumber === weekNumber);
  if (!week) return true; // no such week = can't place
  return week.sessions.some((s) => s.dayOfWeek === day);
}

function hasAdjacentKeySession(week: PlanWeek, day: number, excludeSession?: PlanSession): boolean {
  return week.sessions.some(
    (s) => s !== excludeSession && s.isKeySession && Math.abs(s.dayOfWeek - day) <= 1,
  );
}

function shouldMove(
  session: PlanSession,
  blockedSet: Set<string>,
  weekNumber: number,
): boolean {
  // Never move race day
  if (session.workoutId === "__race_day__") return false;
  // Never move completed / skipped / modified
  if (session.status === "completed" || session.status === "skipped" || session.status === "modified") return false;
  // Only move if the day is blocked
  return isBlocked(blockedSet, weekNumber, session.dayOfWeek);
}

function removeSession(week: PlanWeek, session: PlanSession): void {
  const idx = week.sessions.indexOf(session);
  if (idx !== -1) week.sessions.splice(idx, 1);
}

/**
 * Spiral search: tries days near the origin first (+1, -1, +2, -2, ...),
 * then spills into subsequent weeks.
 */
function findSlot(
  plan: TrainingPlan,
  blockedSet: Set<string>,
  originWeek: number,
  originDay: number,
  _fromWeek: number,
  lastWeek: number,
  currentWeek: PlanWeek,
  session: PlanSession,
): { weekNumber: number; day: number } | null {
  // --- Same week: spiral from originDay ---
  for (let offset = 1; offset <= 6; offset++) {
    for (const sign of [1, -1]) {
      const candidateDay = originDay + offset * sign;
      if (candidateDay < 0 || candidateDay > 6) continue;
      if (isBlocked(blockedSet, originWeek, candidateDay)) continue;
      if (isOccupied(plan, originWeek, candidateDay)) continue;

      // For key sessions, prefer non-adjacent-to-key placement but don't reject outright here
      // (we'll try to find a non-adjacent slot first, then fall back)
      if (session.isKeySession && hasAdjacentKeySession(currentWeek, candidateDay, session)) {
        continue; // try to find a better slot
      }

      return { weekNumber: originWeek, day: candidateDay };
    }
  }

  // If key session, relax adjacency constraint for same week
  if (session.isKeySession) {
    for (let offset = 1; offset <= 6; offset++) {
      for (const sign of [1, -1]) {
        const candidateDay = originDay + offset * sign;
        if (candidateDay < 0 || candidateDay > 6) continue;
        if (isBlocked(blockedSet, originWeek, candidateDay)) continue;
        if (isOccupied(plan, originWeek, candidateDay)) continue;
        return { weekNumber: originWeek, day: candidateDay };
      }
    }
  }

  // --- Subsequent weeks ---
  for (let wn = originWeek + 1; wn <= lastWeek; wn++) {
    const week = plan.weeks.find((w) => w.weekNumber === wn);
    if (!week) continue;

    for (let day = 0; day <= 6; day++) {
      if (isBlocked(blockedSet, wn, day)) continue;
      if (isOccupied(plan, wn, day)) continue;

      if (session.isKeySession && hasAdjacentKeySession(week, day, session)) {
        continue; // try better slots first
      }

      return { weekNumber: wn, day };
    }

    // Relax adjacency for key sessions
    if (session.isKeySession) {
      for (let day = 0; day <= 6; day++) {
        if (isBlocked(blockedSet, wn, day)) continue;
        if (isOccupied(plan, wn, day)) continue;
        return { weekNumber: wn, day };
      }
    }
  }

  return null;
}
