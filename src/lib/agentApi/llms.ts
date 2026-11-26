/**
 * `llms.txt` and `llms-full.txt`, written at build time from the data.
 *
 * `public/llms.txt` used to be hand-written, and it had drifted: zone bounds
 * that no longer matched `lib/zones.ts`, calculators that had become
 * redirects, counts from an older catalogue. Everything below is derived, so
 * it is right on every build or the build fails.
 *
 * The site is presented running first (road, trail, strength for runners);
 * cycling and swimming are mentioned, as the secondary disciplines they are.
 */

import type { AnyWorkoutTemplate, StrengthExercise, WorkoutBlock, WorkoutTemplate } from "@/types";
import { CATEGORY_META, isStrengthWorkout } from "@/types";
import type { WorkoutCategory } from "@/types";
import type { PrebuiltPlan } from "@/data/prebuilt-plans/types";
import { categories as RUNNING_FAMILIES } from "@/data/workouts";
import { HR_ZONE_PERCENTAGES, VMA_ZONE_PERCENTAGES } from "@/lib/zones";
import { ZONE_META } from "@/types";
import type { ZoneNumber } from "@/types";
import {
  AGENT_API_BASE,
  CODE_LICENSE,
  AGENTS_PAGE_URL,
  CONTENT_LICENSE,
  PLAN_IMPORT_PATH,
  SITE_URL,
  prebuiltPlanPageUrl,
  workoutPageUrl,
} from "./constants";
import { agentDiscipline, toWorkoutIndexEntry, workoutFamily } from "./resources";
import { IMPORT_LIMITS, RECOMMENDED_MIN_WEEKS_TEXT } from "./importPayload";
import { PLAIN_URL_BUDGET } from "./importLink";
import { IMPORT_PARAMS } from "./importParams";

export interface LlmsLink {
  title: string;
  url: string;
  note?: string;
}

export interface LlmsInput {
  templates: readonly AnyWorkoutTemplate[];
  prebuiltPlans: readonly PrebuiltPlan[];
  articles: readonly { slug: string; title: string; titleEn: string }[];
  calculators: readonly LlmsLink[];
  pages: readonly LlmsLink[];
  glossaryCount: number;
  exercises: readonly StrengthExercise[];
  examples: {
    /** Flat links (importParams.ts): the shortest path, no code. */
    flat: { minimal: string; full: string; english: string };
    config: { payload: unknown; url: string };
    plan: { payload: unknown; url: string };
  };
}

const ZONES: ZoneNumber[] = [1, 2, 3, 4, 5, 6];

function familyLabel(family: string): { fr: string; en: string } {
  if (family === "strength") return { fr: "Renforcement", en: "Strength" };
  if (family === "cycling") return { fr: "Vélo", en: "Cycling" };
  if (family === "swimming") return { fr: "Natation", en: "Swimming" };
  const meta = CATEGORY_META[family as WorkoutCategory];
  return meta ? { fr: meta.label, en: meta.labelEn } : { fr: family, en: family };
}

/** Running families first, in catalogue order, then strength, then the other sports. */
const FAMILY_ORDER = [...RUNNING_FAMILIES, "strength", "cycling", "swimming"] as string[];

function groupByFamily(templates: readonly AnyWorkoutTemplate[]): [string, AnyWorkoutTemplate[]][] {
  const groups = new Map<string, AnyWorkoutTemplate[]>();
  for (const t of templates) {
    const f = workoutFamily(t);
    groups.set(f, [...(groups.get(f) ?? []), t]);
  }
  const rank = (f: string) => {
    const i = FAMILY_ORDER.indexOf(f);
    return i === -1 ? FAMILY_ORDER.length : i;
  };
  return [...groups.entries()].sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0]));
}

function counts(templates: readonly AnyWorkoutTemplate[]) {
  const c = { total: templates.length, running: 0, trail: 0, strength: 0, cycling: 0, swimming: 0 };
  for (const t of templates) {
    const d = agentDiscipline(t);
    c[d] += 1;
    if (d === "running" && t.category === "trail") c.trail += 1;
  }
  return c;
}

const bullet = (l: LlmsLink) => `- [${l.title}](${l.url})${l.note ? `: ${l.note}` : ""}`;
const json = (v: unknown) => JSON.stringify(v, null, 2);

