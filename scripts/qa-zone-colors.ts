/**
 * Guard: the hex tables in src/lib/zoneColors.ts must match the CSS custom
 * properties in src/styles/themes.css.
 *
 * The DOM reads `var(--zone-N)`; exports (PDF, share images) cannot, so they
 * read the TS table. Two sources exist by necessity — this check makes sure
 * they never say different things, which is how the PDF ramp ended up off by
 * one zone.
 *
 * Usage: bun run scripts/qa-zone-colors.ts   (exits 1 on mismatch)
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { getZoneHexMap, type ThemeMode } from "../src/lib/zoneColors";
import type { Discipline, ZoneNumber } from "../src/types";

const CSS_PATH = join(import.meta.dir, "..", "src", "styles", "themes.css");
const css = readFileSync(CSS_PATH, "utf8");

// themes.css is one `:root { ... }` block followed by one `.dark { ... }`.
const darkIndex = css.indexOf(".dark {");
if (darkIndex === -1) {
  console.error("Could not locate the .dark block in themes.css");
  process.exit(1);
}
const blocks: Record<ThemeMode, string> = {
  light: css.slice(0, darkIndex),
  dark: css.slice(darkIndex),
};

const VAR_PREFIX: Record<Discipline, string> = {
  running: "--zone-",
  cycling: "--zone-cyclo-",
  swimming: "--zone-swim-",
};

const failures: string[] = [];

for (const theme of ["light", "dark"] as ThemeMode[]) {
  for (const discipline of Object.keys(VAR_PREFIX) as Discipline[]) {
    const map = getZoneHexMap({ theme, discipline });
    for (let zone = 1 as ZoneNumber; zone <= 6; zone++) {
      const varName = `${VAR_PREFIX[discipline]}${zone}`;
      // `--zone-1:` must not match `--zone-1-bg:`; require the colon directly.
      const match = blocks[theme].match(new RegExp(`${varName}\\s*:\\s*(#[0-9a-fA-F]{3,8})\\s*;`));
      if (!match) {
        failures.push(`${theme}/${discipline} Z${zone}: ${varName} not found in themes.css`);
        continue;
      }
      const cssHex = match[1].toLowerCase();
      const tsHex = map[zone as ZoneNumber].toLowerCase();
      if (cssHex !== tsHex) {
        failures.push(`${theme}/${discipline} Z${zone}: themes.css ${cssHex} vs zoneColors.ts ${tsHex}`);
      }
    }
  }
}

if (failures.length > 0) {
  console.error(`Zone colour drift (${failures.length}):`);
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log("Zone colours match themes.css across light/dark and all 3 disciplines.");
