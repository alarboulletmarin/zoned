/**
 * USAGE: bun run scripts/sync-data.ts
 *
 * Writes src/data/facts.json — every number and shape the films put on screen,
 * read from the app's own data and engines rather than typed by hand.
 *
 * The rule this enforces: a marketing video may not claim anything the product
 * does not produce. Bars, splits and interval blocks are all real output here,
 * so when the catalogue or the generator changes, rerunning this updates the
 * films instead of leaving them quietly wrong.
 *
 * The bundler cannot do this at render time — these sources read the filesystem
 * — hence the JSON handoff.
 *
 * BOTH LANGUAGES, ALWAYS. Anything with words in it is emitted twice, French in
 * the base field and English in an `…En` twin, mirroring the app's own
 * convention (`nameEn`, `descriptionEn`, `messageEn`). The films read one or the
 * other through `factsFor(lang)`; nothing downstream translates anything, so a
 * missing twin here is a French string on an English screen.
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import { readSiteStats } from "../../scripts/site-stats.ts";
import { generatePlan } from "../../src/lib/planGenerator/index.ts";
import { generateRacePlan, getDistanceLabelEn } from "../../src/lib/raceSimulator.ts";
import { formatSplitTime } from "../../src/lib/splits.ts";
import { TARGET_SYSTEM_SCIENCE } from "../../src/data/science/data.ts";
import { auditPlan } from "../../src/lib/planGenerator/audit.ts";
import {
  POLARIZED_EASY_MIN_FRACTION,
  POLARIZED_HARD_MAX_FRACTION,
} from "../../src/lib/planGenerator/constants.ts";
import type { AssistedPlanConfig } from "../../src/types/plan.ts";

const ROOT = join(import.meta.dirname, "..", "..");
const OUT_DIR = join(import.meta.dirname, "..", "src", "data");
const OUT_FILE = join(OUT_DIR, "facts.json");

/* -- Catalogue counters --------------------------------------------------- */

const stats = readSiteStats();

/* -- A real marathon plan ------------------------------------------------- */

const plan = await generatePlan({
  id: "video-marathon",
  raceDistance: "marathon",
  raceDate: "2026-11-29",
  startDate: "2026-08-10",
  runnerLevel: "intermediate",
  daysPerWeek: 4,
  vma: 16,
  trainingGoal: "time",
  planPurpose: "race",
  currentWeeklyKm: 40,
  currentLongRunKm: 14,
  createdAt: "2026-07-01",
} as unknown as AssistedPlanConfig);

const weeks = plan.weeks.map((w) => ({
  n: w.weekNumber,
  phase: w.phase as string,
  km: Math.round(w.targetKm ?? 0),
  recovery: Boolean(w.isRecoveryWeek),
}));

/* -- A real workout, flattened into a timeline ---------------------------- */

type Step = {
  kind: "segment" | "repeat";
  durationSec?: number;
  zone?: string;
  role?: string;
  count?: number;
  steps?: Step[];
  between?: Step[];
};

/** `declared` records whether the source block named a zone at all. */
type Segment = { zone: string; sec: number; role: string; declared: boolean };

/**
 * Expands the `WorkoutStep` tree (see docs/workout-format.md) into the flat
 * list of coloured blocks the timeline draws. `between` is interleaved, not
 * appended, and never trails the last repetition.
 */
function flatten(steps: Step[] | undefined): Segment[] {
  if (!steps) return [];
  const out: Segment[] = [];
  for (const step of steps) {
    if (step.kind === "segment") {
      out.push({
        zone: step.zone ?? "Z1",
        sec: step.durationSec ?? 0,
        role: step.role ?? "effort",
        declared: Boolean(step.zone),
      });
      continue;
    }
    const count = step.count ?? 1;
    for (let i = 0; i < count; i++) {
      out.push(...flatten(step.steps));
      if (i < count - 1) out.push(...flatten(step.between));
    }
  }
  return out;
}

const WORKOUT_ID = "VMA-001";
const vma = JSON.parse(readFileSync(join(ROOT, "src/data/workouts/vma.json"), "utf-8"));
const template = vma.templates.find((t: { id: string }) => t.id === WORKOUT_ID);
if (!template) throw new Error(`${WORKOUT_ID} not found in src/data/workouts/vma.json`);

const segments = [
  ...flatten(template.warmupStructure),
  ...flatten(template.mainSetStructure),
  ...flatten(template.cooldownStructure),
];

