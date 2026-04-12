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
        message: "Aucune session de course trouvee dans le plan",
        messageEn: "No race day session found in the plan",
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
          message: `La course est en semaine ${week.weekNumber} au lieu de la derniere semaine (${plan.totalWeeks})`,
          messageEn: `Race day is in week ${week.weekNumber} instead of the last week (${plan.totalWeeks})`,
        });
      }
    }
  }

  // ── Per-week checks (3-8) ──────────────────────────────────────────
  for (let i = 0; i < plan.weeks.length; i++) {
    const week = plan.weeks[i];
    const prevWeek = i > 0 ? plan.weeks[i - 1] : null;

    const keySessions = week.sessions.filter((s) => s.isKeySession);
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
            message: `Semaine ${week.weekNumber} : 2 seances cles sur des jours consecutifs (${DAY_NAMES_FR[keySessions[a].dayOfWeek]} et ${DAY_NAMES_FR[keySessions[b].dayOfWeek]})`,
            messageEn: `Week ${week.weekNumber}: 2 key sessions on consecutive days (${DAY_NAMES_EN[keySessions[a].dayOfWeek]} and ${DAY_NAMES_EN[keySessions[b].dayOfWeek]})`,
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
            message: `Semaine ${week.weekNumber} : seance cle (${DAY_NAMES_FR[key.dayOfWeek]}) adjacente a la sortie longue (${DAY_NAMES_FR[lr.dayOfWeek]})`,
            messageEn: `Week ${week.weekNumber}: key session (${DAY_NAMES_EN[key.dayOfWeek]}) adjacent to long run (${DAY_NAMES_EN[lr.dayOfWeek]})`,
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
        message: `Semaine ${week.weekNumber} (recup) contient ${keySessions.length} seance(s) cle(s)`,
        messageEn: `Week ${week.weekNumber} (recovery) contains ${keySessions.length} key session(s)`,
      });
    }

    // ── Check 6: TAPER_WEEK_HEAVY ────────────────────────────────────
    if (week.phase === "taper" && week.volumePercent > 70) {
      findings.push({
        id: nextId(),
        severity: "warning",
        code: "TAPER_WEEK_HEAVY",
        weekNumber: week.weekNumber,
        message: `Semaine ${week.weekNumber} (affutage) a un volume de ${week.volumePercent}% (> 70%)`,
        messageEn: `Week ${week.weekNumber} (taper) has ${week.volumePercent}% volume (> 70%)`,
      });
    }

    // ── Check 7: VOLUME_JUMP_TOO_LARGE ───────────────────────────────
    if (
      prevWeek &&
      !prevWeek.isRecoveryWeek &&
      week.volumePercent > prevWeek.volumePercent * 1.2
    ) {
      findings.push({
        id: nextId(),
        severity: "warning",
        code: "VOLUME_JUMP_TOO_LARGE",
        weekNumber: week.weekNumber,
        message: `Semaine ${week.weekNumber} : saut de volume de ${prevWeek.volumePercent}% a ${week.volumePercent}% (> +20%)`,
        messageEn: `Week ${week.weekNumber}: volume jump from ${prevWeek.volumePercent}% to ${week.volumePercent}% (> +20%)`,
      });
    }

    // ── Check 8: EMPTY_WEEK ──────────────────────────────────────────
    if (week.sessions.length === 0) {
      findings.push({
        id: nextId(),
        severity: "info",
        code: "EMPTY_WEEK",
        weekNumber: week.weekNumber,
        message: `Semaine ${week.weekNumber} : aucune seance programmee`,
        messageEn: `Week ${week.weekNumber}: no sessions scheduled`,
      });
    }
  }

  return findings;
}
