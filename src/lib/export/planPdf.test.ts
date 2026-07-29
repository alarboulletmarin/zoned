/**
 * Export layer: plan → PDF.
 *
 * `src/lib/export/` had no tests at all, so the running/strength refactor of
 * issue #127 could not satisfy the "tests pass before AND after" rule. These
 * tests pin the document `exportPlanToPDF` hands to pdfmake (every string a
 * reader would see) rather than the private helpers, so they keep biting
 * whatever the internals become.
 *
 * What is exercised on purpose:
 *  - the running / strength discrimination (`isRunningWorkout` /
 *    `isStrengthWorkout`), including that neither kind's rendering leaks into
 *    the other: strength sessions must show exercise blocks, running sessions
 *    zone blocks, and never the reverse;
 *  - `WORKOUT_PHASES` + `getWorkoutPhaseBlocks`, through the strength summary
 *    and the exercise-name resolution that now walk the phases generically;
 *  - a cycling template (`CYC-*`), running-SHAPED and therefore on the zone
 *    path even though it is not a run;
 *  - an unresolvable `workoutId`, which must degrade rather than throw;
 *  - empty and absent phase arrays (the `?? []` / `|| []` guards);
 *  - the duration and block-count arithmetic across all three kinds.
 *
 * Two things are stubbed, both because they cannot load under `bun test`:
 *  - `@/i18n` is a Vite module (`import.meta.glob`). The stub returns the raw
 *    key, so assertions read `common:export.planPdf.<key>` instead of freezing
 *    French copy into the test.
 *  - `pdfmake` renders to a browser canvas. The stub captures the document
 *    definition, which IS the thing this module produces; everything under
 *    test still runs for real, including the real catalogue data.
 */

import { beforeAll, describe, expect, mock, test } from "bun:test";

import type { PlanSession, TrainingPlan } from "@/types/plan";
import type { AnyWorkoutTemplate, WorkoutBlock, WorkoutTemplate } from "@/types";
import type { StrengthBlock, StrengthWorkoutTemplate } from "@/types/strength";
import { isRunningWorkout, isStrengthWorkout } from "@/lib/workoutTemplate";

mock.module("@/i18n", () => ({
  default: {
    language: "fr",
    t: (key: string) => key,
  },
}));

/** Last document definition handed to pdfmake, captured by the stub below. */
let lastDoc: { content?: unknown } | null = null;

/** The captured document, or a loud failure if pdfmake was never reached. */
function captured(): { content?: unknown } {
  if (!lastDoc) throw new Error("pdfmake.createPdf was never called");
  return lastDoc;
}

mock.module("pdfmake/build/pdfmake", () => ({
  default: {
    vfs: {},
    createPdf: (doc: { content?: unknown }) => {
      lastDoc = doc;
      return { getBlob: async () => new Blob(["%PDF-1.7"], { type: "application/pdf" }) };
    },
  },
}));

mock.module("pdfmake/build/vfs_fonts", () => ({ default: { vfs: {} } }));

const { getWorkoutById } = await import("@/data/workouts");
const { exportPlanToPDF } = await import("./planPdf");

// ── Catalogue ids, resolved from the real data so the fixtures stay honest ──

const RUNNING_ID = "END-001"; // 5min Z1 + 40min Z2 + 5min Z1 = 50min of blocks
const STRENGTH_ID = "STR-008"; // 2 warmup + 4 main + 1 cooldown = 7 exercise blocks
const CYCLING_ID = "CYC-001"; // running-shaped, 35min single main block, no warmup/cooldown
const MISSING_ID = "END-000-not-in-catalogue";
const MISSING_STRENGTH_ID = "STR-000-not-in-catalogue";

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

function session(
  overrides: Partial<PlanSession> & Pick<PlanSession, "dayOfWeek" | "workoutId">,
): PlanSession {
  return {
    sessionType: "endurance",
    isKeySession: false,
    estimatedDurationMin: 50,
    ...overrides,
  };
}

