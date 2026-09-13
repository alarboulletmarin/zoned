/* g-plank.mjs, gainage sur les avant-bras.
 *
 * Le gréement ne sait pas produire cette pose (docs/doodles.md le dit) : sa
 * famille est debout, son bras part vers l'arrière. La traversée est donc
 * écrite ici à la main, mais les BOUCLES de BASE, tête, poing, pied, sont
 * reposées telles quelles, par rotation rigide et translation, jamais d'échelle.
 * C'est elles qui portent l'écriture du dessin approuvé.
 *
 * Repère : s = le long du corps, vers la tête ; h = perpendiculaire, vers le dos.
 */
import { writeFileSync } from "node:fs";
import { cr, rot } from "./lib.mjs";
import { BASE, svg } from "./rig.mjs";

const OUT = new URL("../../src/assets/doodles/plank.svg", import.meta.url).pathname;

const G = 300;                 // ligne de sol
const D = Math.PI / 180;

// , , ,  réglages , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , 
const K = {
  tilt: 8.0,        // inclinaison du corps : épaules plus hautes que les chevilles
  hip: -96,         // épaule → hanche, le long de l'axe
  kneeN: -150, ankleN: -206,   // jambe proche
  kneeF: -130, ankleF: -180,   // jambe éloignée (plus courte : elle est derrière)
  footN: 118, footF: 112,      // cheville → orteil : vers le bas ET vers l'arrière,
                               // orteils repliés sous le pied. 118 met la pointe à plat.
  headAt: 41, headH: 1, headDeg: -9.4,   // tête : position et direction du crâne
  // Les deux avant-bras convergent vers les mains jointes : deux bandes
  // parallèles au sol se confondent, un V se lit.
  elbowN: [156, 291], wristN: [203, 296],  // bras proche (accentué) : coude intérieur
  elbowF: [131, 301], wristF: [178, 296],  // bras éloigné : pointe du coude, au sol
};

const u = [Math.cos(-K.tilt * D), Math.sin(-K.tilt * D)];   // vers la tête
const n = [u[1], -u[0]];                                     // vers le dos
const O = [150, 238];                                        // centre d'épaule
const T = (s, h) => [O[0] + u[0] * s + n[0] * h, O[1] + u[1] * s + n[1] * h];

const ang = ([x, y]) => Math.atan2(y, x) / D;
const mid = (a, b) => [(BASE[a][0] + BASE[b][0]) / 2, (BASE[a][1] + BASE[b][1]) / 2];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const maxY = (pts) => Math.max(...pts.map((p) => p[1]));

/* Repose une tranche de BASE telle quelle : rotation rigide autour de piv, puis
   translation de piv vers `to`. Aucune échelle, le tremblement reste intact. */
const place = (a, b, piv, deg, to) =>
  rot(BASE.slice(a, b + 1), piv, deg).map(([x, y]) => [x - piv[0] + to[0], y - piv[1] + to[1]]);

/* Le poing de BASE au bout d'un avant-bras dont on donne la direction absolue.
   Renvoie [poignet-dessus, ...poing, poignet-dessous]. */
const fist = (side, to, deg) => {
  const [a, b, elbow] = side === "back" ? [8, 16, 7] : [41, 49, 40];
  const piv = mid(a, b);
  return place(a, b, piv, deg - ang(sub(piv, BASE[elbow])), to);
};

/* Le pied avant de BASE. Renvoie [cheville-devant, ...pied, cheville-derrière]. */
const foot = (to, deg) => {
  const piv = mid(55, 65);
  return place(55, 65, piv, deg - ang(sub(BASE[60], piv)), to);
};

/* Le pied posé : on descend la cheville jusqu'à ce que les orteils mordent le
   sol de 3 px, comme la semelle du dessin approuvé déborde sous sa ligne. */
const DROP = [];
const plant = (to, deg) => {
  const f0 = foot(to, deg);
  const dy = G + 3 - maxY(f0.slice(1, 10));
  DROP.push(dy);                    // combien la cheville a dû descendre : ~0 = jambe droite
  return foot([to[0], to[1] + dy], deg);
};

/* La tête de BASE, crâne pointé dans la direction donnée.
   Renvoie [attache-nuque, ...tête, attache-gorge]. */
const HEADC = (() => {
  let x = 0, y = 0;
  for (let i = 20; i <= 36; i++) { x += BASE[i][0]; y += BASE[i][1]; }
  return [x / 17, y / 17];
})();
/* 19..38 : l'attache de nuque, la tête, l'attache de gorge et le devant du cou.
   On reprend la jonction de BASE en bloc, c'est elle qui fait que la tête
   touche le cou au lieu d'être posée à côté. */
const head = (to, deg) => place(19, 38, HEADC, deg - ang(sub(HEADC, mid(19, 37))), to);

/* Le point d'où la nuque doit arriver : dans le prolongement de l'attache,
   sinon le trait rebrousse chemin et fait un crochet. */
const back = (a, b, d) => {
  const v = sub(a, b), L = Math.hypot(v[0], v[1]);
  return [a[0] + (v[0] / L) * d, a[1] + (v[1] / L) * d];
};

// , , ,  la traversée , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , 
const P = [];
const at = () => P.length;          // index de la prochaine ancre
const add = (...pts) => { P.push(...pts); };

