/* run-cycle.mjs — la figure qui court sur place, image par image.
 *
 * Six poses, jouées à 110 ms chacune : 660 ms le cycle, soit 182 pas par
 * minute — une allure facile — à 9 images par seconde. Le saccadé est voulu.
 * C'est un dessin animé image par image, pas une interpolation ; à 24 images
 * par seconde on obtiendrait un rendu 3D pauvre, à 9 on obtient un dessin.
 *
 * LE SOL NE DÉFILE PAS. Les ancres 3 et 53 — le bassin — ne figurent dans
 * aucun `idx` de JOINTS : aucune pose ne les déplace, elles restent à x=112.
 * La figure court donc sur place par construction, et c'est le PIED qui
 * recule de 148 à 98 sous un bassin fixe. C'est ça, le tapis roulant.
 *
 * Un cycle de course est symétrique ; ce gréement ne l'est pas. Le bras
 * arrière a 126 unités de portée, le bras avant 90 ; le pied avant est une
 * palette de neuf ancres sans arc de semelle, le pied d'appui en a sept plus
 * les sept de SOLE. Les six poses sont donc écrites une par une — aucun flip,
 * aucun demi-cycle retourné.
 *
 *   bun scripts/doodles/run-cycle.mjs
 */
import { writeFileSync } from "node:fs";
import { Figure, strokeBottom } from "./rig.mjs";
import { aim, levelLead, levelStand } from "./pose-tools.mjs";

const OUT = new URL("../../src/assets/doodles/", import.meta.url).pathname;

/* Repères du gréement au repos, mesurés une fois (voir l'en-tête). */
const GY = 375.6;       // le dessous de la semelle de BASE
const PELVIS_X = 112.0; // invariant : aucune pose ne le déplace
const PAD = 6;

/* Bornes anatomiques. Le gréement ne connaît pas l'anatomie : hors de ces
   plages il trouve des solutions et les trouve bonnes.
     leadKnee  : 58,5° de flexion à 0 ; 0° à -58 ; EN DESSOUS le genou plie à
                 l'envers. Plafond à +30 (85,7°), le nœud arrive vers 90°.
     standKnee : 5,8° à 0 ; 84,9° à -98. */
const LEAD_KNEE = [-56, 30];
const STAND_KNEE = [-98, 0];

/* Le tronçon qui passe sous le pied avant, et l'ancre la plus basse de chaque
   pied — celle qu'on amène au sol. */
const LEAD_SOLE = Figure.LEAD_SOLE;      // [63, 65]
const LEAD_TIP = 64;
const STAND_TIP = -5;                    // S[4], le point bas de l'arc de semelle

const paintOf = (s, f) =>
  s.contact === "lead" ? f.paths([LEAD_SOLE], { sole: false })
  : s.contact === "stand" ? f.paths([])
  : f.paths([], { sole: false });
const accentBottom = (paths) => strokeBottom(paths.filter((p) => p.accent).map((p) => p.d));
const accentY = (f, s) => accentBottom(paintOf(s, f));

const flexion = (a, b, c) => {
  const u = [a[0] - b[0], a[1] - b[1]], v = [c[0] - b[0], c[1] - b[1]];
  return 180 - Math.abs(Math.atan2(u[0] * v[1] - u[1] * v[0], u[0] * v[0] + u[1] * v[1]) * 180 / Math.PI);
};
const pelvisY = (f) => (f.P[3][1] + f.P[53][1]) / 2;
/* L'écart entre les deux pieds : c'est LA foulée telle qu'elle se lit. Deux
   images d'appui qui ne l'ont pas égale se lisent comme une claudication, et
   aucun contrôle de hauteur ne l'attrape — les deux hanches peuvent être à la
   même altitude avec un pas deux fois plus long d'un côté. */
const ecart = (f) => Math.abs(f.at(LEAD_TIP)[0] - f.at(STAND_TIP)[0]);
const headTop = (f) => Math.min(...Array.from({ length: 17 }, (_, k) => f.P[20 + k][1]));

