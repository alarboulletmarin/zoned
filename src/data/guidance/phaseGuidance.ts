import type { TrainingPhase } from "@/types";
import type { PlanSession } from "@/types/plan";

// ── Types ──────────────────────────────────────────────────────────

export interface ChecklistItem {
  id: string;
  labelKey: string; // i18n key in plan namespace, e.g. "guidance.longRun"
  /** Only set when labelKey uses {{count}} for pluralization. */
  count?: number;
  matchFn: (sessions: PlanSession[]) => boolean;
}

export interface PhaseGuidance {
  descriptionKey: string; // i18n key, e.g. "guidance.phaseBase"
  checklist: (daysPerWeek: number, isRecoveryWeek: boolean) => ChecklistItem[];
  tipIds: string[]; // IDs from src/data/tips/data.ts
}

// ── Helpers ────────────────────────────────────────────────────────

/** True when a session is a "real" running session (not cross-training activity). */
function isRunning(s: PlanSession): boolean {
  return !s.workoutId?.startsWith("__activity_");
}

function hasSessionType(
  sessions: PlanSession[],
  types: string[],
): boolean {
  return sessions.some(
    (s) => isRunning(s) && types.includes(s.sessionType),
  );
}

function countSessionType(
  sessions: PlanSession[],
  types: string[],
): number {
  return sessions.filter(
    (s) => isRunning(s) && types.includes(s.sessionType),
  ).length;
}

function easyRunCount(daysPerWeek: number): number {
  return daysPerWeek <= 4 ? 1 : daysPerWeek <= 5 ? 2 : 3;
}

/** Recovery week checklist: only easy runs + rest day. */
function recoveryChecklist(daysPerWeek: number): ChecklistItem[] {
  const count = daysPerWeek - 1;
  return [
    {
      id: "easy_run",
      labelKey: count === 1 ? "guidance.easyRun" : "guidance.easyRuns",
      count,
      matchFn: (sessions) =>
        countSessionType(sessions, ["endurance", "recovery"]) >= count,
    },
    {
      id: "rest_day",
      labelKey: "guidance.restDay",
      matchFn: (sessions) =>
        sessions.filter((s) => isRunning(s)).length < daysPerWeek,
    },
  ];
}

// ── Phase guidance map ─────────────────────────────────────────────

