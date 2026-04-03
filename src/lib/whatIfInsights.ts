import type { PlanStats, EnhancedPlanAnalysis } from "@/lib/planStats";
import type { TrainingPlan } from "@/types/plan";

export interface WhatIfInsight {
  type: "stimulus" | "practical" | "warning";
  key: string;
  params: Record<string, string | number>;
}

/**
 * Sum minutes for a set of zone names from a zone distribution array.
 */
function sumZoneMinutes(
  distribution: EnhancedPlanAnalysis["zoneDistribution"],
  zones: string[],
): number {
  return distribution
    .filter((z) => zones.includes(z.zone))
    .reduce((sum, z) => sum + z.minutes, 0);
}

/**
 * Compare two plan stats + enhanced analyses and generate qualitative insights.
 *
 * Insights are returned sorted: warnings first, then stimulus, then practical.
 */
export function generateInsights(
  statsA: PlanStats,
  statsB: PlanStats,
  analysisA: EnhancedPlanAnalysis,
  analysisB: EnhancedPlanAnalysis,
  planA: TrainingPlan,
  planB: TrainingPlan,
): WhatIfInsight[] {
  const insights: WhatIfInsight[] = [];

  // ── Aerobic stimulus (Z1 + Z2) ──────────────────────────────────────
  const aerobicA = sumZoneMinutes(analysisA.zoneDistribution, ["Z1", "Z2"]);
  const aerobicB = sumZoneMinutes(analysisB.zoneDistribution, ["Z1", "Z2"]);
  const aerobicDelta = aerobicB - aerobicA;

  if (aerobicDelta > 30) {
    const weeksB = statsB.weeklyVolumes.length || 1;
    insights.push({
      type: "stimulus",
      key: "insights.moreAerobicStimulus",
      params: { minutes: Math.round(aerobicDelta / weeksB) },
    });
  }

  // ── Intensity (Z4 + Z5 + Z6) ────────────────────────────────────────
  const intensityA = sumZoneMinutes(analysisA.zoneDistribution, ["Z4", "Z5", "Z6"]);
  const intensityB = sumZoneMinutes(analysisB.zoneDistribution, ["Z4", "Z5", "Z6"]);
  const intensityDelta = intensityB - intensityA;

  if (intensityDelta > 15) {
    const weeksB = statsB.weeklyVolumes.length || 1;
    insights.push({
      type: "stimulus",
      key: "insights.moreIntensity",
      params: { minutes: Math.round(intensityDelta / weeksB) },
    });
  }

  // ── Key sessions ─────────────────────────────────────────────────────
  const keyDelta = statsB.keySessionCount - statsA.keySessionCount;
  if (keyDelta !== 0) {
    insights.push({
      type: "stimulus",
      key: "insights.moreKeySessions",
      params: { count: keyDelta },
    });
  }

  // ── Time commitment ──────────────────────────────────────────────────
  const avgDelta = statsB.avgDurationPerWeekMin - statsA.avgDurationPerWeekMin;
  if (Math.abs(avgDelta) > 15) {
    const hours = Math.round(Math.abs(avgDelta) / 6) / 10; // round to 1 decimal
    if (avgDelta > 0) {
      insights.push({
        type: "practical",
        key: "insights.moreTimeCommitment",
        params: { hours },
      });
    } else {
      insights.push({
        type: "practical",
        key: "insights.lessTimeCommitment",
        params: { hours },
      });
    }
  }

  // ── Recovery weeks ───────────────────────────────────────────────────
  const recoveryDelta = statsB.recoveryWeekCount - statsA.recoveryWeekCount;
  if (recoveryDelta > 0) {
    insights.push({
      type: "practical",
      key: "insights.moreRecovery",
      params: { count: recoveryDelta },
    });
  } else if (recoveryDelta < 0) {
    insights.push({
      type: "practical",
      key: "insights.lessRecovery",
      params: { count: Math.abs(recoveryDelta) },
    });
  }

  // ── Peak volume warning ──────────────────────────────────────────────
  const peakKmA = planA.peakWeeklyKm ?? 0;
  const peakKmB = planB.peakWeeklyKm ?? 0;
  if (peakKmA > 0) {
    const percentHigher = Math.round(((peakKmB - peakKmA) / peakKmA) * 100);
    if (percentHigher > 40) {
      insights.push({
        type: "warning",
        key: "insights.volumeJumpWarning",
        params: { percent: percentHigher },
      });
    }
    if (peakKmB > peakKmA) {
      insights.push({
        type: "stimulus",
        key: "insights.higherPeakVolume",
        params: {
          km: Math.round(peakKmB),
          kmA: Math.round(peakKmA),
        },
      });
    }
  }

  // ── Long run comparison ──────────────────────────────────────────────
  const longRunA = planA.peakLongRunKm ?? 0;
  const longRunB = planB.peakLongRunKm ?? 0;
  if (longRunB > longRunA && longRunA > 0) {
    insights.push({
      type: "stimulus",
      key: "insights.longerLongRun",
      params: {
        km: Math.round(longRunB),
        kmA: Math.round(longRunA),
      },
    });
  } else if (longRunA === longRunB && longRunA > 0) {
    insights.push({
      type: "practical",
      key: "insights.sameLongRun",
      params: {},
    });
  }

  // ── Sort: warnings first, then stimulus, then practical ──────────────
  const typeOrder: Record<WhatIfInsight["type"], number> = {
    warning: 0,
    stimulus: 1,
    practical: 2,
  };

  insights.sort((a, b) => typeOrder[a.type] - typeOrder[b.type]);

  return insights;
}
