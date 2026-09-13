/**
 * Le menu mobile ne doit pas s'ouvrir avec l'anneau vermillon autour de la
 * porte Aujourd'hui. Le correctif tient en deux moitiés qui ne servent à
 * rien l'une sans l'autre : le focus d'ouverture déplacé sur `.zn-menu__inner`
 * (MobileMenu.tsx) et le reset de son anneau écrit HORS COUCHE (base.css).
 * Séparer les deux fait revenir le cadre, et, si le reset descend dans
 * `components/mobile-menu.css`, il revient en faisant le tour de l'écran,
 * puisque le `tabindex="-1"` fait entrer le panneau dans la règle de focus
 * globale de base.css, que la couche des composants ne peut pas battre.
 *
 * Le test lit les sources, il ne monte rien : `bun test` n'a pas de DOM (ni
 * jsdom ni happy-dom dans ce dépôt, cf. `lib/theme.test.ts`), et un DOM simulé
 * n'implémente de toute façon pas les dialog focusing steps ni
 * `:focus-visible`, il rendrait le test vert quoi qu'on écrive. C'est le même
 * geste que `assets/doodles/frames.test.ts` : garder deux fichiers d'accord.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("le menu mobile ne s'ouvre pas sur une porte focusée", () => {
  test("l'ouverture pose le focus sur le panneau qui défile, pas sur une porte", () => {
    const src = read("src/components/layout/MobileMenu.tsx");

    // L'ordre compte : un focus posé avant showModal() serait repris par les
    // dialog focusing steps.
    expect(src).toMatch(/dialogRef\.current\?\.showModal\(\);[\s\S]*?innerRef\.current\?\.focus\(\);/);

    // La cible du focus est bien le scroller, et elle est focusable sans
    // ajouter d'arrêt de tabulation.
    const inner = src.match(/<div className="zn-menu__inner"[^>]*>/)![0];
    expect(inner).toContain("ref={innerRef}");
    expect(inner).toContain("tabIndex={-1}");

    // Aucune porte ne reçoit le focus par le code.
    expect(src).not.toMatch(/door[\w.?]*\.focus\(\)/i);
  });

  test("le reset de l'anneau du panneau est dans base.css, hors couche", () => {
    // Les commentaires portent des accolades dans cette feuille : les retirer
    // avant de compter la profondeur.
    const css = read("src/styles/base.css").replace(/\/\*[\s\S]*?\*\//g, "");
    const at = css.indexOf(".zn-menu__inner:focus-visible");
    expect(at, "le reset doit exister dans src/styles/base.css").toBeGreaterThan(-1);

    const before = css.slice(0, at);
    const depth =
      (before.match(/\{/g)?.length ?? 0) - (before.match(/\}/g)?.length ?? 0);
    expect(depth, "le reset doit être au premier niveau, hors @layer").toBe(0);

    expect(css.slice(at)).toMatch(/^\.zn-menu__inner:focus-visible\s*\{\s*outline:\s*none;/);
  });
});