export const PHASE_GUIDANCE: Record<TrainingPhase, PhaseGuidance> = {
  // ── Base phase ───────────────────────────────────────────────────
  base: {
    descriptionKey: "guidance.phaseBase",
    tipIds: ["training-001", "training-010", "training-007"],
    checklist(daysPerWeek, isRecoveryWeek) {
      if (isRecoveryWeek) return recoveryChecklist(daysPerWeek);

      const count = easyRunCount(daysPerWeek);
      const items: ChecklistItem[] = [
        {
          id: "long_run",
          labelKey: "guidance.longRun",
          matchFn: (sessions) => hasSessionType(sessions, ["long_run"]),
        },
        {
          id: "quality_1",
          labelKey: "guidance.qualityBase",
          matchFn: (sessions) =>
            hasSessionType(sessions, ["fartlek", "hills"]),
        },
        {
          id: "easy_run",
          labelKey: count === 1 ? "guidance.easyRun" : "guidance.easyRuns",
          count,
          matchFn: (sessions) =>
            countSessionType(sessions, ["endurance", "recovery"]) >= count,
        },
        {
          id: "rest_day",
          labelKey: "guidance.restDay",
          matchFn: (sessions) =>
            sessions.filter((s) => isRunning(s)).length < daysPerWeek,
        },
      ];

      if (daysPerWeek >= 6) {
        items.splice(3, 0, {
          id: "recovery_run",
          labelKey: "guidance.recoveryRun",
          matchFn: (sessions) => hasSessionType(sessions, ["recovery"]),
        });
      }

      return items;
    },
  },

  // ── Build phase ──────────────────────────────────────────────────
  build: {
    descriptionKey: "guidance.phaseBuild",
    tipIds: ["training-003", "training-005", "training-006"],
    checklist(daysPerWeek, isRecoveryWeek) {
      if (isRecoveryWeek) return recoveryChecklist(daysPerWeek);

      const qualityTypes = [
        "vo2max",
        "threshold",
        "hills",
        "fartlek",
        "speed",
      ];
      const count = easyRunCount(daysPerWeek);
      const items: ChecklistItem[] = [
        {
          id: "long_run",
          labelKey: "guidance.longRun",
          matchFn: (sessions) => hasSessionType(sessions, ["long_run"]),
        },
        {
          id: "quality_1",
          labelKey: "guidance.qualityBuild",
          matchFn: (sessions) =>
            hasSessionType(sessions, ["vo2max", "threshold", "speed"]),
        },
        {
          id: "easy_run",
          labelKey: count === 1 ? "guidance.easyRun" : "guidance.easyRuns",
          count,
          matchFn: (sessions) =>
            countSessionType(sessions, ["endurance", "recovery"]) >= count,
        },
        {
          id: "rest_day",
          labelKey: "guidance.restDay",
          matchFn: (sessions) =>
            sessions.filter((s) => isRunning(s)).length < daysPerWeek,
        },
      ];

      if (daysPerWeek >= 5) {
        items.splice(2, 0, {
          id: "quality_2",
          labelKey: "guidance.qualityBuild2",
          matchFn: (sessions) =>
            countSessionType(sessions, qualityTypes) >= 2,
        });
      }

      return items;
    },
  },

  // ── Peak phase ───────────────────────────────────────────────────
  peak: {
    descriptionKey: "guidance.phasePeak",
    tipIds: ["training-011", "training-014", "training-005"],
    checklist(daysPerWeek, isRecoveryWeek) {
      if (isRecoveryWeek) return recoveryChecklist(daysPerWeek);

      const qualityTypes = [
        "threshold",
        "race_specific",
        "tempo",
        "vo2max",
        "speed",
      ];
      const count = easyRunCount(daysPerWeek);
      const items: ChecklistItem[] = [
        {
          id: "long_run",
          labelKey: "guidance.longRun",
          matchFn: (sessions) => hasSessionType(sessions, ["long_run"]),
        },
        {
          id: "quality_1",
          labelKey: "guidance.qualityPeak",
          matchFn: (sessions) =>
            hasSessionType(sessions, [
              "threshold",
              "race_specific",
              "tempo",
            ]),
        },
        {
          id: "easy_run",
          labelKey: count === 1 ? "guidance.easyRun" : "guidance.easyRuns",
          count,
          matchFn: (sessions) =>
            countSessionType(sessions, ["endurance", "recovery"]) >= count,
        },
        {
          id: "rest_day",
          labelKey: "guidance.restDay",
          matchFn: (sessions) =>
            sessions.filter((s) => isRunning(s)).length < daysPerWeek,
        },
      ];

      if (daysPerWeek >= 5) {
        items.splice(2, 0, {
          id: "quality_2",
          labelKey: "guidance.qualityPeak2",
          matchFn: (sessions) =>
            countSessionType(sessions, qualityTypes) >= 2,
        });
      }

      return items;
    },
  },

  // ── Taper phase ──────────────────────────────────────────────────
  taper: {
    descriptionKey: "guidance.phaseTaper",
    tipIds: ["training-014", "recovery-001", "recovery-003"],
    checklist(daysPerWeek) {
      const count = Math.max(1, daysPerWeek - 2);
      return [
        {
          id: "quality_taper",
          labelKey: "guidance.qualityTaper",
          matchFn: (sessions) =>
            hasSessionType(sessions, ["race_specific", "tempo"]),
        },
        {
          id: "easy_run",
          labelKey: count === 1 ? "guidance.easyRun" : "guidance.easyRuns",
          count,
          matchFn: (sessions) =>
            countSessionType(sessions, ["endurance", "recovery"]) >= count,
        },
        {
          id: "rest_day",
          labelKey: "guidance.restDay",
          matchFn: (sessions) =>
            sessions.filter((s) => isRunning(s)).length < daysPerWeek,
        },
      ];
    },
  },

  // ── Recovery phase ───────────────────────────────────────────────
  recovery: {
    descriptionKey: "guidance.phaseRecovery",
    tipIds: ["recovery-007", "recovery-009", "recovery-006"],
    checklist(daysPerWeek) {
      return recoveryChecklist(daysPerWeek);
    },
  },
};
