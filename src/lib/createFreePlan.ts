import type { TrainingPlan, PlanWeek, PlanConfig, PhaseRange, TrainingGoal, PlanPurpose } from "@/types/plan";
import type { TrainingPhase } from "@/types";

interface FreePlanOptions {
  daysPerWeek?: number;
  trainingGoal?: TrainingGoal;
  planPurpose?: PlanPurpose;
}

const RECOVERY_WEEK_FREQUENCY = 4;
const RECOVERY_WEEK_VOLUME_PCT = 60;

/**
 * Calculate phase distribution for a free plan (no race distance).
 * Uses a standard periodization: ~40% base, ~30% build, ~15% peak, ~15% taper.
 */
function calculateFreePhases(totalWeeks: number): PhaseRange[] {
  if (totalWeeks < 4) {
    return [{ phase: "base", startWeek: 1, endWeek: totalWeeks }];
  }

  const taperWeeks = Math.max(1, Math.round(totalWeeks * 0.12));
  const available = totalWeeks - taperWeeks;

  const baseWeeks = Math.max(1, Math.round(available * 0.45));
  const buildWeeks = Math.max(1, Math.round(available * 0.30));
  let peakWeeks = Math.max(1, available - baseWeeks - buildWeeks);

  // Adjust if rounding doesn't add up
  const total = baseWeeks + buildWeeks + peakWeeks + taperWeeks;
  if (total < totalWeeks) peakWeeks += totalWeeks - total;

  const phases: PhaseRange[] = [];
  let w = 1;

  phases.push({ phase: "base", startWeek: w, endWeek: w + baseWeeks - 1 });
  w += baseWeeks;
  phases.push({ phase: "build", startWeek: w, endWeek: w + buildWeeks - 1 });
  w += buildWeeks;
  phases.push({ phase: "peak", startWeek: w, endWeek: w + peakWeeks - 1 });
  w += peakWeeks;
  phases.push({ phase: "taper", startWeek: w, endWeek: w + taperWeeks - 1 });

  return phases;
}

function getPhaseForWeek(weekNumber: number, phases: PhaseRange[]): TrainingPhase {
  for (const range of phases) {
    if (weekNumber >= range.startWeek && weekNumber <= range.endWeek) {
      return range.phase;
    }
  }
  return "base";
}

export function createFreePlan(name: string, totalWeeks: number, startDate?: string, options?: FreePlanOptions): TrainingPlan {
  const id = crypto.randomUUID();
  const config: PlanConfig = {
    id,
    planMode: "free",
    daysPerWeek: options?.daysPerWeek ?? 4,
    planName: name,
    createdAt: new Date().toISOString(),
    ...(startDate && {
      startDate,
      endDate: (() => {
        const d = new Date(startDate);
        d.setDate(d.getDate() + totalWeeks * 7);
        return d.toISOString().split("T")[0];
      })(),
    }),
    ...(options?.trainingGoal && { trainingGoal: options.trainingGoal }),
    ...(options?.planPurpose && { planPurpose: options.planPurpose }),
  };

  const phases = calculateFreePhases(totalWeeks);

  const weeks: PlanWeek[] = Array.from({ length: totalWeeks }, (_, i) => {
    const weekNumber = i + 1;
    const phase = getPhaseForWeek(weekNumber, phases);
    const isRecoveryWeek = weekNumber > 1 && weekNumber % RECOVERY_WEEK_FREQUENCY === 0 && phase !== "taper";

    return {
      weekNumber,
      phase,
      isRecoveryWeek,
      volumePercent: isRecoveryWeek ? RECOVERY_WEEK_VOLUME_PCT : 100,
      sessions: [],
    };
  });

  return { id, config, weeks, totalWeeks, phases, name, nameEn: name };
}
