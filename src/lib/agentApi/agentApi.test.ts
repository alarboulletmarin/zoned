import { describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { spawnSync } from "child_process";

import { getAllPrebuiltPlans } from "@/data/prebuilt-plans";
import { generatePlan } from "@/lib/planGenerator";
import { normalizeStoredPlan } from "@/lib/planSchema";
import {
  DEFLATE_PREFIX,
  RACE_DAY_WORKOUT_ID,
  buildCatalogueLookup,
  buildPlanImportSchema,
  buildPrebuiltPlanResource,
  buildWorkoutDetail,
  buildWorkoutsIndex,
  buildZonesResource,
  decodeImportValue,
  describeIssue,
  encodeImportDeflated,
  encodeImportPlain,
  formatIssueReport,
  importConfigToPlanConfig,
  importPlanToTrainingPlan,
  loadAgentCatalogue,
  planImportUrl,
  planImportUrlFor,
  readImportFragment,
  validateImportPayload,
  type ImportIssue,
  type ValidationResult,
} from "@/lib/agentApi";
import { VMA_ZONE_PERCENTAGES } from "@/lib/zones";
import type { WorkoutTemplate } from "@/types";

const ROOT = join(import.meta.dirname, "../../..");
const templates = await loadAgentCatalogue();
const lookup = buildCatalogueLookup(templates);
const TODAY = "2026-11-25";
const opts = { today: TODAY };

const idsOf = (prefix: string) => templates.filter((t) => t.id.startsWith(prefix)).map((t) => t.id);
const END = idsOf("END-");
const VMA = idsOf("VMA-");
const THR = idsOf("THR-");
const REC = idsOf("REC-");
const STR = idsOf("STR-");
const LONG = templates.filter((t) => !("kind" in t) && t.category === "long_run" && !t.discipline).map((t) => t.id);

function errorsOf(result: ValidationResult): ImportIssue[] {
  if (result.ok) throw new Error("expected the payload to be rejected");
  return result.errors;
}

const minimalPlan = () => ({
  version: 1,
  kind: "plan",
  name: "Test",
  startDate: "2026-11-30",
  weeks: [{ sessions: [{ day: 1, workoutId: END[0] }] }],
});

const minimalConfig = () => ({
  version: 1,
  kind: "config",
  raceDistance: "10K",
  raceDate: "2027-04-11",
  level: "intermediate",
  daysPerWeek: 4,
  longRunDay: 6,
});

/** 16 weeks, five sessions a week, notes on three of them when asked. */
function sixteenWeeks(withNotes: boolean) {
  return {
    version: 1,
    kind: "plan",
    name: "Marathon de Paris 2027, objectif 3h30",
    startDate: "2026-12-14",
    raceDistance: "marathon",
    raceDate: "2027-04-04",
    weeks: Array.from({ length: 16 }, (_, i) => ({
      phase: i < 5 ? "base" : i < 10 ? "build" : i < 14 ? "peak" : "taper",
      ...(i % 4 === 3 && { isRecoveryWeek: true }),
      sessions: [
        { day: 0, workoutId: REC[0] },
        { day: 1, workoutId: VMA[i % VMA.length], ...(withNotes && { note: "Allure 5K, récup trottinée, garder la foulée relâchée." }) },
        { day: 3, workoutId: THR[i % THR.length], ...(withNotes && { note: "Seuil contrôlé, ne pas finir à bloc." }) },
        { day: 4, workoutId: END[i % END.length] },
        { day: 6, workoutId: LONG[i % LONG.length], ...(withNotes && { note: "Sortie longue, dernier tiers à allure marathon.", durationMin: 90 + i * 5 }) },
      ],
    })),
  };
}

// ── Generated files: the index and the details must agree ──────────

describe("generate-agent-api output", () => {
  const out = mkdtempSync(join(tmpdir(), "zoned-agent-api-"));
  const run = spawnSync("bun", ["run", "scripts/generate-agent-api.ts", "--out", out], {
    cwd: ROOT,
    encoding: "utf-8",
  });
  const api = join(out, "api", "v1");
  const read = (path: string) => JSON.parse(readFileSync(join(api, path), "utf-8"));

  test("the script succeeds", () => {
    expect(run.stderr).not.toContain("error");
    expect(run.status).toBe(0);
  });

  test("workouts.json lists exactly the detail files, and they agree field by field", () => {
    const index = read("workouts.json");
    const files = readdirSync(join(api, "workouts")).map((f) => f.replace(/\.json$/, "")).sort();
    const listed = index.workouts.map((w: { id: string }) => w.id).sort();
    expect(listed).toEqual(files);
    expect(index.count).toBe(files.length);
    expect(index.count).toBe(templates.length);
    const byDiscipline = Object.values(index.byDiscipline as Record<string, number>).reduce((a, b) => a + b, 0);
    expect(byDiscipline).toBe(index.count);

    for (const entry of index.workouts) {
      const detail = read(`workouts/${entry.id}.json`);
      for (const [key, value] of Object.entries(entry)) {
        expect([entry.id, key, detail[key]]).toEqual([entry.id, key, value]);
      }
      expect(entry.json).toBe(`https://zoned.run/api/v1/workouts/${entry.id}.json`);
    }
  });

  test("index.json counts and plan list match the files", () => {
    const index = read("index.json");
    const plans = readdirSync(join(api, "plans", "prebuilt")).map((f) => f.replace(/\.json$/, "")).sort();
    expect(index.counts.workouts).toBe(templates.length);
    expect(index.counts.prebuiltPlans).toBe(plans.length);
    expect(index.prebuiltPlans.map((p: { slug: string }) => p.slug).sort()).toEqual(plans);
    expect(index.license.content.id).toBe("CC-BY-4.0");
    expect(Date.parse(index.generatedAt)).not.toBeNaN();
  });

  test("every prebuilt session points at a published workout or a marker", () => {
    const files = new Set(readdirSync(join(api, "workouts")).map((f) => f.replace(/\.json$/, "")));
    for (const p of getAllPrebuiltPlans()) {
      const plan = read(`plans/prebuilt/${p.slug}.json`);
      expect(plan.weeks.length).toBe(p.weeks.length);
      for (const w of plan.weeks) {
        for (const s of w.sessions) {
          if (s.marker) expect(s.workoutId.startsWith("__")).toBe(true);
          else expect(files.has(s.workoutId)).toBe(true);
        }
      }
    }
  });

  test("llms.txt is written, and its two example links import", async () => {
    const llms = readFileSync(join(out, "llms.txt"), "utf-8");
    const full = readFileSync(join(out, "llms-full.txt"), "utf-8");
    const links = [...llms.matchAll(/^Link: (https:\/\/zoned\.run\/plan\/import#d=\S+)$/gm)].map((m) => m[1]);
    expect(links.length).toBe(2);
    for (const link of links) {
      const read = await readImportFragment(new URL(link).hash);
      expect(read.ok).toBe(true);
      if (read.ok) expect(validateImportPayload(read.raw, lookup, { today: new Date().toISOString().slice(0, 10) }).ok).toBe(true);
    }
    for (const t of templates) expect(full).toContain(`### ${t.id} `);
    rmSync(out, { recursive: true, force: true });
  });
});

// ── Resources ───────────────────────────────────────────────────────

describe("resources", () => {
  test("zones come from lib/zones, not from a copy", () => {
    const zones = buildZonesResource().zones;
    expect(zones.map((z) => z.id)).toEqual(["Z1", "Z2", "Z3", "Z4", "Z5", "Z6"]);
    expect(zones[3].vmaPercent).toEqual({ min: VMA_ZONE_PERCENTAGES[4][0], max: VMA_ZONE_PERCENTAGES[4][1] });
  });

  test("a running detail carries a step tree for every phase, authored or derived", () => {
    const vma001 = buildWorkoutDetail(lookup.get("VMA-001")!) as Record<string, unknown>;
    expect(vma001.structureSource).toEqual({ warmup: "authored", main: "authored", cooldown: "authored" });
    // A template whose warm-up exists only as display blocks still gets a tree.
    // (no catalogue template is in that case today, so one is made from VMA-001).
    const { warmupStructure: _drop, ...partial } = lookup.get("VMA-001") as WorkoutTemplate;
    const detail = buildWorkoutDetail(partial) as Record<string, any>;
    expect(detail.structureSource.warmup).toBe("derived");
    expect(detail.structure.warmup.length).toBe(detail.blocks.warmup.length);
  });

  test("every prebuilt plan resolves against the catalogue", () => {
    for (const p of getAllPrebuiltPlans()) expect(() => buildPrebuiltPlanResource(p, lookup)).not.toThrow();
  });

  test("index counts are derived", () => {
    const index = buildWorkoutsIndex(templates);
    expect(index.count).toBe(templates.length);
    expect(index.byDiscipline.strength).toBe(STR.length);
  });

  test("every catalogue id matches the schema's workoutId pattern", () => {
    const schema = buildPlanImportSchema();
    const plan = schema.oneOf[1].properties as Record<string, any>;
    const pattern = new RegExp(plan.weeks.items.properties.sessions.items.properties.workoutId.pattern);
    for (const t of templates) expect([t.id, pattern.test(t.id)]).toEqual([t.id, true]);
    expect(pattern.test(RACE_DAY_WORKOUT_ID)).toBe(true);
  });
});

// ── Link encoding ───────────────────────────────────────────────────

describe("import link", () => {
  test("plain round trip keeps accents", async () => {
    const payload = { ...minimalPlan(), name: "Prépa 10 km, élan d'automne" };
    const read = await decodeImportValue(encodeImportPlain(payload));
    expect(read).toEqual({ ok: true, raw: payload });
  });

  test("deflated round trip, versioned by its prefix", async () => {
    const payload = sixteenWeeks(true);
    const encoded = await encodeImportDeflated(payload);
    expect(encoded.startsWith(DEFLATE_PREFIX)).toBe(true);
    expect(await decodeImportValue(encoded)).toEqual({ ok: true, raw: payload });
  });

  test("the fragment reader takes #d= in both encodings and the #j= fallback", async () => {
    const payload = minimalConfig();
    expect(await readImportFragment(`#d=${encodeImportPlain(payload)}`)).toEqual({ ok: true, raw: payload });
    expect(await readImportFragment(`d=${await encodeImportDeflated(payload)}`)).toEqual({ ok: true, raw: payload });
    expect(await readImportFragment(`#j=${encodeURIComponent(JSON.stringify(payload))}`)).toEqual({ ok: true, raw: payload });
  });

  test("broken links say why", async () => {
    expect(await readImportFragment("")).toEqual({ ok: false, reason: "missing" });
    expect(await readImportFragment("#d=")).toEqual({ ok: false, reason: "missing" });
    expect(await readImportFragment("#d=%%%")).toEqual({ ok: false, reason: "malformed_base64" });
    expect(await readImportFragment(`#d=${btoa("{not json")}`)).toEqual({ ok: false, reason: "malformed_json" });
    expect(await readImportFragment("#d=z9.abc")).toEqual({ ok: false, reason: "unknown_encoding" });
    expect(await readImportFragment("#d=z1.AAAA")).toEqual({ ok: false, reason: "malformed_base64" });
  });

  test("a 16-week plan: lengths measured, deflate kicks in past the budget", async () => {
    const plain = planImportUrlFor(encodeImportPlain(sixteenWeeks(false)));
    const plainNotes = planImportUrlFor(encodeImportPlain(sixteenWeeks(true)));
    const chosen = await planImportUrl(sixteenWeeks(true));
    // Recorded in the PR: ~4.4k plain, ~8.5k with notes, under 1k deflated.
    expect(plain.length).toBeLessThan(5000);
    expect(plainNotes.length).toBeGreaterThan(8000);
    expect(chosen).toContain(`#d=${DEFLATE_PREFIX}`);
    expect(chosen.length).toBeLessThan(1200);
    const read = await readImportFragment(new URL(chosen).hash);
    expect(read.ok && validateImportPayload(read.raw, lookup, opts).ok).toBe(true);
  });

  test("an English link carries ?lang=en before the fragment", () => {
    expect(planImportUrlFor("abc", "en")).toBe("https://zoned.run/plan/import?lang=en#d=abc");
  });
});

// ── Validation ──────────────────────────────────────────────────────

describe("validation", () => {
  test("minimal payloads of both kinds are accepted", () => {
    expect(validateImportPayload(minimalPlan(), lookup, opts).ok).toBe(true);
    expect(validateImportPayload(minimalConfig(), lookup, opts).ok).toBe(true);
  });

  test("the root is checked first", () => {
    expect(errorsOf(validateImportPayload([], lookup, opts))[0].code).toBe("not_object");
    expect(errorsOf(validateImportPayload({ ...minimalPlan(), version: 2 }, lookup, opts))[0].code).toBe("unsupported_version");
    expect(errorsOf(validateImportPayload({ ...minimalPlan(), kind: "week" }, lookup, opts)).map((e) => e.code)).toContain("unknown_kind");
  });

  test("an unknown workout names the week and the session", () => {
    const payload = minimalPlan();
    payload.weeks = [
      { sessions: [{ day: 0, workoutId: END[0] }] },
      { sessions: [{ day: 0, workoutId: END[0] }] },
      { sessions: [{ day: 1, workoutId: END[0] }, { day: 3, workoutId: "END-999" }] },
    ];
    const [issue] = errorsOf(validateImportPayload(payload, lookup, opts));
    expect(issue).toMatchObject({ code: "unknown_workout", path: "weeks[2].sessions[1].workoutId" });
    expect(describeIssue(issue, "fr")).toStartWith("semaine 3, séance 2 : séance END-999 inconnue.");
    expect(describeIssue(issue, "en")).toStartWith("week 3, session 2: unknown workout END-999.");
  });

  test("a near miss gets a suggestion", () => {
    const payload = minimalPlan();
    payload.weeks[0].sessions[0].workoutId = "end-1";
    const [issue] = errorsOf(validateImportPayload(payload, lookup, opts));
    expect(issue.params.suggestion).toBe("END-001");
    expect(describeIssue(issue, "en")).toContain("Did you mean END-001?");
  });

  test("custom workouts and typos in field names are refused", () => {
    const payload = { ...minimalPlan(), weeks: [{ sessions: [{ day: 0, workoutId: "CUSTOM-abc" }, { day: 1, workout_id: END[0] }] }] };
    const codes = errorsOf(validateImportPayload(payload, lookup, opts)).map((e) => `${e.code}@${e.path}`);
    expect(codes).toContain("custom_workout@weeks[0].sessions[0].workoutId");
    expect(codes).toContain("unknown_field@weeks[0].sessions[1].workout_id");
    expect(codes).toContain("missing_field@weeks[0].sessions[1].workoutId");
  });

  test("every issue is reported, not just the first", () => {
    const payload = {
      version: 1,
      kind: "config",
      raceDistance: "half",
      raceDate: "2027-02-30",
      level: "pro",
      daysPerWeek: 9,
      longRunDay: 7.5,
      vma: "16",
    };
    const codes = errorsOf(validateImportPayload(payload, lookup, opts)).map((e) => `${e.code}@${e.path}`);
    expect(codes).toEqual([
      "invalid_enum@raceDistance",
      "invalid_date@raceDate",
      "invalid_enum@level",
      "out_of_range@daysPerWeek",
      "out_of_range@longRunDay",
      "invalid_type@vma",
    ]);
  });

  test("config dates: not in the past, and a window the generator accepts", () => {
    const past = errorsOf(validateImportPayload({ ...minimalConfig(), raceDate: "2026-01-01" }, lookup, opts));
    expect(past[0].code).toBe("date_in_past");
    const tooSoon = errorsOf(validateImportPayload({ ...minimalConfig(), raceDate: "2026-12-06" }, lookup, opts));
    expect(tooSoon[0]).toMatchObject({ code: "weeks_out_of_range", params: { count: 2, min: 4, max: 52 } });
  });

  test("plan shape limits", () => {
    const crowded = { ...minimalPlan(), weeks: [{ sessions: [0, 0, 0].map(() => ({ day: 2, workoutId: END[0] })) }] };
    expect(errorsOf(validateImportPayload(crowded, lookup, opts))[0]).toMatchObject({ code: "too_many_sessions_day", params: { day: 2, count: 3 } });
    const empty = { ...minimalPlan(), weeks: [{ sessions: [] }, { sessions: [] }] };
    expect(errorsOf(validateImportPayload(empty, lookup, opts)).map((e) => e.code)).toContain("empty_plan");
    const none = { ...minimalPlan(), weeks: [] };
    expect(errorsOf(validateImportPayload(none, lookup, opts))[0].code).toBe("weeks_out_of_range");
    const long = { ...minimalPlan(), name: "x".repeat(200) };
    expect(errorsOf(validateImportPayload(long, lookup, opts))[0].code).toBe("text_too_long");
  });

  test("a start that is not a Monday is moved, with a warning", () => {
    const result = validateImportPayload({ ...minimalPlan(), startDate: "2026-12-02" }, lookup, opts);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload.kind === "plan" && result.payload.startDate).toBe("2026-11-30");
    expect(result.warnings[0].code).toBe("start_moved_to_monday");
  });

  test("any issue inside a week is placed, even one the validator did not number", () => {
    const payload = { ...minimalPlan(), weeks: [{ sessions: [] }, { sessions: [{ day: 9, workoutId: END[0] }] }] };
    const issue = errorsOf(validateImportPayload(payload, lookup, opts)).find((e) => e.code === "out_of_range")!;
    expect(describeIssue(issue, "en")).toBe("week 2, session 1: weeks[1].sessions[0].day is 9, expected an integer between 0 and 6.");
  });

  test("the report for an agent lists every issue in English", () => {
    const payload = { ...minimalPlan(), extra: 1, weeks: [{ sessions: [{ day: 8, workoutId: "END-999" }] }] };
    const report = formatIssueReport(errorsOf(validateImportPayload(payload, lookup, opts)));
    expect(report.split("\n").length).toBe(4);
    expect(report).toContain("error unknown_field at extra");
    expect(report).toContain("error unknown_workout at weeks[0].sessions[0].workoutId: week 1, session 1: unknown workout END-999.");
  });
});

// ── Payload to plan ─────────────────────────────────────────────────

describe("payload to plan", () => {
  const meta = { id: "imported-1", createdAt: "2026-11-25T10:00:00.000Z" };

  test("a written plan becomes a stored plan the schema keeps as is", () => {
    const result = validateImportPayload(sixteenWeeks(true), lookup, opts);
    if (!result.ok || result.payload.kind !== "plan") throw new Error("rejected");
    const plan = importPlanToTrainingPlan(result.payload, lookup, meta);
    expect(plan.totalWeeks).toBe(16);
    expect(plan.config.planMode).toBe("free");
    expect(plan.config.startDate).toBe("2026-12-14");
    expect(plan.config.daysPerWeek).toBe(5);
    expect(plan.phases.map((p) => p.phase)).toEqual(["base", "build", "peak", "taper"]);
    expect(plan.weeks[3].isRecoveryWeek).toBe(true);
    expect(plan.weeks[3].volumePercent).toBe(60);
    const long = plan.weeks[2].sessions.find((s) => s.dayOfWeek === 6)!;
    expect(long).toMatchObject({ estimatedDurationMin: 100, precision: "fixed", notes: "Sortie longue, dernier tiers à allure marathon." });
    expect(normalizeStoredPlan(plan)).toEqual(plan);
  });

  test("weeks without a phase get a free plan's split; the race day is a marker", () => {
    const payload = {
      ...minimalPlan(),
      raceDate: "2027-01-24",
      weeks: Array.from({ length: 8 }, (_, i) => ({
        sessions: i === 7 ? [{ day: 6, workoutId: RACE_DAY_WORKOUT_ID }] : [{ day: 2, workoutId: END[0] }, { day: 4, workoutId: STR[0] }],
      })),
    };
    const result = validateImportPayload(payload, lookup, opts);
    if (!result.ok || result.payload.kind !== "plan") throw new Error(JSON.stringify(!result.ok && result.errors));
    const plan = importPlanToTrainingPlan(result.payload, lookup, meta);
    expect(plan.weeks[0].phase).toBe("base");
    expect(plan.weeks[7].phase).toBe("taper");
    expect(plan.weeks[7].sessions[0]).toMatchObject({ workoutId: RACE_DAY_WORKOUT_ID, sessionType: "race_specific" });
    expect(plan.weeks[0].sessions[1]).toMatchObject({ workoutId: STR[0], sessionType: "strength", isKeySession: false });
  });

  test("a config payload runs the generator like a shared plan", async () => {
    const result = validateImportPayload({ ...minimalConfig(), vma: 15.5, goal: "time", startDate: "2026-11-30" }, lookup, opts);
    if (!result.ok || result.payload.kind !== "config") throw new Error("rejected");
    const config = importConfigToPlanConfig(result.payload);
    expect(config).toMatchObject({ raceDistance: "10K", runnerLevel: "intermediate", vma: 15.5, trainingGoal: "time" });
    const plan = await generatePlan({ ...config, ...meta });
    expect(plan.totalWeeks).toBeGreaterThanOrEqual(4);
    for (const w of plan.weeks) {
      for (const s of w.sessions) {
        if (!s.workoutId.startsWith("__")) expect(lookup.has(s.workoutId)).toBe(true);
      }
    }
  });
});
