import { describe, expect, test } from "bun:test";

import type { PlanSession } from "@/types/plan";
import type { WorkoutTemplate } from "@/types";
import {
  isSessionSubstitutable,
  estimatePlannedSessionTss,
  rankSubstitutionCandidates,
  findEquivalentWorkout,
} from "./substitute";

// ── Helpers ────────────────────────────────────────────────────────

function makeSession(overrides: Partial<PlanSession> = {}): PlanSession {
  return {
    dayOfWeek: 2,
    workoutId: "END-001",
    sessionType: "endurance",
    isKeySession: false,
    estimatedDurationMin: 60,
    ...overrides,
  };
}

function makeTemplate(overrides: Partial<WorkoutTemplate>): WorkoutTemplate {
  return {
    id: overrides.id ?? "CYC-TEST",
    name: "Test",
    nameEn: "Test",
    description: "",
    descriptionEn: "",
    category: "endurance",
    sessionType: "endurance",
    targetSystem: "aerobic_base",
    difficulty: "intermediate",
    typicalDuration: { min: 55, max: 65 },
    environment: { requiresHills: false, requiresTrack: false },
    warmupTemplate: [],
    mainSetTemplate: [],
    cooldownTemplate: [],
    coachingTips: [],
    coachingTipsEn: [],
    commonMistakes: [],
    commonMistakesEn: [],
    variationIds: [],
    selectionCriteria: {
      phases: ["base"],
      weekPositions: ["mid"],
      relativeLoad: "moderate",
      tags: [],
      priorityScore: 50,
    },
    ...overrides,
  };
}

// ── Eligibility ────────────────────────────────────────────────────

describe("isSessionSubstitutable", () => {
  test("allows recovery, endurance and long runs", () => {
    expect(isSessionSubstitutable(makeSession({ sessionType: "recovery" }))).toBe(true);
    expect(isSessionSubstitutable(makeSession({ sessionType: "endurance" }))).toBe(true);
    expect(isSessionSubstitutable(makeSession({ sessionType: "long_run" }))).toBe(true);
  });

  test("blocks quality running sessions", () => {
    expect(isSessionSubstitutable(makeSession({ sessionType: "threshold" }))).toBe(false);
    expect(isSessionSubstitutable(makeSession({ sessionType: "vo2max" }))).toBe(false);
    expect(isSessionSubstitutable(makeSession({ sessionType: "speed" }))).toBe(false);
    expect(isSessionSubstitutable(makeSession({ sessionType: "race_specific" }))).toBe(false);
  });
});

// ── TSS estimation ─────────────────────────────────────────────────

describe("estimatePlannedSessionTss", () => {
  test("uses loadScore when present", () => {
    const session = makeSession({ loadScore: 42 });
    expect(estimatePlannedSessionTss(session)).toBe(42);
  });

  test("falls back to zone-based estimate when loadScore is absent", () => {
    const session = makeSession({
      sessionType: "endurance",
      estimatedDurationMin: 60,
    });
    const tss = estimatePlannedSessionTss(session);
    expect(tss).toBeGreaterThan(0);
  });

  test("quality sessions yield higher TSS than easy at equal duration", () => {
    const easy = estimatePlannedSessionTss(
      makeSession({ sessionType: "recovery", estimatedDurationMin: 60 }),
    );
    const threshold = estimatePlannedSessionTss(
      makeSession({ sessionType: "threshold", estimatedDurationMin: 60 }),
    );
    expect(threshold).toBeGreaterThan(easy);
  });
});

// ── Candidate ranking ──────────────────────────────────────────────