// 1. jambe proche, arête supérieure (mollet, ischio), couture à mi-cuisse
add(T(-128, 8));
add(T(-104, 9.5), T(K.hip, 12));
// 2. le dos, de la hanche à l'épaule
add(T(-70, 14.5), T(-38, 16.5));
/* 3. bras éloigné. Il pend du dos et croise le flanc deux fois.
   Son bord EXTÉRIEUR doit rester extérieur d'un bout à l'autre : arrière de
   l'épaule → pointe du coude au sol → dessous de l'avant-bras → poing →
   dessus → intérieur du coude → nuque. Le poing est parcouru à l'envers pour
   ça ; c'est la même boucle de BASE, prise dans l'autre sens. */
add(T(-20, 15));
add([K.elbowF[0] - 1, 258]);      // le bras s'incurve : une verticale droite fait un pied de table
const iF7 = at(); add(K.elbowF);
add(...fist("back", K.wristF, ang(sub(K.wristF, K.elbowF))).reverse());
add([K.elbowF[0] + 6, K.elbowF[1] - 13]);   // intérieur du coude
add([K.elbowF[0] + 5, 254]);
// 4. épaule, nuque, tête, gorge, devant du cou
const HD = head(T(K.headAt, K.headH), K.headDeg);
add(back(HD[0], HD[1], 22));   // le bras remonte droit dans la nuque
add(...HD);
// 5. bras proche : épaule basse → coude → avant-bras dessus → poing → dessous → aisselle
const N38 = HD[HD.length - 1];
// L'épaule tombe droit sous la gorge : décalée vers l'avant, le trait rebrousse
// et fabrique un crochet qui se lit comme un menton en trop.
add([N38[0] - 1, N38[1] + 12]);
add([K.elbowN[0] + 4, 271]);
add(K.elbowN);
add(...fist("front", K.wristN, ang(sub(K.wristN, K.elbowN))));
const iN49 = at() - 1;                                          // poignet, dessous
// L'avant-bras s'enfonce légèrement : un accent rectiligne à 2 px de la ligne
// de sol se lit comme un soulignement, un arc qui la mord se lit comme un appui.
add([(K.wristN[0] + K.elbowN[0]) / 2 - 2, G + 4.5]);
const iN50 = at(); add([K.elbowN[0] - 5, G + 2.5]);             // pointe du coude, au sol
add([K.elbowN[0] - 10, G - 6]);                                // arrière du coude, idem
// 6. poitrine et ventre jusqu'à la hanche
add(T(-14, -15), T(-48, -17.5), T(-76, -16), T(K.hip, -13));  // le ventre s'affaisse un peu : le gainage n'est pas une planche
// 7. jambe éloignée : tibia → pied → mollet → hanche
add(T(K.kneeF, -7.5));
const footF = plant(T(K.ankleF, 0), K.footF);
add(...footF);
add(T(K.kneeF + 4, 6.5), T(-98, 10));
// 8. jambe proche : tibia → pied → retour à la couture
add(T(-106, -11), T(K.kneeN, -7));
const footN = plant(T(K.ankleN, 0), K.footN);
const iNfoot = at(); add(...footN);
add(T(-196, 8.5), T(-160, 8));
add(P[0]);

// , , ,  accents : uniquement ce qui touche le sol , , , , , , , , , , , , , , , , 
// l'avant-bras proche posé à plat, et les orteils du pied proche.
const iToeA = iNfoot + 2, iToeB = iNfoot + 7;   // 57..62 de BASE : la pointe, à plat
const ACCENTS = [[iN49, iN50], [iToeA, iToeB]];

// , , ,  assemblage , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , 
function slice(a, b) {
  let d = `M ${P[a][0].toFixed(1)} ${P[a][1].toFixed(1)}`;
  const t = 1 / 6;
  for (let i = a; i < b; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || P[i + 1];
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}
const cuts = [...ACCENTS].sort((a, b) => a[0] - b[0]);
const paths = [];
let i = 0;
for (const [a, b] of cuts) {
  if (a > i) paths.push({ d: slice(i, a) });
  paths.push({ d: slice(a, b), accent: true });
  i = b;
}
paths.push({ d: slice(i, P.length - 1) });

/* Aucun sol dessiné : le cadre se coupe au trait rendu et c'est la règle de
   la page, droite, qui fait le sol. Le contrôle chiffré se lit contre G. */
const out = process.argv[2] || OUT;
writeFileSync(out, svg(paths));

// , , ,  contrôle chiffré , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , , 
const yy = (a, b) => P.slice(a, b + 1)
  .map((p) => `x=${p[0].toFixed(0)} y=${p[1].toFixed(1)} (${(p[1] - G).toFixed(1)} sous le sol)`)
  .join("\n                        ");
console.log(`→ ${out}  sol y=${G}`);
console.log(`   accent avant-bras  ancres ${iN49}..${iN50}  y = ${yy(iN49, iN50)}`);
console.log(`   accent orteils     ancres ${iToeA}..${iToeB}  y = ${yy(iToeA, iToeB)}`);
console.log(`   pied éloigné (encre) y max = ${maxY(footF.slice(1, 10)).toFixed(1)}`);
console.log(`   coude éloigné (encre) y = ${P[iF7][1].toFixed(1)}`);
console.log(`   pied proche, ancres 55..65 : ${footN.map((q, k) => `${55 + k}:${q[0].toFixed(0)},${q[1].toFixed(1)}`).join("  ")}`);
console.log(`   chevilles descendues de ${DROP.map((d) => d.toFixed(1)).join(" / ")} px pour poser les orteils`);
