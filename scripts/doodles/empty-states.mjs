/* Les deux figures des états vides.
 *
 * `EmptyState` sert dix-neuf écrans, mais seulement trois situations : un
 * filtre qui ne trouve rien, quelque chose jamais commencé, une panne. D'où
 * deux dessins et non dix-neuf — la variante choisit, pas la page.
 *
 * Le cadre est en paysage alors que la figure est verticale : une silhouette
 * seule dans son propre gabarit fait un trait perdu au milieu d'une carte
 * large. C'est le sol, prolongé de part et d'autre, qui fait le dessin —
 * comme dans le duo approuvé, qui est en 440x323.
 *
 *   bun scripts/doodles/empty-states.mjs
 */
import { writeFileSync } from "node:fs";
import { Figure, svg, ground } from "./rig.mjs";

const OUT = new URL("../../src/assets/doodles/", import.meta.url).pathname;

/* L'accent se DÉDUIT du contact, il ne se décrète pas.
 *
 * `Figure.LEAD_SOLE` nomme le tronçon qui passe sous le pied avant — mais dans
 * cette pose la jambe avant n'atteint pas le sol : elle plafonne onze pixels
 * au-dessus, `plantLead` ne trouve pas de racine encadrée et ne bouge donc
 * rien. Le vermillon était peint dessus quand même, c'est-à-dire sur un membre
 * EN L'AIR — la faute exacte que docs/doodles.md interdit, et elle est passée
 * en production parce qu'à 220 px l'écart fait deux pixels d'écran.
 *
 * On cherche donc les ancres réellement au contact, et on ne peint que
 * celles-là. Une pose où rien ne touche ne reçoit aucun accent, ce qui est la
 * bonne réponse plutôt qu'un accent décoratif.
 */
function contacts(f, sol, tol = 5) {
  const runs = [];
  let debut = null;
  for (let i = 0; i < f.P.length; i++) {
    const touche = f.P[i][1] >= sol - tol;
    if (touche && debut === null) debut = i;
    if (!touche && debut !== null) {
      if (i - 1 > debut) runs.push([debut, i - 1]);
      debut = null;
    }
  }
  if (debut !== null && f.P.length - 1 > debut) runs.push([debut, f.P.length - 1]);
  return runs;
}

function draw(name, spec, { ar = 1.32, ahead = 0.42 } = {}) {
  const f = new Figure().pose(spec);
  f.plantLead({ knee: -5 });

  const b = f.bbox(), gy = f.groundY();
  const h = Math.max(b.h, gy - b.y0) + 10;
  const w = h * ar;
  const x0 = b.x0 - (w - b.w) * (1 - ahead);   // plus de sol devant que derrière
  const paths = [...f.paths(contacts(f, gy)), { d: ground(x0 + 4, x0 + w - 4, gy) }];
  writeFileSync(`${OUT}${name}.svg`, svg(paths, { x0, y0: b.y0, w, h }, { pad: 6 }));
  console.log(`→ ${name}.svg  ${Math.round(w)}x${Math.round(h)}`);
}

// Debout, bras qui pendent : « rien de commencé ». Le coude arrière à -90
// est ce qui décolle l'avant-bras du torse ; au-dessus il se recolle, en
// dessous il croise le ventre.
draw("standing", {
  head: 3, torso: 0,
  frontArm: 6, frontElbow: 130,
  backArm: -35, backElbow: -90,
});

// La main remontée au menton : « le filtre n'a rien trouvé », et la panne.
// L'épaule avant à -58 pose la main à la mâchoire ; à -66 elle passe derrière
// le crâne et le contour de la tête se brouille.
draw("wondering", {
  head: -6, torso: -3,
  frontArm: -58, frontElbow: -14,
  backArm: -35, backElbow: -90,
});
