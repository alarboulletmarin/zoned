/* La figure qui manquait aux pratiques : la montée.
 *
 *   bun scripts/doodles/practices.mjs
 *
 * Écrit src/assets/doodles/climbing.svg.
 *
 * ── Une figure, pas quatre ─────────────────────────────────────────────────
 *
 * Le plan de refonte prévoyait quatre dessins de pratique. Après inventaire,
 * trois existaient déjà et le quatrième était hors de portée du gréement :
 *
 *   route      → `runners-duo`, le dessin approuvé. Il ne se retouche pas.
 *   ultra      → `walking-away`, la figure qui s'éloigne. C'est exactement ce
 *                que l'ultra est : du temps sur les pieds, et on avance.
 *   triathlon  → `standing`, la figure debout, bras qui pendent. Elle sert
 *                déjà l'état « rien de commencé », et c'est précisément le
 *                statut du triathlon : annoncé, pas livré.
 *   trail      → rien. D'où ce fichier.
 *
 * Et une pose que le plan proposait est écartée pour une raison écrite :
 * « ultra = les mains sur les cuisses » a DÉJÀ été dessinée, sous le nom
 * `catching-breath`, et rejetée en revue — huit croisements dans une boîte de
 * 23 × 65 px, un nœud et non un chevauchement (voir l'en-tête de effort.mjs).
 * Le gréement ne courbe pas le rachis : au-delà de ~58° de bascule du buste,
 * le dos reste une règle. Ce n'est pas un réglage à retrouver.
 *
 * « Une figure de plus ne se juge pas sur la place disponible mais sur ce
 * qu'elle retire » (docs/doodles.md). Trois réemplois, un dessin.
 *
 * ── Les huit tours, et ce qu'ils ont appris ────────────────────────────────
 *
 * 1. Buste penché + genou levé à la main : les deux jambes se rejoignent en bas
 *    et le pied libre croise le tibia d'appui à hauteur de CHEVILLE. Les deux
 *    pieds font un nœud, exactement le défaut n° 3 du cycle de foulée.
 * 2. Augmenter `leadHip` pour lever le genou : raté, et dans le mauvais sens —
 *    `leadHip` POSITIF recule la jambe avant. Les six essais du tour ont donné
 *    une figure penchée, jambes serrées, sans pas.
 * 3. `leadHip` NÉGATIF amène la cuisse vers l'avant, `leadKnee` positif la
 *    plie davantage. Le genou monte enfin.
 * 4. Cuisse à l'horizontale : ça ne se lit pas comme une montée mais comme un
 *    coup de pied. C'est l'ÉCART DES APPUIS qui fait la montée, pas la hauteur
 *    du genou — donc `standHip` recule la jambe d'appui, et `leadHip` se
 *    modère.
 * 5. La semelle d'appui était sur la pointe : l'accent sortait en diagonale, et
 *    le bas du cadre n'était donc touché que par un orteil. `levelStand` la
 *    remet à plat — le vermillon redevient un trait horizontal posé sur la
 *    règle de la page.
 * 6. Rastérisée à 130 px (la largeur de service) à côté de `easy-run` et du
 *    duo : la figure se distingue des deux, et c'est le test qui compte. Un
 *    dessin de plus qui ressemble à un dessin déjà là ne sert à rien.
 * 7. Le pied libre doit passer à hauteur de GENOU d'appui. Mesuré, pas estimé :
 *    à `leadKnee` 22 la pointe est 24 unités SOUS le genou, à 16 avec
 *    `leadHip` -28 elle est à sa hauteur exacte.
 * 8. Relecture à 300, 130 et 90 px, sur papier et sur encre. La cuisse avant
 *    et le bas du torse ouvrent un coin étroit qui se referme presque à 90 px.
 *    C'est un CROISEMENT, pas un nœud, et le trait qui se croise est la
 *    signature de la maison — on le garde.
 */
import { writeFileSync } from "node:fs";
import { Figure, svg } from "./rig.mjs";
import { levelStand } from "./pose-tools.mjs";

const OUT = new URL("../../src/assets/doodles/", import.meta.url).pathname;

/* L'accent se DÉDUIT du contact, il ne se décrète pas : on cherche les ancres
   réellement au sol et on ne peint que celles-là. Copié de empty-states.mjs,
   où la règle a été apprise en peignant du vermillon sur un membre en l'air. */
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

/* La montée. `standHip` 32 écarte les appuis — c'est lui qui fait la pente ;
   `leadHip` -28 amène la cuisse devant et `leadKnee` 16 la plie juste assez
   pour que la pointe du pied libre passe à hauteur du genou d'appui. `torso`
   14 penche le buste dans la côte sans que `head` 4 ne fasse rentrer la tête
   dans les épaules. Les BRAS ne sont pas touchés : c'est le balancier du
   dessin approuvé, et il n'y a aucune raison de le rejouer. */
const f = new Figure().pose({ head: 4, torso: 14, leadHip: -28, leadKnee: 16, standHip: 32 });
levelStand(f);

const sol = f.groundY();
const accents = contacts(f, sol);
if (accents.length === 0) throw new Error("aucun contact au sol : pas d'accent à peindre");

/* Le contrôle du tour 7, gardé dans le générateur : si un réglage futur fait
   descendre le pied libre sous le genou d'appui, les deux jambes se nouent en
   bas et ça doit échouer ici, pas se découvrir sur une planche. */
const genouAppui = (f.P[1][1] + f.P[69][1]) / 2;
const pointeLibre = Math.max(...[59, 60, 61].map((i) => f.P[i][1]));
if (pointeLibre > genouAppui + 1) {
  throw new Error(
    `le pied libre passe sous le genou d'appui (${pointeLibre.toFixed(1)} > ${genouAppui.toFixed(1)})`,
  );
}

writeFileSync(`${OUT}climbing.svg`, svg(f.paths(accents)));
console.log(
  `→ climbing.svg  sol ${sol.toFixed(1)}  accents ${JSON.stringify(accents)}  ` +
    `pointe libre ${pointeLibre.toFixed(0)} / genou d'appui ${genouAppui.toFixed(0)}`,
);