/* Pose un pied au sol À UN X DONNÉ. Deux passes : viser, mettre la semelle à
   plat (ce qui déplace le pied), viser à nouveau. Sans la seconde passe
   l'accent se dresse — mesuré à 27 unités de haut sur le premier jet, un
   vermillon debout au lieu d'un vermillon posé. */
function plant(f, leg, x, y) {
  const lead = leg === "lead";
  const joints = lead ? ["leadHip", "leadKnee"] : ["standHip", "standKnee"];
  const tip = lead ? LEAD_TIP : STAND_TIP;
  const knee = lead ? LEAD_KNEE : STAND_KNEE;
  for (let pass = 0; pass < 2; pass++) {
    aim(f, joints, [[tip, [x, y]]], [-90, 90], knee);
    if (lead) levelLead(f); else levelStand(f);
  }
  aim(f, joints, [[tip, [x, y]]], [-14, 14], [-10, 10]);
  return f;
}

/* Le calage LOCAL, et c'est lui qui empêche la figure de boiter.
 *
 * La hauteur finale du corps vaut 240 + GROUND − (bas de l'accent AVANT
 * translation) : le bassin est fixe à 240, et la translation ramène l'accent
 * sur la règle. Deux images d'appui n'ont donc la même hauteur que si leur
 * accent tombe au même y LOCAL — c'est-à-dire si les deux jambes descendent
 * d'autant sous le bassin.
 *
 * Elles ne le peuvent pas également. Mesuré, portée verticale maximale du bas
 * de l'accent selon le pied et sa position :
 *
 *     pied avant   x=148 → 372,1     x=120 → 369,8     x=98 → 363,8
 *     pied d'appui x=148 → 368,9     x=120 → 375,0     x=98 → 375,6
 *
 * Onze unités d'écart en arrière : la hanche avant pivote à x=120,4, la jambe
 * avant y pend naturellement vers l'AVANT et se retrouve en bout de course dès
 * qu'on la tire derrière. Viser une hauteur fixe donnait donc deux demi-foulées
 * qui rebondissaient en sens contraire (240,0 / 246,8 d'un côté, 241,5 / 235,8
 * de l'autre) — une claudication, et le premier défaut que la planche montre.
 *
 * L'assise commune n'est donc pas un nombre écrit : c'est le MINIMUM des
 * quatre portées, mesuré à chaque exécution. Toute jambe peut descendre moins
 * loin qu'elle ne peut ; aucune ne peut descendre plus loin qu'elle ne peut.
 * Une pose retouchée déplace l'assise toute seule, sans constante à corriger.
 *
 * Ce qui laisse le rebond aux seules images en vol. Le gréement ne peut pas
 * le donner autrement : le bassin est fixe, et la cheville ne rattrape rien —
 * le pied AVANT plie (leadFoot +30 descend la pointe de 6,8) mais le pied
 * d'appui ne plie pas, son pivot [0, 71] est dans l'arc de semelle et +30 ne
 * déplace la pointe que de 2,3. Un rebond par la cheville ne marcherait que
 * sur une demi-foulée sur deux, ce qui ramène la claudication par la fenêtre.
 * Deux niveaux, donc : les quatre appuis sur la ligne, les deux vols en l'air.
 * C'est ce que fait le dessin animé limité, et à 9 images par seconde ça
 * rebondit.
 */
function reach(s) {
  let best = -Infinity;
  for (let y = GY - 8; y <= GY + 26; y += 1) {
    const f = new Figure().pose({ ...HOLD, ...s.arms, ...s.free });
    plant(f, s.contact, s.x, y);
    best = Math.max(best, accentY(f, s));
  }
  return best;
}

/** Amène le bas de l'accent au y local `target`. On vise la POINTE, mais on
 *  mesure l'ACCENT : la mise à plat de la semelle déplace le contact entre les
 *  deux, d'où la correction en boucle. La relation est en 1:1, donc reporter
 *  l'erreur sur la cible converge en trois ou quatre tours ; la vingtaine
 *  d'itérations n'est là que pour les poses raides. */
