import { describe, expect, test } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";

/**
 * Le garde-fou de l'icône d'écran d'accueil.
 *
 * Une icône de PWA ne se teste que sur un vrai téléphone : on déploie, on
 * ajoute à l'écran d'accueil, on regarde. Deux tours ont déjà été payés comme
 * ça, le second parce qu'un SVG était entré en tête des `icons` du manifeste.
 *
 * Depuis iOS 16.4, un manifeste qui déclare des `icons` est PRÉFÉRÉ à
 * <link rel="apple-touch-icon"> : ce n'est plus un repli, c'est la liste que
 * Safari lit. Et un écran d'accueil iOS ne pose pas un vecteur. Un SVG en
 * `sizes: "any"` répond à toutes les tailles demandées, donc Safari l'élisait,
 * ne le rasterisait pas, et l'app arrivait en pastille grise frappée de
 * l'initiale du <title>, sans jamais descendre jusqu'aux PNG.
 *
 * Ce test lit `vite.config.ts` par regex, la même astuce que
 * `nav-coverage.test.ts`, parce que le manifeste n'existe qu'au build.
 */

const CONFIG = readFileSync(join(import.meta.dirname, "../../vite.config.ts"), "utf8");

const iconsBlock = CONFIG.match(/\n\s*icons:\s*\[([\s\S]*?)\n\s*\],/);

describe("icônes du manifeste PWA", () => {
  test("le bloc `icons` est trouvé dans vite.config.ts", () => {
    expect(iconsBlock).not.toBeNull();
  });

  test("aucune icône vectorielle : iOS ne rasterise pas un SVG d'écran d'accueil", () => {
    expect(iconsBlock![1]).not.toContain("image/svg+xml");
    expect(iconsBlock![1]).not.toContain(".svg");
  });

  test("une icône `any` de 512 px, à laquelle toute plateforme peut se rabattre", () => {
    const sources = [...iconsBlock![1].matchAll(/src:\s*"([^"]+)"/g)].map((m) => m[1]);
    expect(sources).toContain("pwa-512x512.png");
    expect(sources.every((src) => src.endsWith(".png"))).toBe(true);
  });
});