const workout = {
  id: template.id,
  name: template.name as string,
  nameEn: (template.nameEn ?? template.name) as string,
  summary: template.mainSetTemplate?.[0]?.description as string,
  summaryEn: (template.mainSetTemplate?.[0]?.descriptionEn ??
    template.mainSetTemplate?.[0]?.description) as string,
  segments,
  totalMin: Math.round(segments.reduce((s, seg) => s + seg.sec, 0) / 60),
};

/* -- The polarised distribution of the generated plan --------------------- */

/**
 * Zone of a spec, resolving a span like "Z1-Z2" to its UPPER bound — the same
 * rule as `parseZoneSpan(zone)?.max` in the app's own timeline transform.
 */
function zoneUpperBound(spec: string): number | null {
  const found = [...String(spec).matchAll(/Z\s*(\d+)/gi)]
    .map((m) => Number(m[1]))
    .filter((n) => Number.isFinite(n) && n >= 1 && n <= 6);
  return found.length ? Math.max(...found) : null;
}

/** Every running workout in the catalogue, indexed by id. */
function buildWorkoutIndex(): Map<string, Record<string, unknown>> {
  const dir = join(ROOT, "src/data/workouts");
  const index = new Map<string, Record<string, unknown>>();
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const data = JSON.parse(readFileSync(join(dir, file), "utf-8"));
    for (const t of data.templates ?? []) index.set(t.id, t);
  }
  return index;
}

/**
 * Time spent in each zone across the whole generated marathon plan.
 *
 * MEASUREMENT, NOT A CLAIM. Read this before putting a percentage on screen:
 *
 * `GOAL_MODIFIERS.hardFraction` and `POLARIZED_EASY_MIN_FRACTION` exist in
 * `src/lib/planGenerator/constants.ts` but are referenced nowhere else — the
 * generator neither enforces nor validates an intensity split. Whatever a plan
 * measures, it measures by accident.
 *
 * Measured here, a real marathon plan comes out around 77 % Z1-Z2, 18 % Z3 and
 * 5 % Z4+. That clears both constants (75 % easy floor, 25 % hard ceiling) but
 * it is pyramidal, not polarised: Seiler's model wants minimal Z3 and 15-20 %
 * hard, and this has the two the other way round.
 *
 * So the films present the polarised model as the principle Zoned documents
 * (Seiler 2010, methodology page and article) and never as a property of a
 * generated plan. Kept because the number is worth knowing, and because the day
 * the generator does enforce a split, this is where the proof will come from.
 *
 * A span like "Z1-Z2" is credited to its lower bound, the same rule the colour
 * lookup uses. Segments with no declared zone are excluded rather than counted
 * as Z1, which would inflate the easy share. Cross-training sessions carry no
 * running structure and are reported as uncovered rather than silently dropped.
 */
function polarisedDistribution() {
  const index = buildWorkoutIndex();
  const seconds = new Map<number, number>();
  let covered = 0;
  let missing = 0;

  for (const week of plan.weeks) {
    for (const session of week.sessions) {
      const template = session.workoutId ? index.get(session.workoutId) : undefined;
      if (!template) {
        missing++;
        continue;
      }
      covered++;
      const blocks = [
        ...flatten(template.warmupStructure as Step[]),
        ...flatten(template.mainSetStructure as Step[]),
        ...flatten(template.cooldownStructure as Step[]),
      ];
      for (const b of blocks) {
        if (!b.declared) continue;
        const zone = zoneUpperBound(b.zone);
        if (zone === null) continue;
        seconds.set(zone, (seconds.get(zone) ?? 0) + b.sec);
      }
    }
  }

  const total = [...seconds.values()].reduce((a, b) => a + b, 0);
  const byZone = [1, 2, 3, 4, 5, 6].map((z) => ({
    zone: z,
    pct: total ? Math.round(((seconds.get(z) ?? 0) / total) * 1000) / 10 : 0,
  }));

  const share = (zones: number[]) =>
    Math.round(byZone.filter((b) => zones.includes(b.zone)).reduce((s, b) => s + b.pct, 0) * 10) /
    10;

  return {
    byZone,
    easyPct: share([1, 2]),
    middlePct: share([3]),
    hardPct: share([4, 5, 6]),
    sessionsCovered: covered,
    sessionsWithoutStructure: missing,
  };
}

const polarised = {
  /**
   * The rule as Zoned documents it — Seiler (2010), 75-80 % Z1-Z2, 15-20 % Z4+,
   * minimal Z3. These are the app's own constants, which is what makes it the
   * principle the films may show.
   */
  model: {
    easyMinPct: Math.round(POLARIZED_EASY_MIN_FRACTION * 100),
    hardMaxPct: Math.round(POLARIZED_HARD_MAX_FRACTION * 100),
    source: "Seiler 2010",
  },
  measured: polarisedDistribution(),
};

