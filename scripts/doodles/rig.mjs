/* rig.mjs — le gréement du trait Zoned.
 *
 * Le doodle approuvé (runners-duo, figure de gauche) est une traversée continue
 * de 78 ancres, lissée en Catmull-Rom. Ce module la découpe en articulations et
 * la repose. Toute figure produite ici hérite donc de l'écriture exacte du
 * dessin validé : mêmes boucles de main, même tête, même pied.
 *
 * La traversée, dans l'ordre :
 *   0..2   arrière de la jambe d'appui, du talon à la hanche
 *   3..5   flanc arrière        6 épaule arrière
 *   7..17  bras arrière (coude 7, poignet 8, poing 9-16, retour 17)
 *   18..19 trapèze et cou       20..36 tête       37..39 cou et épaule avant
 *   40..50 bras avant (coude 40, poignet 41, poing 42-48, retour 49-50)
 *   51..53 torse avant jusqu'à la hanche avant
 *   54..66 jambe avant (genou 54, cheville 55, pied 56-64, retour 65-66)
 *   67..70 devant de la jambe d'appui
 *   71..77 pied d'appui
 *   SOLE   la semelle, en vermillon, referme le circuit de 77 à 0
 */
import { cr, rot as rotate, f1 } from "./lib.mjs";

export const BASE = [
  [87.3,367.9],[95.5,303.2],[97.0,241.7],[96.5,236.1],[108.9,196.7],[114.0,157.6],[126.9,144.1],
  [93.3,198.1],[42.3,183.8],[33.4,179.7],[34.0,170.1],[31.7,171.3],[30.3,173.4],[30.1,176.0],
  [31.3,178.3],[36.6,170.3],[45.7,172.2],[86.7,181.9],[113.1,135.9],[133.7,122.2],[133.9,114.8],
  [128.9,110.5],[125.5,104.9],[124.1,98.5],[124.6,91.9],[127.2,85.9],[131.5,80.9],[137.1,77.5],
  [143.5,76.1],[150.1,76.6],[156.1,79.2],[161.1,83.5],[164.5,89.1],[165.9,95.5],[165.4,102.1],
  [162.8,108.1],[158.5,113.1],[152.9,116.5],[153.1,127.1],[159.4,142.9],[174.7,184.7],[191.3,154.2],
  [199.7,148.2],[207.7,153.7],[207.9,151.1],[206.8,148.7],[204.7,147.3],[202.1,147.1],[206.3,155.8],
  [200.7,161.8],[173.3,211.3],[149.0,166.4],[135.1,203.3],[127.5,243.9],[177.6,264.7],[187.1,325.1],
  [198.0,328.8],[213.3,327.1],[216.1,332.2],[216.9,330.8],[216.9,329.3],[216.2,327.9],[214.8,327.1],
  [214.7,332.9],[198.0,339.2],[176.9,334.9],[162.4,275.3],[113.3,245.7],[115.0,242.3],[112.5,304.8],
  [100.7,360.1],[110.8,365.0],[129.9,366.0],[131.6,371.5],[132.7,370.4],[133.0,368.9],[132.5,367.4],
  [131.4,366.3],
];
/* La semelle : elle ferme le circuit et porte l'accent. Indices négatifs dans
   les groupes ci-dessous, pour que les rotations l'emportent avec le pied. */
export const SOLE = [[131.4,366.3],[133.0,370.6],[129.5,372.6],[112.0,375.4],[97.0,375.6],[88.6,373.8],[87.3,367.9]];

/* Découpe la traversée en gardant les tangentes de la courbe entière : les
   points de contrôle se calculent sur P complet, on n'émet que a..b. */
function crSlice(P, a, b, t = 1 / 6) {
  let d = `M ${f1(P[a][0])} ${f1(P[a][1])}`;
  for (let i = a; i < b; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || P[i + 1];
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += `C${f1(c1[0])} ${f1(c1[1])} ${f1(c2[0])} ${f1(c2[1])} ${f1(p2[0])} ${f1(p2[1])}`;
  }
  return d;
}

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const SOLE_IDX = SOLE.map((_, i) => -(i + 1)); // -1..-7