function makePlan(sessions: PlanSession[]): TrainingPlan {
  return {
    id: "plan-pdf-test",
    name: "Plan test PDF",
    nameEn: "PDF test plan",
    totalWeeks: 1,
    phases: [{ phase: "base", startWeek: 1, endWeek: 1 }],
    config: {
      id: "cfg-pdf-test",
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
 * `exportPlanToPDF` ends on a DOM download. Bun has no `document`, so we
 * install a minimal one; the captured document definition is what we assert on.
 */
async function runExport(
  plan: TrainingPlan,
  workoutNames: Record<string, string>,
  workoutTemplates: Record<string, AnyWorkoutTemplate>,
): Promise<{ strings: string[]; joined: string; filename: string }> {
  lastDoc = null;

  const anchor = { href: "", download: "", click: () => {} };
  const fakeDocument = {
    createElement: () => anchor,
    body: { appendChild: () => {}, removeChild: () => {} },
  };

  const realCreate = URL.createObjectURL;
  const realRevoke = URL.revokeObjectURL;
  Object.defineProperty(globalThis, "document", { value: fakeDocument, configurable: true });
  URL.createObjectURL = () => "blob:zoned-test";
  URL.revokeObjectURL = () => {};

  try {
    await exportPlanToPDF(plan, workoutNames, workoutTemplates);
  } finally {
    URL.createObjectURL = realCreate;
    URL.revokeObjectURL = realRevoke;
    Reflect.deleteProperty(globalThis, "document");
  }

  const strings = collectText(captured().content);
  return { strings, joined: strings.join("\n"), filename: anchor.download };
}

/** Every literal string in a pdfmake content tree, in document order. */
function collectText(node: unknown, out: string[] = []): string[] {
  if (node == null) return out;
  if (typeof node === "string") {
    out.push(node);
    return out;
  }
  if (Array.isArray(node)) {
    for (const child of node) collectText(child, out);
    return out;
  }
  if (typeof node !== "object") return out;

  const record = node as Record<string, unknown>;
  if ("text" in record) collectText(record.text, out);
  if ("stack" in record) collectText(record.stack, out);
  if ("columns" in record) collectText(record.columns, out);
  if ("table" in record) collectText((record.table as { body?: unknown }).body, out);
  return out;
}

/** Every table in the content tree, as raw cell rows. */
function tables(node: unknown, out: unknown[][][] = []): unknown[][][] {
  if (node == null || typeof node !== "object") return out;
  if (Array.isArray(node)) {
    for (const child of node) tables(child, out);
    return out;
  }
  const record = node as Record<string, unknown>;
  const table = record.table as { body?: unknown[][] } | undefined;
  if (table?.body) out.push(table.body);
  for (const value of Object.values(record)) tables(value, out);
  return out;
}

/**
 * The appendix block tables of a document, in document order. Both the running
 * and the strength renderer emit a five-column table headed "Phase"; the
 * three-column phase legend on page 1 shares the header word but not the shape.
 */
function blockTables(content: unknown): unknown[][][] {
  return tables(content).filter(
    (body) => body[0]?.length === 5 && collectText(body[0])[0] === "Phase",
  );
}

/**
 * The weekly session table rows (header excluded), as raw pdfmake cells:
 * day, name, type, zone, duration, summary. Needed wherever the cell's text is
 * not enough to tell two branches apart; the zone cell is the case in point,
 * since the strength cell and the no-template fallback both read as an em dash
 * and differ only in their fill.
 */
function sessionCells(content: unknown): unknown[][] {
  return tables(content)
    .filter((body) => body[0]?.length === 6 && collectText(body[0])[0] === "common:export.planPdf.day")
    .flatMap((body) => body.slice(1));
}

/** The same rows, each flattened to its six cell strings. */
function sessionRows(content: unknown): string[][] {
  return sessionCells(content).map((row) => row.map((cell) => collectText(cell).join("")));
}

/** One raw cell of one session row. */
function sessionCell(content: unknown, row: number, column: number): Record<string, unknown> {
  return sessionCells(content)[row][column] as Record<string, unknown>;
}

/** The single appendix block table of a single-workout document. */
function appendixTable(content: unknown): unknown[][] {
  const found = blockTables(content);
  if (found.length !== 1) {
    throw new Error(`expected exactly one appendix block table, found ${found.length}`);
  }
  return found[0];
}

const EXERCISES_LABEL = "common:export.planPdf.exercises";

// ── Tests ───────────────────────────────────────────────────────────

describe("exportPlanToPDF: document assembly", () => {
  test("produces a document and a filename for a mixed plan", async () => {
    const plan = makePlan([
      session({ dayOfWeek: 0, workoutId: RUNNING_ID }),
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
      session({ dayOfWeek: 4, workoutId: CYCLING_ID, sessionType: "recovery", estimatedDurationMin: 35 }),
      session({ dayOfWeek: 6, workoutId: MISSING_ID }),
    ]);

    const { strings, filename } = await runExport(
      plan,
      {
        [RUNNING_ID]: "Endurance fondamentale",
        [STRENGTH_ID]: "Core stability coureur",
        [CYCLING_ID]: "Sortie récupération",
      },
      templates,
    );

    expect(strings.length).toBeGreaterThan(0);
    expect(filename).toBe("plan-10K-Plan test PDF.pdf");

    // The weekly table names sessions from `workoutNames`, not from the
    // template or the raw id, and appends the appendix reference superscript.
    // Unresolvable ids fall back to the id itself.
    expect(sessionRows(captured().content).map((row) => row[1])).toEqual([
      "Endurance fondamentale ¹",
      "Core stability coureur ²",
      "Sortie récupération ³",
      `${MISSING_ID} ⁴`,
    ]);
  });

  test("appendix carries one entry per resolvable workout, in order of first appearance", async () => {
    const plan = makePlan([
      session({ dayOfWeek: 0, workoutId: RUNNING_ID }),
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
      session({ dayOfWeek: 4, workoutId: CYCLING_ID, sessionType: "recovery", estimatedDurationMin: 35 }),
      session({ dayOfWeek: 6, workoutId: MISSING_ID }),
    ]);

    const { strings } = await runExport(plan, {}, templates);
    const refs = strings.filter((s) => /^\[\d+] $/.test(s));

    // Three resolvable templates get an appendix entry; the missing id gets a
    // reference number but no entry, because there is nothing to render.
    expect(refs).toEqual(["[1] ", "[2] ", "[3] "]);
    expect(strings).toContain(running(RUNNING_ID).name);
    expect(strings).toContain(strengthOf(STRENGTH_ID).name);
    expect(strings).toContain(running(CYCLING_ID).name);
    expect(strings).not.toContain(MISSING_ID + " ");
  });
});

describe("exportPlanToPDF: running sessions", () => {
  test("summarises the zone blocks, scaled to the session duration", async () => {
    const run = running(RUNNING_ID);
    // Template blocks total 50min; asking for 50min means no scaling.
    const plan = makePlan([session({ dayOfWeek: 0, workoutId: RUNNING_ID, estimatedDurationMin: 50 })]);
    const { strings } = await runExport(plan, {}, { [RUNNING_ID]: run });
    const [day, , type, zone, duration, summary] = sessionRows(captured().content)[0];

    expect(strings).toContain("5' Z1 › 40' Z2 › 5' Z1");
    // The whole row, so the summary cannot be confused with the appendix text.
    expect([day, type, zone, duration, summary]).toEqual([
      "Lun",
      "Endurance",
      "Z2", // dominant zone of the main set
      "50min",
      "5' Z1 › 40' Z2 › 5' Z1",
    ]);
  });

  test("doubling the session duration doubles every continuous block", async () => {
    const run = running(RUNNING_ID);
    const plan = makePlan([session({ dayOfWeek: 0, workoutId: RUNNING_ID, estimatedDurationMin: 100 })]);
    const { strings } = await runExport(plan, {}, { [RUNNING_ID]: run });

    // Proof that the total is computed from the blocks (5+40+5=50) and used as
    // the scale denominator, not read from typicalDuration.
    expect(strings).toContain("10' Z1 › 80' Z2 › 10' Z1");
    expect(strings).toContain("1h40"); // the duration column
  });

  test("the appendix lists one row per zone block, with duration and zone", async () => {
    const run = running(RUNNING_ID);
    const plan = makePlan([session({ dayOfWeek: 0, workoutId: RUNNING_ID })]);
    const { strings, joined } = await runExport(plan, {}, { [RUNNING_ID]: run });

    const blocks: WorkoutBlock[] = [
      ...run.warmupTemplate,
      ...run.mainSetTemplate,
      ...run.cooldownTemplate,
    ];
    const body = appendixTable(captured().content);
    expect(body).toHaveLength(blocks.length + 1); // + header row

    for (const block of blocks) {
      expect(strings).toContain(block.description);
    }
    expect(joined).toContain("40min");
    expect(strings).toContain("Z2");
    // Non-repeated blocks show an em dash in the Reps column.
    expect(strings).toContain("—");
  });

  test("no strength rendering leaks into a running-only document", async () => {
    const plan = makePlan([session({ dayOfWeek: 0, workoutId: RUNNING_ID })]);
    const { joined } = await runExport(plan, {}, { [RUNNING_ID]: running(RUNNING_ID) });

    expect(joined).not.toContain(EXERCISES_LABEL); // strength summary label
    expect(joined).not.toContain("common:export.planPdf.exercise"); // strength table header
    expect(joined).not.toContain("Bird-dog"); // an exercise name
    expect(joined).not.toContain("×"); // sets×reps notation
  });
});

describe("exportPlanToPDF: strength sessions", () => {
  test("summarises the exercise blocks: count plus the first three names", async () => {
    const strength = strengthOf(STRENGTH_ID);
    const plan = makePlan([
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
    ]);
    const { strings } = await runExport(plan, {}, { [STRENGTH_ID]: strength });

    const blockCount =
      strength.warmupBlocks.length + strength.mainBlocks.length + strength.cooldownBlocks.length;
    expect(blockCount).toBe(7);
    // Walks warmup → main → cooldown, so the two warmup exercises come first.
    expect(strings).toContain(`7 ${EXERCISES_LABEL} · Bird-dog, Dead bug, Planche frontale...`);

    const [day, , type, zone, duration, summary] = sessionRows(captured().content)[0];
    expect([day, type, zone, duration, summary]).toEqual([
      "Mer",
      "Core", // from the strength category, not the session type
      "—", // strength rows carry no zone
      "30min",
      `7 ${EXERCISES_LABEL} · Bird-dog, Dead bug, Planche frontale...`,
    ]);
  });

  test("the appendix lists one row per exercise block, with resolved names and sets", async () => {
    const strength = strengthOf(STRENGTH_ID);
    const plan = makePlan([
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
    ]);
    const { strings } = await runExport(plan, {}, { [STRENGTH_ID]: strength });

    const blocks: StrengthBlock[] = [
      ...strength.warmupBlocks,
      ...strength.mainBlocks,
      ...strength.cooldownBlocks,
    ];
    const body = appendixTable(captured().content);
    expect(body).toHaveLength(blocks.length + 1); // + header row

    // Exercise ids are resolved to catalogue names, never printed raw.
    expect(strings).toContain("Planche frontale");
    expect(strings).not.toContain("EX-CO-001");
    expect(strings).toContain("3×30s"); // sets × reps
    expect(strings).toContain("1×6");
  });

  test("no running rendering leaks into a strength-only document", async () => {
    const plan = makePlan([
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
    ]);
    const { strings, joined } = await runExport(plan, {}, { [STRENGTH_ID]: strengthOf(STRENGTH_ID) });

    // A strength document names no training zone anywhere: the session row's
    // zone cell is an em dash and the appendix has no zone column.
    // ("Zone" itself is a weekly-table column header and is always present.)
    expect(joined).not.toMatch(/\bZ[1-6]\b/);
    expect(strings).toContain("—"); // the em-dash zone cell
    // The strength appendix has its own header vocabulary.
    expect(strings).toContain("common:export.planPdf.exercise");
    expect(strings).not.toContain("Reps"); // the running appendix's own column
  });

  test("the session type label comes from the strength category, not the session type", async () => {
    const plan = makePlan([
      // sessionType deliberately says "endurance": the template must win.
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, estimatedDurationMin: 30 }),
    ]);
    const { strings } = await runExport(plan, {}, { [STRENGTH_ID]: strengthOf(STRENGTH_ID) });

    expect(strengthOf(STRENGTH_ID).category).toBe("runner_core");
    expect(strings).toContain("Core");
    expect(strings).not.toContain("Endurance");
  });
});

describe("exportPlanToPDF: cycling sessions", () => {
  test("a CYC- template takes the zone path and shows its single main block", async () => {
    const cycling = running(CYCLING_ID);
    const plan = makePlan([
      session({ dayOfWeek: 4, workoutId: CYCLING_ID, sessionType: "recovery", estimatedDurationMin: 35 }),
    ]);
    const { strings, joined } = await runExport(plan, {}, { [CYCLING_ID]: cycling });

    const [, , , zone, duration, summary] = sessionRows(captured().content)[0];
    expect([zone, duration, summary]).toEqual(["Z1", "35min", "35' Z1"]);
    expect(strings).toContain("35' Z1");
    expect(joined).not.toContain(EXERCISES_LABEL);
  });

  test("empty warmup and cooldown arrays contribute no appendix rows", async () => {
    const cycling = running(CYCLING_ID);
    // Guard the premise: only meaningful while CYC-001 ships empty arrays.
    expect(cycling.warmupTemplate).toHaveLength(0);
    expect(cycling.cooldownTemplate).toHaveLength(0);

    const plan = makePlan([
      session({ dayOfWeek: 4, workoutId: CYCLING_ID, sessionType: "recovery", estimatedDurationMin: 35 }),
    ]);
    await runExport(plan, {}, { [CYCLING_ID]: cycling });

    // Header + the single main block, nothing else.
    expect(appendixTable(captured().content)).toHaveLength(2);
  });
});

describe("exportPlanToPDF: empty and absent phase arrays", () => {
  test("a running template with every phase empty yields an empty summary and no block table", async () => {
    const empty: WorkoutTemplate = {
      ...running(RUNNING_ID),
      warmupTemplate: [],
      mainSetTemplate: [],
      cooldownTemplate: [],
    };
    const plan = makePlan([session({ dayOfWeek: 0, workoutId: RUNNING_ID })]);
    const { strings } = await runExport(plan, {}, { [RUNNING_ID]: empty });

    expect(strings).toContain(empty.name); // the appendix entry still renders
    expect(() => appendixTable(captured().content)).toThrow(); // but carries no table
    expect(sessionRows(captured().content)[0][3]).toBe("Z2"); // no zones: falls back to Z2
    expect(strings.filter((s) => s.includes("›"))).toHaveLength(0); // no summary segments
  });

  test("a running template with absent warmup/cooldown fields does not throw (the `|| []` guard)", async () => {
    // Simulates a hand-written or legacy entry: the fields are typed as
    // required, so only untyped data can reach the export this way.
    const partial: WorkoutTemplate = {
      ...running(RUNNING_ID),
      warmupTemplate: undefined as unknown as WorkoutBlock[],
      mainSetTemplate: [],
      cooldownTemplate: undefined as unknown as WorkoutBlock[],
    };
    const plan = makePlan([session({ dayOfWeek: 0, workoutId: RUNNING_ID })]);
    const { strings } = await runExport(plan, {}, { [RUNNING_ID]: partial });

    expect(strings).toContain(partial.name);
    expect(strings.filter((s) => s.includes("›"))).toHaveLength(0);
  });

  test("a strength template with every phase empty counts zero exercises", async () => {
    const empty: StrengthWorkoutTemplate = {
      ...strengthOf(STRENGTH_ID),
      warmupBlocks: [],
      mainBlocks: [],
      cooldownBlocks: [],
    };
    const plan = makePlan([
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
    ]);
    const { strings } = await runExport(plan, {}, { [STRENGTH_ID]: empty });

    expect(strings).toContain(`0 ${EXERCISES_LABEL} · `);
    expect(() => appendixTable(captured().content)).toThrow();
  });

  test("a strength template with absent block fields does not throw (the `?? []` guard)", async () => {
    const partial: StrengthWorkoutTemplate = {
      ...strengthOf(STRENGTH_ID),
      warmupBlocks: undefined as unknown as StrengthBlock[],
      mainBlocks: undefined as unknown as StrengthBlock[],
      cooldownBlocks: undefined as unknown as StrengthBlock[],
    };
    const plan = makePlan([
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
    ]);
    const { strings } = await runExport(plan, {}, { [STRENGTH_ID]: partial });

    expect(strings).toContain(`0 ${EXERCISES_LABEL} · `);
  });
});

describe("exportPlanToPDF: unresolvable workoutId", () => {
  test("degrades to a bare row instead of throwing", async () => {
    const plan = makePlan([session({ dayOfWeek: 6, workoutId: MISSING_ID })]);
    const { joined } = await runExport(plan, {}, {});

    const [, name, , zone, duration, summary] = sessionRows(captured().content)[0];
    expect([name, zone, duration, summary]).toEqual([
      // The raw id stands in for the name. It still carries the superscript
      // appendix reference "¹" even though the appendix skips unresolvable
      // ids, so that link lands nowhere; pinned here as current behaviour.
      `${MISSING_ID} ¹`,
      "—", // no template, so no zone
      "50min",
      "", // and no summary to build
    ]);
    expect(joined).not.toContain(EXERCISES_LABEL);
    expect(blockTables(captured().content)).toHaveLength(0);

    // The em dash alone does not say WHICH branch produced it: the unknown
    // cell is the plain grey one, with no fill. Pinned so it cannot silently
    // become the strength cell (see the STR- test below for the other side).
    const zoneCell = sessionCell(captured().content, 0, 3);
    expect(zoneCell.fillColor).toBeUndefined();
    expect(zoneCell.color).toBe("#aaa");
  });

  test("an unresolvable STR- id is still treated as strength, by prefix", async () => {
    const plan = makePlan([
      session({ dayOfWeek: 2, workoutId: MISSING_STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
    ]);
    const { strings, joined } = await runExport(plan, {}, {});

    expect(strings).toContain(MISSING_STRENGTH_ID);
    // Both the strength cell and the unknown-workout fallback read as an em
    // dash, so the text proves nothing: it is the slate fill that marks the
    // strength branch.
    const zoneCell = sessionCell(captured().content, 0, 3);
    expect(zoneCell.text).toBe("—");
    expect(zoneCell.fillColor).toBe("#94a3b8");
    expect(zoneCell.bold).toBe(true);
    // No template to read a zone from, and the STR- prefix keeps it off the
    // running path, so no zone token appears anywhere.
    expect(joined).not.toMatch(/\bZ[1-6]\b/);
  });

  test("a missing template does not stop the sessions around it", async () => {
    const plan = makePlan([
      session({ dayOfWeek: 0, workoutId: MISSING_ID }),
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
      session({ dayOfWeek: 4, workoutId: RUNNING_ID }),
    ]);
    const { strings } = await runExport(plan, {}, templates);

    expect(strings).toContain(MISSING_ID);
    expect(strings).toContain(`7 ${EXERCISES_LABEL} · Bird-dog, Dead bug, Planche frontale...`);
    expect(strings).toContain("5' Z1 › 40' Z2 › 5' Z1");
  });
});

describe("exportPlanToPDF: totals across the three kinds", () => {
  test("each row shows its own session duration, formatted", async () => {
    const plan = makePlan([
      session({ dayOfWeek: 0, workoutId: RUNNING_ID, estimatedDurationMin: 50 }),
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
      session({ dayOfWeek: 4, workoutId: CYCLING_ID, sessionType: "recovery", estimatedDurationMin: 95 }),
    ]);
    const { strings } = await runExport(plan, {}, templates);

    expect(strings).toContain("50min");
    expect(strings).toContain("30min");
    expect(strings).toContain("1h35");
  });

  test("appendix row counts match each template's own block count", async () => {
    const run = running(RUNNING_ID);
    const strength = strengthOf(STRENGTH_ID);
    const cycling = running(CYCLING_ID);

    const runRows = run.warmupTemplate.length + run.mainSetTemplate.length + run.cooldownTemplate.length;
    const strengthRows =
      strength.warmupBlocks.length + strength.mainBlocks.length + strength.cooldownBlocks.length;
    const cyclingRows =
      cycling.warmupTemplate.length + cycling.mainSetTemplate.length + cycling.cooldownTemplate.length;

    const plan = makePlan([
      session({ dayOfWeek: 0, workoutId: RUNNING_ID }),
      session({ dayOfWeek: 2, workoutId: STRENGTH_ID, sessionType: "strength", estimatedDurationMin: 30 }),
      session({ dayOfWeek: 4, workoutId: CYCLING_ID, sessionType: "recovery", estimatedDurationMin: 35 }),
    ]);
    await runExport(plan, {}, templates);

    expect(blockTables(captured().content).map((b) => b.length - 1)).toEqual([
      runRows,
      strengthRows,
      cyclingRows,
    ]);
  });
});
