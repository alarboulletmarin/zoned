/**
 * Characterisation tests for the shared-week wire format.
 *
 * These pin the exact bytes `encodeSharedWeek` produces. Links people have
 * already sent must keep decoding forever, so any change here is a breaking
 * change, not a refactor. The golden below is derived from the format spec
 * (`{v, n, c?, s}` with fixed-position session tuples), not from the
 * implementation, if the two disagree, the implementation is what moved.
 */

import { describe, expect, mock, test } from "bun:test";

import type { TrainingPlan } from "@/types/plan";
import { SESSION_TYPE_CODES } from "@/lib/share/codes";

// `weekShare` pulls `createEmptyWeekPlan` from weekToPlan, which reaches the
// i18n entry point, and that module uses `import.meta.glob`, a Vite-only API
// that throws under `bun test`. Stubbing i18n itself (the way every other lib
// test does) keeps the real weekToPlan loadable, which matters because a
// module mock is process-wide: a stub of weekToPlan here would replace it for
// the other test files of the run too.
mock.module("@/i18n", () => ({ default: { language: "fr" } }));

const {
  decodeSharedWeek,
  encodeSharedWeek,
  isSharedSessionKnown,
  sharedWeekSessions,
  sharedWeekUrl,
} = await import("./weekShare");

/** Minimal plan shaped like a saved week, only the fields the encoder reads. */
function buildWeek(): TrainingPlan {
  return {
    id: "week-1",
    config: {
      id: "week-1",
      createdAt: "2026-07-25T00:00:00.000Z",
      daysPerWeek: 2,
      isSingleWeek: true,
      weekCategory: "build",
    },
    weeks: [
      {
        weekNumber: 1,
        phase: "build",
        isRecoveryWeek: false,
        volumePercent: 100,
        sessions: [
          {
            dayOfWeek: 0,
            workoutId: "REC-001",
            sessionType: "recovery",
            isKeySession: false,
            estimatedDurationMin: 45,
          },
          {
            dayOfWeek: 2,
            workoutId: "VMA-012",
            sessionType: "vo2max",
            isKeySession: true,
            estimatedDurationMin: 60,
          },
        ],
      },
    ],
    totalWeeks: 1,
    phases: [],
    name: "Ma semaine",
    nameEn: "My week",
  } as TrainingPlan;
}

describe("wire format", () => {
  test("encodes to the exact bytes the format specifies", () => {
    expect(encodeSharedWeek(buildWeek(), "Ma semaine")).toBe(
      "eyJ2IjoxLCJuIjoiTWEgc2VtYWluZSIsImMiOiJidWlsZCIsInMiOltbMCwiUkVDLTAwMSIsMCw0NV0sWzIsIlZNQS0wMTIiLDQsNjAsMV1dfQ",
    );
  });

  test("omits the category when the week has none", () => {
    const plan = buildWeek();
    delete plan.config.weekCategory;
    const payload = decodeSharedWeek(encodeSharedWeek(plan, "Ma semaine"))!;
    expect(payload).not.toHaveProperty("c");
  });

  test("drops the key-session flag when false, keeps it when true", () => {
    const payload = decodeSharedWeek(encodeSharedWeek(buildWeek(), "Ma semaine"))!;
    expect(payload.s[0]).toHaveLength(4);
    expect(payload.s[1]).toEqual([2, "VMA-012", 4, 60, 1]);
  });

  test("builds a /weeks/shared link", () => {
    expect(sharedWeekUrl(buildWeek(), "Ma semaine")).toMatch(
      /\/weeks\/shared\?d=eyJ2Ijox/,
    );
  });
});

