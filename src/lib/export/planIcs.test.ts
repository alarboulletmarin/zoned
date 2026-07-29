/**
 * Export layer: plan → ICS.
 *
 * `src/lib/export/` had no tests at all, so the running/strength refactor of
 * issue #127 could not satisfy the "tests pass before AND after" rule. These
 * tests pin the observable output of `exportPlanToICS` (the calendar text a
 * user actually imports) rather than the private helpers, so they keep biting
 * whatever the internals become.
 *
 * What is exercised on purpose:
 *  - the running / strength discrimination (`isRunningWorkout` vs
 *    `isStrengthWorkout`), including that neither kind's rendering leaks into
 *    the other;
 *  - a cycling template (`CYC-*`), which is running-SHAPED and must therefore
 *    take the zone-block path even though it is not a run;
 *  - an unresolvable `workoutId`, which must degrade to a bare event instead of
 *    throwing;
 *  - empty phase arrays, which must emit no phase section at all.
 *
 * `@/i18n` is stubbed because it is a Vite module (`import.meta.glob`) that
 * cannot load under `bun test`; the stub returns the raw key, which makes the
 * separators easy to assert on without freezing French copy into the test.
 * Nothing else is mocked: the real `ics` library produces the real calendar.
 */

import { beforeAll, describe, expect, mock, test } from "bun:test";

import type { PlanSession, TrainingPlan } from "@/types/plan";
import type { AnyWorkoutTemplate, WorkoutTemplate } from "@/types";
import type { StrengthBlock, StrengthWorkoutTemplate } from "@/types/strength";
import { isRunningWorkout, isStrengthWorkout } from "@/lib/workoutTemplate";

mock.module("@/i18n", () => ({
  default: {
    language: "fr",
    t: (key: string) => key,
  },
}));

const { getWorkoutById } = await import("@/data/workouts");
const { exportPlanToICS } = await import("./planIcs");

// ── Catalogue ids, resolved from the real data so the fixtures stay honest ──

const RUNNING_ID = "END-001"; // warmup + main + cooldown, all zone blocks
const STRENGTH_ID = "STR-008"; // 2 warmup + 4 main + 1 cooldown exercise blocks
const CYCLING_ID = "CYC-001"; // running-shaped, empty warmup AND cooldown
const MISSING_ID = "END-000-not-in-catalogue";

const templates: Record<string, AnyWorkoutTemplate> = {};

beforeAll(async () => {
  for (const id of [RUNNING_ID, STRENGTH_ID, CYCLING_ID]) {
    const template = await getWorkoutById(id);
    if (!template) throw new Error(`fixture id ${id} vanished from the catalogue`);
    templates[id] = template;
  }
});

/** Fixture accessor that also asserts the catalogue entry is of the kind we expect. */
function running(id: string): WorkoutTemplate {
  const template = templates[id];
  if (!isRunningWorkout(template)) throw new Error(`${id} is not a running template`);
  return template;
}

function strengthOf(id: string): StrengthWorkoutTemplate {
  const template = templates[id];
  if (!isStrengthWorkout(template)) throw new Error(`${id} is not a strength template`);
  return template;
}

// ── Fixtures ────────────────────────────────────────────────────────

function session(overrides: Partial<PlanSession> & Pick<PlanSession, "dayOfWeek" | "workoutId">): PlanSession {
  return {
    sessionType: "endurance",
    isKeySession: false,
    estimatedDurationMin: 50,
    ...overrides,
  };
}

function makePlan(sessions: PlanSession[]): TrainingPlan {
  return {
    id: "plan-ics-test",
    name: "Plan test ICS",
    nameEn: "ICS test plan",
    totalWeeks: 1,
    phases: [{ phase: "base", startWeek: 1, endWeek: 1 }],
    config: {
      id: "cfg-ics-test",
      daysPerWeek: 4,
      createdAt: "2026-01-05T00:00:00.000Z",
      startDate: "2026-01-05", // a Monday
      raceDistance: "10K",
    },
    weeks: [
      {
        weekNumber: 1,
        phase: "base",
        isRecoveryWeek: false,
        volumePercent: 100,
        sessions,
      },
    ],
  };
}

// ── Harness ─────────────────────────────────────────────────────────

/**
 * `exportPlanToICS` ends on a DOM download. Bun has no `document`, so we install
 * a minimal one and intercept the object URL to get at the calendar text.
 */
