/* La figure qui montre.
 *
 * Elle accompagne les flèches d'annotation : la légende dit quoi regarder, la
 * flèche dit où, et la figure dit que quelqu'un te le montre. C'est ce qui
 * garde le personnage au centre au lieu de laisser une flèche seule flotter
 * sur la page.
 *
 * Bras avant tendu à l'horizontale (coude à +90) : au-dessous il propose, au-
 * dessus il salue. Le cadre est serré sur le trait, donc la main tendue
 * affleure le bord droit, la flèche prend le relais juste après.
 *
 *   bun scripts/doodles/pointing.mjs
 */
import { writeFileSync } from "node:fs";
import { Figure, svg } from "./rig.mjs";

const OUT = new URL("../../src/assets/doodles/", import.meta.url).pathname;

const f = new Figure().pose({
  head: 4,
  frontArm: -24, frontElbow: 90,
  backArm: -35, backElbow: -90,
});
f.plantLead({ knee: -5 });

const gy = f.groundY();

/* L'accent se déduit du contact. Dans cette pose la jambe avant n'atteint pas
   le sol, elle plafonne une dizaine de pixels au-dessus, et peindre
   Figure.LEAD_SOLE y posait du vermillon sur un membre EN L'AIR, la faute que
   docs/doodles.md interdit. On ne peint que les ancres réellement au contact ;
   ici, la seule semelle qui touche. */
const contacts = (() => {
  const runs = []; let debut = null;
  for (let i = 0; i < f.P.length; i++) {
    const touche = f.P[i][1] >= gy - 5;
    if (touche && debut === null) debut = i;
    if (!touche && debut !== null) { if (i - 1 > debut) runs.push([debut, i - 1]); debut = null; }
  }
  if (debut !== null && f.P.length - 1 > debut) runs.push([debut, f.P.length - 1]);
  return runs;
})();
writeFileSync(`${OUT}pointing.svg`, svg(f.paths(contacts)));
console.log(`→ pointing.svg  sol ${gy.toFixed(1)}`);