function seat(f, s, target) {
  /* La tolérance est celle du pipeline, pas une ambition : `aim` affine par
     pas de 0,1°, `f1` arrondit au dixième d'unité, et le trait est mesuré sur
     des cubiques échantillonnées. En dessous de ~0,1 unité l'itération
     oscille dans ce bruit au lieu de converger. Sur une figure de 300 unités,
     c'est 0,03 % — invisible, et bien en deçà du dixième de pixel à l'écran. */
  let y = GY, err = Infinity;
  for (let k = 0; k < 20 && Math.abs(err) >= 0.1; k++) {
    plant(f, s.contact, s.x, y);
    err = target - accentY(f, s);
    y += err;
  }
  if (Math.abs(err) >= 0.2)
    throw new Error(`${s.n} : l'assise ne converge pas (reste ${err.toFixed(2)}) — ` +
      `la jambe est en bout de course, augmente la marge de SEAT ou rapproche x du bassin`);
  return f;
}

/* ── les six poses ───────────────────────────────────────────────────────── */

/* `head` et `torso` sont CONSTANTS sur les six images. `torso.idx` vaut
   range(4, 52), qui contient la tête et les deux épaules : les figer supprime
   la première cause de tremblement inter-images, et rend le contrôle « pas de
   bobine de tête » vrai par construction. */
const HOLD = { head: 3, torso: 5 };

/* `contact` dit quel pied est au sol et `x` où il se pose ; `free` est la
   jambe qui ne l'est pas, `arms` les deux bras. `rise` n'existe que sur les
   images en vol : elles seules portent le rebond, pour la raison expliquée
   au-dessus de `reach`. Les quatre appuis, eux, sont sur la ligne.

   Les angles sont en degrés, horaire positif. Sens utiles, mesurés : une
   HANCHE positive recule le pied, des deux côtés ; `leadFoot` positif descend
   la pointe ; un coude replié (130-156) tient le poing près du corps — à 60-84
   le bras sort en perche horizontale, ce qui a coûté un tour de planche. */
const CYCLE = [
  { n: "1-appui-pres", contact: "lead", x: 148,
    free: { standHip: 4, standKnee: -94, standFoot: 40 },
    arms: { backArm: -18, backElbow: -58, frontArm: 20, frontElbow: 140 } },

  { n: "2-poussee-pres", contact: "lead", x: 98,
    free: { standHip: -30, standKnee: -60, standFoot: 12 },
    arms: { backArm: 2, backElbow: -62, frontArm: -14, frontElbow: 138 } },

  { n: "3-vol-a", contact: null, rise: 12,
    free: { leadHip: 44, leadKnee: 30, leadFoot: -16, standHip: -36, standKnee: -44, standFoot: 6 },
    arms: { backArm: 6, backElbow: -66, frontArm: -20, frontElbow: 132 } },

  { n: "4-appui-loin", contact: "stand", x: 148,
    free: { leadHip: 16, leadKnee: 30, leadFoot: -26 },
    arms: { backArm: 4, backElbow: -64, frontArm: -22, frontElbow: 128 } },

  { n: "5-poussee-loin", contact: "stand", x: 98,
    free: { leadHip: -26, leadKnee: 18, leadFoot: 4 },
    arms: { backArm: -14, backElbow: -58, frontArm: 14, frontElbow: 132 } },

  { n: "6-vol-b", contact: null, rise: 12,
    free: { leadHip: -22, leadKnee: -4, leadFoot: 6, standHip: 24, standKnee: -62, standFoot: 10 },
    arms: { backArm: -20, backElbow: -54, frontArm: 22, frontElbow: 136 } },
];

/* ── construction ────────────────────────────────────────────────────────── */

/* L'assise commune : la plus courte des quatre portées, moins trois unités.
   La marge n'est pas cosmétique. Au bout de sa course, la relation entre la
   cible visée et le contact obtenu s'aplatit — la jambe ne descend plus, quoi
   qu'on demande — et le calage ci-dessous, qui corrige en 1:1, n'y converge
   pas : à une demi-unité de marge il restait 1,3 d'écart entre les appuis, ce
   qui est une claudication de plus. Trois unités laissent chaque jambe dans la
   plage où elle répond. Et une jambe verrouillée en extension se dessinerait
   de toute façon comme une béquille. */