async function runExport(
  plan: TrainingPlan,
  workoutNames: Record<string, string>,
  workoutTemplates: Record<string, AnyWorkoutTemplate>,
): Promise<{ ics: string; filename: string }> {
  let blob: Blob | null = null;
  let filename = "";

  const anchor = { href: "", download: "", click: () => {} };
  const fakeDocument = {
    createElement: () => anchor,
    body: { appendChild: () => {}, removeChild: () => {} },
  };

  const realCreate = URL.createObjectURL;
  const realRevoke = URL.revokeObjectURL;
  Object.defineProperty(globalThis, "document", { value: fakeDocument, configurable: true });
  URL.createObjectURL = (obj: Blob | MediaSource) => {
    blob = obj as Blob;
    return "blob:zoned-test";
  };
  URL.revokeObjectURL = () => {};

  try {
    exportPlanToICS(plan, workoutNames, workoutTemplates);
    filename = anchor.download;
  } finally {
    URL.createObjectURL = realCreate;
    URL.revokeObjectURL = realRevoke;
    Reflect.deleteProperty(globalThis, "document");
  }

  if (!blob) return { ics: "", filename };
  return { ics: unfold(await (blob as Blob).text()), filename };
}

/**
 * RFC 5545 folds every line past 75 octets onto a continuation line starting
 * with a space. Undo that so each property is one line again; escaping is
 * undone later, per property, by `prop`.
 */
function unfold(ics: string): string {
  return ics.replace(/\r\n[ \t]/g, "");
}

/** Split a calendar into its VEVENT bodies, in document order. */
function events(ics: string): string[] {
  return ics
    .split("BEGIN:VEVENT")
    .slice(1)
    .map((chunk) => chunk.split("END:VEVENT")[0]);
}

/** The unescaped value of a single property inside one VEVENT. */
function prop(event: string, name: string): string {
  const match = event.match(new RegExp(`^${name}:(.*)$`, "m"));
  if (!match) return "";
  return match[1]
    .trimEnd()
    .replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";");
}

const WARMUP_SEP = "common:export.planIcs.warmupSep";
const MAIN_SEP = "common:export.planIcs.mainSetSep";
const COOLDOWN_SEP = "common:export.planIcs.cooldownSep";
const TIPS_SEP = "common:export.planIcs.tips";

// ── Tests ───────────────────────────────────────────────────────────

describe("exportPlanToICS: one event per session", () => {
  test("emits every session, resolvable or not", async () => {
    const plan = makePlan([
      session({ dayOfWeek: 0, workoutId: RUNNING_ID }),
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
      session({ dayOfWeek: 4, workoutId: CYCLING_ID, sessionType: "recovery", estimatedDurationMin: 35 }),
      session({ dayOfWeek: 6, workoutId: MISSING_ID }),
    ]);

    const { ics, filename } = await runExport(plan, { [RUNNING_ID]: "Endurance fondamentale" }, templates);

    expect(events(ics)).toHaveLength(4);
    expect(filename).toBe("plan-10K-plan-ics-test.ics");
  });

  test("places each session on its own day, counted from the plan Monday", async () => {
    const plan = makePlan([
      session({ dayOfWeek: 0, workoutId: RUNNING_ID }),
      session({ dayOfWeek: 6, workoutId: RUNNING_ID }),
    ]);

    const [monday, sunday] = events((await runExport(plan, {}, templates)).ics);

    expect(prop(monday, "DTSTART;VALUE=DATE")).toBe("20260105");
    expect(prop(sunday, "DTSTART;VALUE=DATE")).toBe("20260111");
  });
});

describe("exportPlanToICS: running sessions", () => {
  test("renders every zone block of every phase, with its duration and zone", async () => {
    const plan = makePlan([session({ dayOfWeek: 0, workoutId: RUNNING_ID })]);
    const [event] = events((await runExport(plan, { [RUNNING_ID]: "Endurance fondamentale" }, templates)).ics);
    const description = prop(event, "DESCRIPTION");

    expect(description).toContain(WARMUP_SEP);
    expect(description).toContain("• Marche rapide ou footing très lent (5min) [Z1]");
    expect(description).toContain(MAIN_SEP);
    expect(description).toContain("• Course continue en Z2 (40min) [Z2]");
    expect(description).toContain(COOLDOWN_SEP);
    expect(description).toContain("• Retour au calme progressif (5min) [Z1]");
  });

  test("tags the title with the dominant zone and files the event under Running", async () => {
    const plan = makePlan([session({ dayOfWeek: 0, workoutId: RUNNING_ID })]);
    const [event] = events((await runExport(plan, { [RUNNING_ID]: "Endurance fondamentale" }, templates)).ics);

    expect(prop(event, "SUMMARY")).toBe("Endurance fondamentale - 50min [Z2]");
    expect(prop(event, "CATEGORIES")).toContain("Running");
    expect(prop(event, "CATEGORIES")).not.toContain("Strength");
  });

  test("no strength rendering leaks in", async () => {
    const plan = makePlan([session({ dayOfWeek: 0, workoutId: RUNNING_ID })]);
    const [event] = events((await runExport(plan, {}, templates)).ics);

    // "[Renfo]" is the strength title tag; a zone-block workout must never get it.
    expect(prop(event, "SUMMARY")).not.toContain("[Renfo]");
    // Exercise ids are the strength block currency and have no business here.
    expect(prop(event, "DESCRIPTION")).not.toContain("EX-");
  });
});

