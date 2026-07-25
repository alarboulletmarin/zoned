import type { TrainingPlan, RaceDistance } from "@/types/plan";
import { RACE_DISTANCE_META } from "@/types/plan";
import { RECOMMENDED_PLAN_WEEKS } from "./constants";
import {
  goalDemandFactor,
  vmaRequiredForPace,
  UNREALISTIC_DEMAND,
} from "./goalCalibration";

// ── Types ────────────────────────────────────────────────────────────

export type FindingSeverity = "error" | "warning" | "info";

export interface PlanFinding {
  id: string;
  severity: FindingSeverity;
  code: string;
  weekNumber: number;
  sessionIndex?: number;
  message: string;
  messageEn: string;
  suggestion?: string;
  suggestionEn?: string;
  fixable?: boolean;
}

// ── Constants ────────────────────────────────────────────────────────

const DAY_NAMES_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAY_NAMES_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// ── Volume metric ────────────────────────────────────────────────────
// Progression checks must run on the km the runner actually covers.
// volumePercent is a model value that stays smooth by construction, so
// auditing it reported a clean progression while the delivered km jumped by
// more than 100% between two weeks. Fall back to it only for legacy weeks
// saved before targetKm existed.

interface VolumeMetric {
  /** Comparable magnitude: km when available, else volumePercent */
  value: number;
  /** Below this, relative jumps are tiny in absolute terms and pose little risk */
  lowThreshold: number;
  format: (v: number) => string;
}

function volumeMetric(week: { targetKm?: number; volumePercent: number }): VolumeMetric {
  if (week.targetKm && week.targetKm > 0) {
    return { value: week.targetKm, lowThreshold: 25, format: (v) => `${Math.round(v)} km` };
  }
  return { value: week.volumePercent, lowThreshold: 55, format: (v) => `${Math.round(v)}%` };
}

/**
 * Distance between two days of the week, wrapping around.
 * Sunday and Monday are 1 day apart, not 6.
 */
function dayDistance(a: number, b: number): number {
  const diff = Math.abs(a - b);
  return Math.min(diff, 7 - diff);
}

// ── Audit engine ─────────────────────────────────────────────────────

