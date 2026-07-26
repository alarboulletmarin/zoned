/**
 * Catalogue counts read straight from the source data, shared by the build-time
 * generators (OG images, per-route meta) so a headline number can never drift
 * from what the app actually ships.
 *
 * Must mirror `useAppStats` (src/hooks/useAppStats.ts) so these match the
 * numbers users see on the About page: running + cycling + swimming + strength.
 */

import { readFileSync, readdirSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");

function countTemplatesInDir(dir: string): number {
  const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
  let total = 0;
  for (const file of files) {
    const data = JSON.parse(readFileSync(join(dir, file), "utf-8"));
    if (data.templates && Array.isArray(data.templates)) {
      total += data.templates.length;
    }
  }
  return total;
}

export function countWorkouts(): number {
  // src/data/workouts/*.json holds running + cycling + swimming files; strength sessions live separately.
  const main = countTemplatesInDir(join(ROOT, "src/data/workouts"));
  const strength = countTemplatesInDir(join(ROOT, "src/data/strength/sessions"));
  return main + strength;
}

export function countCalculators(): number {
  // Parse the CALCULATEURS array literal in CalculateursPage.tsx (single source of truth in-app).
  const src = readFileSync(join(ROOT, "src/pages/CalculateursPage.tsx"), "utf-8");
  const start = src.indexOf("export const CALCULATEURS");
  if (start === -1) throw new Error("CALCULATEURS array not found");
  const end = src.indexOf("\n];", start);
  if (end === -1) throw new Error("CALCULATEURS array terminator not found");
  const slice = src.slice(start, end);
  const matches = slice.match(/^\s+id:\s/gm);
  return matches ? matches.length : 0;
}

export function countPlans(): number {
  const dir = join(ROOT, "src/data/prebuilt-plans/plans");
  return readdirSync(dir).filter((f) => f.endsWith(".ts")).length;
}

export interface SiteStats {
  workouts: number;
  plans: number;
  calculators: number;
}

export function readSiteStats(): SiteStats {
  return {
    workouts: countWorkouts(),
    plans: countPlans(),
    calculators: countCalculators(),
  };
}
