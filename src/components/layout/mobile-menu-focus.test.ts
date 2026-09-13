/**
 * Le menu mobile ne doit porter l'anneau vermillon NI à l'ouverture, autour de
 * la porte Aujourd'hui, NI à la sortie, autour du hamburger.
 *
 * Le second cas est le même anneau que le premier, déplacé. Un `focus()` de
 * script emporte l'état focus-visible de l'élément qu'il remplace : à la
 * fermeture, celui-ci est `.zn-menu__inner`, dont l'anneau est masqué et non
 * éteint, et le déclencheur, lui, n'a pas de reset. Une porte tapée n'a donc
 * pas à rendre le focus au déclencheur — elle emmène ailleurs — et c'est le
 * drapeau `handoff` qui le dit, celui-là même que la recherche lève déjà.
 *
 * L'ouverture. Le correctif tient en deux moitiés qui ne servent à
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

describe("le menu mobile ne se referme pas sur un hamburger focusé", () => {
  const src = read("src/components/layout/MobileMenu.tsx");

  test("la fermeture par navigation passe la main au lieu de rendre le focus", () => {
    // L'effet qui suit `pathname`. La garde sur `open` compte autant que le
    // drapeau : un drapeau levé par la passe de montage, ou par une navigation
    // faite hors du panneau, resterait levé et mangerait le retour de focus de
    // la fermeture suivante, celle du clavier.
    const effect = src.match(/useEffect\(\(\) => \{([^}]*?)close\(\);\s*\}, \[pathname, close\]\);/)![1];
    expect(effect).toContain("if (!dialogRef.current?.open) return;");
    expect(effect).toContain("handoff.current = true;");
    expect(effect.indexOf("open) return")).toBeLessThan(effect.indexOf("handoff.current = true"));
  });

  test("le drapeau coupe le retour de focus, et se rabaisse tout seul", () => {
    expect(src).toMatch(
      /if \(handoff\.current\) \{\s*handoff\.current = false;\s*return;\s*\}[\s\S]*?triggerRef\.current\?\.focus\(\);/,
    );
    // Le retour de focus reste écrit une seule fois : Escape, la pilule et le
    // glissé le veulent toujours.
    expect(src.match(/triggerRef\.current\?\.focus\(\)/g)).toHaveLength(1);
  });
});