/* Une articulation = un pivot (moyenne de deux ancres vivantes) et l'ensemble
   des ancres qui tournent avec elle. Les articulations sont listées de la plus
   proximale à la plus distale : appliquées dans cet ordre, une rotation de
   hanche emporte le genou, qui emporte le pied. */
export const JOINTS = {
  torso:     { pivot: [3, 53],  idx: range(4, 52) },
  head:      { pivot: [19, 37], idx: range(20, 36) },
  backArm:   { pivot: [6, 18],  idx: range(7, 17) },
  backElbow: { pivot: [7, 17],  idx: range(8, 16) },
  backHand:  { pivot: [8, 16],  idx: range(9, 15) },
  frontArm:  { pivot: [39, 51], idx: range(40, 50) },
  frontElbow:{ pivot: [40, 50], idx: range(41, 49) },
  frontHand: { pivot: [41, 49], idx: range(42, 48) },
  leadHip:   { pivot: [53, 67], idx: range(54, 66) },
  leadKnee:  { pivot: [54, 66], idx: range(55, 65) },
  leadFoot:  { pivot: [55, 65], idx: range(56, 64) },
  standHip:  { pivot: [3, 68],  idx: [0, 1, 2, ...range(69, 77), ...SOLE_IDX] },
  standKnee: { pivot: [1, 69],  idx: [0, ...range(70, 77), ...SOLE_IDX] },
  standFoot: { pivot: [0, 71],  idx: [0, ...range(72, 77), ...SOLE_IDX] },
};

/** Une figure = les 78 ancres + la semelle, transformables ensemble. */
export class Figure {
  constructor(pts = BASE, sole = SOLE) {
    this.P = pts.map((p) => [...p]);
    this.S = sole.map((p) => [...p]);
  }
  at(i) { return i < 0 ? this.S[-i - 1] : this.P[i]; }
  set(i, v) { if (i < 0) this.S[-i - 1] = v; else this.P[i] = v; }
  all() { return [...this.P, ...this.S]; }

  /** pose({ leadKnee: 24, frontArm: -10, ... }) — degrés, horaire positif. */
  pose(spec) {
    for (const [name, deg] of Object.entries(spec)) {
      if (!deg) continue;
      const j = JOINTS[name];
      if (!j) throw new Error(`articulation inconnue : ${name}`);
      const [a, b] = j.pivot.map((i) => this.at(i));
      const pivot = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const moved = rotate(j.idx.map((i) => this.at(i)), pivot, deg);
      j.idx.forEach((i, k) => this.set(i, moved[k]));
    }
    return this;
  }

  map(fn) { this.P = this.P.map(fn); this.S = this.S.map(fn); return this; }
  translate(dx, dy) { return this.map(([x, y]) => [x + dx, y + dy]); }
  scale(k, ky = k, o = this.bbox().c) {
    return this.map(([x, y]) => [o[0] + (x - o[0]) * k, o[1] + (y - o[1]) * ky]);
  }
  rotate(deg, o = this.bbox().c) { return this.map((p) => rotate([p], o, deg)[0]); }
  /** Miroir : la figure regarde à gauche. Le tracé reste identique. */
  flip(x = this.bbox().c[0]) { return this.map(([px, y]) => [2 * x - px, y]); }

  bbox() {
    const a = this.all();
    const x0 = Math.min(...a.map((p) => p[0])), x1 = Math.max(...a.map((p) => p[0]));
    const y0 = Math.min(...a.map((p) => p[1])), y1 = Math.max(...a.map((p) => p[1]));
    return { x0, y0, x1, y1, w: x1 - x0, h: y1 - y0, c: [(x0 + x1) / 2, (y0 + y1) / 2] };
  }
  /** Ordonnée du sol : le dessous du pied d'appui, pas celui de la semelle.
      Dans le dessin approuvé, la ligne de sol traverse l'arc de semelle, qui
      déborde de quatre pixels sous elle — c'est ce débord qui fait le contact
      plutôt qu'un pied posé sur un rail. */
  groundY() { return Math.max(...[0, 71, 72, 73, 74, 75, 76, 77].map((i) => this.P[i][1])); }