describe("exportPlanToICS: strength sessions", () => {
  test("renders the session description and its coaching tips, not zone blocks", async () => {
    const plan = makePlan([
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
    ]);
    const [event] = events((await runExport(plan, { [STRENGTH_ID]: "Core stability coureur" }, templates)).ics);
    const description = prop(event, "DESCRIPTION");
    const strength = strengthOf(STRENGTH_ID);

    expect(description).toContain(strength.description);
    expect(description).toContain(TIPS_SEP);
    for (const tip of strength.coachingTips) {
      expect(description).toContain(`• ${tip}`);
    }

    // The three running phase separators must be absent: a strength template has
    // no zone blocks and the code must not go looking for them.
    expect(description).not.toContain(WARMUP_SEP);
    expect(description).not.toContain(MAIN_SEP);
    expect(description).not.toContain(COOLDOWN_SEP);
  });

  test("tags the title [Renfo], never a zone, and files the event under Strength", async () => {
    const plan = makePlan([
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
    ]);
    const [event] = events((await runExport(plan, { [STRENGTH_ID]: "Core stability coureur" }, templates)).ics);

    expect(prop(event, "SUMMARY")).toBe("Core stability coureur - 30min [Renfo]");
    expect(prop(event, "SUMMARY")).not.toMatch(/\[Z\d\]/);
    expect(prop(event, "CATEGORIES")).toContain("Strength");
    expect(prop(event, "CATEGORIES")).not.toContain("Running");
  });

  test("the bullet count equals the coaching-tip count, so no exercise blocks are listed", async () => {
    const plan = makePlan([
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
    ]);
    const [event] = events((await runExport(plan, {}, templates)).ics);
    const strength = strengthOf(STRENGTH_ID);
    const bullets = prop(event, "DESCRIPTION").split("\n").filter((line) => line.startsWith("•"));

    expect(bullets).toHaveLength(strength.coachingTips.length);
  });
});

describe("exportPlanToICS: cycling sessions", () => {
  test("a CYC- template takes the zone-block path, not the strength one", async () => {
    const plan = makePlan([
      session({ dayOfWeek: 4, workoutId: CYCLING_ID, sessionType: "recovery", estimatedDurationMin: 35 }),
    ]);
    const [event] = events((await runExport(plan, { [CYCLING_ID]: "Sortie récupération" }, templates)).ics);
    const description = prop(event, "DESCRIPTION");

    expect(prop(event, "SUMMARY")).toBe("Sortie récupération - 35min [Z1]");
    expect(description).toContain(MAIN_SEP);
    expect(description).toContain("• Pédalage souple en Z1, cadence 90-100 rpm (35min) [Z1]");
    expect(prop(event, "CATEGORIES")).not.toContain("Strength");
  });

  test("empty warmup and cooldown arrays emit no phase section", async () => {
    // Guard the premise: this test is only meaningful while CYC-001 ships with
    // empty warmup/cooldown arrays.
    const cycling = running(CYCLING_ID);
    expect(cycling.warmupTemplate).toHaveLength(0);
    expect(cycling.cooldownTemplate).toHaveLength(0);

    const plan = makePlan([
      session({ dayOfWeek: 4, workoutId: CYCLING_ID, sessionType: "recovery", estimatedDurationMin: 35 }),
    ]);
    const description = prop(events((await runExport(plan, {}, templates)).ics)[0], "DESCRIPTION");

    expect(description).not.toContain(WARMUP_SEP);
    expect(description).not.toContain(COOLDOWN_SEP);
  });
});

