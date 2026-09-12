/**
 * `LOGO_RATIO` est le rapport du cadre de `src/assets/logo.svg`, recopié dans
 * le code parce qu'un SVG importé en `?react` est un composant et que son
 * `viewBox` n'est pas lisible à l'exécution. Le logo est de la sortie générée
 * (`scripts/generate-wordmark.mjs`) : le jour où le mot, la graisse ou
 * l'approche changent, le cadre change, et la constante doit suivre — sinon le
 * mot flotte au milieu de sa boîte sur les vingt-sept cartes de partage.
 *
 * Même motif que `src/assets/doodles/frames.test.ts` pour les cadres des
 * dessins, où trois constantes avaient dérivé en une journée.
 */
import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LOGO_RATIO } from "./_shared";

test("LOGO_RATIO suit le cadre de logo.svg", () => {
  const svg = readFileSync(join(import.meta.dir, "../../../assets/logo.svg"), "utf8");
  const [, , w, h] = svg.match(/viewBox="([^"]+)"/)![1].split(" ").map(Number);
  expect(Math.abs(LOGO_RATIO - w / h)).toBeLessThan(5e-4);
});
