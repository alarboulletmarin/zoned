/**
 * USAGE:
 *   bun run capture:readme                                   # anglais, depuis le serveur local
 *   ZONED_LOCALE=fr bun run capture:readme
 *   ZONED_BASE_URL=https://zoned.run bun run capture:readme
 *
 * Refait les captures de `assets/` que le README montre : des rendus bureau
 * propres, en clair ou en sombre selon la vue.
 *
 * Anglais par défaut : le README est écrit en anglais, des captures françaises
 * faisaient dire deux choses à la même page. Le nom de fichier porte la langue,
 * donc changer de langue produit un jeu distinct au lieu d'écraser l'autre.
 *
 * La cible par défaut est le serveur local (`bun run dev`), pas la production :
 * une capture doit montrer le dépôt tel qu'il est, pas ce qui est déployé.
 *
 * Sortie (écrase), avec <l> = langue :
 *   assets/home_<l>_light.png            (page d'accueil)
 *   assets/home_<l>_dark.png             (page d'accueil, sombre)
 *   assets/library_<l>_light.png         (bibliothèque)
 *   assets/workout_<l>_light.png         (une séance canonique)
 *   assets/plan_with_stats_<l>_light.png (plans prêts à l'emploi)
 */

import { mkdirSync } from "fs";
import { join } from "path";
import puppeteer from "puppeteer";
import { dismissOverlays, seedApp, waitForApp, withLang, type Lang, type Theme } from "./lib/capture-prep";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "assets");
const BASE = process.env.ZONED_BASE_URL ?? "http://localhost:5173";

type Shot = {
  file: string;
  url: string;
  theme: Theme;
};

const LOCALE: Lang = process.env.ZONED_LOCALE === "fr" ? "fr" : "en";

const SHOTS: Shot[] = [
  { file: `home_${LOCALE}_light.png`, url: "/", theme: "light" },
  { file: `home_${LOCALE}_dark.png`, url: "/", theme: "dark" },
  { file: `library_${LOCALE}_light.png`, url: "/library", theme: "light" },
  { file: `workout_${LOCALE}_light.png`, url: "/workout/VMA-001", theme: "light" },
  { file: `plan_with_stats_${LOCALE}_light.png`, url: "/plan/new/prebuilt", theme: "light" },
];

const VIEWPORT_W = 1440;
const VIEWPORT_H = 900;

async function main() {
  mkdirSync(OUT, { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  let failed = 0;

  for (const shot of SHOTS) {
    const page = await browser.newPage();
    await page.setViewport({
      width: VIEWPORT_W,
      height: VIEWPORT_H,
      deviceScaleFactor: 2,
    });
    await seedApp(page, { lang: LOCALE, theme: shot.theme });

    const target = withLang(BASE, shot.url, LOCALE);
    process.stdout.write(`→ ${shot.url}  (${shot.theme}) `);
    try {
      await page.goto(target, { waitUntil: "networkidle0", timeout: 60_000 });
      await waitForApp(page);
      await dismissOverlays(page);

      await page.screenshot({
        path: join(OUT, shot.file),
        type: "png",
        clip: { x: 0, y: 0, width: VIEWPORT_W, height: VIEWPORT_H },
      });
      console.log(`✓ ${shot.file}`);
    } catch (err) {
      failed++;
      console.log(`✗ ${shot.file}: ${(err as Error).message}`);
    }
    await page.close();
  }

  await browser.close();

  // Une capture manquée laisse en place le fichier de la passe précédente, donc
  // une passe partiellement ratée mettrait une vieille image dans le README.
  if (failed) {
    console.error(`${failed} capture(s) en échec.`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
