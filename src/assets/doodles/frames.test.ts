/**
 * Les cadres des dessins sont recopiés en dur à quatre endroits du code. Ce
 * test dit la vérité sur chacun : si un SVG est recoupé (scripts/doodles/
 * recut.mjs), la constante doit suivre — c'est arrivé trois fois le 6 sept.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
/* Le gréement lui-même : c'est LUI la source de vérité pour le bas du trait
   rendu (cubiques échantillonnées, demi-épaisseur comprise). Le réimplémenter
   ici ferait vérifier au test sa propre copie de la règle au lieu de la vraie.
   Les fichiers de test sont exclus de tsconfig, donc un .mjs sans types passe. */
import { strokeBottom } from "../../../scripts/doodles/rig.mjs";

const ROOT = join(import.meta.dir, "../../..");
const viewBox = (name: string) => {
  const s = readFileSync(join(ROOT, "src/assets/doodles", `${name}.svg`), "utf8");
  return s.match(/viewBox="([^"]+)"/)![1].split(" ").map(Number) as [number, number, number, number];
};
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("les cadres recopiés suivent les fichiers SVG", () => {
  test("PlanViewPage : les sept rapports d'aspect de POSES", () => {
    const src = read("src/pages/PlanViewPage.tsx");
    const imports = Object.fromEntries([...src.matchAll(/import (\w+) from "@\/assets\/doodles\/([\w-]+)\.svg\?react"/g)].map((m) => [m[1], m[2]]));
    const poses = [...src.matchAll(/(\w+): \{ Art: (\w+), foot: [0-9.]+, aspect: ([0-9.]+)/g)];
    expect(poses.length).toBe(7);
    for (const [, key, art, aspect] of poses) {
      const [, , w, h] = viewBox(imports[art]);
      expect(Math.abs(Number(aspect) - w / h), `${key} (${imports[art]})`).toBeLessThan(5e-4);
    }
  });

  test("ZoneFigures : les six largeurs de FIGURES", () => {
    const src = read("src/components/domain/ZoneFigures.tsx");
    const widths = [...src.matchAll(/\[Zone(\d), ([0-9.]+)\]/g)];
    expect(widths.length).toBe(6);
    for (const [, n, w] of widths) expect(Number(w)).toBe(viewBox(`zone-${n}`)[2]);
  });

  test("zone-figures.css : la scène a la hauteur de la plus haute figure", () => {
    const css = read("src/styles/components/zone-figures.css");
    const h = Number(css.match(/block-size: calc\(([0-9.]+) \* var\(--zfig-scale\) \* 1px\)/)![1]);
    const tallest = Math.max(...[1, 2, 3, 4, 5, 6].map((n) => viewBox(`zone-${n}`)[3]));
    expect(h).toBe(tallest);
  });

  /* Le duo était inliné ici lui aussi, et ce test le gardait. Il a quitté la
     coquille le 9 septembre 2026 : une figure par écran, et un dessin remplace
     au lieu de s'ajouter. Il reste dans le hero, le menu mobile, la feuille de
     partage et l'image Open Graph — mais plus dans index.html, donc plus rien
     à garder ici. */

  /* Le cycle de foulée est inliné dans la coquille comme le duo, et il porte
     en plus une CADENCE, recopiée elle aussi. Trois endroits doivent
     s'accorder : le SVG (combien d'images), le CSS inline de index.html et
     src/styles/components/run-cycle.css (leurs délais et leur palier). Une
     image ajoutée au générateur sans toucher aux deux CSS ferait sauter une
     pose sur six, en silence. */
  test("index.html : le cycle inliné est le fichier, cadence comprise", () => {
    const html = read("index.html");
    const svg = read("src/assets/doodles/run-cycle.svg");
    const css = read("src/styles/components/run-cycle.css");
    const [x, y, w, h] = viewBox("run-cycle");

    expect(html).toContain(`viewBox="${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}"`);
    expect(html).toContain(`aspect-ratio: ${w} / ${h};`);
    for (const d of [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1])) expect(html).toContain(d);

    const n = [...svg.matchAll(/class="rc-f rc-f--(\d+)"/g)].length;
    expect(n).toBeGreaterThanOrEqual(4);
    for (let i = 1; i <= n; i++) {
      expect(html, `index.html manque .rc-f--${i}`).toContain(`.rc-f--${i} {`);
      expect(css, `run-cycle.css manque .rc-f--${i}`).toContain(`.rc-f--${i} {`);
    }
    expect([...css.matchAll(/\.rc-f--(\d+) \{ animation-delay/g)].length).toBe(n);

    const num = (src: string, k: string) => Number(src.match(new RegExp(`--rc-${k}:\\s*(\\d+)ms`))![1]);
    const [step, dur] = [num(html, "step"), num(html, "dur")];
    expect(dur).toBe(step * n);
    expect(num(css, "step")).toBe(step);
    expect(num(css, "dur")).toBe(dur);
    // la fenêtre visible vaut exactement une image du cycle
    const stop = Number(html.match(/(\d+\.\d+)%,\s*100% \{ opacity: 0/)![1]);
    expect(Math.abs(stop - 100 / n)).toBeLessThan(0.02);

    /* Et la retenue de la coquille couvre un nombre ENTIER de foulées, à partir
       du moment où la figure part (--rc-start). C'est la propriété qui compte :
       une retenue arrondie à la seconde couperait la figure en plein pas, et
       rien d'autre ne s'en apercevrait. Le nombre de foulées, lui, est libre —
       c'est le réglage du propriétaire. */
    const start = num(html, "start");
    const hold = Number(read("src/main.tsx").match(/SHELL_HOLD_MS = (\d+)/)![1]);
    expect(hold, "SHELL_HOLD_MS doit dépasser --rc-start").toBeGreaterThan(start);
    expect((hold - start) % dur, "la retenue doit couvrir des foulées entières").toBe(0);
  });

  /* La règle 3 de docs/doodles.md, vérifiée sur les nombres plutôt que de
     confiance : le vermillon marque un contact RÉEL. Une figure qui court le
     perd un tiers du temps — elle est en l'air — et un accent peint sur une
     semelle qui ne touche rien est la faute, pas une licence. */
  test("run-cycle : une seule ligne de sol, et aucun accent en l'air", () => {
    const svg = read("src/assets/doodles/run-cycle.svg");
    const groups = [...svg.matchAll(/<g class="rc-f[^"]*">([\s\S]*?)<\/g>/g)].map((m) => m[1]);
    expect(groups.length).toBeGreaterThanOrEqual(4);
    const ds = (g: string) => [...g.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
    const accents = (g: string) => [...g.matchAll(/stroke="var\(--accent\)" d="([^"]+)"/g)].map((m) => m[1]);
    const posees = groups.filter((g) => accents(g).length > 0);
    const enVol = groups.filter((g) => accents(g).length === 0);
    expect(posees.length).toBeGreaterThan(0);
    expect(enVol.length).toBeGreaterThan(0);

    const sol = Math.max(...posees.map((g) => strokeBottom(accents(g))));
    for (const g of posees) {
      // même ligne de sol, et c'est l'accent qui la touche — rien ne passe dessous
      expect(Math.abs(strokeBottom(accents(g)) - sol)).toBeLessThan(0.25);
      expect(strokeBottom(ds(g)) - sol).toBeLessThan(0.25);
    }
    for (const g of enVol) {
      // vraiment en l'air : pas « un accent oublié », un décollage qui se voit
      expect(sol - strokeBottom(ds(g))).toBeGreaterThan(8);
    }
  });
});
