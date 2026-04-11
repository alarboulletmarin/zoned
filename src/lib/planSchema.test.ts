import { describe, expect, test } from "bun:test";

import type { TrainingPlan } from "@/types/plan";
import {
  CURRENT_PLAN_SCHEMA_VERSION,
  normalizeStoredPlan,
  parseImportedPlanJson,
} from "./planSchema";

function makeLegacyPlan(): TrainingPlan {
  return {
    id: "plan-1",
    config: {
      id: "config-legacy",
      raceDistance: "10K",
      raceDate: "2026-08-01",
      daysPerWeek: 4,
      createdAt: "2026-01-01T10:00:00.000Z",
    },
    weeks: [
      {
        weekNumber: 1,
        phase: "base",
        isRecoveryWeek: false,
        volumePercent: 100,
        sessions: [
          {
            dayOfWeek: 2,
            workoutId: "W-1",
            sessionType: "endurance",
            isKeySession: false,
            estimatedDurationMin: 45,
          },
        ],
      },
    ],
    totalWeeks: 99,
    phases: [{ phase: "base", startWeek: 1, endWeek: 1 }],
    name: "Plan 10K",
    nameEn: "10K plan",
    version: 2,
  };
}

describe("normalizeStoredPlan", () => {
  test("migrates legacy plans to the current schema and aligns identifiers", () => {
    const normalized = normalizeStoredPlan(makeLegacyPlan());

    expect(normalized).not.toBeNull();
    expect(normalized?.schemaVersion).toBe(CURRENT_PLAN_SCHEMA_VERSION);
    expect(normalized?.config.id).toBe("plan-1");
    expect(normalized?.totalWeeks).toBe(1);
  });

  test("rejects invalid plan payloads", () => {
    expect(normalizeStoredPlan({ id: "broken" })).toBeNull();
  });
});

describe("parseImportedPlanJson", () => {
  test("re-ids imported plans and refreshes timestamps", () => {
    const imported = parseImportedPlanJson(JSON.stringify(makeLegacyPlan()));

    expect(imported).not.toBeNull();
    expect(imported?.id).not.toBe("plan-1");
    expect(imported?.config.id).toBe(imported?.id);
    expect(imported?.config.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(imported?.schemaVersion).toBe(CURRENT_PLAN_SCHEMA_VERSION);
    expect(imported?.totalWeeks).toBe(1);
  });

  test("returns null for malformed JSON", () => {
    expect(parseImportedPlanJson("not-json")).toBeNull();
  });
});