export function auditPlan(plan: TrainingPlan): PlanFinding[] {
  const findings: PlanFinding[] = [];
  let findingId = 0;
  const nextId = () => `finding-${++findingId}`;

  // ── Check 1: RACE_DAY_MISSING ──────────────────────────────────────
  if (plan.config.raceDate) {
    const hasRaceDay = plan.weeks.some((w) =>
      w.sessions.some((s) => s.workoutId === "__race_day__"),
    );
    if (!hasRaceDay) {
      findings.push({
        id: nextId(),
        severity: "error",
        code: "RACE_DAY_MISSING",
        weekNumber: plan.totalWeeks,
        message: "Aucune séance de course trouvée dans le plan. La course est prévue mais n'apparaît pas dans le calendrier.",
        messageEn: "No race day session found in the plan. The race is scheduled but doesn't appear in the calendar.",
      });
    }
  }

  // ── Check 2: RACE_DAY_NOT_LAST_WEEK ────────────────────────────────
  if (plan.config.raceDate) {
    for (const week of plan.weeks) {
      const raceSession = week.sessions.find(
        (s) => s.workoutId === "__race_day__",
      );
      if (raceSession && week.weekNumber !== plan.totalWeeks) {
        findings.push({
          id: nextId(),
          severity: "error",
          code: "RACE_DAY_NOT_LAST_WEEK",
          weekNumber: week.weekNumber,
          message: `La course est placée en semaine ${week.weekNumber} au lieu de la dernière semaine (S${plan.totalWeeks}). L'affûtage risque d'être mal calibré.`,
          messageEn: `Race day is in week ${week.weekNumber} instead of the last week (W${plan.totalWeeks}). The taper may not be properly calibrated.`,
        });
      }
    }
  }

  // ── Check 2b: INTERMEDIATE_RACE_ON_RECOVERY ──────────────────────
  for (const week of plan.weeks) {
    if (week.intermediateRace && week._originalIsRecovery) {
      findings.push({
        id: nextId(),
        severity: "warning",
        code: "INTERMEDIATE_RACE_ON_RECOVERY",
        weekNumber: week.weekNumber,
        message: `Semaine ${week.weekNumber} : course intermédiaire placée sur une semaine initialement prévue en récupération. La fatigue accumulée pourrait affecter la performance.`,
        messageEn: `Week ${week.weekNumber}: intermediate race placed on a week originally planned as recovery. Accumulated fatigue may affect performance.`,
      });
    }
  }

  // ── Check 2c: PRIORITY_A_NEAR_TAPER ──────────────────────────────
  if (plan.config.raceDate) {
    const taperPhase = plan.phases.find(p => p.phase === "taper");
    if (taperPhase) {
      for (const week of plan.weeks) {
        if (week.intermediateRace?.priority === "A" && taperPhase.startWeek - week.weekNumber <= 3) {
          findings.push({
            id: nextId(),
            severity: "warning",
            code: "PRIORITY_A_NEAR_TAPER",
            weekNumber: week.weekNumber,
            message: `Semaine ${week.weekNumber} : course priorité A à moins de 3 semaines de l'affûtage (S${taperPhase.startWeek}). La récupération pourrait empiéter sur la période d'affûtage.`,
            messageEn: `Week ${week.weekNumber}: priority-A race within 3 weeks of taper start (W${taperPhase.startWeek}). Recovery may overlap with the taper period.`,
          });
        }
      }
    }
  }

  // ── Per-week checks (3-8) ──────────────────────────────────────────
  // Taper is judged against the plan's own peak, not against a model percentage
  const peakKm = Math.max(0, ...plan.weeks.map((w) => w.targetKm ?? 0));

  for (let i = 0; i < plan.weeks.length; i++) {
    const week = plan.weeks[i];
    const prevWeek = i > 0 ? plan.weeks[i - 1] : null;

    // Exclude race-day markers from key session checks — races are "key" events
    // but should not trigger training-specific warnings (spacing, recovery, etc.)
    const keySessions = week.sessions.filter(
      (s) => s.isKeySession && s.workoutId !== "__race_day__" && s.workoutId !== "__intermediate_race__",
    );
    const longRuns = week.sessions.filter(
      (s) => s.sessionType === "long_run",
    );

    // ── Check 3: KEY_SESSIONS_TOO_CLOSE ──────────────────────────────
    for (let a = 0; a < keySessions.length; a++) {
      for (let b = a + 1; b < keySessions.length; b++) {
        if (dayDistance(keySessions[a].dayOfWeek, keySessions[b].dayOfWeek) <= 1) {
          findings.push({
            id: nextId(),
            severity: "warning",
            code: "KEY_SESSIONS_TOO_CLOSE",
            weekNumber: week.weekNumber,
            message: `Semaine ${week.weekNumber} : 2 séances clés consécutives (${DAY_NAMES_FR[keySessions[a].dayOfWeek]} et ${DAY_NAMES_FR[keySessions[b].dayOfWeek]}). Prévoir au moins 1 jour de récupération entre deux séances intenses.`,
            messageEn: `Week ${week.weekNumber}: 2 key sessions on consecutive days (${DAY_NAMES_EN[keySessions[a].dayOfWeek]} and ${DAY_NAMES_EN[keySessions[b].dayOfWeek]}). Allow at least 1 recovery day between intense sessions.`,
            suggestion: `Déplacer une des deux séances pour avoir au moins 1 jour de repos entre les deux.`,
            suggestionEn: `Move one of the two sessions to have at least 1 rest day between them.`,
            fixable: true,
          });
        }
      }
    }

    // ── Check 4: KEY_SESSION_ADJACENT_LONG_RUN ───────────────────────
    for (const key of keySessions) {
      for (const lr of longRuns) {
        if (key === lr) continue; // a long_run that is also key: skip self
        if (dayDistance(key.dayOfWeek, lr.dayOfWeek) <= 1) {
          findings.push({
            id: nextId(),
            severity: "warning",
            code: "KEY_SESSION_ADJACENT_LONG_RUN",
            weekNumber: week.weekNumber,
            message: `Semaine ${week.weekNumber} : séance clé (${DAY_NAMES_FR[key.dayOfWeek]}) collée à la sortie longue (${DAY_NAMES_FR[lr.dayOfWeek]}). Risque de fatigue accumulée — espacer d'au moins 1 jour.`,
            messageEn: `Week ${week.weekNumber}: key session (${DAY_NAMES_EN[key.dayOfWeek]}) adjacent to long run (${DAY_NAMES_EN[lr.dayOfWeek]}). Risk of accumulated fatigue — space them at least 1 day apart.`,
            suggestion: `Déplacer la séance clé ou la sortie longue pour les séparer d'au moins 1 jour.`,
            suggestionEn: `Move the key session or long run to separate them by at least 1 day.`,
            fixable: true,
          });
        }
      }
    }

    // ── Check 5: RECOVERY_WEEK_TOO_HARD ──────────────────────────────
    if (week.isRecoveryWeek && keySessions.length > 0) {
      findings.push({
        id: nextId(),
        severity: "warning",
        code: "RECOVERY_WEEK_TOO_HARD",
        weekNumber: week.weekNumber,
        message: `Semaine ${week.weekNumber} (récupération) contient ${keySessions.length} séance(s) clé(s). Une semaine de récup devrait être allégée pour permettre la régénération.`,
        messageEn: `Week ${week.weekNumber} (recovery) contains ${keySessions.length} key session(s). A recovery week should be lighter to allow regeneration.`,
        suggestion: `Remplacer la/les séance(s) clé(s) par de l'endurance facile ou du footing léger.`,
        suggestionEn: `Replace key session(s) with easy endurance or light jogging.`,
        fixable: true,
      });
    }

    // ── Check 6: TAPER_WEEK_HEAVY ────────────────────────────────────
    // Bosquet et al. (2007): a taper works when volume drops well below peak
    // while intensity holds. Measured against the plan's real peak km when
    // available, since volumePercent alone said nothing about delivered load.
    const taperShare = peakKm > 0 && week.targetKm
      ? (week.targetKm / peakKm) * 100
      : week.volumePercent;
    if (week.phase === "taper" && taperShare > 70) {
      const shown = Math.round(taperShare);
      findings.push({
        id: nextId(),
        severity: "warning",
        code: "TAPER_WEEK_HEAVY",
        weekNumber: week.weekNumber,
        message: `Semaine ${week.weekNumber} (affûtage) : volume à ${shown}% du pic, trop élevé pour un affûtage efficace. Réduire sous 70% pour arriver frais le jour J.`,
        messageEn: `Week ${week.weekNumber} (taper): volume at ${shown}% of peak, too high for effective tapering. Reduce below 70% to arrive fresh on race day.`,
        suggestion: `Supprimer une séance ou réduire les durées pour passer sous 70% du pic.`,
        suggestionEn: `Remove a session or reduce durations to get below 70% of peak.`,
        fixable: true,
      });
    }

    // ── Check 7: VOLUME_JUMP_TOO_LARGE ───────────────────────────────
    // Skip when previous week is recovery or has an intermediate race (expected volume dip).
    // Skip when both weeks are at low volume — at such low absolute volumes
    // (e.g., return-from-injury plans), relative jumps of 25% represent tiny absolute
    // km increases and pose negligible injury risk.
    // Threshold: 21% to absorb rounding artifacts.
    const vol = volumeMetric(week);
    const prevVol = prevWeek ? volumeMetric(prevWeek) : null;
    if (
      prevWeek &&
      prevVol &&
      !prevWeek.isRecoveryWeek &&
      !prevWeek.intermediateRace &&
      prevVol.value > 0 &&
      !(prevVol.value < prevVol.lowThreshold && vol.value < vol.lowThreshold) &&
      vol.value > prevVol.value * 1.21
    ) {
      const pctIncrease = Math.round((vol.value / prevVol.value - 1) * 100);
      const suggested = vol.format(prevVol.value * 1.15);
      findings.push({
        id: nextId(),
        severity: "warning",
        code: "VOLUME_JUMP_TOO_LARGE",
        weekNumber: week.weekNumber,
        fixable: true,
        message: `Semaine ${week.weekNumber} : volume passe de ${prevVol.format(prevVol.value)} à ${vol.format(vol.value)} (+${pctIncrease}%). Une augmentation > 20% par semaine augmente le risque de blessure.`,
        messageEn: `Week ${week.weekNumber}: volume jumps from ${prevVol.format(prevVol.value)} to ${vol.format(vol.value)} (+${pctIncrease}%). Increasing by more than 20% per week raises injury risk.`,
        suggestion: `Réduire le volume de S${week.weekNumber} à ~${suggested} ou ajouter une semaine intermédiaire.`,
        suggestionEn: `Reduce W${week.weekNumber} volume to ~${suggested} or add a transition week.`,
      });
    }

    // ── Check 8: EMPTY_WEEK ──────────────────────────────────────────
    if (week.sessions.length === 0) {
      findings.push({
        id: nextId(),
        severity: "info",
        code: "EMPTY_WEEK",
        weekNumber: week.weekNumber,
        message: `Semaine ${week.weekNumber} : aucune séance programmée.`,
        messageEn: `Week ${week.weekNumber}: no sessions scheduled.`,
      });
    }

    // ── Check 9: DUPLICATE_DAY_SESSIONS ─────────────────────────────
    // Detect multiple running sessions on the same day (data corruption / accidental drag)
    const runningSessions = week.sessions.filter(
      (s) => s.workoutId !== "__race_day__" && s.workoutId !== "__intermediate_race__"
        && !s.workoutId.startsWith("STR-") && !s.workoutId.startsWith("__activity_"),
    );
    const dayCount = new Map<number, number>();
    for (const s of runningSessions) {
      dayCount.set(s.dayOfWeek, (dayCount.get(s.dayOfWeek) ?? 0) + 1);
    }
    for (const [day, count] of dayCount) {
      if (count > 1) {
        findings.push({
          id: nextId(),
          severity: "warning",
          code: "DUPLICATE_DAY_SESSIONS",
          weekNumber: week.weekNumber,
          message: `Semaine ${week.weekNumber} : ${count} séances de course le ${DAY_NAMES_FR[day]}. Une seule séance par jour est recommandée.`,
          messageEn: `Week ${week.weekNumber}: ${count} running sessions on ${DAY_NAMES_EN[day]}. One session per day is recommended.`,
          suggestion: `Supprimer les doublons ou déplacer les séances en trop sur d'autres jours.`,
          suggestionEn: `Remove duplicates or move extra sessions to other days.`,
        });
      }
    }

    // ── Check 10: VOLUME_JUMP_AFTER_RECOVERY ────────────────────────
    // Check volume jump across recovery weeks: compare to the last NON-recovery week
    // to catch cases like S3=40% → S4(recovery) → S5=73% (+82% real jump)
    if (
      prevWeek?.isRecoveryWeek &&
      i >= 2
    ) {
      const lastNonRecovery = plan.weeks.slice(0, i).reverse().find(w => !w.isRecoveryWeek);
      const lastVol = lastNonRecovery ? volumeMetric(lastNonRecovery) : null;
      if (
        lastNonRecovery &&
        lastVol &&
        lastVol.value > 0 &&
        !(lastVol.value < lastVol.lowThreshold && vol.value < vol.lowThreshold) &&
        vol.value > lastVol.value * 1.30
      ) {
        const pctIncrease = Math.round((vol.value / lastVol.value - 1) * 100);
        const suggested = vol.format(lastVol.value * 1.15);
        findings.push({
          id: nextId(),
          severity: "warning",
          code: "VOLUME_JUMP_AFTER_RECOVERY",
          weekNumber: week.weekNumber,
          message: `Semaine ${week.weekNumber} : volume passe de ${lastVol.format(lastVol.value)} (S${lastNonRecovery.weekNumber}) à ${vol.format(vol.value)} (+${pctIncrease}% en comptant la récupération). Reprise trop agressive après récupération.`,
          messageEn: `Week ${week.weekNumber}: volume jumps from ${lastVol.format(lastVol.value)} (W${lastNonRecovery.weekNumber}) to ${vol.format(vol.value)} (+${pctIncrease}% across recovery). Too aggressive return after recovery.`,
          suggestion: `Reprendre à ~${suggested} maximum après la récupération.`,
          suggestionEn: `Resume at ~${suggested} maximum after recovery.`,
          fixable: true,
        });
      }
    }
  }

  findings.push(...auditGoalFeasibility(plan, nextId));

  return findings;
}

