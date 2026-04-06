/**
 * Strength Integration — Post-processing step for training plans
 *
 * Adds periodized strength training suggestions to an already-generated
 * running plan. Strength sessions are placed on rest days or paired with
 * easy running days, never on key session days.
 *
 * Evidence base:
 * - Ronnestad et al. (2014): Periodized strength → power → maintenance
 *   optimizes concurrent training adaptations in endurance athletes.
 * - Beattie et al. (2017): Heavy resistance training (3-5 RM) improves
 *   running economy more than muscular endurance protocols.
 * - Lauersen et al. (2014): Strength training reduces injury risk by ~50%.
 * - Denadai et al. (2017): Strength training improves running economy 2-8%.
 *
 * Architecture:
 *   Generated PlanWeeks → Phase detection → Session selection
 *   → Day placement → Load scoring → Mutated PlanWeeks
 */

import type { PlanWeek, PlanSession } from "@/types/plan";
import type {
  TrainingPhase,
  StrengthIntensity,
  StrengthCategory,
  StrengthWorkoutTemplate,
} from "@/types";
import { loadAllStrengthSessions } from "@/data/strength";

// ── Strength Load Bridge ─────────────────────────────────────────
// Maps strength intensity to a load factor (0-1) for TRIMP-like scoring.
// Factors calibrated so that a 45-min hypertrophy session produces a load
// comparable to a 45-min Z2 run (~32 vs ~34), keeping weekly totals meaningful.

const STRENGTH_LOAD_FACTORS: Record<StrengthIntensity, number> = {
  mobility: 0.3,
  endurance: 0.5,
  hypertrophy: 0.7,
  strength: 0.9,
  power: 0.85,
};

function computeStrengthLoad(
  durationMin: number,
  intensity: StrengthIntensity,
): number {
  return Math.round(durationMin * (STRENGTH_LOAD_FACTORS[intensity] ?? 0.5));
}

// ── Phase-to-Strength Configuration ─────────────────────────────
// Defines which strength categories and max frequency apply per phase.
// Follows Ronnestad 2014 periodization: base (endurance/hypertrophy) →
// build (hypertrophy/strength) → peak (power/strength) → taper (mobility).

const STRENGTH_PHASE_CONFIG: Record<
  TrainingPhase,
  {
    categories: StrengthCategory[];
    maxFrequency: number;
  }
> = {
  base: {
    categories: ["runner_full_body", "mobility", "runner_core"],
    maxFrequency: 3,
  },
  build: {
    categories: ["runner_lower", "runner_core", "runner_full_body"],
    maxFrequency: 2,
  },
  peak: {
    categories: ["plyometrics", "runner_core", "prehab"],
    maxFrequency: 2,
  },
  taper: {
    categories: ["mobility", "prehab"],
    maxFrequency: 1,
  },
  recovery: {
    categories: ["mobility"],
    maxFrequency: 1,
  },
};

// ── Session Selection ───────────────────────────────────────────

/**
 * Select strength sessions for a given phase.
 *
 * Filters by suitablePhases and allowed categories, then prefers
 * least-used sessions for variety. Randomizes among equally suitable
 * candidates to avoid deterministic repetition.
 */
function selectStrengthSessions(
  allSessions: StrengthWorkoutTemplate[],
  phase: TrainingPhase,
  count: number,
  usedIds: Map<string, number>,
): StrengthWorkoutTemplate[] {
  const phaseConfig = STRENGTH_PHASE_CONFIG[phase];

  // Filter: must match phase AND allowed categories
  const candidates = allSessions.filter(
    (s) =>
      s.suitablePhases.includes(phase) &&
      phaseConfig.categories.includes(s.category),
  );

  if (candidates.length === 0) return [];

  // Sort by usage count (ascending), then shuffle ties
  const scored = candidates.map((s) => ({
    session: s,
    usageCount: usedIds.get(s.id) ?? 0,
    random: Math.random(),
  }));

  scored.sort((a, b) => {
    if (a.usageCount !== b.usageCount) return a.usageCount - b.usageCount;
    return a.random - b.random;
  });

  // Pick up to `count`, ensuring no duplicate within same week
  const selected: StrengthWorkoutTemplate[] = [];
  const weekIds = new Set<string>();

  for (const item of scored) {
    if (selected.length >= count) break;
    if (weekIds.has(item.session.id)) continue;
    selected.push(item.session);
    weekIds.add(item.session.id);
  }

  return selected;
}

// ── Day Placement ───────────────────────────────────────────────

/**
 * Find suitable days for strength sessions within a week.
 *
 * Priority:
 * 1. Rest days (no running session)
 * 2. Easy-run days (recovery or endurance session type)
 * 3. Never on key session days
 *
 * Returns day indices spaced at least 1 day apart.
 */