describe("an activity of the week", () => {
  const withCommute = (): TrainingPlan => {
    const plan = buildWeek();
    plan.weeks[0].sessions.push({
      dayOfWeek: 4,
      workoutId: "__activity_commute__",
      discipline: "cycling",
      sessionType: "cycling",
      isKeySession: false,
      estimatedDurationMin: 45,
      intensity: "moderate",
    });
    return plan;
  };

  test("travels with its effort in a sixth slot, the key flag pinned to 0", () => {
    const payload = decodeSharedWeek(encodeSharedWeek(withCommute(), "Ma semaine"))!;
    expect(payload.s[2]).toEqual([4, "__activity_commute__", 11, 45, 0, 1]);
  });

  test("comes back as the same session, effort included", () => {
    const payload = decodeSharedWeek(encodeSharedWeek(withCommute(), "Ma semaine"))!;
    expect(sharedWeekSessions(payload)[2]).toEqual({
      dayOfWeek: 4,
      workoutId: "__activity_commute__",
      sessionType: "cycling",
      isKeySession: false,
      estimatedDurationMin: 45,
      intensity: "moderate",
    });
  });

  test("a loose session and a fixed one with km take the later positions", () => {
    const plan = buildWeek();
    plan.weeks[0].sessions[0].precision = "loose";
    plan.weeks[0].sessions[1].precision = "fixed";
    plan.weeks[0].sessions[1].targetDistanceKm = 8.5;
    const payload = decodeSharedWeek(encodeSharedWeek(plan, "Ma semaine"))!;
    expect(payload.s[0]).toEqual([0, "REC-001", 0, 45, 0, -1, 1]);
    expect(payload.s[1]).toEqual([2, "VMA-012", 4, 60, 1, -1, 0, 85]);
    const back = sharedWeekSessions(payload);
    expect(back[0].precision).toBe("loose");
    expect(back[0].targetDistanceKm).toBeUndefined();
    expect(back[1].precision).toBeUndefined();
    expect(back[1].targetDistanceKm).toBe(8.5);
  });

  test("an unknown effort code is dropped, the session is kept", () => {
    const encoded = Buffer.from(
      JSON.stringify({ v: 1, n: "x", s: [[0, "__activity_cycling__", 11, 45, 0, 9]] }),
    ).toString("base64url");
    const payload = decodeSharedWeek(encoded)!;
    expect(payload.s[0]).toEqual([0, "__activity_cycling__", 11, 45]);
  });

  test("is known to any recipient, a commute is nobody's custom workout", () => {
    expect(isSharedSessionKnown("__activity_commute__", new Set())).toBe(true);
    expect(isSharedSessionKnown("REC-001", new Set())).toBe(false);
    expect(isSharedSessionKnown("REC-001", new Set(["REC-001"]))).toBe(true);
  });
});

describe("round-trip", () => {
  test("restores sessions sorted Mon→Sun", () => {
    const payload = decodeSharedWeek(encodeSharedWeek(buildWeek(), "Ma semaine"))!;
    expect(sharedWeekSessions(payload)).toEqual([
      {
        dayOfWeek: 0,
        workoutId: "REC-001",
        sessionType: "recovery",
        isKeySession: false,
        estimatedDurationMin: 45,
      },
      {
        dayOfWeek: 2,
        workoutId: "VMA-012",
        sessionType: "vo2max",
        isKeySession: true,
        estimatedDurationMin: 60,
      },
    ]);
  });

  test("survives accented week names (UTF-8, not latin1)", () => {
    const name = "Ma semaine spécifique, côtes";
    expect(decodeSharedWeek(encodeSharedWeek(buildWeek(), name))!.n).toBe(name);
  });
});

describe("decodeSharedWeek rejects bad input", () => {
  const encode = (payload: unknown) =>
    Buffer.from(JSON.stringify(payload)).toString("base64url");
  const valid = { v: 1, n: "x", s: [[0, "REC-001", 0, 45]] };

  test.each([
    ["a wrong version", encode({ ...valid, v: 2 })],
    ["a blank name", encode({ ...valid, n: "   " })],
    ["no sessions", encode({ ...valid, s: [] })],
    ["a non-array session list", encode({ ...valid, s: "nope" })],
    ["an out-of-range day", encode({ ...valid, s: [[7, "REC-001", 0, 45]] })],
    ["an empty workout id", encode({ ...valid, s: [[0, "", 0, 45]] })],
    ["an unknown session-type code", encode({ ...valid, s: [[0, "REC-001", 99, 45]] })],
    ["a negative duration", encode({ ...valid, s: [[0, "REC-001", 0, -5]] })],
    ["garbage", "!!!not-base64!!!"],
  ])("returns null for %s", (_label, encoded) => {
    expect(decodeSharedWeek(encoded)).toBeNull();
  });

  test("ignores an unknown category rather than failing", () => {
    const payload = decodeSharedWeek(encode({ ...valid, c: "bogus" }));
    expect(payload).not.toBeNull();
    expect(payload).not.toHaveProperty("c");
  });
});

describe("session-type codes", () => {
  test("match the shared table, the indexes are baked into live links", () => {
    // weekShare must agree with share/codes.ts entry for entry, or the same
    // link decodes differently depending on which table is consulted.
    expect(SESSION_TYPE_CODES[0]).toBe("recovery");
    expect(SESSION_TYPE_CODES[4]).toBe("vo2max");
    expect(SESSION_TYPE_CODES).toHaveLength(17);

    const payload = decodeSharedWeek(encodeSharedWeek(buildWeek(), "Ma semaine"))!;
    expect(sharedWeekSessions(payload)[1].sessionType).toBe(SESSION_TYPE_CODES[4]);
  });
});