const SEAT = Math.min(...CYCLE.filter((s) => s.contact).map(reach)) - 3;

const frames = CYCLE.map((s) => {
  const f = new Figure().pose({ ...HOLD, ...s.arms, ...s.free });
  if (s.contact) seat(f, s, SEAT);
  return { s, f };
});

/* Les images d'appui posent leur trait sur UNE ligne : une mesure, une
   translation. `translate(0, δ)` décale `strokeBottom` d'exactement δ, donc
   aucune itération n'est nécessaire.

   On épingle sur le bas de l'ACCENT, pas sur le bas de la figure. C'est le
   vermillon qui doit toucher la règle — s'il flotte, la règle 3 est enfreinte,
   et se caler sur le point le plus bas laisserait justement le vermillon en
   l'air quand la jambe libre descend plus bas que la semelle plantée. Ce qui
   est arrivé au premier jet : sur l'image 4 l'accent était 2,8 au-dessus. Le
   contrôle qui suit vérifie que plus rien ne passe SOUS l'accent. */
const GROUND = accentBottom(paintOf(frames[0].s, frames[0].f));
for (const fr of frames) {
  if (!fr.s.contact) continue;
  const b = accentBottom(paintOf(fr.s, fr.f));
  fr.f.translate(0, +(GROUND - b).toFixed(1));
}
/* Les images en vol n'ont pas de sol pour se caler : c'est le bassin qui les
   place, à `rise` au-dessus de celui des images d'appui. */
const PELVIS0 = pelvisY(frames[0].f);
for (const fr of frames) {
  if (fr.s.contact) continue;
  fr.f.translate(0, +((PELVIS0 - fr.s.rise) - pelvisY(fr.f)).toFixed(1));
}
for (const fr of frames) fr.paths = paintOf(fr.s, fr.f);

/* ── les six contrôles, qui refusent une mauvaise passe ──────────────────── */

const fail = [];
const near = (a, b, tol) => Math.abs(a - b) <= tol;

// 1. pas de bobine de tête : le crâne suit le bassin exactement.
const deltas = frames.map((fr) => headTop(fr.f) - pelvisY(fr.f));
if (Math.max(...deltas) - Math.min(...deltas) > 0.2)
  fail.push(`bobine de tête : Δ(crâne−bassin) varie de ${(Math.max(...deltas) - Math.min(...deltas)).toFixed(2)}`);

// 2. une seule ligne de sol, et c'est l'accent qui la touche.
const contacts = frames.filter((fr) => fr.s.contact);
const accBots = contacts.map((fr) => accentBottom(fr.paths));
if (Math.max(...accBots) - Math.min(...accBots) > 0.25)
  fail.push(`sol qui tremble : ${accBots.map((b) => b.toFixed(2)).join(" / ")}`);
for (const fr of contacts) {
  const under = strokeBottom(fr.paths.map((p) => p.d)) - accentBottom(fr.paths);
  if (under > 0.15)
    fail.push(`${fr.s.n} : ${under.toFixed(1)} unités de trait passent SOUS l'accent (un membre sous le sol)`);
}
// et les images en vol sont vraiment en l'air.
for (const fr of frames.filter((f) => !f.s.contact)) {
  const clair = GROUND - strokeBottom(fr.paths.map((p) => p.d));
  if (clair < 8) fail.push(`${fr.s.n} : ne décolle que de ${clair.toFixed(1)} — ça ne se lit pas comme un vol`);
  if (fr.paths.some((p) => p.accent)) fail.push(`${fr.s.n} : un accent en l'air`);
}

// 3. le pied planté RECULE sous le bassin : pas de patinage.
for (const [a, b] of [[0, 1], [3, 4]]) {
  const tip = frames[a].s.contact === "lead" ? LEAD_TIP : STAND_TIP;
  const dx = frames[a].f.at(tip)[0] - frames[b].f.at(tip)[0];
  if (dx < 40) fail.push(`patinage ${frames[a].s.n}→${frames[b].s.n} : le pied ne recule que de ${dx.toFixed(1)}`);
}