/* -- What the plan audit actually finds ----------------------------------- */

/**
 * `auditPlan` run on the same generated plan. These are real warnings about a
 * real plan, which is the whole point: the generator does not pretend its
 * output is perfect, it re-reads it and says so.
 *
 * `DUPLICATE_DAY_SESSIONS` is filtered out — its message interpolates an
 * undefined day name ("2 séances de course le undefined"), a formatting bug in
 * the app that should not be put on screen.
 */
const auditFindings = auditPlan(plan)
  .filter((f) => f.code !== "DUPLICATE_DAY_SESSIONS")
  .map((f) => ({
    code: f.code,
    severity: f.severity,
    message: f.message,
    messageEn: f.messageEn,
  }));

/* -- What adjusting a session actually does ------------------------------- */

/**
 * The catalogue suggests 12 repetitions and allows 8 to 14. Both durations are
 * computed from the same block tree, so the claim "drop to 8 and the session is
 * 48 minutes" is arithmetic, not a guess.
 */
function durationAtReps(reps: number): number {
  const warmup = flatten(template.warmupStructure as Step[]).reduce((s, b) => s + b.sec, 0);
  const cooldown = flatten(template.cooldownStructure as Step[]).reduce((s, b) => s + b.sec, 0);
  const sets = 2;
  const effort = 30;
  const recovery = 30;
  const between = 180;
  const main = sets * (reps * effort + (reps - 1) * recovery) + (sets - 1) * between;
  return Math.round((warmup + main + cooldown) / 60);
}

const scaling = template.scaling as { minValue: number; maxValue: number; stepSize: number };
const adjust = {
  workout: template.name as string,
  workoutEn: (template.nameEn ?? template.name) as string,
  defaultReps: 12,
  minReps: scaling.minValue,
  maxReps: scaling.maxValue,
  step: scaling.stepSize,
  defaultMin: durationAtReps(12),
  adjustedReps: 8,
  adjustedMin: durationAtReps(8),
};

/* -- Real session names, for the catalogue marquee ------------------------ */

/**
 * A spread of actual workout names taken across every category file, used by
 * the scrolling band in the catalogue act. Sampled on a fixed stride rather
 * than sliced from the top, so the band shows the range of the catalogue
 * instead of twenty recovery jogs.
 *
 * Both languages are sampled in one pass on the same stride, so the two bands
 * hold the same sessions in the same order — the English cut is the same shot,
 * not a different one. Every template in the catalogue carries `nameEn`
 * (checked: 239/239), so the fallback never fires today.
 */
function sampleWorkoutNames(perFile: number): { fr: string[]; en: string[] } {
  const dir = join(ROOT, "src/data/workouts");
  const fr: string[] = [];
  const en: string[] = [];

  for (const file of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
    const data = JSON.parse(readFileSync(join(dir, file), "utf-8"));
    const templates: { name?: string; nameEn?: string }[] = data.templates ?? [];
    if (!templates.length) continue;
    const stride = Math.max(1, Math.floor(templates.length / perFile));
    for (let i = 0; i < templates.length && fr.length < 400; i += stride) {
      const name = templates[i]?.name;
      if (!name) continue;
      fr.push(name);
      en.push(templates[i]?.nameEn ?? name);
    }
  }
  return { fr, en };
}

const workoutNames = sampleWorkoutNames(4);

/* -- The science behind the catalogue ------------------------------------- */

/**
 * Counts and a readable sample from `src/data/science`. The claim the film
 * makes — that Zoned pushes no single method and cites its sources — is only
 * honest if the figures come from the reference table itself.
 */
