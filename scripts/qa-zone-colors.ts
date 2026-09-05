/**
 * Guard: the hex tables in src/lib/zoneColors.ts must match the ink ramp in
 * src/styles/design/zones.css.
 *
 * The DOM reads `var(--zone-N)`; exports (PDF, share images) cannot, so they
 * read the TS table. Two sources exist by necessity — this check makes sure
 * they never say different things, which is how the PDF ramp ended up off by
 * one zone.
 *
 * The redesign made the CSS side an rgba ink rather than a literal hex, so the
 * check no longer compares strings: it composites the ramp over the same paper
 * the browser would, and compares the result. That is a stricter invariant than
 * the old one — the alpha ladder, the ink and the paper all have to agree, not
 * just twelve copied hexes.
 *
 * Usage: bun run scripts/qa-zone-colors.ts   (exits 1 on mismatch)
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getZoneHexMap, UNZONED_HEX, type ThemeMode } from "../src/lib/zoneColors";
import type { Discipline, ZoneNumber } from "../src/types";

const STYLES = join(import.meta.dir, "..", "src", "styles", "design");
const zonesCss = readFileSync(join(STYLES, "zones.css"), "utf8");
const colorsCss = readFileSync(join(STYLES, "colors.css"), "utf8");

/** The `:root { ... }` or `.dark { ... }` body of a stylesheet. */
function block(css: string, selector: string, file: string): string {
  const start = css.indexOf(`${selector} {`);
  if (start === -1) throw new Error(`Could not locate the ${selector} block in ${file}`);
  const end = css.indexOf("}", start);
  if (end === -1) throw new Error(`Unterminated ${selector} block in ${file}`);
  return css.slice(start, end);
}

function declaration(css: string, name: string): string | null {
  const match = css.match(new RegExp(`${name}\\s*:\\s*([^;]+);`));
  return match ? match[1].trim() : null;
}

type Rgb = [number, number, number];

function parseHex(value: string): Rgb | null {
  const match = value.match(/^#([0-9a-fA-F]{6})$/);
  if (!match) return null;
  const n = parseInt(match[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function parseRgba(value: string): { rgb: Rgb; alpha: number } | null {
  const match = value.match(/^rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)$/);
  if (!match) return null;
  return {
    rgb: [Number(match[1]), Number(match[2]), Number(match[3])],
    alpha: Number(match[4]),
  };
}

function toHex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/** Source-over compositing, the same maths the browser runs for an rgba fill. */
function composite(ink: Rgb, alpha: number, paper: Rgb): Rgb {
  return ink.map((c, i) => Math.round(paper[i] + (c - paper[i]) * alpha)) as Rgb;
}

const SELECTOR: Record<ThemeMode, string> = { light: ":root", dark: ".dark" };
const DISCIPLINES: Discipline[] = ["running", "cycling", "swimming"];

const failures: string[] = [];

for (const theme of ["light", "dark"] as ThemeMode[]) {
  const zones = block(zonesCss, SELECTOR[theme], "design/zones.css");
  const colors = block(colorsCss, SELECTOR[theme], "design/colors.css");

  // Zone fills land on the card surface — that is what ZoneBar and every chip
  // paint themselves on, so that is the paper the ramp has to be composited
  // against for an export to look like the screen.
  const paperValue = declaration(colors, "--paper-raised");
  const paper = paperValue ? parseHex(paperValue) : null;
  if (!paper) {
    failures.push(`${theme}: --paper-raised is missing or not a #rrggbb value in design/colors.css`);
    continue;
  }

  const expected = getZoneHexMap({ theme });

  for (let zone = 1 as ZoneNumber; zone <= 6; zone++) {
    const value = declaration(zones, `--zone-${zone}`);
    if (!value) {
      failures.push(`${theme} Z${zone}: --zone-${zone} not found in design/zones.css`);
      continue;
    }

    const solid = parseHex(value);
    const ink = parseRgba(value);
    if (!solid && !ink) {
      failures.push(`${theme} Z${zone}: --zone-${zone} is "${value}", expected #rrggbb or rgba()`);
      continue;
    }

    const cssHex = solid ? toHex(solid) : toHex(composite(ink!.rgb, ink!.alpha, paper));
    const tsHex = expected[zone].toLowerCase();
    if (cssHex !== tsHex) {
      failures.push(
        `${theme} Z${zone}: design/zones.css composites to ${cssHex} vs zoneColors.ts ${tsHex}`,
      );
    }
  }

  // A recovery block is not a zone: it falls back to the sunken paper it would
  // be cut out of, never to a ramp value.
  if (theme === "light") {
    const sunken = declaration(colors, "--paper-sunken");
    if (sunken?.toLowerCase() !== UNZONED_HEX.toLowerCase()) {
      failures.push(`UNZONED_HEX ${UNZONED_HEX} vs --paper-sunken ${sunken}`);
    }
  }
}

// One ramp for the three disciplines: an effort in Z4 is an effort in Z4.
// Kept as an assertion so a discipline-specific table cannot creep back in.
for (const discipline of DISCIPLINES) {
  for (const theme of ["light", "dark"] as ThemeMode[]) {
    const map = getZoneHexMap({ theme, discipline });
    const base = getZoneHexMap({ theme });
    for (let zone = 1 as ZoneNumber; zone <= 6; zone++) {
      if (map[zone] !== base[zone]) {
        failures.push(
          `${theme}/${discipline} Z${zone}: ${map[zone]} diverges from the shared ramp ${base[zone]}`,
        );
      }
    }
  }
}

if (failures.length > 0) {
  console.error(`Zone colour drift (${failures.length}):`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log(
  "Zone colours match design/zones.css: the ink ramp composites to the exported hexes in both themes.",
);
