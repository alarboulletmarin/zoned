/**
 * USAGE: bun run scripts/generate-agent-api.ts [--out dist]
 *
 * Writes the static agent API and the llms files, after `vite build`:
 *
 *   dist/api/v1/index.json
 *   dist/api/v1/zones.json
 *   dist/api/v1/workouts.json
 *   dist/api/v1/workouts/{id}.json
 *   dist/api/v1/plans/prebuilt/{slug}.json
 *   dist/api/v1/schema/plan-import.schema.json
 *   dist/llms.txt
 *   dist/llms-full.txt
 *
 * Every byte comes from `src/lib/agentApi/`, which reads the catalogue and
 * the code's own constants. Nothing is restated here, so this script has no
 * opinion: it loads, builds, checks the index against the detail files, and
 * writes. Contract: docs/agent-api.md.
 */

import { mkdirSync, rmSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import {
  AGENT_API_VERSION,
  agentDiscipline,
  buildApiIndex,
  buildCatalogueLookup,
  buildPlanImportSchema,
  buildPrebuiltPlanResource,
  buildWorkoutDetail,
  buildWorkoutsIndex,
  buildZonesResource,
  encodeImportPlain,
  loadAgentCatalogue,
  planImportUrlFor,
  validateImportPayload,
} from "@/lib/agentApi";
import { buildLlmsFullTxt, buildLlmsTxt, type LlmsLink } from "@/lib/agentApi/llms";
import { getAllPrebuiltPlans } from "@/data/prebuilt-plans";
import { getAllArticleMeta } from "@/data/articles/metadata";
import { COMMAND_SURFACES } from "@/data/command-surfaces";
import { loadAllTerms } from "@/data/glossary";
import { loadAllExercises } from "@/data/strength";
import { addDaysToDate, defaultPlanStart } from "@/lib/planDates";
import { SITE_URL } from "@/lib/agentApi/constants";

const ROOT = join(import.meta.dirname, "..");
const outArg = process.argv.indexOf("--out");
const OUT = resolve(ROOT, outArg !== -1 ? process.argv[outArg + 1] : "dist");
const API_DIR = join(OUT, "api", AGENT_API_VERSION);

/** Public pages llms.txt points at, titles from the command palette registry. */
const PAGE_PATHS = [
  "/library",
  "/plan/new",
  "/weeks/new/prebuilt",
  "/calculators",
  "/race-simulator",
  "/learn",
  "/glossary",
  "/methodology",
  "/plans/methodology",
  "/guides",
  "/collections",
  "/about",
];

function writeJson(path: string, value: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function fail(message: string): never {
  console.error(`x ${message}`);
  process.exit(1);
}

const [templates, terms, exercises] = await Promise.all([
  loadAgentCatalogue(),
  loadAllTerms(),
  loadAllExercises(),
]);
const lookup = buildCatalogueLookup(templates);
const prebuiltPlans = getAllPrebuiltPlans();
const generatedAt = new Date().toISOString();
const today = generatedAt.slice(0, 10);

// Start clean: a workout removed from the catalogue must not keep a stale file.
rmSync(API_DIR, { recursive: true, force: true });

const workoutsIndex = buildWorkoutsIndex(templates);
writeJson(join(API_DIR, "index.json"), buildApiIndex({ generatedAt, templates, prebuiltPlans }));
writeJson(join(API_DIR, "zones.json"), buildZonesResource());
writeJson(join(API_DIR, "workouts.json"), workoutsIndex);
for (const w of templates) {
  writeJson(join(API_DIR, "workouts", `${w.id}.json`), buildWorkoutDetail(w));
}
for (const p of prebuiltPlans) {
  writeJson(join(API_DIR, "plans", "prebuilt", `${p.slug}.json`), buildPrebuiltPlanResource(p, lookup));
}
writeJson(join(API_DIR, "schema", "plan-import.schema.json"), buildPlanImportSchema());

// ── llms.txt examples, validated like any agent payload ─────────────

const firstOf = (pred: (id: string) => boolean): string => {
  const hit = templates.find((t) => pred(t.id));
  if (!hit) fail("llms.txt example: no workout matches");
  return hit.id;
};
const startMonday = defaultPlanStart(today);
// A Sunday about six months out, so the example stays valid between deploys.
const raceDate = addDaysToDate(startMonday, 26 * 7 - 1);

const configExample = {
  version: 1,
  kind: "config",
  raceDistance: "10K",
  raceDate,
  level: "intermediate",
  daysPerWeek: 4,
  longRunDay: 6,
};
const easy = firstOf((id) => id.startsWith("END-"));
const quality = firstOf((id) => id.startsWith("VMA-"));
const long = templates.find((t) => agentDiscipline(t) === "running" && t.category === "long_run")?.id
  ?? fail("llms.txt example: no long run");
const strength = firstOf((id) => id.startsWith("STR-"));
const planExample = {
  version: 1,
  kind: "plan",
  name: "Reprise 2 semaines",
  startDate: startMonday,
  weeks: [
    {
      phase: "base",
      sessions: [
        { day: 1, workoutId: easy },
        { day: 3, workoutId: quality, note: "Première séance de VMA, rester facile sur les récupérations." },
        { day: 4, workoutId: strength },
        { day: 6, workoutId: long },
      ],
    },
    {
      phase: "base",
      isRecoveryWeek: true,
      sessions: [
        { day: 1, workoutId: easy },
        { day: 6, workoutId: long, durationMin: 60 },
      ],
    },
  ],
};
for (const [name, example] of [["config", configExample], ["plan", planExample]] as const) {
  const result = validateImportPayload(example, lookup, { today });
  if (!result.ok) fail(`llms.txt ${name} example is rejected: ${JSON.stringify(result.errors)}`);
}

const calculators: LlmsLink[] = COMMAND_SURFACES.filter(
  (s) => s.section === "calculator" && s.url.startsWith("/calculators/"),
).map((s) => ({ title: s.title, url: `${SITE_URL}${s.url}`, note: s.subtitle }));
const pages: LlmsLink[] = PAGE_PATHS.map((path) => {
  const s = COMMAND_SURFACES.find((x) => x.url === path);
  if (!s) fail(`llms.txt: ${path} is not in COMMAND_SURFACES`);
  return { title: s.title, url: `${SITE_URL}${path}`, note: s.subtitle };
});

const llmsInput = {
  templates,
  prebuiltPlans,
  articles: getAllArticleMeta(),
  calculators,
  pages,
  glossaryCount: terms.length,
  exercises,
  examples: {
    config: { payload: configExample, url: planImportUrlFor(encodeImportPlain(configExample)) },
    plan: { payload: planExample, url: planImportUrlFor(encodeImportPlain(planExample)) },
  },
};
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "llms.txt"), buildLlmsTxt(llmsInput));
writeFileSync(join(OUT, "llms-full.txt"), buildLlmsFullTxt(llmsInput));

console.log(
  `Agent API ${AGENT_API_VERSION}: ${workoutsIndex.count} workouts, ${prebuiltPlans.length} prebuilt plans, llms.txt + llms-full.txt -> ${OUT}`,
);