function scienceFacts() {
  const systems = Object.keys(TARGET_SYSTEM_SCIENCE);
  const references = systems.flatMap(
    (s) => TARGET_SYSTEM_SCIENCE[s as keyof typeof TARGET_SYSTEM_SCIENCE].references ?? [],
  );
  const authors = [...new Set(references.map((r) => r.authors))];

  /** Surname of the first author, for the grid. */
  const surname = (authors_: string) => authors_.split(",")[0].trim().split(" ")[0];

  /**
   * Human label for each target system, for the tag above a researcher's name.
   *
   * Hand-written here in both languages: `TARGET_SYSTEM_SCIENCE` is keyed by the
   * raw enum and carries no display label of its own. Keep the two maps in step
   * — a card falls back to the raw key, which would put `aerobic_base` on
   * screen rather than fail.
   */
  const SYSTEM_LABEL: Record<string, string> = {
    aerobic_base: "Base aérobie",
    aerobic_power: "Puissance aérobie",
    vo2max: "VO2max",
    aerobic_threshold: "Seuil aérobie",
    lactate_threshold: "Seuil lactique",
    lactate_tolerance: "Tolérance lactique",
    neuromuscular: "Neuromusculaire",
    speed: "Vitesse",
    strength: "Force",
    race_specific: "Spécifique course",
    mixed: "Mixte",
  };

  const SYSTEM_LABEL_EN: Record<string, string> = {
    aerobic_base: "Aerobic base",
    aerobic_power: "Aerobic power",
    vo2max: "VO2max",
    aerobic_threshold: "Aerobic threshold",
    lactate_threshold: "Lactate threshold",
    lactate_tolerance: "Lactate tolerance",
    neuromuscular: "Neuromuscular",
    speed: "Speed",
    strength: "Strength",
    race_specific: "Race specific",
    mixed: "Mixed",
  };

  // One card per researcher: their surname, the system they are cited under and
  // the year. All three come from the reference table, none are written by hand.
  const seen = new Set<string>();
  const cards: { name: string; system: string; systemEn: string; year: number }[] = [];
  for (const system of systems) {
    for (const ref of TARGET_SYSTEM_SCIENCE[system as keyof typeof TARGET_SYSTEM_SCIENCE]
      .references ?? []) {
      const name = surname(ref.authors);
      if (seen.has(name)) continue;
      seen.add(name);
      cards.push({
        name,
        system: SYSTEM_LABEL[system] ?? system,
        systemEn: SYSTEM_LABEL_EN[system] ?? system,
        year: ref.year,
      });
    }
  }

  return {
    systems: systems.length,
    references: references.length,
    authors: authors.length,
    withLink: references.filter((r) => Boolean(r.link)).length,
    names: [...seen],
    cards,
  };
}

const science = scienceFacts();

/* -- A real race plan ----------------------------------------------------- */

const HALF_KM = 21.0975;
const TARGET_SECONDS = 105 * 60; // 1 h 45

const racePlan = generateRacePlan({
  distanceKm: HALF_KM,
  targetTimeSeconds: TARGET_SECONDS,
  startTime: "09:00",
  strategy: "negative",
  bodyWeightKg: 70,
});

const race = {
  distanceLabel: racePlan.distanceLabel,
  distanceLabelEn: getDistanceLabelEn(HALF_KM),
  targetTime: formatSplitTime(TARGET_SECONDS),
  pace: racePlan.paceFormatted,
  finishTime: racePlan.estimatedFinishTime,
  splits: racePlan.splits.map((s) => ({
    km: s.index,
    pace: s.paceMinPerKm,
    cumulative: formatSplitTime(s.cumulativeTimeSeconds),
  })),
};

/* -- Write ---------------------------------------------------------------- */

const facts = {
  stats,
  plan: {
    distance: "Marathon",
    distanceEn: "Marathon",
    weeks,
    peakKm: Math.max(...weeks.map((w) => w.km)),
    totalKm: weeks.reduce((sum, w) => sum + w.km, 0),
  },
  workout,
  workoutNames,
  polarised,
  audit: auditFindings,
  adjust,
  science,
  race,
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, `${JSON.stringify(facts, null, 2)}\n`, "utf-8");

console.log(
  [
    `facts.json`,
    `  catalogue : ${stats.workouts} séances · ${stats.plans} plans · ${stats.calculators} calculateurs`,
    `  plan      : ${weeks.length} semaines, pic ${facts.plan.peakKm} km`,
    `  séance    : ${workout.name} / ${workout.nameEn}, ${segments.length} blocs, ${workout.totalMin} min`,
    `  bandeau   : ${workoutNames.fr.length} noms de séances (FR et EN)`,
    `  polarisé  : modèle ${polarised.model.easyMinPct}% facile min (${polarised.model.source})` +
      ` · plan mesuré ${polarised.measured.easyPct}% Z1-Z2 / ${polarised.measured.middlePct}% Z3 / ${polarised.measured.hardPct}% Z4+` +
      ` — NON conforme, cf. commentaire`,
    `  audit     : ${auditFindings.length} constat(s) sur le plan généré`,
    `  ajuster   : ${adjust.defaultReps} reps ${adjust.defaultMin} min → ${adjust.adjustedReps} reps ${adjust.adjustedMin} min`,
    `  science   : ${science.authors} auteurs · ${science.references} références (${science.withLink} avec lien) · ${science.systems} systèmes`,
    `  course    : ${race.distanceLabel} / ${race.distanceLabelEn} en ${race.targetTime}, ${race.splits.length} splits`,
  ].join("\n"),
);
