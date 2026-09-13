/* Rasterise des doodles côte à côte, sur le papier ou sur l'encre.
 *
 * La direction artistique impose de regarder chaque dessin à sa taille réelle
 * et à 120 px avant de le valider : un trait qui tient à 340 px peut se fermer
 * en tache à la taille d'une carte. Ce script est l'outil de ce regard.
 *
 *   bun scripts/doodles/render.mjs vu.png "src/assets/doodles/runner.svg" 340,120
 *   bun scripts/doodles/render.mjs vu.png "a.svg,b.svg" 200 --dark
 */
import puppeteer from "puppeteer";
import { readFileSync } from "node:fs";
import { basename } from "node:path";

const [out, files, widths = "340", ...flags] = process.argv.slice(2);
if (!out || !files) {
  console.error("usage: render.mjs <sortie.png> <a.svg[,b.svg]> [largeurs] [--dark]");
  process.exit(1);
}
const dark = flags.includes("--dark");
const PAD = 24, GAP = 28, CAP = 22;

const cells = files.split(",").map((f) => f.trim()).filter(Boolean).flatMap((f) => {
  const svg = readFileSync(f, "utf8");
  const vb = svg.match(/viewBox="([-\d.\s]+)"/)[1].trim().split(/\s+/).map(Number);
  return widths.split(",").map(Number).map((w) => ({
    name: `${basename(f, ".svg")} · ${w}`, w, h: Math.round(w / (vb[2] / vb[3])), svg,
  }));
});

const W = PAD * 2 + cells.reduce((s, c) => s + c.w, 0) + GAP * (cells.length - 1);
const H = PAD * 2 + Math.max(...cells.map((c) => c.h)) + CAP;

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
// La taille est calculée avant le contenu : redimensionner après la peinture
// donne une capture en damier, sur ce Chrome comme sur les précédents.
await page.setViewport({ width: Math.ceil(W), height: Math.ceil(H), deviceScaleFactor: 2 });
await page.setContent(`<style>
  html,body{margin:0;background:${dark ? "#16150F" : "#F6F5F2"};color:${dark ? "#F2F0EA" : "#171614"};
    --accent:#E8452A;font:11px ui-monospace,monospace}
  .sheet{display:flex;gap:${GAP}px;padding:${PAD}px;align-items:flex-end}
  figure{margin:0}figcaption{opacity:.45;padding-top:6px}
  svg{display:block;width:100%;height:100%}
</style><div class="sheet">${cells.map((c) =>
  `<figure><div style="width:${c.w}px;height:${c.h}px">${c.svg}</div><figcaption>${c.name}</figcaption></figure>`).join("")}</div>`);
await new Promise((r) => setTimeout(r, 120));
await page.screenshot({ path: out });
await browser.close();
console.log("→", out, `${Math.ceil(W)}x${Math.ceil(H)}`);
