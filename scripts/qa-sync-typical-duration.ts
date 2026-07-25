/**
 * Realign every template's declared typicalDuration with the duration its
 * own structure produces.
 *
 * The structure is the source of truth: it is what the timeline, the zone
 * breakdown, the cards and the exports all render. A declared range that
 * disagrees with it (VMA-001 announced 25-35min for a 56min session) is
 * visible to the user and costs credibility.
 *
 * The range keeps a +/-10% band, rounded to 5min, to reflect that pace
 * varies between runners.
 *
 * Edits are textual so the hand-authored JSON formatting survives: some
 * files use compact one-line objects, others are fully expanded, and a
 * JSON round-trip would reflow hundreds of unrelated lines.
 *
 * Usage:
 *   bun run scripts/qa-sync-typical-duration.ts            # dry run
 *   bun run scripts/qa-sync-typical-duration.ts --write    # apply
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getStructuredWorkoutDurationMinutes } from "../src/lib/workoutStructure";

const WORKOUT_DIR = join(import.meta.dir, "..", "src", "data", "workouts");
const WRITE = process.argv.includes("--write");

const roundTo5 = (value: number) => Math.max(5, Math.round(value / 5) * 5);

function deriveRange(durationMin: number): { min: number; max: number } {
  const min = roundTo5(durationMin * 0.9);
  const max = Math.max(roundTo5(durationMin * 1.1), min + 5);
  return { min, max };
}

/**
 * Replace the typicalDuration object that follows `"id": "<id>"`, keeping the
 * surrounding whitespace style of whatever it replaces.
 */
function replaceRange(source: string, id: string, next: { min: number; max: number }): string | null {
  const idIndex = source.indexOf(`"id": "${id}"`);
  if (idIndex === -1) return null;

  const pattern = /"typicalDuration"\s*:\s*\{[^{}]*\}/;
  const rest = source.slice(idIndex);
  const match = rest.match(pattern);
  if (!match || match.index == null) return null;

  const isCompact = !match[0].includes("\n");
  const replacement = isCompact
    ? `"typicalDuration": { "min": ${next.min}, "max": ${next.max} }`
    : `"typicalDuration": {\n        "min": ${next.min},\n        "max": ${next.max}\n      }`;

  const absolute = idIndex + match.index;
  return source.slice(0, absolute) + replacement + source.slice(absolute + match[0].length);
}

let changed = 0;
let scanned = 0;
let failed = 0;

for (const file of readdirSync(WORKOUT_DIR).filter((f) => f.endsWith(".json"))) {
  const path = join(WORKOUT_DIR, file);
  let source = readFileSync(path, "utf8");
  const parsed = JSON.parse(source);
  const templates = Array.isArray(parsed) ? parsed : (parsed.templates ?? []);
  let fileChanged = false;

  for (const template of templates) {
    if (!template.typicalDuration) continue;
    scanned++;

    let computed: number;
    try {
      computed = getStructuredWorkoutDurationMinutes(template);
    } catch {
      console.error(`[skip] ${template.id}: structure could not be flattened`);
      continue;
    }
    if (!Number.isFinite(computed) || computed <= 0) continue;

    const next = deriveRange(computed);
    const current = template.typicalDuration;
    if (current.min === next.min && current.max === next.max) continue;

    const updated = replaceRange(source, template.id, next);
    if (updated == null) {
      console.error(`[fail] ${template.id}: could not locate typicalDuration in ${file}`);
      failed++;
      continue;
    }

    console.log(
      `${template.id.padEnd(12)} ${current.min}-${current.max}min -> ${next.min}-${next.max}min` +
        `  (structure: ${computed.toFixed(1)}min)`,
    );
    source = updated;
    fileChanged = true;
    changed++;
  }

  if (fileChanged) {
    // Fail fast rather than write a file we corrupted.
    JSON.parse(source);
    if (WRITE) writeFileSync(path, source, "utf8");
  }
}

console.log(
  `\n${changed} of ${scanned} templates realigned${failed > 0 ? `, ${failed} failed` : ""}` +
    `${WRITE ? " (written)" : " (dry run, pass --write)"}.`,
);
