/**
 * QA audit — zone and duration coherence across every workout template.
 *
 * Invariants checked:
 *   1. every zone spec parses (no segment silently classified as Z1);
 *   2. the zone breakdown accounts for 100% of the session — range specs are
 *      split across the zones they span, unzoned segments get their own bar;
 *   3. the computed duration matches the declared typicalDuration.
 *
 * The breakdown maths below mirrors components/visualization/transforms.ts.
 * That module cannot be imported here: it pulls in i18n, which needs Vite.
 *
 * Usage: bun run scripts/qa-zone-audit.ts [--json]
 */

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parseZoneSpan } from "../src/types";
import { flattenWorkoutSegments, getStructuredWorkoutDurationMinutes } from "../src/lib/workoutStructure";

const WORKOUT_DIR = join(import.meta.dir, "..", "src", "data", "workouts");
const EPSILON = 0.01;

interface Template {
  id: string;
  name: string;
  typicalDuration?: { min: number; max: number };
  [key: string]: unknown;
}

function loadTemplates(): Template[] {
  const out: Template[] = [];
  for (const file of readdirSync(WORKOUT_DIR).filter((f) => f.endsWith(".json"))) {
    const raw = JSON.parse(readFileSync(join(WORKOUT_DIR, file), "utf8"));
    const templates = Array.isArray(raw) ? raw : (raw.templates ?? []);
    for (const t of templates) out.push({ ...t, __file: file });
  }
  return out;
}

interface Finding {
  id: string;
  name: string;
  file: string;
  totalMin: number;
  breakdownMin: number;
  unzonedMin: number;
  unzonedPercent: number;
  unparsedZones: string[];
  typicalMin?: number;
  typicalMax?: number;
  outsideTypical: boolean;
}

const templates = loadTemplates();
const findings: Finding[] = [];
let breakdownMismatches = 0;

for (const template of templates) {
  let segments;
  try {
    segments = flattenWorkoutSegments(template as never);
  } catch (error) {
    console.error(`[skip] ${template.id}: ${(error as Error).message}`);
    continue;
  }

  const totalMin = getStructuredWorkoutDurationMinutes(template as never);
  const zoneTotals = new Map<number, number>();
  const unparsedZones: string[] = [];
  let unzonedMin = 0;

  for (const segment of segments) {
    const durationMin = segment.durationSec / 60;
    const span = parseZoneSpan(segment.zone ?? undefined);
    if (!span) {
      unzonedMin += durationMin;
      if (segment.zone) unparsedZones.push(segment.zone);
      continue;
    }
    const share = durationMin / (span.max - span.min + 1);
    for (let zone = span.min; zone <= span.max; zone++) {
      zoneTotals.set(zone, (zoneTotals.get(zone) ?? 0) + share);
    }
  }

  const breakdownMin = [...zoneTotals.values()].reduce((a, b) => a + b, 0) + unzonedMin;
  if (Math.abs(breakdownMin - totalMin) > EPSILON) breakdownMismatches++;

  const typical = template.typicalDuration;
  const outsideTypical = Boolean(typical && (totalMin < typical.min || totalMin > typical.max));

  if (unzonedMin > EPSILON || unparsedZones.length > 0 || outsideTypical || Math.abs(breakdownMin - totalMin) > EPSILON) {
    findings.push({
      id: template.id,
      name: template.name,
      file: String(template.__file),
      totalMin: Number(totalMin.toFixed(2)),
      breakdownMin: Number(breakdownMin.toFixed(2)),
      unzonedMin: Number(unzonedMin.toFixed(2)),
      unzonedPercent: totalMin > 0 ? Number(((unzonedMin / totalMin) * 100).toFixed(1)) : 0,
      unparsedZones: [...new Set(unparsedZones)],
      typicalMin: typical?.min,
      typicalMax: typical?.max,
      outsideTypical,
    });
  }
}

if (process.argv.includes("--json")) {
  console.log(JSON.stringify({ total: templates.length, breakdownMismatches, findings }, null, 2));
} else {
  const withUnparsed = findings.filter((f) => f.unparsedZones.length > 0);
  const withUnzoned = findings.filter((f) => f.unzonedMin > EPSILON);
  const withDrift = findings.filter((f) => f.outsideTypical);

  console.log(`Templates scanned: ${templates.length}`);
  console.log(`  breakdown != total (must be 0) : ${breakdownMismatches}`);
  console.log(`  unparsable zone spec          : ${withUnparsed.length}`);
  console.log(`  unzoned time (own bar)        : ${withUnzoned.length}`);
  console.log(`  duration outside typical      : ${withDrift.length}`);

  if (withUnparsed.length > 0) {
    console.log(`\n--- Unparsable zone specs ---`);
    for (const f of withUnparsed) {
      console.log(`  ${f.id.padEnd(12)} ${f.unparsedZones.join(", ")}`);
    }
  }

  console.log(`\n--- Unzoned time, shown as its own bar ---`);
  for (const f of withUnzoned.sort((a, b) => b.unzonedPercent - a.unzonedPercent).slice(0, 15)) {
    console.log(`  ${f.id.padEnd(12)} ${String(f.unzonedPercent).padStart(5)}%  ${f.unzonedMin}min of ${f.totalMin}min  ${f.name}`);
  }

  console.log(`\n--- Duration drift vs typicalDuration ---`);
  for (const f of withDrift.sort((a, b) => b.totalMin - a.totalMin).slice(0, 20)) {
    console.log(`  ${f.id.padEnd(12)} computed ${String(f.totalMin).padStart(6)}min  declared ${f.typicalMin}-${f.typicalMax}min  ${f.name}`);
  }
}
