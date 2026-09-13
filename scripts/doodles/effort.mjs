/* Les deux figures de l'effort tenu : pendant, et juste après.
 *
 * `easy-run`, l'allure facile, celle qu'on tient des heures. Foulée longue et
 * basse, deux appuis au sol, bras qui pendent, buste presque droit. Elle sert
 * les surfaces de nutrition : c'est la TENUE dans la durée qui parle, pas un
 * objet (la règle 2 interdit la gourde et l'assiette).
 *
 * `catching-breath` a été REJETÉ en revue et retiré : huit croisements tenaient
 * dans une boîte de 23 x 65 px, soit 11 x 30 px à la taille de service, un
 * nœud, pas un chevauchement. C'est la limite du gréement sur les poses
 * penchées, documentée dans docs/doodles.md. L'ancienne version disait :
 * la tête basse. C'est une pose penchée, donc à la limite de ce que le gréement
 * sait faire ; voir la note Ce que ce fichier a appris en bas.
 *
 *   bun scripts/doodles/effort.mjs
 */
import { writeFileSync } from "node:fs";
import { Figure, svg } from "./rig.mjs";
import { footX, leadSoleY, levelLead, levelStand } from "./pose-tools.mjs";

const OUT = new URL("../../src/assets/doodles/", import.meta.url).pathname;

/* ── outillage ───────────────────────────────────────────────────────────── */

/* `sweep`, `aim`, `levelStand` et `levelLead` vivaient ici. Ils sont partagés
   avec run-cycle.mjs depuis scripts/doodles/pose-tools.mjs ; ce fichier n'en
   garde que ce qui lui est propre. */

/** Pose le pied avant au sol, en retenant la solution la plus AVANCÉE.
 *
 *  Deux choses que `Figure.plantLead` ne fait pas, et qui coûtent chacune un
 *  dessin si on les oublie :
 *
 *  1. Le sol est atteint par deux angles de hanche, jambe pendante sous le
 *     bassin, ou jambe tendue devant. Une minimisation naïve prend la première
 *     et écrase la foulée : les deux pieds finissent au même endroit et il n'y
 *     a plus de pas. On garde donc la racine la plus avancée.
 *  2. `bite` fait mordre la semelle avant SOUS la ligne de sol. La semelle
 *     d'appui déborde d'elle-même de ~4 px (le duo approuvé mord de 3,07) ;
 *     sans ce décalage le pied avant se retrouve peint en vermillon un pixel
 *     au-dessus du sol, un accent sur un membre qui flotte, la faute que la
 *     règle 3 interdit. */
function plantForward(f, { knee = -34, bite = 3 } = {}) {
  f.pose({ leadKnee: knee });
  const gy = f.groundY() + bite;
  const pick = (lo, hi, tol = 0.6) => {
    let best = null, bx = -Infinity;
    for (let d = lo; d <= hi; d += 0.1) {
      const g = new Figure(f.P, f.S).pose({ leadHip: d });
      if (Math.abs(leadSoleY(g) - gy) > tol) continue;
      const x = footX(g);
      if (x > bx) { bx = x; best = d; }
    }
    return best;
  };
  const a = pick(-90, 90, 1.0);
  if (a === null) throw new Error(`pied avant hors d'atteinte (knee=${knee})`);
  f.pose({ leadHip: a });
  levelLead(f);
  const b = pick(-10, 10);
  if (b !== null) f.pose({ leadHip: b });
  return f;
}

/** Écrit le SVG. Le cadre est serré sur la figure et coupé à la semelle : le
 *  sol est une règle de la page, pas un trait du fichier. */
function write(name, f) {
  writeFileSync(`${OUT}${name}.svg`, svg(f.paths([Figure.LEAD_SOLE])));
  const acc = [...[63, 64, 65].map((i) => f.P[i][1]), ...f.S.map((p) => p[1])];
  console.log(`→ ${name}.svg  ` +
    `accents ${Math.min(...acc).toFixed(1)}..${Math.max(...acc).toFixed(1)} / sol ${f.groundY().toFixed(1)}`);
}

/* ── 1. l'allure facile ──────────────────────────────────────────────────── */

/* `standHip` 34 recule la jambe d'appui : c'est lui qui fait la foulée, pas le
   genou avant. `torso` 5 suffit à faire courir la figure plutôt que flâner ;
   à 10 elle se penche dans le vent. `frontArm` -10 décolle le poing avant du
   bord du torse, à 0 les deux se fondent en un bulbe dès 120 px. */
{
  const f = new Figure().pose({
    head: 3, torso: 5, standHip: 34,
    frontArm: -10, frontElbow: 150,
    backArm: 5, backElbow: -40,
  });
  levelStand(f);
  plantForward(f, { knee: -34 });
  write("easy-run", f);
}

/* ── 2. l'après-effort ───────────────────────────────────────────────────── */

/* Le gréement fait pivoter le buste sur des hanches fixes : à 58° les épaules
   sont déjà 75 px DEVANT les genoux, et tout bras tiré vers son propre genou
   traverse le tronc en diagonale, c'est l'écheveau qui a coûté la version
   précédente. Deux décisions le désamorcent :
     · les DEUX mains vont sur le genou avant, pas une par genou. En profil
       c'est ce qu'on voit de toute façon, et le bras arrière (portée 131) y
       arrive là où le bras avant (portée 93) n'atteint jamais le genou arrière ;
     · le coude arrière est visé à côté du coude avant, décalé de (-16, -10).
       Superposés, les deux bras font quatre lignes parallèles et une tache ;
       décalés, ils ouvrent un V étroit qui se lit. */

/* Ce que ce fichier a appris, en vingt-deux tours :
 *
 * · La foulée ne vient pas du genou avant. `plantLead` décroche dès que la
 *   jambe est tendue vers l'avant (bissection non encadrée) et repose le pied
 *   sous le bassin ; c'est `standHip` qui écarte les appuis.
 * · Le bras avant du gréement est court, 93 px de portée contre 131 pour le
 *   bras arrière, parce qu'en `BASE` il est dessiné plié et raccourci. Toute
 *   cible posée au-delà le fait se contorsionner. Mesurer avant de viser.
 * · `head` au-delà de 30° avale l'encoche du cou : la tête cesse d'être une
 *   boucle fermée. 18° donne la tête basse sans casser la jonction.
 * · Le défaut qui reste sur `catching-breath` : le dos est une règle. Le
 *   rachis de `BASE` est presque droit, ce qui passe inaperçu à la verticale
 *   et se voit dès qu'on le couche à 58°. Aucun réglage du gréement ne le
 *   courbe, il faudrait une traversée écrite pour cette pose, comme le
 *   gainage. À 130 px, la taille d'affichage, ça ne se voit pas.
 */
