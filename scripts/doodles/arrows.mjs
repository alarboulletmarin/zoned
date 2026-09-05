/* Les flèches d'annotation.
 *
 * Une flèche tracée à la main n'est pas un objet dessiné au sens de la règle 2
 * de docs/doodles.md : c'est une marque d'annotation, du même ordre que la ligne
 * de sol. Elle ne concurrence aucun glyphe Material, parce qu'aucun glyphe ne
 * fait ce travail-là — montrer un endroit précis d'une page.
 *
 * Elle est en encre, jamais en vermillon : l'accent reste réservé au contact
 * avec le sol, et une flèche rouge ferait un second point focal sur chaque
 * écran qui en porte une.
 *
 * Le tremblement est délibéré. Une courbe régulière se lit comme un connecteur
 * de diagramme ; ce sont les points de contrôle légèrement inégaux qui font la
 * main. Chaque flèche est asymétrique par construction, pas par bruit aléatoire
 * — le rendu doit être identique d'une génération à l'autre.
 *
 *   bun scripts/doodles/arrows.mjs
 */
import { writeFileSync } from "node:fs";
import { cr, f1 } from "./lib.mjs";

const OUT = new URL("../../src/assets/doodles/", import.meta.url).pathname;

/** La pointe : deux traits courts partant de l'extrémité, ouverts de ±26°. */
function head(tip, from, len = 11, spread = 26) {
  const a = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
  return [spread, -spread].map((d) => {
    const t = a + Math.PI + (d * Math.PI) / 180;
    return `M ${f1(tip[0])} ${f1(tip[1])}L${f1(tip[0] + Math.cos(t) * len)} ${f1(tip[1] + Math.sin(t) * len)}`;
  });
}

function arrow(name, pts, { w, h, len } = {}) {
  const d = cr(pts);
  const tip = pts[pts.length - 1];
  const paths = [d, ...head(tip, pts[pts.length - 2], len)];
  writeFileSync(`${OUT}${name}.svg`,
    `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
${paths.map((p) => `  <path d="${p}"/>`).join("\n")}
</svg>
`);
  console.log(`→ ${name}.svg  ${w}x${h}`);
}

/* Descend vers la droite : la légende est en haut à gauche, la cible en bas. */
arrow("arrow-down-right", [[6, 8], [14, 30], [30, 47], [52, 56], [72, 62]], { w: 84, h: 72 });

/* Descend vers la gauche : la légende est en haut à droite. */
arrow("arrow-down-left", [[78, 8], [70, 31], [54, 48], [32, 57], [12, 62]], { w: 84, h: 72 });

/* Remonte vers la droite : la légende est en bas, la cible au-dessus. */
arrow("arrow-up-right", [[6, 64], [15, 42], [32, 25], [53, 15], [72, 10]], { w: 84, h: 72 });

/* Le long crochet, pour sauter par-dessus un bloc : il part vers le bas,
   contourne, et revient pointer sur le côté. */
arrow("arrow-hook", [[8, 6], [6, 30], [16, 52], [40, 62], [66, 58], [78, 44]], { w: 90, h: 72 });
