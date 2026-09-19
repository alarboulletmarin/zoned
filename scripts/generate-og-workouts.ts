/**
 * USAGE: bun run scripts/generate-og-workouts.ts [--limit N] [--id VMA-001] [--out DIR]
 *
 * Generates one 1200x630 share card per catalogue workout:
 *   public/og/workout/<id>.png
 *
 * Why: the 250 /workout/<id> URLs all served og-library.png, so sharing a VMA
 * session and sharing the whole library produced the same preview. The card
 * that matters in a link preview is the one naming the session.
 *
 * This script owns no design of its own. The format, the template, the fonts,
 * the duo and the screenshot pass all come from scripts/generate-og-image.ts,
 * which stays the single source of truth for what a Zoned card looks like.
 * The only thing tuned here is the balance: on a section card the wordmark is
 * the headline, on a workout card the session name is, so the wordmark shrinks
 * to a signature and the name takes the lede slot.
 *
 * Copy is English, same reason as the section cards: link previews are read by
 * a predominantly English-speaking audience.
 *
 * Reads the catalogue JSON directly rather than importing src/. The runtime
 * helpers (getWorkoutHero and friends) pull in React components, which a
 * headless build script has no business mounting.
 */

import { mkdirSync, writeFileSync, readFileSync, readdirSync } from "fs";
import { dirname, join } from "path";
import {
  type FormatConfig,
  type Card,
  buildHtml,
  launchBrowser,
  captureOne,
} from "./generate-og-image";

const ROOT = join(import.meta.dirname, "..");
const WORKOUTS_DIR = join(ROOT, "src/data/workouts");
const DEFAULT_OUT = "public/og/workout";

// --- Format -----------------------------------------------------------------

/**
 * The section-card geometry, rebalanced around a title instead of a wordmark.
 *
 * wordmarkFs drops from 96 to 44: it signs the card rather than leading it.
 * ledeFs climbs to 44 so the session name reads first, and ledeMax 21ch breaks
 * the longest names (40 chars) over two lines instead of three. valueFs drops
 * to 48 because one stat is a word, not a number, and three stats have to fit
 * the 560px copy column beside the duo.
 */
const OG_WORKOUT: FormatConfig = {
  name: "og-workout",
  w: 1200, h: 630,
  pxX: 72, pxTop: 56, pxBottom: 44,
  wordmarkFs: 44,
  ledeFs: 52, ledeMax: 19,
  valueFs: 48, labelFs: 14, metaFs: 16,
  statGap: 36,
  duoW: 420, rule: 2,
};

// --- Catalogue --------------------------------------------------------------

interface WorkoutTemplate {
  id: string;
  name: string;
  nameEn?: string;
  category?: string;
  difficulty?: string;
  typicalDuration?: { min: number; max: number };
  mainSetTemplate?: { zone?: string }[];
}

function readWorkouts(): WorkoutTemplate[] {
  const out: WorkoutTemplate[] = [];
  for (const file of readdirSync(WORKOUTS_DIR).filter((f) => f.endsWith(".json"))) {
    const data = JSON.parse(readFileSync(join(WORKOUTS_DIR, file), "utf-8")) as {
      templates?: WorkoutTemplate[];
    };
    out.push(...(data.templates ?? []));
  }
  return out;
}

// --- Card copy --------------------------------------------------------------

/**
 * Highest zone touched by the main set.
 *
 * Zone strings in the catalogue are not plain labels: they carry ranges
 * (Z1-Z2), open tops (Z5+) and progressions (Z4->Z5+). Reading every digit and
 * keeping the largest answers "how hard does this session get" for all three
 * shapes without a parser. Two of the 250 templates carry no zone at all, and
 * fall back to the session that has none to show.
 */
function dominantZone(w: WorkoutTemplate): string | null {
  const digits = (w.mainSetTemplate ?? [])
    .map((b) => b.zone ?? "")
    .join(" ")
    .match(/\d/g);
  return digits ? `Z${Math.max(...digits.map(Number))}` : null;
}

/** Long enough to be read at a glance, short enough for valueFs at 48px. */
const LEVEL: Record<string, string> = {
  beginner: "EASY",
  intermediate: "MEDIUM",
  advanced: "HARD",
  elite: "ELITE",
};

function duration(w: WorkoutTemplate): string {
  const d = w.typicalDuration;
  if (!d) return "-";
  // A hyphen, not an en dash: the typography gate bans the dash everywhere
  // under scripts/ and src/, ranges included.
  return d.min === d.max ? String(d.min) : `${d.min}-${d.max}`;
}

export function buildWorkoutCard(w: WorkoutTemplate, outDir: string): Card {
  const zone = dominantZone(w);
  const level = LEVEL[w.difficulty ?? ""] ?? "MEDIUM";

  return {
    out: `${outDir}/${w.id}.png`,
    lede: w.nameEn ?? w.name,
    stats: [
      { value: duration(w), label: "Minutes" },
      // A session with no zone in its main set shows its level twice rather
      // than an empty slot, so the three-stat rhythm never breaks.
      zone ? { value: zone, label: "Main zone" } : { value: level, label: "Level" },
      zone ? { value: level, label: "Level" } : { value: w.id, label: "Session" },
    ],
  };
}

// --- Main -------------------------------------------------------------------

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i === -1 ? undefined : process.argv[i + 1];
}

async function main() {
  const outDir = arg("--out") ?? DEFAULT_OUT;
  const onlyId = arg("--id");
  const limit = Number(arg("--limit") ?? 0);

  let workouts = readWorkouts();
  if (onlyId) workouts = workouts.filter((w) => w.id === onlyId);
  if (limit > 0) workouts = workouts.slice(0, limit);

  if (workouts.length === 0) {
    console.error(onlyId ? `No workout with id ${onlyId}` : "No workouts found");
    process.exit(1);
  }

  console.log(`Generating ${workouts.length} workout share cards into ${outDir}/`);
  mkdirSync(join(ROOT, outDir), { recursive: true });

  const browser = await launchBrowser();
  let done = 0;

  try {
    for (const w of workouts) {
      const card = buildWorkoutCard(w, outDir);
      const png = await captureOne(browser, OG_WORKOUT, buildHtml(OG_WORKOUT, card, "light", "workout"));
      const outPath = join(ROOT, card.out);
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, png);
      done += 1;
      if (done % 25 === 0 || done === workouts.length) {
        console.log(`  ${String(done).padStart(3)}/${workouts.length}`);
      }
    }
  } finally {
    await browser.close();
  }

  console.log("Done.");
}

if (import.meta.main) {
  main().catch((err) => {
    console.error("Failed to generate workout cards:", err);
    process.exit(1);
  });
}