// ── Goal feasibility ─────────────────────────────────────────────────
// The generator builds the best plan it can from the runner's declared volume
// and the weeks available. When those inputs cannot support the stated goal it
// used to stay silent, handing over a plan that looks complete but under-
// prepares the runner. These checks say so instead.

/** Long run a runner should reach to face the distance, in km */
const LONG_RUN_TARGET_KM: Record<RaceDistance, number> = {
  "5K": 10,
  "10K": 14,
  semi: 18,
  marathon: 28,
  trail_short: 22,
  trail: 30,
  ultra: 35,
};

/** Weekly volume below which the distance becomes a survival exercise, in km */
const WEEKLY_VOLUME_FLOOR_KM: Record<RaceDistance, number> = {
  "5K": 20,
  "10K": 25,
  semi: 35,
  marathon: 50,
  trail_short: 40,
  trail: 50,
  ultra: 60,
};

function auditGoalFeasibility(
  plan: TrainingPlan,
  nextId: () => string,
): PlanFinding[] {
  const out: PlanFinding[] = [];
  const distance = plan.config.raceDistance;
  if (!distance || !plan.config.raceDate) return out;

  const lastWeek = plan.totalWeeks;
  const peakWeeklyKm = Math.max(0, ...plan.weeks.map((w) => w.targetKm ?? 0));
  const peakLongRunKm = Math.max(
    0,
    ...plan.weeks.flatMap((w) =>
      w.sessions
        .filter((s) => s.sessionType === "long_run")
        .map((s) => s.targetDistanceKm ?? 0),
    ),
  );

  // ── PLAN_TOO_SHORT_FOR_DISTANCE ────────────────────────────────────
  const recommended = RECOMMENDED_PLAN_WEEKS[distance];
  if (recommended && plan.totalWeeks < recommended.min) {
    out.push({
      id: nextId(),
      severity: "warning",
      code: "PLAN_TOO_SHORT_FOR_DISTANCE",
      weekNumber: 1,
      message: `Plan de ${plan.totalWeeks} semaines pour un ${RACE_DISTANCE_META[distance].label} : ${recommended.min} semaines minimum sont recommandées. La progression sera comprimée.`,
      messageEn: `${plan.totalWeeks}-week plan for a ${RACE_DISTANCE_META[distance].labelEn}: ${recommended.min} weeks are recommended as a minimum. The progression will be compressed.`,
      suggestion: `Repousser la course ou viser une distance plus courte pour cette échéance.`,
      suggestionEn: `Push the race back, or target a shorter distance for this date.`,
    });
  }

  // ── WEEKLY_VOLUME_TOO_LOW_FOR_DISTANCE ─────────────────────────────
  const volumeFloor = WEEKLY_VOLUME_FLOOR_KM[distance];
  if (peakWeeklyKm > 0 && peakWeeklyKm < volumeFloor) {
    out.push({
      id: nextId(),
      severity: "warning",
      code: "WEEKLY_VOLUME_TOO_LOW_FOR_DISTANCE",
      weekNumber: lastWeek,
      message: `Le plan culmine à ${peakWeeklyKm} km par semaine, en dessous des ~${volumeFloor} km attendus pour un ${RACE_DISTANCE_META[distance].label}. Ton volume de départ et la durée du plan ne permettent pas d'aller plus haut sans risque.`,
      messageEn: `The plan peaks at ${peakWeeklyKm} km per week, below the ~${volumeFloor} km expected for a ${RACE_DISTANCE_META[distance].labelEn}. Your starting volume and the time available do not allow more without added risk.`,
      suggestion: `Augmenter le nombre de jours de course par semaine, ou prévoir un cycle de préparation plus long.`,
      suggestionEn: `Add running days per week, or allow a longer preparation cycle.`,
    });
  }

  // ── LONG_RUN_TOO_SHORT_FOR_DISTANCE ────────────────────────────────
  const longRunFloor = LONG_RUN_TARGET_KM[distance];
  if (peakLongRunKm > 0 && peakLongRunKm < longRunFloor * 0.85) {
    out.push({
      id: nextId(),
      severity: "warning",
      code: "LONG_RUN_TOO_SHORT_FOR_DISTANCE",
      weekNumber: lastWeek,
      message: `La plus longue sortie du plan atteint ${peakLongRunKm} km, contre ~${longRunFloor} km souhaitables pour un ${RACE_DISTANCE_META[distance].label}. Prévois de marcher ou de ralentir sur la fin de course.`,
      messageEn: `The longest run in this plan reaches ${peakLongRunKm} km, against the ~${longRunFloor} km worth aiming for on a ${RACE_DISTANCE_META[distance].labelEn}. Expect to walk or slow down late in the race.`,
      suggestion: `Partir d'une sortie longue plus élevée, ou allonger la durée du plan.`,
      suggestionEn: `Start from a longer long run, or extend the plan.`,
    });
  }

  // ── GOAL_PACE_OUT_OF_REACH ─────────────────────────────────────────
  const { targetPaceMinKm, vma } = plan.config;
  if (targetPaceMinKm && vma) {
    const demand = goalDemandFactor(targetPaceMinKm, vma, distance);
    if (demand >= UNREALISTIC_DEMAND) {
      const required = vmaRequiredForPace(targetPaceMinKm, distance);
      out.push({
        id: nextId(),
        severity: "warning",
        code: "GOAL_PACE_OUT_OF_REACH",
        weekNumber: 1,
        message: `L'allure visée demande une VMA d'environ ${required.toFixed(1)} km/h, contre ${vma} km/h déclarée. Le plan pousse le volume au maximum de ce qui est sûr, mais l'écart reste important.`,
        messageEn: `The target pace calls for a VMA around ${required.toFixed(1)} km/h, against the ${vma} km/h you entered. The plan pushes volume as far as is safe, but the gap remains significant.`,
        suggestion: `Viser une allure plus prudente pour cette échéance, ou prévoir un cycle supplémentaire.`,
        suggestionEn: `Aim for a more conservative pace for this date, or plan an extra cycle.`,
      });
    }
  }

  return out;
}
