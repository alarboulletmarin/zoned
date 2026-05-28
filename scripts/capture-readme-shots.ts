/**
 * USAGE: bun run scripts/capture-readme-shots.ts
 *
 * Refreshes the screenshots in assets/ referenced by README.md. Captures
 * clean desktop renderings of the v0.6.0 editorial UI from zoned.run, in
 * French, in light or dark mode as needed.
 *
 * Output (overwrites):
 *   assets/home_fr_light.png         (landing viewport)
 *   assets/home_fr_dark.png          (landing viewport, dark)
 *   assets/libray_fr_light.png       (library viewport — kept original typo)
 *   assets/workout_fr_light.png      (one canonical workout detail)
 *   assets/plan_with_stats_fr_light.png (plan view)
 */

import { mkdirSync } from "fs";
import { join } from "path";
import puppeteer from "puppeteer";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "assets");
const BASE = process.env.ZONED_BASE_URL ?? "https://zoned.run";

type Shot = {
  file: string;
  url: string;
  theme: "light" | "dark";
  fullPage: boolean;
};

const SHOTS: Shot[] = [
  { file: "home_fr_light.png",          url: "/",             theme: "light", fullPage: false },
  { file: "home_fr_dark.png",           url: "/",             theme: "dark",  fullPage: false },
  { file: "libray_fr_light.png",        url: "/library",      theme: "light", fullPage: false },
  { file: "workout_fr_light.png",       url: "/workout/VMA-001", theme: "light", fullPage: false },
  { file: "plan_with_stats_fr_light.png", url: "/plan/new/prebuilt", theme: "light", fullPage: false },
];

const VIEWPORT_W = 1440;
const VIEWPORT_H = 900;

async function dismissBanners(page: import("puppeteer").Page) {
  await page.evaluate(() => {
    const all = Array.from(document.querySelectorAll("div, section, aside"));
    for (const el of all) {
      const txt = (el as HTMLElement).innerText || "";
      if (/Install Zoned|Installer Zoned/.test(txt) && txt.length < 400) {
        (el as HTMLElement).remove();
      }
    }
  }).catch(() => {});
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  for (const shot of SHOTS) {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({ "Accept-Language": "fr-FR,fr;q=0.9" });
    await page.setViewport({
      width: VIEWPORT_W,
      height: VIEWPORT_H,
      deviceScaleFactor: 2,
    });

    // Force French language + chosen theme before page scripts run.
    await page.evaluateOnNewDocument((theme: string) => {
      try {
        localStorage.setItem("zoned-language", "fr");
        localStorage.setItem("i18nextLng", "fr");
        // Theme is stored under `zoned-theme` by the ThemeProvider.
        localStorage.setItem("zoned-theme", theme);
      } catch {}
    }, shot.theme);

    const target = BASE + shot.url;
    console.log(`→ ${target}  (${shot.theme})`);
    await page.goto(target, { waitUntil: "networkidle0", timeout: 45000 });
    await page.waitForSelector("main", { timeout: 15000 }).catch(() => {});
    await page.evaluateHandle("document.fonts.ready");
    await dismissBanners(page);
    await new Promise((r) => setTimeout(r, 800));

    const out = join(OUT, shot.file);
    await page.screenshot({
      path: out,
      type: "png",
      fullPage: shot.fullPage,
      clip: shot.fullPage
        ? undefined
        : { x: 0, y: 0, width: VIEWPORT_W, height: VIEWPORT_H },
      omitBackground: false,
    });
    console.log(`  ✓ ${shot.file}`);
    await page.close();
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
