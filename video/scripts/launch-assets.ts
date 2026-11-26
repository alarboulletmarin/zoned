/**
 * Everything the Launch film reads from public/, rebuilt from the current app:
 * the three fonts, four app screens photographed live, and the score
 * (scripts/launch-score.ts). All of it is gitignored.
 *
 *   (cd .. && bun run dev)                      # or any served build
 *   bun run launch:assets
 *   npx remotion render Launch-Square-EN out/Launch-Square-EN.mp4
 *
 * The screens are captured, never copied from ../assets/: those PNGs are framed
 * for the README and age with it, and a launch film showing last month's
 * navigation is exactly the wrong film.
 *
 * ZONED_BASE_URL (default http://localhost:5173) picks the app to photograph.
 * REMOTION_BROWSER_EXECUTABLE, when set, is the Chrome puppeteer drives.
 */

import { copyFileSync, mkdirSync } from "fs";
import { join } from "path";
import puppeteer from "puppeteer";

const ROOT = join(import.meta.dirname, "..");
const APP = join(ROOT, "..");
const OUT = join(ROOT, "public", "launch");
const BASE = process.env.ZONED_BASE_URL ?? "http://localhost:5173";

const FONTS = ["bricolage-grotesque-latin.woff2", "space-grotesk-latin.woff2", "jetbrains-mono-latin.woff2"];
mkdirSync(join(ROOT, "public", "fonts"), { recursive: true });
for (const f of FONTS) copyFileSync(join(APP, "public", "fonts", f), join(ROOT, "public", "fonts", f));

/** The four screens of the montage, in English, light theme, 1440 wide @2x. */
const SCREENS: Record<string, string> = {
  workout: "/workout/VMA-001",
  plan: "/plan/prebuilt/marathon",
  library: "/library",
  zones: "/calculators/zones",
};

mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: process.env.REMOTION_BROWSER_EXECUTABLE,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
await page.emulateMediaFeatures([{ name: "prefers-color-scheme", value: "light" }]);
for (const [id, path] of Object.entries(SCREENS)) {
  await page.goto(`${BASE}${path}?lang=en`, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));
  await page.screenshot({ path: join(OUT, `${id}.png`) as `${string}.png` });
  console.log(`screen ${id} · ${await page.title()}`);
}
await browser.close();

await import("./launch-score.ts");
