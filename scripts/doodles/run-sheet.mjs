/* run-sheet.mjs, regarder le cycle de foulée, ce que les nombres ne font pas.
 *
 * render.mjs lit des FICHIERS et pose les figures côte à côte ; les six images
 * du cycle sont des groupes dans un seul fichier, et ce qu'il faut vérifier
 * n'est pas chaque pose isolée mais leur SUITE. D'où ce script frère.
 *
 * Trois planches, dans l'ordre où elles servent :
 *   1. la bande, les six images côte à côte, dans le cadre partagé, donc sur
 *      une ligne de sol commune. À la taille de service et à 120 px, sur
 *      papier et sur encre (docs/doodles.md, rastériser à la taille réelle
 *      ET à 120 px).
 *   2. la pelure d'oignon, les six superposées, plus trois repères : le sol,
 *      le bassin d'appui, le sommet du crâne d'appui. On y lit d'un coup si le
 *      bassin décrit un arc, si le crâne décrit le MÊME (sinon la tête
 *      bobine), et si les quatre appuis tombent à quatre x distincts (sinon le
 *      pied patine).
 *   3. le flip, l'animation réelle à la cadence réelle, capturée à six
 *      décalages. Le stroboscope et le pop ne se voient que là.
 *
 *   bun scripts/doodles/run-sheet.mjs [--dark]
 */
import puppeteer from "puppeteer";
import { readFileSync, mkdirSync } from "node:fs";

const dark = process.argv.includes("--dark");
const SUF = dark ? "-sombre" : "";
const BG = dark ? "#16150F" : "#F6F5F2";
const FG = dark ? "#EDEBE7" : "#171614";
const OUT = new URL("../../.doodles-vu/", import.meta.url).pathname;
mkdirSync(OUT, { recursive: true });

const src = readFileSync(new URL("../../src/assets/doodles/run-cycle.svg", import.meta.url).pathname, "utf8");
const [vx, vy, vw, vh] = src.match(/viewBox="([^"]+)"/)[1].split(" ").map(Number);
const groups = [...src.matchAll(/<g class="rc-f rc-f--(\d+)">([\s\S]*?)<\/g>/g)].map((m) => m[2]);
const N = groups.length;
const STEP = 110, DUR = STEP * N;

/* Un seul groupe, dans le cadre COMMUN : c'est ce qui met les six sur la même
   ligne de sol. Recadrer chaque pose sur elle-même les ferait toutes flotter
   à la même hauteur, ce qui masquerait exactement le défaut qu'on cherche. */
const one = (i, cls = "") =>
  `<svg class="${cls}" viewBox="${vx} ${vy} ${vw} ${vh}" fill="none" stroke="currentColor"
     stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${groups[i]}</svg>`;

const shell = (body, extra = "") => `<style>
  html,body{margin:0;background:${BG};color:${FG};--accent:#E8452A;
    font:11px ui-monospace,SFMono-Regular,monospace}
  svg{display:block;width:100%;height:100%}
  figcaption{opacity:.45;padding-top:6px;text-align:center}
  ${extra}
</style>${body}`;

const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
const page = await browser.newPage();
const shoot = async (name, w, h, html) => {
  await page.setViewport({ width: Math.ceil(w), height: Math.ceil(h), deviceScaleFactor: 2 });
  await page.setContent(shell(html));
  await new Promise((r) => setTimeout(r, 140));
  await page.screenshot({ path: `${OUT}${name}${SUF}.png` });
  console.log(`→ .doodles-vu/${name}${SUF}.png`);
};

/* ── 1. la bande, à deux tailles ─────────────────────────────────────────── */
for (const W of [176, 120]) {
  const H = Math.round(W / (vw / vh));
  const cells = groups.map((_, i) =>
    `<figure style="margin:0"><div style="width:${W}px;height:${H}px">${one(i)}</div>
     <figcaption>${i + 1}</figcaption></figure>`).join("");
  await shoot(`bande-${W}`, 48 + N * W + (N - 1) * 20, 48 + H + 20,
    `<div style="display:flex;gap:20px;padding:24px;align-items:flex-end">${cells}</div>`);
}

/* ── 2. la pelure d'oignon ───────────────────────────────────────────────── */
{
  const W = 300, H = Math.round(W / (vw / vh));
  // Les repères sont en fraction de la hauteur du cadre : le sol est le bas du
  // viewBox par construction (docs/doodles.md, le bas du cadre EST la ligne
  // d'appui), le reste se mesure sur le dessin lui-même.
  const stack = groups.map((_, i) =>
    `<div style="position:absolute;inset:0;opacity:.34">${one(i)}</div>`).join("");
  await shoot("pelure", W + 48, H + 68,
    `<div style="padding:24px"><div style="position:relative;width:${W}px;height:${H}px">
       ${stack}
       <div style="position:absolute;left:0;right:0;bottom:0;height:1px;background:#E8452A"></div>
     </div><figcaption>les six superposées · la ligne rouge est le sol</figcaption></div>`);
}

/* ── 3. le flip, à la cadence réelle ─────────────────────────────────────── */
{
  const W = 176, H = Math.round(W / (vw / vh));
  const inner = src.match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1];
  /* Chaque cellule joue l'animation ENTIÈRE, décalée d'une image de plus que
     la précédente. Une capture unique montre donc les six instants du cycle
     tels que le navigateur les peint, ce qui est le seul moyen de voir un
     stroboscope ou un pop, que les nombres ne disent pas.

     Le décalage doit porter sur les groupes animés, pas sur le conteneur : un
     `animation-delay` sur une div sans animation ne fait rien, et la planche
     sort alors en six cellules identiques. C'est arrivé. */
  const css = [];
  for (let c = 0; c < N; c++)
    for (let i = 0; i < N; i++)
      css.push(`.c${c} .rc-f--${i + 1}{animation-delay:${(i - c) * STEP}ms}`);
  const cells = Array.from({ length: N }, (_, c) =>
    `<figure style="margin:0"><div class="c${c}" style="width:${W}px;height:${H}px">
       <svg viewBox="${vx} ${vy} ${vw} ${vh}" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">${inner}</svg>
     </div><figcaption>t+${c * STEP}ms</figcaption></figure>`).join("");
  await shoot("flip", 48 + N * W + (N - 1) * 20, 48 + H + 20,
    `<style>.rc-f{opacity:0;animation:rc ${DUR}ms steps(1) infinite}
     ${css.join("")}
     @keyframes rc{0%,${(100 / N).toFixed(2)}%{opacity:1}${(100 / N + 0.01).toFixed(2)}%,100%{opacity:0}}</style>
     <div style="display:flex;gap:20px;padding:24px;align-items:flex-end">${cells}</div>`);
}

await browser.close();