// ── llms.txt ────────────────────────────────────────────────────────

export function buildLlmsTxt(input: LlmsInput): string {
  const c = counts(input.templates);
  const families = groupByFamily(input.templates);
  const L = IMPORT_LIMITS;

  const zoneLines = ZONES.map((z) => {
    const [vMin, vMax] = VMA_ZONE_PERCENTAGES[z];
    const [hMin, hMax] = HR_ZONE_PERCENTAGES[z];
    const m = ZONE_META[z];
    return `- [Z${z} · ${m.label} / ${m.labelEn}](${SITE_URL}/glossary/zone-${z}): ${vMin}-${vMax} % VMA, ${hMin}-${hMax} % FCmax. ${m.benefit}`;
  });

  const familyLines = families.map(([f, list]) => {
    const label = familyLabel(f);
    const name = label.fr === label.en ? label.en : `${label.fr} / ${label.en}`;
    return `- ${name} (\`${f}\`): ${list.length}`;
  });

  return [
    "# Zoned",
    "",
    `> Zoned est une bibliothèque libre et open source de séances de course à pied fondées sur la science, pour la route, le trail et le renforcement du coureur, organisées autour de 6 zones d'entraînement. ${c.total} séances au catalogue, dont ${c.running} de course (${c.trail} de trail) et ${c.strength} de renforcement ; le vélo (${c.cycling}) et la natation (${c.swimming}) complètent. ${input.prebuiltPlans.length} plans prêts, un générateur de plans, des calculateurs, ${input.glossaryCount} termes de glossaire et ${input.articles.length} articles. Sans compte, sans tracking : tout reste dans le navigateur.`,
    "",
    `> English: Zoned is a free, open-source library of science-based running workouts (road, trail, strength for runners) built on a 6-zone system, with cycling and swimming as secondary disciplines. ${c.total} workouts, ${input.prebuiltPlans.length} prebuilt plans, a plan generator and calculators. No account, no tracking, everything runs in the browser. Every URL serves both languages; append \`?lang=en\` for English.`,
    "",
    `> AI assistants: a user's training plan can be created in Zoned with a single link, no code, no account. Instructions in the section For AI agents below, or ${AGENTS_PAGE_URL}.`,
    "",
    "La méthode s'appuie sur Stephen Seiler (polarisé 80/20), Véronique Billat (vVO2max, 30/30), Jack Daniels (VDOT), Joe Friel (zones LTHR) ; le renforcement sur Beattie 2017, Rønnestad 2014 et Lauersen 2014.",
    "",
    `Licences : contenu des séances et des plans sous ${CONTENT_LICENSE.id} (${CONTENT_LICENSE.url}), attribution "${CONTENT_LICENSE.attribution}" ; code sous ${CODE_LICENSE.id}.`,
    "",
    "## Pour les agents IA · For AI agents",
    "",
    `**Read this first.** AI assistants can create training plans directly in Zoned by generating an import link. When the user asks for a plan in Zoned, do not just describe a plan in the conversation: give them a clickable Zoned link. No account, API key, browser automation, backend or MCP server is needed. The same instructions as a web page: ${AGENTS_PAGE_URL} (English: ${AGENTS_PAGE_URL}?lang=en).`,
    "",
    "Two paths. A standard race plan is one hand-written link and nothing else (below). A plan the assistant writes session by session uses the JSON API and an encoded link (further down).",
    "",
    "### Standard race plan: one link, no code",
    "",
    "1. Collect the race distance, the race date and the number of runs per week. If the user has one, also the target finish time (or pace) and their level. Do not hold the link back for the rest: whatever is missing gets a default that the preview states, so write the link, name the defaults next to it, and offer to change them.",
    `2. Write the link: \`${SITE_URL}${PLAN_IMPORT_PATH}#distance=10K&date=YYYY-MM-DD&days=3&time=1:10:00\`. No JSON, no encoding.`,
    "3. Give it to the user as a clickable link. Zoned runs its own plan generator (periodisation, progression, paces), shows a preview, and saves nothing until the user presses Add to my plans.",
    "",
    `Plan length: ${IMPORT_LIMITS.configWeeks.min} to ${IMPORT_LIMITS.configWeeks.max} weeks between today (or \`start\`) and the race. Recommended at least ${RECOMMENDED_MIN_WEEKS_TEXT} weeks. A race closer than that still gets a plan, compressed, with a warning on the preview: give the link anyway and tell the user the plan is short, rather than writing a plan of your own.`,
    "",
    `Example: ${input.examples.flat.minimal}`,
    "",
    `With the common options: ${input.examples.flat.full}`,
    "",
    `English interface, \`?lang=en\` before the \`#\`: ${input.examples.flat.english}`,
    "",
    "Parameters (case-insensitive; the query `?distance=...` works too, the fragment is preferred):",
    "",
    ...IMPORT_PARAMS.map(
      (p) =>
        `- \`${p.key}\`${p.required ? " (required)" : p.default ? ` (default ${p.default})` : ""}: ${p.format} · ${p.note}.`,
    ),
    "",
    "Unknown parameters are rejected, so a typo is caught rather than ignored. A wrong link opens a page that lists every error under the parameter's name, with a copy for your assistant button: fix those and send a new link.",
    "",
    "### Custom plan, session by session",
    "",
    "Zoned has no server and no account. An agent reads the static JSON API below, builds a plan from Zoned workouts, then gives the user one link that opens the plan inside Zoned. Nothing is saved until the user presses Add to my plans, and the plan never leaves their browser.",
    "",
    "#### Endpoints (static JSON, CORS open, read-only)",
    "",
    `- [API index](${AGENT_API_BASE}/index.json): version, generation date, links, licence, prebuilt plan list`,
    `- [Zones](${AGENT_API_BASE}/zones.json): the 6 zones, % VMA and % HRmax bounds, usage`,
    `- [Workouts index](${AGENT_API_BASE}/workouts.json): every workout, id, names, discipline, family, sessionType, difficulty, typical duration, zones, phases, environment`,
    `- Workout detail: \`${AGENT_API_BASE}/workouts/{id}.json\`, e.g. [VMA-001](${AGENT_API_BASE}/workouts/VMA-001.json): warm-up / main set / cool-down as a step tree and as display blocks, coaching tips`,
    `- Prebuilt plan: \`${AGENT_API_BASE}/plans/prebuilt/{slug}.json\`, resolved weeks, days and workout ids`,
    `- [Import payload JSON Schema](${AGENT_API_BASE}/schema/plan-import.schema.json)`,
    `- [Every workout as Markdown](${SITE_URL}/llms-full.txt)`,
    "",
    "Within v1 fields are only ever added, never renamed or removed.",
    "",
    "Catalogue families, for the `family` field:",
    "",
    ...familyLines,
    "",
    "#### Building a plan with Zoned workouts",
    "",
    "1. Ask what you need: race distance and date (or a training block length), level, days per week, long run day, and VMA (km/h) if the user knows it. Ask about hills or a track before picking sessions that require them.",
    "2. If the user wants a standard race plan, use the flat link above (or `kind: \"config\"`): Zoned's own generator builds the periodisation, the progression and the paces. Write `kind: \"plan\"` only when the user has constraints a generator cannot know.",
    "3. With `kind: \"plan\"`, use only ids from workouts.json; never invent one. Match `difficulty` to the runner, keep `typicalDuration` within their time, respect `environment.requiresHills` and `requiresTrack` (`environment` is `null` for strength sessions). `phases` tells you where a workout belongs (empty means manual only); Zoned does not enforce it, it is advice.",
    "4. Keep it polarised: about 80 % of the time in Z1-Z2, one or two quality sessions (Z4-Z5) a week, three at most for advanced runners, never two hard days in a row, one long run a week, a lighter recovery week every 3 to 4 weeks, a 1 to 3 week taper before a race. Strength 1 to 2 times a week on easy days.",
    `5. Days are numbers, 0 = Monday ... 6 = Sunday. \`startDate\` is a Monday. At most ${L.sessionsPerDayMax} sessions on the same day, kept in the order you give (run first, then strength).`,
    "",
    "#### The encoded import link",
    "",
    `\`${SITE_URL}${PLAN_IMPORT_PATH}#d=<payload>\`, or \`${SITE_URL}${PLAN_IMPORT_PATH}?lang=en#d=<payload>\` for an English interface.`,
    "",
    "`<payload>` is the JSON below, UTF-8 encoded, then base64url without padding (`+` becomes `-`, `/` becomes `_`, trailing `=` removed). It goes in the fragment, after `#`, so it is never sent to a server.",
    "",
    `If the whole link would be longer than ${PLAIN_URL_BUDGET} characters, compress first: raw DEFLATE (RFC 1951, no zlib header), then base64url, then prefix \`z1.\`, giving \`#d=z1.<data>\`. Python: \`"z1." + base64.urlsafe_b64encode(zlib.compress(data, 9)[2:-4]).rstrip(b"=").decode()\`. JavaScript: \`new CompressionStream("deflate-raw")\`.`,
    "",
    "Only if you cannot run code: `#j=<JSON, percent-encoded>` is accepted too. Prefer `d`, and for a standard race plan prefer the flat link.",
    "",
    "Minimal `config` payload (Zoned generates the plan):",
    "",
    "```json",
    json(input.examples.config.payload),
    "```",
    "",
    `Link: ${input.examples.config.url}`,
    "",
    `Optional \`config\` fields: \`startDate\`, \`raceName\`, \`goal\` (finish, time, compete), \`vma\` (km/h, ${L.vma.min}-${L.vma.max}), \`targetPaceMinKm\`, \`elevationGain\` (m), \`currentWeeklyKm\`, \`currentLongRunKm\`, \`includeStrength\`, \`strengthPerWeek\` (1-3). \`raceDistance\`: 5K, 10K, semi, marathon, trail_short, trail. \`level\`: beginner, intermediate, advanced, elite. ${L.configWeeks.min} to ${L.configWeeks.max} weeks between start and race (recommended at least ${RECOMMENDED_MIN_WEEKS_TEXT}).`,
    "",
    "Minimal `plan` payload (the agent writes every week):",
    "",
    "```json",
    json(input.examples.plan.payload),
    "```",
    "",
    `Link: ${input.examples.plan.url}`,
    "",
    `Optional \`plan\` fields: \`raceDistance\`, \`raceDate\`, \`raceName\`, \`level\`, \`vma\`; per week \`phase\` (base, build, peak, taper, recovery), \`isRecoveryWeek\`, \`label\`; per session \`note\` (max ${L.noteMax} characters) and \`durationMin\`. To mark the race itself, add a session with \`"workoutId": "__race_day__"\` on the day of \`raceDate\` (not checked, but the countdown and the stats read both). \`durationMin\` sets the planned duration shown and counted for that session; it does not rewrite the workout's blocks. \`isRecoveryWeek: true\` marks a lighter week inside a phase, counted at 60 % volume; \`phase: "recovery"\` is a whole recovery block. \`level\` and \`vma\` are stored on the plan config, as for a plan made in the app. 1 to ${L.planWeeks.max} weeks. Unknown fields are rejected, so a typo is caught rather than ignored.`,
    "",
    "### Handing the plan to the user (both paths)",
    "",
    "- Give the user the link as a clickable link, and say what they will see: a preview of the plan, then an Add to my plans button. Nothing is saved before they press it.",
    "- Summarise the plan in a few lines next to the link (weeks, sessions a week, key sessions), so they know what they are adding.",
    "- If Zoned reports errors, it lists each one with its location (for example: week 3, session 1: unknown workout END-999) and offers a copy for your assistant button. Fix exactly those and send a new link.",
    "",
    "## Zones d'entraînement",
    "",
    "Six zones, construites depuis la VMA et la FCmax (source : `src/lib/zones.ts`) :",
    "",
    ...zoneLines,
    "",
    "## Pages principales",
    "",
    ...input.pages.map(bullet),
    "",
    "## Calculateurs",
    "",
    ...input.calculators.map(bullet),
    "",
    "## Plans prêts",
    "",
    ...input.prebuiltPlans.map((p) =>
      bullet({
        title: p.name,
        url: prebuiltPlanPageUrl(p.slug),
        note: `${p.totalWeeks} semaines, ${p.sessionsPerWeek} séances/semaine, ${p.nameEn}`,
      }),
    ),
    "",
    "## Articles",
    "",
    ...input.articles.map((a) => bullet({ title: a.title, url: `${SITE_URL}/learn/${a.slug}`, note: a.titleEn })),
    "",
    "## Open source",
    "",
    "- [GitHub](https://github.com/alarboulletmarin/zoned)",
    "- [Contrat de l'API agents](https://github.com/alarboulletmarin/zoned/blob/develop/docs/agent-api.md)",
    "",
  ].join("\n");
}