describe("exportPlanToICS: empty phase arrays", () => {
  test("a running template with no blocks at all still produces a valid event", async () => {
    const empty: WorkoutTemplate = {
      ...running(RUNNING_ID),
      warmupTemplate: [],
      mainSetTemplate: [],
      cooldownTemplate: [],
    };
    const plan = makePlan([session({ dayOfWeek: 0, workoutId: RUNNING_ID })]);
    const [event] = events((await runExport(plan, { [RUNNING_ID]: "Vide" }, { [RUNNING_ID]: empty })).ics);
    const description = prop(event, "DESCRIPTION");

    expect(description).toContain(empty.description);
    expect(description).not.toContain(WARMUP_SEP);
    expect(description).not.toContain(MAIN_SEP);
    expect(description).not.toContain(COOLDOWN_SEP);
    // No main-set zones to pick from: getDominantZone falls back to Z2.
    expect(prop(event, "SUMMARY")).toBe("Vide - 50min [Z2]");
  });

  test("a strength template with no blocks at all still produces a valid event", async () => {
    const empty: StrengthWorkoutTemplate = {
      ...strengthOf(STRENGTH_ID),
      warmupBlocks: [],
      mainBlocks: [],
      cooldownBlocks: [],
    };
    const plan = makePlan([
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
    ]);
    const [event] = events((await runExport(plan, { [STRENGTH_ID]: "Renfo vide" }, { [STRENGTH_ID]: empty })).ics);

    expect(prop(event, "SUMMARY")).toBe("Renfo vide - 30min [Renfo]");
    expect(prop(event, "CATEGORIES")).toContain("Strength");
    expect(prop(event, "DESCRIPTION")).toContain(empty.description);
  });
});

describe("exportPlanToICS: unresolvable workoutId", () => {
  test("degrades to a bare event instead of throwing", async () => {
    const plan = makePlan([session({ dayOfWeek: 6, workoutId: MISSING_ID })]);
    const { ics } = await runExport(plan, {}, templates);
    const [event] = events(ics);

    // Falls back to the raw id, with no zone tag and no discipline claim.
    expect(prop(event, "SUMMARY")).toBe(`${MISSING_ID} - 50min`);
    expect(prop(event, "SUMMARY")).not.toContain("[");
    expect(prop(event, "CATEGORIES")).toContain("Running");

    const description = prop(event, "DESCRIPTION");
    expect(description).toContain("common:export.planIcs.durationLabel: 50 min");
    expect(description).not.toContain(MAIN_SEP);
    expect(description).not.toContain(TIPS_SEP);
  });

  test("a missing template does not stop the sessions around it", async () => {
    const plan = makePlan([
      session({ dayOfWeek: 0, workoutId: MISSING_ID }),
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
      session({ dayOfWeek: 4, workoutId: RUNNING_ID }),
    ]);
    const all = events((await runExport(plan, {}, templates)).ics);

    expect(all).toHaveLength(3);
    expect(prop(all[1], "CATEGORIES")).toContain("Strength");
    expect(prop(all[2], "SUMMARY")).toContain("[Z2]");
  });
});

describe("exportPlanToICS: totals", () => {
  test("each event advertises its own session duration across all three kinds", async () => {
    const plan = makePlan([
      session({ dayOfWeek: 0, workoutId: RUNNING_ID, estimatedDurationMin: 50 }),
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
      session({ dayOfWeek: 4, workoutId: CYCLING_ID, sessionType: "recovery", estimatedDurationMin: 35 }),
    ]);
    const all = events((await runExport(plan, {}, templates)).ics);

    expect(all.map((e) => prop(e, "SUMMARY"))).toEqual([
      `${RUNNING_ID} - 50min [Z2]`,
      `${STRENGTH_ID} - 30min [Renfo]`,
      `${CYCLING_ID} - 35min [Z1]`,
    ]);
    for (const [index, minutes] of [50, 30, 35].entries()) {
      expect(prop(all[index], "DESCRIPTION")).toContain(
        `common:export.planIcs.durationLabel: ${minutes} min`,
      );
    }
  });

  test("block counts stay per-kind: zone bullets for runs, tip bullets for strength", async () => {
    const run = running(RUNNING_ID);
    const strength = strengthOf(STRENGTH_ID);
    const strengthBlocks: StrengthBlock[] = [
      ...strength.warmupBlocks,
      ...strength.mainBlocks,
      ...strength.cooldownBlocks,
    ];

    const plan = makePlan([
      session({ dayOfWeek: 0, workoutId: RUNNING_ID }),
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
    ]);
    const [runEvent, strengthEvent] = events((await runExport(plan, {}, templates)).ics);

    const runBullets = prop(runEvent, "DESCRIPTION").split("\n").filter((l) => l.startsWith("•"));
    const strengthBullets = prop(strengthEvent, "DESCRIPTION").split("\n").filter((l) => l.startsWith("•"));

    const runBlockCount =
      run.warmupTemplate.length + run.mainSetTemplate.length + run.cooldownTemplate.length;
    // Endurance ships no coaching tips section here only if the array is empty;
    // count both contributions explicitly rather than hardcoding a number.
    expect(runBullets).toHaveLength(runBlockCount + run.coachingTips.length);
    // The strength event lists tips only; its 7 exercise blocks are appendix
    // material in the PDF, not calendar material.
    expect(strengthBlocks.length).toBeGreaterThan(0);
    expect(strengthBullets).toHaveLength(strength.coachingTips.length);
  });
});
