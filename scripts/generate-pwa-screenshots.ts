/**
 * USAGE:
 *   bun run dev &                             # ou build + preview sur :4173
 *   bun run generate:pwa-screenshots
 *
 * Capture les images que le manifeste PWA déclare (vite.config.ts). Chrome les
 * montre dans la fenêtre d'installation riche sur Android et sur bureau ; sans
 * elles, la fenêtre retombe sur le couple icône + nom.
 *
 * Deux facteurs de forme sont exigés pour la fenêtre riche :
 *   - wide   -> bureau,  1280×800
 *   - narrow -> mobile,   540×960
 *
 * En anglais, comme les chaînes du manifeste. Viser une autre cible avec
 * ZONED_BASE_URL.
 */

import { mkdirSync } from "fs";
import { join } from "path";
import puppeteer from "puppeteer";
import { dismissOverlays, seedApp, waitForApp, withLang, type Lang } from "./lib/capture-prep";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "public/screenshots");
const BASE = process.env.ZONED_BASE_URL ?? "http://localhost:5173";
const LOCALE: Lang = "en";

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

async function main() {
  mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  let failed = 0;

  try {
    for (const shot of SHOTS) {
      const page = await browser.newPage();
      await page.setViewport({ width: shot.width, height: shot.height, deviceScaleFactor: 1 });
      await seedApp(page, { lang: LOCALE, theme: "light" });

      process.stdout.write(`→ ${shot.formFactor.padEnd(6)} ${shot.width}×${shot.height} `);
      try {
        await page.goto(withLang(BASE, shot.url, LOCALE), {
          waitUntil: "networkidle0",
          timeout: 60_000,
        });
        await waitForApp(page);
        await dismissOverlays(page);

        await page.screenshot({
          path: join(OUT, shot.file),
          type: "png",
          clip: { x: 0, y: 0, width: shot.width, height: shot.height },
        });
        console.log(`✓ public/screenshots/${shot.file}`);
      } catch (err) {
        failed++;
        console.log(`✗ ${shot.file}: ${(err as Error).message}`);
      }
      await page.close();
    }
  } finally {
    await browser.close();
  }

  console.log("Garder `manifest.screenshots` (vite.config.ts) aligné sur cette liste.");

  // Une capture manquée laisserait le fichier de la passe précédente dans le
  // manifeste, c'est-à-dire une vieille image dans la fenêtre d'installation.
  if (failed) {
    console.error(`${failed} capture(s) en échec.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Échec des captures PWA :", err);
  process.exit(1);
});
