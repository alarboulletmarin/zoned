/* pose-tools.mjs — les solveurs de pose, partagés par les générateurs.
 *
 * Ces trois fonctions vivaient dans effort.mjs, qui les gardait pour lui. Le
 * cycle de foulée (run-cycle.mjs) a besoin des mêmes : plutôt que de les
 * recopier — et de laisser deux copies diverger — elles sont ici.
 *
 * Elles ne posent rien toutes seules : elles CHERCHENT un angle. Le gréement
 * (rig.mjs) dit ce qu'une articulation peut faire ; celles-ci disent quel
 * angle atteint un but — un pied au sol, une semelle à plat, une main sur un
 * genou. Toute recherche se fait sur des copies (`new Figure(f.P, f.S)`) et
 * n'applique au sujet que l'angle retenu.
 *
 * BORNER LES PLAGES. Le gréement ne connaît pas l'anatomie : `leadKnee` passe
 * sous zéro de flexion vers -58° et plie le genou à l'envers en dessous ;
 * `standKnee` noue le trait au-delà de 90° de flexion. Une recherche non
 * bornée trouve ces solutions et les trouve bonnes. Les plages sûres,
 * mesurées : `leadKnee` de -56 à +30, `standKnee` de -98 à 0.
 */
import { Figure } from "./rig.mjs";

/** Balaye une articulation et retient l'angle qui minimise `cost`. */
export function sweep(f, joint, cost, [lo, hi] = [-90, 90], step = 0.25) {
  let best = 0, bc = Infinity;
  for (let d = lo; d <= hi; d += step) {
    const g = new Figure(f.P, f.S).pose({ [joint]: d });
    const c = cost(g);
    if (c < bc) { bc = c; best = d; }
  }
  f.pose({ [joint]: best });
  return +best.toFixed(2);
}

/** Balaye deux articulations en chaîne et retient le couple qui place au mieux
 *  un ou plusieurs repères. goals : [[indice d'ancre, [x, y], poids]] */
export function aim(f, [j1, j2], goals, r1 = [-170, 170], r2 = [-140, 140]) {
  const cost = (a, b) => {
    const g = new Figure(f.P, f.S).pose({ [j1]: a, [j2]: b });
    return goals.reduce((s, [i, t, w = 1]) => {
      const p = g.at(i);
      return s + w * Math.hypot(p[0] - t[0], p[1] - t[1]);
    }, 0);
  };
  let best = [0, 0], bc = Infinity, step = 6;
  for (let a = r1[0]; a <= r1[1]; a += step)
    for (let b = r2[0]; b <= r2[1]; b += step) {
      const c = cost(a, b);
      if (c < bc) { bc = c; best = [a, b]; }
    }
  for (step = 3; step >= 0.25; step /= 2)
    for (let k = 0; k < 20; k++) {
      let moved = false;
      for (const [da, db] of [[step, 0], [-step, 0], [0, step], [0, -step]]) {
        const c = cost(best[0] + da, best[1] + db);
        if (c < bc - 1e-4) { bc = c; best = [best[0] + da, best[1] + db]; moved = true; }
      }
      if (!moved) break;
    }
  f.pose({ [j1]: +best[0].toFixed(1), [j2]: +best[1].toFixed(1) });
  return f;
}

/* Le pied avant : neuf ancres, sans arc de semelle. Le tronçon [63, 65] est
   celui qui passe dessous, c'est lui que le vermillon peint. */
export const LEAD_FOOT = [56, 57, 58, 59, 60, 61, 62, 63, 64];
export const leadSoleY = (g) => Math.max(...LEAD_FOOT.map((i) => g.P[i][1]));
export const footX = (g) => LEAD_FOOT.reduce((s, i) => s + g.P[i][0], 0) / LEAD_FOOT.length;

/** Met la semelle d'appui à plat après avoir balancé la jambe arrière. */
export const levelStand = (f) =>
  sweep(f, "standFoot", (g) => Math.abs(g.P[74][1] - g.P[0][1]), [-70, 70]);

/** Met la semelle AVANT à plat : c'est le tronçon [63, 65] qui doit être
 *  horizontal, pas la pointe. Sans ça l'accent se dresse — mesuré à 27 unités
 *  de haut sur un premier jet du cycle, soit un vermillon debout au lieu d'un
 *  vermillon posé. */
export const levelLead = (f) =>
  sweep(f, "leadFoot", (g) => Math.abs(g.P[63][1] - g.P[65][1]), [-70, 70]);
