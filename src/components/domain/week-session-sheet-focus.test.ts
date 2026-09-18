/**
 * La feuille d'une séance de la semaine ne s'ouvre PAS sur son champ de durée.
 *
 * Laissé au navigateur, showModal() pose le focus sur le premier contrôle du
 * panneau, et c'est le champ de durée : un téléphone y répond par son clavier
 * et un zoom, la feuille s'ouvrait donc sur une question que personne n'avait
 * posée. Le focus d'ouverture vise le corps de la feuille (`initialFocus`),
 * qui est focusable sans arrêt de tabulation (`tabIndex={-1}`), et dont
 * l'anneau est éteint hors couche dans base.css, comme celui du menu mobile.
 *
 * Même geste que `layout/mobile-menu-focus.test.ts` : le test lit les
 * sources, `bun test` n'a pas de DOM, et un DOM simulé n'implémente de toute
 * façon pas les dialog focusing steps.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(import.meta.dir, "../../..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("la feuille d'une séance s'ouvre sans focuser le champ de durée", () => {
  test("le focus d'ouverture vise le corps de la feuille", () => {
    const src = read("src/components/domain/WeekSessionSheet.tsx");

    expect(src).toContain("initialFocus={bodyRef}");
    const body = src.match(/<form[^>]*className="zn-wksheet__body"[^>]*>/)![0];
    expect(body).toContain("ref={bodyRef}");
    expect(body).toContain("tabIndex={-1}");

    // Aucun champ n'est focusé par le code ni par l'attribut.
    expect(src).not.toMatch(/autoFocus/);
    expect(src).not.toMatch(/\.focus\(\)/);
  });

  test("le moteur pose l'autofocus AVANT showModal(), puis le rappelle", () => {
    const src = read("src/components/ui/native-dialog.tsx");
    expect(src).toMatch(
      /setAttribute\("autofocus", ""\);[\s\S]*?dialog\.showModal\(\);[\s\S]*?target\.focus\(\{ preventScroll: true \}\)/,
    );
  });

  test("le reset de l'anneau du corps est dans base.css, hors couche", () => {
    const css = read("src/styles/base.css").replace(/\/\*[\s\S]*?\*\//g, "");
    const at = css.indexOf(".zn-wksheet__body:focus-visible");
    expect(at, "le reset doit exister dans src/styles/base.css").toBeGreaterThan(-1);
    const before = css.slice(0, at);
    const depth =
      (before.match(/\{/g)?.length ?? 0) - (before.match(/\}/g)?.length ?? 0);
    expect(depth).toBe(0);
  });

  test("ajouter une activité ne rouvre plus la feuille sur la durée", () => {
    const src = read("src/pages/WeekViewPage.tsx");
    const add = src.slice(src.indexOf("const handleWorkoutAdd"), src.indexOf("const placeState"));
    expect(add).not.toContain("setSheetIndex(");
  });
});