  /* Le trait reste continu même quand il change de couleur : on le découpe en
     sous-chemins qui partagent leurs extrémités, exactement comme le dessin
     approuvé le fait pour sa semelle. Les tangentes sont calculées sur la
     traversée entière, donc la coupe ne se voit pas.

     accents : liste de [a, b] — les tronçons tracés en vermillon. Le contact
     au sol, jamais autre chose. */
  paths(accents = []) {
    const cuts = [...accents].sort((u, v) => u[0] - v[0]);
    const out = [];
    let i = 0;
    for (const [a, b] of cuts) {
      if (a > i) out.push({ d: crSlice(this.P, i, a) });
      out.push({ d: crSlice(this.P, a, b), accent: true });
      i = b;
    }
    if (i < this.P.length - 1) out.push({ d: crSlice(this.P, i, this.P.length - 1) });
    out.push({ d: cr(this.S), accent: true });
    return out;
  }

  /* Pose le pied avant au sol. Le gréement part d'une jambe en l'air : sans
     ça, chaque pose à deux appuis demanderait de chercher deux angles à la
     main.

     La bissection ne s'applique que si la racine est encadrée. La jambe avant
     n'atteint le sol que sur une plage étroite — au-delà elle repart vers le
     haut — et une bissection non encadrée converge alors vers une borne et
     projette le pied en l'air. C'est arrivé, ça se voyait tout de suite. */
  plantLead({ knee = -4, y = this.groundY() } = {}) {
    this.pose({ leadKnee: knee });
    const FOOT = JOINTS.leadFoot.idx;
    const bisect = (joint, cost, lo, hi) => {
      const at = (deg) => cost(new Figure(this.P, this.S).pose({ [joint]: deg }));
      if (at(lo) * at(hi) > 0) return false; // racine non encadrée : on ne touche à rien
      const up = at(lo) < 0;
      for (let k = 0; k < 30; k++) {
        const mid = (lo + hi) / 2;
        if (at(mid) < 0 === up) lo = mid; else hi = mid;
      }
      this.pose({ [joint]: (lo + hi) / 2 });
      return true;
    };
    const sole = (f) => Math.max(...FOOT.map((i) => f.P[i][1]));
    bisect("leadHip", (f) => sole(f) - y, -50, 46);
    // 63 et 65 sont les deux bouts du tronçon qui passe sous le pied — celui
    // que le vermillon peint. C'est lui qui doit être horizontal : mettre à
    // niveau la pointe (60) et le talon laisse le pied sur la demi-pointe.
    bisect("leadFoot", (f) => f.P[63][1] - f.P[65][1], -40, 40);
    bisect("leadHip", (f) => sole(f) - y, -14, 14);
    return this;
  }

  /* Le tronçon de la traversée qui passe sous le pied avant, quand il est
     posé : c'est là que va le vermillon. */
  static LEAD_SOLE = [63, 65];
}

/** Une ligne de sol qui ondule — une droite se lit comme un schéma. */
export const ground = (x0, x1, y, sag = 3) =>
  cr([[x0, y + sag * 0.4], [x0 + (x1 - x0) * 0.28, y - sag], [x0 + (x1 - x0) * 0.6, y - sag * 0.5],
      [x0 + (x1 - x0) * 0.84, y + sag * 0.3], [x1, y + sag * 0.6]]);

/** Assemble le SVG final : viewBox serré sur le contenu, marge égale. */
export function svg(paths, box, { pad = 12 } = {}) {
  const W = Math.round(box.w + pad * 2), H = Math.round(box.h + pad * 2);
  const body = paths
    .map((p) => `  <path${p.accent ? ` stroke="var(--accent)"` : ""} d="${p.d}"/>`)
    .join("\n");
  return `<svg viewBox="${(box.x0 - pad).toFixed(1)} ${(box.y0 - pad).toFixed(1)} ${W} ${H}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
${body}
</svg>
`;
}
