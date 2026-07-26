/**
 * USAGE:
 *   bun run build && bun run preview &        # serve dist/ on :4173
 *   bun run scripts/generate-pwa-screenshots.ts
 *
 * Captures the screenshots referenced by the PWA manifest (vite.config.ts).
 * Chrome shows them in the richer install prompt on Android and desktop; a
 * manifest without them falls back to the bare icon-and-name dialog.
 *
 * Two form factors are required for the rich prompt:
 *   - "wide"   → desktop, 1280×800
 *   - "narrow" → mobile,   540×960
 *
 * Captured in English (i18next locale is forced via localStorage) to match the
 * manifest strings. Override the target with ZONED_BASE_URL to shoot against
 * production instead of a local preview.
 */

import { mkdirSync } from "fs";
import { join } from "path";
import puppeteer from "puppeteer";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "public/screenshots");
const BASE = process.env.ZONED_BASE_URL ?? "http://localhost:4173";

type Shot = {
  file: string;
  url: string;
  width: number;
  height: number;
  formFactor: "wide" | "narrow";
};

const SHOTS: Shot[] = [
  { file: "wide-home.png", url: "/", width: 1280, height: 800, formFactor: "wide" },
  { file: "wide-library.png", url: "/library", width: 1280, height: 800, formFactor: "wide" },
  { file: "narrow-home.png", url: "/", width: 540, height: 960, formFactor: "narrow" },
  { file: "narrow-library.png", url: "/library", width: 540, height: 960, formFactor: "narrow" },
];

/** Remove the install banner and any cookie/update toast from the shot. */
async function dismissBanners(page: import("puppeteer").Page) {
  await page.evaluate(() => {
    for (const el of Array.from(document.querySelectorAll("div, section, aside"))) {
      const txt = (el as HTMLElement).innerText || "";
      if (/Install Zoned|Installer Zoned/.test(txt) && txt.length < 400) {
        (el as HTMLElement).remove();
      }
    }
  });
}

async function main() {
  mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  try {
    for (const shot of SHOTS) {
      const page = await browser.newPage();
      await page.setViewport({ width: shot.width, height: shot.height, deviceScaleFactor: 1 });

      // Force English + light theme before the app boots.
      await page.evaluateOnNewDocument(() => {
        localStorage.setItem("i18nextLng", "en");
        localStorage.setItem("zoned-theme", "light");
      });

      await page.goto(`${BASE}${shot.url}`, { waitUntil: "networkidle0", timeout: 45_000 });
      await new Promise((r) => setTimeout(r, 1200));
      await dismissBanners(page);

      await page.screenshot({
        path: join(OUT, shot.file),
        type: "png",
        clip: { x: 0, y: 0, width: shot.width, height: shot.height },
      });
      console.log(`  ${shot.formFactor.padEnd(6)} ${shot.width}×${shot.height} → public/screenshots/${shot.file}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }

  console.log("Done. Keep vite.config.ts `manifest.screenshots` in sync with this list.");
}

main().catch((err) => {
  console.error("Failed to capture PWA screenshots:", err);
  process.exit(1);
});