describe("rankSubstitutionCandidates", () => {
  test("keeps only candidates of the target discipline", () => {
    const bikeCandidate = makeTemplate({
      id: "CYC-001",
      discipline: "cycling",
      sessionType: "endurance",
      typicalDuration: { min: 55, max: 65 },
    });
    const runCandidate = makeTemplate({
      id: "END-010",
      discipline: "running",
      sessionType: "endurance",
    });
    const ranked = rankSubstitutionCandidates({
      plannedSession: makeSession({ sessionType: "endurance", estimatedDurationMin: 60 }),
      targetDiscipline: "cycling",
      candidates: [bikeCandidate, runCandidate],
    });
    expect(ranked).toHaveLength(1);
    expect(ranked[0].workout.id).toBe("CYC-001");
  });

  test("ranks closest TSS match first", () => {
    const planned = makeSession({ sessionType: "endurance", estimatedDurationMin: 60 });

    const shortBike = makeTemplate({
      id: "CYC-A",
      discipline: "cycling",
      sessionType: "endurance",
      typicalDuration: { min: 50, max: 60 },
    });
    const longBike = makeTemplate({
      id: "CYC-B",
      discipline: "cycling",
      sessionType: "endurance",
      typicalDuration: { min: 115, max: 125 },
    });

    const ranked = rankSubstitutionCandidates({
      plannedSession: planned,
      targetDiscipline: "cycling",
      candidates: [longBike, shortBike],
    });

    expect(ranked[0].workout.id).toBe("CYC-A");
  });

  test("applies max deviation cutoff", () => {
    const planned = makeSession({ sessionType: "endurance", estimatedDurationMin: 60 });
    const farOff = makeTemplate({
      id: "CYC-FAR",
      discipline: "cycling",
      sessionType: "vo2max",
      typicalDuration: { min: 120, max: 130 },
    });
    const ranked = rankSubstitutionCandidates({
      plannedSession: planned,
      targetDiscipline: "cycling",
      candidates: [farOff],
      options: { maxDeviation: 0.10 },
    });
    expect(ranked).toHaveLength(0);
  });

  test("tie-breaks on priority score when match distance is equal", () => {
    const planned = makeSession({ sessionType: "endurance", estimatedDurationMin: 60 });

    const lowPriority = makeTemplate({
      id: "CYC-LOW",
      discipline: "cycling",
      sessionType: "endurance",
      typicalDuration: { min: 55, max: 65 },
      selectionCriteria: {
        phases: ["base"],
        weekPositions: ["mid"],
        relativeLoad: "moderate",
        tags: [],
        priorityScore: 40,
      },
    });
    const highPriority = makeTemplate({
      id: "CYC-HIGH",
      discipline: "cycling",
      sessionType: "endurance",
      typicalDuration: { min: 55, max: 65 },
      selectionCriteria: {
        phases: ["base"],
        weekPositions: ["mid"],
        relativeLoad: "moderate",
        tags: [],
        priorityScore: 95,
      },
    });
    const ranked = rankSubstitutionCandidates({
      plannedSession: planned,
      targetDiscipline: "cycling",
      candidates: [lowPriority, highPriority],
    });
    expect(ranked[0].workout.id).toBe("CYC-HIGH");
  });
});

// ── High-level helper ──────────────────────────────────────────────

describe("findEquivalentWorkout", () => {
  test("returns null for quality sessions", () => {
    const result = findEquivalentWorkout({
      plannedSession: makeSession({ sessionType: "threshold" }),
      targetDiscipline: "cycling",
      candidates: [
        makeTemplate({ id: "CYC-X", discipline: "cycling", sessionType: "endurance" }),
      ],
    });
    expect(result).toBeNull();
  });

  test("returns null when no candidate lies within tolerance", () => {
    const result = findEquivalentWorkout({
      plannedSession: makeSession({ sessionType: "endurance", estimatedDurationMin: 45 }),
      targetDiscipline: "cycling",
      candidates: [
        makeTemplate({
          id: "CYC-MEGA",
          discipline: "cycling",
          sessionType: "vo2max",
          typicalDuration: { min: 150, max: 180 },
        }),
      ],
    });
    expect(result).toBeNull();
  });

  test("picks the best match for an easy endurance run", () => {
    const result = findEquivalentWorkout({
      plannedSession: makeSession({ sessionType: "endurance", estimatedDurationMin: 60 }),
      targetDiscipline: "cycling",
      candidates: [
        makeTemplate({
          id: "CYC-OK",
          discipline: "cycling",
          sessionType: "endurance",
          typicalDuration: { min: 55, max: 65 },
        }),
      ],
    });
    expect(result).not.toBeNull();
    expect(result!.workout.id).toBe("CYC-OK");
    expect(result!.matchDistance).toBeLessThan(0.2);
  });
});
