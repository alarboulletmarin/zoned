/**
 * Les cadres des dessins sont recopiés en dur à quatre endroits du code. Ce
 * test dit la vérité sur chacun : si un SVG est recoupé (scripts/doodles/
 * recut.mjs), la constante doit suivre — c'est arrivé trois fois le 6 sept.
 */
import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

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

  test("index.html : le duo inliné est le fichier, viewBox comprise", () => {
    const html = read("index.html");
    const [x, y, w, h] = viewBox("runners-duo");
    expect(html).toContain(`viewBox="${x.toFixed(1)} ${y.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}"`);
    expect(html).toContain(`aspect-ratio: ${w.toFixed(1)} / ${h.toFixed(1)};`);
    const ds = [...read("src/assets/doodles/runners-duo.svg").matchAll(/ d="([^"]+)"/g)].map((m) => m[1]);
    for (const d of ds) expect(html).toContain(d);
  });
});