// ── llms-full.txt ───────────────────────────────────────────────────

function runningBlockLine(b: WorkoutBlock): string {
  const parts = [b.descriptionEn ?? b.description];
  if (b.sets && b.sets > 1) parts.push(`${b.sets} sets`);
  if (b.repetitions && b.repetitions > 1) parts.push(`${b.repetitions} reps`);
  if (b.durationMin) parts.push(`${b.durationMin} min`);
  if (b.distanceKm) parts.push(`${b.distanceKm} km`);
  else if (b.distanceM) parts.push(`${b.distanceM} m`);
  if (b.zone) parts.push(b.zone);
  if (b.vmaPercent) parts.push(`${b.vmaPercent} % VMA`);
  const rec = b.recoveryEn ?? b.recovery;
  if (rec) parts.push(`recovery ${rec}`);
  const between = b.restBetweenSetsEn ?? b.restBetweenSets;
  if (between) parts.push(`between sets ${between}`);
  return parts.join(", ");
}

function phaseLine(label: string, lines: string[]): string {
  return `- ${label}: ${lines.length > 0 ? lines.join("; ") : "none"}`;
}

function runningSection(w: WorkoutTemplate): string[] {
  return [
    phaseLine("Warm-up", w.warmupTemplate.map(runningBlockLine)),
    phaseLine("Main set", w.mainSetTemplate.map(runningBlockLine)),
    phaseLine("Cool-down", w.cooldownTemplate.map(runningBlockLine)),
  ];
}