// 4. les genoux restent dans la plage où le trait se lit.
for (const fr of frames) {
  const fl = flexion(fr.f.P[53], fr.f.P[54], fr.f.P[55]);
  const fs = flexion(fr.f.P[2], fr.f.P[1], fr.f.P[0]);
  if (fl < 0 || fl > 85) fail.push(`${fr.s.n} : genou avant à ${fl.toFixed(1)}°`);
  if (fs < 0 || fs > 85) fail.push(`${fr.s.n} : genou arrière à ${fs.toFixed(1)}°`);
}

/* 5. Opposition. Elle ne se lit PAS dans une image isolée : sous un coude
      replié comme celui du dessin approuvé (frontElbow 140-156), le poing
      avant est devant le bassin à tous les angles — de 142 à 242 selon la
      pose, jamais derrière. Comparer un poing au bassin ne dit donc rien.

      L'opposition est un fait ENTRE les images : quand le pied avance, le
      poing du même côté recule. On la mesure par la corrélation, sur le cycle
      entier, entre l'abscisse du pied et celle du poing de son côté — le bras
      avant appartient à la jambe avant, tous deux sont les membres proches. */
{
  const corr = (u, v) => {
    const mu = u.reduce((a, b) => a + b) / u.length, mv = v.reduce((a, b) => a + b) / v.length;
    const num = u.reduce((s, x, i) => s + (x - mu) * (v[i] - mv), 0);
    return num / Math.sqrt(u.reduce((s, x) => s + (x - mu) ** 2, 0) * v.reduce((s, x) => s + (x - mv) ** 2, 0));
  };
  const cAvant = corr(frames.map((fr) => fr.f.at(LEAD_TIP)[0]), frames.map((fr) => fr.f.P[45][0]));
  const cArriere = corr(frames.map((fr) => fr.f.at(STAND_TIP)[0]), frames.map((fr) => fr.f.P[12][0]));
  if (cAvant > -0.5) fail.push(`opposition avant perdue : corrélation pied/poing ${cAvant.toFixed(2)} (attendu < -0,5)`);
  if (cArriere > -0.5) fail.push(`opposition arrière perdue : corrélation pied/poing ${cArriere.toFixed(2)} (attendu < -0,5)`);
}

// 6. le rebond est le même sur les deux demi-foulées : pas de claudication.
{
  const p = frames.map((fr) => pelvisY(fr.f));
  for (let k = 0; k < 3; k++)
    if (Math.abs(p[k] - p[k + 3]) > 0.5)
      fail.push(`claudication : image ${k + 1} des deux pas à ${p[k].toFixed(1)} et ${p[k + 3].toFixed(1)}`);
  const appuis = [p[0], p[1], p[3], p[4]];
  if (Math.max(...appuis) - Math.min(...appuis) > 0.5)
    fail.push(`appuis à des hauteurs différentes : ${appuis.map((v) => v.toFixed(1)).join(" / ")}`);
  for (const k of [2, 5])
    if (Math.abs((appuis[0] - p[k]) - CYCLE[k].rise) > 0.5)
      fail.push(`${frames[k].s.n} : décolle de ${(appuis[0] - p[k]).toFixed(1)} au lieu de ${CYCLE[k].rise}`);
}

// 7. la foulée est la même des deux côtés.
for (let k = 0; k < 3; k++) {
  const [a, b] = [ecart(frames[k].f), ecart(frames[k + 3].f)];
  if (Math.abs(a - b) > 12)
    fail.push(`foulée inégale : image ${k + 1} des deux pas, ${a.toFixed(0)} contre ${b.toFixed(0)} d'écart entre pieds`);
}

/* 8. La jambe libre avance dans le temps. Elle quitte le sol en arrière puis
      revient vers l'avant, image après image ; elle ne recule jamais. Le
      premier jet violait ça sur les images 1 et 4 — la jambe repartait en
      arrière après avoir déjà commencé à revenir — et ça se voyait comme un
      pas qui bégaie, sans qu'aucun contrôle de hauteur ne l'attrape. */
