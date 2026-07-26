/**
 * USAGE:
 *   bun run scripts/capture-readme-shots.ts              # English, from zoned.run
 *   ZONED_LOCALE=fr bun run scripts/capture-readme-shots.ts
 *   ZONED_BASE_URL=http://localhost:4173 bun run scripts/capture-readme-shots.ts
 *
 * Refreshes the screenshots in assets/ referenced by README.md. Captures clean
 * desktop renderings in light or dark mode as needed.
 *
 * English by default: README.md is written in English, so French screenshots
 * made the two disagree. File names carry the locale, so switching it produces
 * a distinct set rather than silently overwriting the other language.
 *
 * Output (overwrites), with <l> = locale:
 *   assets/home_<l>_light.png            (landing viewport)
 *   assets/home_<l>_dark.png             (landing viewport, dark)
 *   assets/library_<l>_light.png         (library viewport)
 *   assets/workout_<l>_light.png         (one canonical workout detail)
 *   assets/plan_with_stats_<l>_light.png (plan view)
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

const LOCALE = process.env.ZONED_LOCALE === "fr" ? "fr" : "en";
const ACCEPT_LANGUAGE = LOCALE === "fr" ? "fr-FR,fr;q=0.9" : "en-US,en;q=0.9";

const SHOTS: Shot[] = [
  { file: `home_${LOCALE}_light.png`,           url: "/",                  theme: "light", fullPage: false },
  { file: `home_${LOCALE}_dark.png`,            url: "/",                  theme: "dark",  fullPage: false },
  { file: `library_${LOCALE}_light.png`,        url: "/library",           theme: "light", fullPage: false },
  { file: `workout_${LOCALE}_light.png`,        url: "/workout/VMA-001",   theme: "light", fullPage: false },
  { file: `plan_with_stats_${LOCALE}_light.png`, url: "/plan/new/prebuilt", theme: "light", fullPage: false },
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
    await page.setExtraHTTPHeaders({ "Accept-Language": ACCEPT_LANGUAGE });
    await page.setViewport({
      width: VIEWPORT_W,
      height: VIEWPORT_H,
      deviceScaleFactor: 2,
    });

    // Force the chosen language + theme before page scripts run.
    await page.evaluateOnNewDocument(
      (theme: string, locale: string) => {
        try {
          localStorage.setItem("zoned-language", locale);
          localStorage.setItem("i18nextLng", locale);
          // Theme is stored under `zoned-theme` by the ThemeProvider.
          localStorage.setItem("zoned-theme", theme);
        } catch {}
      },
      shot.theme,
      LOCALE
    );

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
