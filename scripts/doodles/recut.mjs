/* Recoupe le cadre de chaque figure de src/assets/doodles/ avec la règle de
 * rig.mjs : gauche, droite et haut à 6 unités des nombres émis (points de
 * contrôle compris), bas à 1,2 sous le point le plus bas du trait rendu
 * (strokeBottom). Ne touche qu'à l'attribut viewBox ; le trait reste identique
 * au byte près. Les flèches n'ont pas de sol et ne sont pas concernées.
 *
 *   bun scripts/doodles/recut.mjs
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { strokeBottom } from "./rig.mjs";

const DIR = new URL("../../src/assets/doodles/", import.meta.url).pathname;
const PAD = 6;
for (const f of readdirSync(DIR).filter((n) => n.endsWith(".svg") && !n.startsWith("arrow-")).sort()) {
  const s = readFileSync(DIR + f, "utf8");
  const ds = [...s.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]);
  const n = ds.flatMap((d) => d.match(/-?\d+(?:\.\d+)?/g).map(Number));
  const xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1);
  const x0 = Math.min(...xs) - PAD, y0 = Math.min(...ys) - PAD;
  const w = Math.max(...xs) + PAD - x0, h = strokeBottom(ds) + 1.2 - y0;
  const vb = `viewBox="${x0.toFixed(1)} ${y0.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}"`;
  const before = s.match(/viewBox="[^"]+"/)[0];
  if (before !== vb) writeFileSync(DIR + f, s.replace(before, vb));
  console.log(`${f.padEnd(20)} ${before === vb ? "=" : "→"} ${vb}`);
}