for (const [tip, nom] of [[LEAD_TIP, "avant"], [STAND_TIP, "arrière"]]) {
  const x = frames.map((fr) => fr.f.at(tip)[0]);
  // le pied planté recule (contrôle 3) ; hors appui il doit avancer.
  const planted = frames.map((fr) =>
    (tip === LEAD_TIP ? fr.s.contact === "lead" : fr.s.contact === "stand"));
  for (let k = 0; k < 6; k++) {
    const j = (k + 1) % 6;
    if (planted[k] && planted[j]) continue;      // les deux au sol : contrôle 3
    if (planted[k] !== planted[j]) continue;     // décollage ou pose : saut normal
    if (x[j] < x[k] - 1)
      fail.push(`pied ${nom} : il recule en l'air entre les images ${k + 1} et ${j + 1} ` +
        `(${x[k].toFixed(0)} → ${x[j].toFixed(0)}) — le pas bégaie`);
  }
}

/* 9. La figure n'a pas commencé à voyager. C'est gratuit aujourd'hui — aucune
      articulation ne touche aux ancres 3 et 53 — mais ça ne se voit nulle
      part : un `translate(dx, …)` ajouté un jour ferait glisser l'animation
      hors du cadre commun, lentement, sans que rien d'autre ne proteste. */
for (const fr of frames) {
  const x = (fr.f.P[3][0] + fr.f.P[53][0]) / 2;
  if (!near(x, PELVIS_X, 1e-9))
    fail.push(`${fr.s.n} : le bassin est en x=${x.toFixed(2)} au lieu de ${PELVIS_X} — la figure voyage`);
}

/* ── le cadre commun ─────────────────────────────────────────────────────── */

const all = frames.flatMap((fr) => fr.paths);
const n = all.flatMap((p) => p.d.match(/-?\d+(?:\.\d+)?/g).map(Number));
const xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1);
const x0 = Math.min(...xs) - PAD, y0 = Math.min(...ys) - PAD;
const w = Math.max(...xs) + PAD - x0;
const h = Math.max(...accBots) + 1.2 - y0;
const vb = `${x0.toFixed(1)} ${y0.toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`;

/* ── la table, puis l'écriture ───────────────────────────────────────────── */

console.log(`\nviewBox "${vb}"   ratio ${(w / h).toFixed(3)}\n`);
console.log("#  phase            bassin  crâne   Δ       bas     pied-x  écart  genoux av/ar   accent");
frames.forEach((fr, i) => {
  const b = strokeBottom(fr.paths.map((p) => p.d));
  const acc = fr.paths.filter((p) => p.accent);
  const tip = fr.s.contact === "lead" ? LEAD_TIP : fr.s.contact === "stand" ? STAND_TIP : null;
  console.log(
    `${i + 1}  ${fr.s.n.padEnd(15)} ` +
    `${pelvisY(fr.f).toFixed(1).padStart(6)} ${headTop(fr.f).toFixed(1).padStart(6)} ` +
    `${(headTop(fr.f) - pelvisY(fr.f)).toFixed(1).padStart(7)} ${b.toFixed(1).padStart(7)} ` +
    `${(tip === null ? "—" : fr.f.at(tip)[0].toFixed(1)).padStart(7)} ${ecart(fr.f).toFixed(0).padStart(6)} ` +
    `${flexion(fr.f.P[53], fr.f.P[54], fr.f.P[55]).toFixed(0).padStart(3)}°/${flexion(fr.f.P[2], fr.f.P[1], fr.f.P[0]).toFixed(0).padStart(3)}°  ` +
    `${acc.length ? strokeBottom(acc.map((p) => p.d)).toFixed(1) : "aucun (en l'air)"}`);
});

if (fail.length) {
  console.error("\n" + fail.map((m) => "  ✗ " + m).join("\n") + "\n");
  process.exit(1);
}

const body = frames.map((fr, i) =>
  `  <g class="rc-f rc-f--${i + 1}">\n` +
  fr.paths.map((p) => `    <path${p.accent ? ` stroke="var(--accent)"` : ""} d="${p.d}"/>`).join("\n") +
  `\n  </g>`).join("\n");

writeFileSync(`${OUT}run-cycle.svg`,
`<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
${body}
</svg>
`);
console.log(`\n→ run-cycle.svg  ${frames.length} images, ${all.length} sous-chemins\n`);