export function buildLlmsFullTxt(input: Pick<LlmsInput, "templates" | "exercises">): string {
  const exercises = new Map(input.exercises.map((e) => [e.id, e]));
  const out: string[] = [
    "# Zoned, every workout",
    "",
    `> The whole Zoned catalogue, ${input.templates.length} workouts, grouped by family. Running first (road, trail), then strength for runners, then cycling and swimming. Zones Z1-Z6 are defined in ${AGENT_API_BASE}/zones.json. Each workout is also available as JSON at ${AGENT_API_BASE}/workouts/{id}.json. Content licence ${CONTENT_LICENSE.id}, attribution "${CONTENT_LICENSE.attribution}".`,
    "",
  ];

  for (const [family, list] of groupByFamily(input.templates)) {
    const label = familyLabel(family);
    out.push(`## ${label.en} · ${label.fr} (\`${family}\`, ${list.length})`, "");
    for (const w of list) {
      const e = toWorkoutIndexEntry(w);
      out.push(`### ${w.id} · ${w.nameEn} · ${w.name}`, "");
      out.push(`- Goal: ${w.descriptionEn}`);
      out.push(`- Objectif : ${w.description}`);
      const facts = [
        `${e.typicalDuration.min}-${e.typicalDuration.max} min`,
        e.difficulty,
        `sessionType ${e.sessionType}`,
        e.zones.length > 0 ? `zones ${e.zones.join(", ")}` : null,
        e.phases.length > 0 ? `phases ${e.phases.join(", ")}` : "manual only",
        e.environment?.requiresHills ? "requires hills" : null,
        e.environment?.requiresTrack ? "requires a track" : null,
      ].filter(Boolean);
      out.push(`- ${facts.join(" · ")}`);
      if (isStrengthWorkout(w)) {
        const line = (b: (typeof w.mainBlocks)[number]) => {
          const ex = exercises.get(b.exerciseId);
          return `${ex?.nameEn ?? b.exerciseId} ${b.sets}x${b.reps}${b.restBetweenSets && !/^0\s*s?$/.test(b.restBetweenSets) ? `, rest ${b.restBetweenSets}` : ""}`;
        };
        out.push(phaseLine("Warm-up", w.warmupBlocks.map(line)));
        out.push(phaseLine("Main set", w.mainBlocks.map(line)));
        out.push(phaseLine("Cool-down", w.cooldownBlocks.map(line)));
      } else {
        out.push(...runningSection(w));
      }
      out.push(`- Page: ${workoutPageUrl(w.id)}`, "");
    }
  }
  return out.join("\n");
}