function findStrengthDays(
  sessions: PlanSession[],
  count: number,
): number[] {
  const allDays = [0, 1, 2, 3, 4, 5, 6];

  // Map running sessions by day
  const runningByDay = new Map<number, PlanSession>();
  for (const s of sessions) {
    runningByDay.set(s.dayOfWeek, s);
  }

  // Classify days
  const restDays: number[] = [];
  const easyDays: number[] = [];
  const keyDays = new Set<number>();

  for (const day of allDays) {
    const session = runningByDay.get(day);
    if (!session) {
      restDays.push(day);
    } else if (session.isKeySession) {
      keyDays.add(day);
    } else if (
      session.sessionType === "recovery" ||
      session.sessionType === "endurance"
    ) {
      easyDays.push(day);
    }
    // Other non-key sessions (tempo, threshold, etc.) are not ideal for pairing
  }

  // Build candidate pool: rest days first, then easy days
  const pool = [...restDays, ...easyDays];

  // Greedily select days with at least 1-day spacing
  const selected: number[] = [];
  const usedDays = new Set<number>();

  for (const day of pool) {
    if (selected.length >= count) break;
    if (keyDays.has(day)) continue;

    // Check 1-day spacing from already selected strength days
    const tooClose = selected.some(
      (d) => Math.abs(d - day) <= 1 || Math.abs(d - day) >= 6, // wrap-around check
    );
    if (tooClose) continue;

    if (!usedDays.has(day)) {
      selected.push(day);
      usedDays.add(day);
    }
  }

  // If we couldn't fill all slots with spacing, relax the constraint
  if (selected.length < count) {
    for (const day of pool) {
      if (selected.length >= count) break;
      if (usedDays.has(day)) continue;
      if (keyDays.has(day)) continue;
      selected.push(day);
      usedDays.add(day);
    }
  }

  return selected.sort((a, b) => a - b);
}

// ── Main Integration Function ───────────────────────────────────

/**
 * Add strength training suggestions to an already-generated running plan.
 *
 * Mutates `weeks` in-place by appending strength PlanSession entries.
 * Strength sessions are marked with `isSuggestion: true` so the UI
 * can render them differently (dismissable by the user).
 *
 * @param weeks - The plan weeks (mutated in-place)
 * @param frequency - User-selected strength sessions per week (1-3)
 */
export async function addStrengthSuggestions(
  weeks: PlanWeek[],
  frequency: 1 | 2 | 3,
): Promise<void> {
  // Load all strength session templates
  const allSessions = await loadAllStrengthSessions();
  if (allSessions.length === 0) return;

  // Track usage across weeks for variety
  const usageTracker = new Map<string, number>();

  for (const week of weeks) {
    const phase = week.phase;
    const phaseConfig = STRENGTH_PHASE_CONFIG[phase];

    // Determine effective frequency:
    // - Recovery weeks: always 1 mobility session
    // - Other weeks: min(user frequency, phase max)
    let effectiveFrequency: number;
    if (week.isRecoveryWeek) {
      effectiveFrequency = 1;
    } else {
      effectiveFrequency = Math.min(frequency, phaseConfig.maxFrequency);
    }

    // Select appropriate strength sessions
    const selectedSessions = selectStrengthSessions(
      allSessions,
      week.isRecoveryWeek ? "recovery" : phase,
      effectiveFrequency,
      usageTracker,
    );

    if (selectedSessions.length === 0) continue;

    // Find suitable days
    const strengthDays = findStrengthDays(
      week.sessions,
      selectedSessions.length,
    );

    // Create PlanSession entries
    for (let i = 0; i < selectedSessions.length && i < strengthDays.length; i++) {
      const template = selectedSessions[i];
      const dayOfWeek = strengthDays[i];

      const avgDuration = Math.round(
        (template.typicalDuration.min + template.typicalDuration.max) / 2,
      );

      const strengthSession: PlanSession = {
        dayOfWeek,
        workoutId: template.id,
        sessionType: "strength",
        isKeySession: false,
        isSuggestion: true,
        estimatedDurationMin: avgDuration,
        loadScore: computeStrengthLoad(avgDuration, template.intensity),
      };

      week.sessions.push(strengthSession);

      // Update usage tracker
      usageTracker.set(
        template.id,
        (usageTracker.get(template.id) ?? 0) + 1,
      );

      // Update weekly load score
      if (week.weeklyLoadScore != null) {
        week.weeklyLoadScore += strengthSession.loadScore ?? 0;
      }
    }
  }
}
