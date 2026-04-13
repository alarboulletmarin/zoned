import type { TrainingPlan } from "@/types/plan";

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
        if (
          Math.abs(keySessions[a].dayOfWeek - keySessions[b].dayOfWeek) <= 1
        ) {
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
        if (Math.abs(key.dayOfWeek - lr.dayOfWeek) <= 1) {
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
    if (week.phase === "taper" && week.volumePercent > 70) {
      findings.push({
        id: nextId(),
        severity: "warning",
        code: "TAPER_WEEK_HEAVY",
        weekNumber: week.weekNumber,
        message: `Semaine ${week.weekNumber} (affûtage) : volume à ${week.volumePercent}%, trop élevé pour un affûtage efficace. Réduire sous 70% pour arriver frais le jour J.`,
        messageEn: `Week ${week.weekNumber} (taper): volume at ${week.volumePercent}%, too high for effective tapering. Reduce below 70% to arrive fresh on race day.`,
        suggestion: `Supprimer une séance ou réduire les durées pour passer sous 70% de volume.`,
        suggestionEn: `Remove a session or reduce durations to get below 70% volume.`,
        fixable: true,
      });
    }

    // ── Check 7: VOLUME_JUMP_TOO_LARGE ───────────────────────────────
    // Skip when previous week is recovery or has an intermediate race (expected volume dip).
    // Skip when both weeks are at low volume (< 55%) — at such low absolute volumes
    // (e.g., return-from-injury plans), relative jumps of 25% represent tiny absolute
    // km increases and pose negligible injury risk.
    // Threshold: 21% to absorb rounding artifacts on integer volumePercent values.
    if (
      prevWeek &&
      !prevWeek.isRecoveryWeek &&
      !prevWeek.intermediateRace &&
      prevWeek.volumePercent > 0 &&
      !(prevWeek.volumePercent < 55 && week.volumePercent < 55) &&
      week.volumePercent > prevWeek.volumePercent * 1.21
    ) {
      const pctIncrease = Math.round((week.volumePercent / prevWeek.volumePercent - 1) * 100);
      findings.push({
        id: nextId(),
        severity: "warning",
        code: "VOLUME_JUMP_TOO_LARGE",
        weekNumber: week.weekNumber,
        fixable: true,
        message: `Semaine ${week.weekNumber} : volume passe de ${prevWeek.volumePercent}% à ${week.volumePercent}% (+${pctIncrease}%). Une augmentation > 20% par semaine augmente le risque de blessure.`,
        messageEn: `Week ${week.weekNumber}: volume jumps from ${prevWeek.volumePercent}% to ${week.volumePercent}% (+${pctIncrease}%). Increasing by more than 20% per week raises injury risk.`,
        suggestion: `Réduire le volume de S${week.weekNumber} à ~${Math.round(prevWeek.volumePercent * 1.15)}% ou ajouter une semaine intermédiaire.`,
        suggestionEn: `Reduce W${week.weekNumber} volume to ~${Math.round(prevWeek.volumePercent * 1.15)}% or add a transition week.`,
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
  }

  return findings;
}
