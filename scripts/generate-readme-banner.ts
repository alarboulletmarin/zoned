/**
 * USAGE: bun run scripts/generate-readme-banner.ts
 *
 * The README banner: the site share card of scripts/generate-og-image.ts,
 * recomposed in 1280×400 and rendered at 2× in both themes —
 *   assets/readme-banner-light.png
 *   assets/readme-banner-dark.png
 * README.md shows them in a <picture> keyed on prefers-color-scheme, so the
 * banner follows the reader's GitHub theme the way the app follows the OS.
 */

import { writeFileSync } from "fs";
import { join } from "path";
import { buildCards, buildHtml, captureOne, launchBrowser, type FormatConfig } from "./generate-og-image";
import { readSiteStats } from "./site-stats";

const ROOT = join(import.meta.dirname, "..");

// 400px tall: the duo at 380 wide is 282 tall and fits the 297px stage with
// the numbers beside it; the lede wraps to two lines at 34ch.
const BANNER: FormatConfig = {
  name: "readme",
  w: 1280, h: 400,
  pxX: 64, pxTop: 40, pxBottom: 32,
  wordmarkFs: 64,
  ledeFs: 22, ledeMax: 34,
  valueFs: 48, labelFs: 13, metaFs: 13,
  statGap: 36,
  duoW: 380, rule: 1.5,
};

async function main() {
  const [site] = buildCards(readSiteStats());
  const browser = await launchBrowser();
  try {
    for (const theme of ["light", "dark"] as const) {
      const png = await captureOne(browser, BANNER, buildHtml(BANNER, site, theme), 2);
      const out = `assets/readme-banner-${theme}.png`;
      writeFileSync(join(ROOT, out), png);
      console.log(`  ${BANNER.w}×${BANNER.h} @2x → ${out}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Failed to generate the README banner:", err);
  process.exit(1);
});
