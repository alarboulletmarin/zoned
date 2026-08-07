/**
 * Export layer: single workout → PDF.
 *
 * The one invariant these tests exist for: **every row of a phase table must
 * carry exactly as many cells as the table has columns.** pdfmake 0.3 walks
 * each row against `widths` and throws `Malformed table row, a cell is
 * undefined` on a short one — it does not pad. The empty-phase placeholder
 * used to be a single-cell row in a five-column table, so `exportToPDF` threw
 * for every session with no warmup or no cooldown (the recovery runs, CYC-001)
 * and the UI turned that into "export failed".
 *
 * The fixtures below are built by hand rather than pulled from the catalogue:
 * the point is to pin the *shapes* the renderer must survive (empty phase,
 * absent phase, populated phase), and those must keep being covered even if
 * every recovery run in the catalogue grows a warmup tomorrow.
 *
 * Two things are stubbed, both because they cannot load under `bun test`, and
 * both the same way `planPdf.test.ts` does it:
 *  - `@/i18n` is a Vite module (`import.meta.glob`); the stub returns the raw
 *    key so assertions never freeze French copy.
 *  - `pdfmake` renders to a browser canvas. The stub captures the document
 *    definition, which IS what this module produces.
 *
 * The stub means these tests assert the row shape rather than watch pdfmake
 * accept it. That is deliberate — the shape is the contract pdfmake enforces —
 * but it also means a green run here is not proof the real renderer is happy.
 */

import { beforeEach, describe, expect, mock, test } from "bun:test";

import type { WorkoutBlock, WorkoutTemplate } from "@/types";

mock.module("@/i18n", () => ({
  default: {
    language: "fr",
    t: (key: string) => key,
  },
}));

/** Last document definition handed to pdfmake, captured by the stub below. */
let lastDoc: { content?: unknown } | null = null;

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

const { exportToPDF } = await import("./pdf");

// ── Fixtures ────────────────────────────────────────────────────────

function block(overrides: Partial<WorkoutBlock> = {}): WorkoutBlock {
  return {
    description: "Bloc",
    descriptionEn: "Block",
    durationMin: 10,
    zone: "Z2",
    ...overrides,
  } as WorkoutBlock;
}

/**
 * A running template with only the fields `exportToPDF` reads. `category` and
 * `difficulty` must be real keys — the renderer indexes CATEGORY_META and
 * DIFFICULTY_META with them.
 */
function workout(overrides: Partial<WorkoutTemplate> = {}): WorkoutTemplate {
  return {
    id: "TEST-001",
    name: "Séance test",
    nameEn: "Test session",
    description: "Description",
    descriptionEn: "Description",
    category: "recovery",
    difficulty: "beginner",
    warmupTemplate: [block()],
    mainSetTemplate: [block({ durationMin: 30 })],
    cooldownTemplate: [block()],
    coachingTips: ["Conseil"],
    coachingTipsEn: ["Tip"],
    commonMistakes: ["Erreur"],
    commonMistakesEn: ["Mistake"],
    ...overrides,
  } as WorkoutTemplate;
}

// ── Harness ─────────────────────────────────────────────────────────

/**
 * `exportToPDF` ends on a DOM download. Bun has no `document`, so we install a
 * minimal one; the captured document definition is what we assert on.
 */
async function runExport(template: WorkoutTemplate): Promise<{ filename: string }> {
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
    await exportToPDF(template);
  } finally {
    URL.createObjectURL = realCreate;
    URL.revokeObjectURL = realRevoke;
    Reflect.deleteProperty(globalThis, "document");
  }

  return { filename: anchor.download };
}

/** Every table in the content tree, with the widths it declared. */
function phaseTables(): { widths: unknown[]; body: unknown[][] }[] {
  const out: { widths: unknown[]; body: unknown[][] }[] = [];
  const walk = (node: unknown) => {
    if (node == null || typeof node !== "object") return;
    if (Array.isArray(node)) {
      node.forEach(walk);
      return;
    }
    const record = node as Record<string, unknown>;
    const table = record.table as { body?: unknown[][]; widths?: unknown[] } | undefined;
    if (table?.body && Array.isArray(table.widths)) {
      out.push({ widths: table.widths, body: table.body });
    }
    Object.values(record).forEach(walk);
  };
  walk(captured().content);
  return out;
}

/**
 * How many columns a row occupies by pdfmake's reckoning: one per cell, and a
 * `colSpan: n` cell still counts as one because the n-1 filler cells that must
 * follow it are themselves in the row.
 */
function cellCount(row: unknown[]): number {
  return row.length;
}

beforeEach(() => {
  lastDoc = null;
});

describe("exportToPDF", () => {
  test("emits the three phase tables", async () => {
    await runExport(workout());
    // Warmup, main set, cooldown — all five columns wide.
    const tables = phaseTables();
    expect(tables).toHaveLength(3);
    for (const table of tables) {
      expect(table.widths).toHaveLength(5);
    }
  });

  test("names the file after the workout id", async () => {
    const { filename } = await runExport(workout({ id: "REC-001" }));
    expect(filename).toBe("REC-001.pdf");
  });

  // ── The regression ────────────────────────────────────────────────

  test("every row of every phase table is as wide as the table", async () => {
    await runExport(
      workout({
        warmupTemplate: [],
        mainSetTemplate: [block({ durationMin: 30 })],
        cooldownTemplate: [],
      }),
    );

    for (const table of phaseTables()) {
      for (const row of table.body) {
        expect(cellCount(row)).toBe(table.widths.length);
      }
    }
  });

  test("an empty phase renders a placeholder spanning the whole row", async () => {
    await runExport(workout({ warmupTemplate: [] }));

    const warmup = phaseTables()[0];
    // Row 0 is the header; row 1 is the placeholder.
    expect(warmup.body).toHaveLength(2);

    const [placeholder, ...filler] = warmup.body[1] as Record<string, unknown>[];
    expect(placeholder.text).toBe("common:export.workoutPdf.none");
    expect(placeholder.colSpan).toBe(5);
    // colSpan swallows the next four cells, but they must still be present.
    expect(filler).toHaveLength(4);
    expect(filler.every((cell) => Object.keys(cell).length === 0)).toBe(true);
  });

  test.each([
    ["warmupTemplate", { warmupTemplate: [] }],
    ["cooldownTemplate", { cooldownTemplate: [] }],
    ["both warmup and cooldown", { warmupTemplate: [], cooldownTemplate: [] }],
    ["mainSetTemplate", { mainSetTemplate: [] }],
  ] as const)("exports a session with an empty %s", async (_label, overrides) => {
    await expect(runExport(workout(overrides))).resolves.toBeDefined();
  });

  test("survives a phase array that is absent entirely", async () => {
    // `warmupTemplate` / `cooldownTemplate` are optional on
    // WorkoutStructureSource, and a custom workout restored from localStorage
    // can arrive without them.
    const partial = workout();
    Reflect.deleteProperty(partial, "warmupTemplate");
    Reflect.deleteProperty(partial, "cooldownTemplate");

    await expect(runExport(partial)).resolves.toBeDefined();

    for (const table of phaseTables()) {
      for (const row of table.body) {
        expect(cellCount(row)).toBe(table.widths.length);
      }
    }
  });
});
