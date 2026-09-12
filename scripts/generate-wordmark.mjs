/* Le logo de Zoned : le mot, tracé en courbes.
 *
 *   bun scripts/generate-wordmark.mjs
 *
 * Écrit src/assets/logo.svg (le mot entier) et public/favicon.svg (le « z. »
 * dans un carré). Sortie générée : on édite ce fichier, jamais les SVG.
 *
 * ── Pourquoi le mot, et pas une figure ─────────────────────────────────────
 *
 * Un signe dessiné a été construit, regardé neuf fois, et écarté. Deux raisons,
 * les deux mesurées sur le rendu plutôt que débattues :
 *
 * 1. Le gréement (scripts/doodles/rig.mjs) sait dessiner la famille debout —
 *    marcher, courir, se pencher, lever un bras. Il ne sait PAS dessiner un
 *    cycliste assis ni un nageur : au-delà d'environ 90° de flexion le trait
 *    fait un nœud au lieu d'un chevauchement (docs/doodles.md). Une figure
 *    unique issue de ce gréement lit donc toujours « un coureur », jamais
 *    « du sport ». Trois disciplines dans une silhouette n'était pas un
 *    réglage à trouver, c'était hors de portée du trait.
 * 2. À 16 et 32 px la figure devient un pâté. Les boucles de main se ferment
 *    les premières ; les retirer donne une personne sans bras, ce qui se voit.
 *
 * Et une raison de fond : les doodles sont déjà l'identité — la coquille de
 * chargement, le hero, le menu, les cartes de partage, l'image Open Graph. Un
 * logo figuratif entrerait en concurrence avec vingt-trois dessins de la même
 * main et perdrait. Le mot ne concurrence rien : il les nomme.
 *
 * Ce que le mot remplace : une ligne de pouls en zigzag, en segments droits —
 * exactement ce que la direction artistique interdit.
 *
 * ── Pourquoi des courbes et non du <text> ──────────────────────────────────
 *
 * Le mot est déjà dans l'app en CSS (`Wordmark.tsx` + `wordmark.css`), et il y
 * reste : dans une page, du texte est meilleur qu'un dessin — il se sélectionne,
 * il suit le thème, il ne pèse rien. Ce fichier sert les trois endroits où le
 * CSS n'arrive pas :
 *
 *   - le favicon, qui n'a pas de page dont hériter la police ;
 *   - les cartes de partage, rendues par `html-to-image` avec `skipFonts: true`
 *     (src/lib/shareImage.ts) — le mot y tombait en Arial ;
 *   - l'OG, la bannière du README et la vidéo, rendus hors navigateur.
 *
 * Les contours viennent du MÊME fichier que l'app charge,
 * public/fonts/bricolage-grotesque-latin.woff2, à la graisse 800 (le défaut de
 * cette instance) et au crénage que le navigateur applique — plus -0,04 em
 * d'approche, la valeur de `wordmark.css`. Le logo et l'en-tête sont donc le
 * même dessin, pas deux réglages qui dérivent.
 */
import { readFileSync, writeFileSync } from "node:fs";
import * as fontkit from "fontkit";
import sharp from "sharp";

const FONT = "public/fonts/bricolage-grotesque-latin.woff2";
/** -0,04 em, l'approche de `.zn-wordmark`. Le font a 1000 unités par em. */
const TRACKING = -0.04;
/* Le monogramme prend l'approche INVERSE, et ce n'est pas une inconséquence.
   Dans le mot, le point suit un « d » dont le fût droit laisse un blanc net à
   -0,04 em — c'est de la bonne typographie serrée. Le « z », lui, finit par une
   barre basse qui déborde à droite : à -0,04 le point mord dedans, et à 16 px
   les deux fondent en un seul pâté avec une écharde rouge. +0,04 est la
   première valeur où le contre-poinçon de la barre et le point restent
   séparés — mesuré en regardant -0,04, 0, +0,04 et +0,09 à 96, 32 et 16 px. */
const MONO_TRACKING = 0.04;
const INK = "#171614";
const PAPER = "#F6F5F2";
const ACCENT = "#E8452A";

const font = fontkit.openSync(FONT);
const EM = font.unitsPerEm;
const f1 = (n) => (Math.round(n * 10) / 10).toString();
/* Trois décimales pour l'échelle et deux pour la translation du favicon. `f1`
   suffit aux contours, qui vivent dans une grille de 1000 unités par em ; il
   ruine une échelle. Arrondie au dixième, 0,067 devient 0,1 — le dessin sort
   de la boîte par la droite et le point vermillon se retrouve coupé en deux
   contre le bord. C'est arrivé, et ça se voyait au premier rendu. */
const f3 = (n) => (Math.round(n * 1000) / 1000).toString();
const f2 = (n) => (Math.round(n * 100) / 100).toString();

/** Le mot posé sur la ligne de base, y déjà retourné (SVG descend).
    Rend un chemin par glyphe, dans l'ordre, avec sa boîte d'encre. */
function setText(text, tracking = TRACKING) {
  const run = font.layout(text);
  const out = [];
  let pen = 0;
  run.glyphs.forEach((glyph, i) => {
    const p = glyph.path.transform(1, 0, 0, -1, pen, 0);
    out.push({ ch: text[i], d: p.toSVG(), bbox: p.bbox });
    pen += run.positions[i].xAdvance + tracking * EM;
  });
  return out;
}

/** La boîte d'encre commune, serrée sur les contours (pas sur les avances). */
function inkBox(glyphs) {
  const b = glyphs.map((g) => g.bbox);
  return {
    x0: Math.min(...b.map((v) => v.minX)),
    y0: Math.min(...b.map((v) => v.minY)),
    x1: Math.max(...b.map((v) => v.maxX)),
    y1: Math.max(...b.map((v) => v.maxY)),
  };
}

/** Le mot, à sa proportion naturelle. Les lettres suivent `currentColor`, le
    point porte l'accent — c'est le seul vermillon du logo, et c'est une
    ponctuation, pas une action (cf. l'en-tête de wordmark.css). */
function logoSvg(text = "zoned.") {
  const glyphs = setText(text);
  const { x0, y0, x1, y1 } = inkBox(glyphs);
  const letters = glyphs.slice(0, -1).map((g) => g.d).join(" ");
  const dot = glyphs.at(-1).d;
  const vb = [x0, y0, x1 - x0, y1 - y0].map(f1).join(" ");
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">
  <!-- Le mot en Bricolage Grotesque 800, approche -0,04 em, vectorisé.
       Généré par scripts/generate-wordmark.mjs — ne pas éditer à la main. -->
  <path d="${letters}" fill="currentColor"/>
  <path d="${dot}" fill="var(--accent, ${ACCENT})"/>
</svg>
`;
}

/** Le favicon : un carré, parce qu'un onglet et une tuile en réclament un.
 *
 *  Le mot entier ne tient pas dans 16 px — six lettres y font deux pixels
 *  chacune. C'est donc l'initiale et le point : la même paire que le mot, dont
 *  le point reste vermillon, et à 16 px il occupe encore deux pixels sur seize.
 *
 *  Rien n'est à l'échelle du trait ici : ce sont des contours remplis, donc
 *  réduire ne les amincit pas — c'était tout le problème de la figure. */
function faviconSvg() {
  const glyphs = setText("z.", MONO_TRACKING);
  const { x0, y0, x1, y1 } = inkBox(glyphs);
  const BOX = 64;
  /* 8 de 64, soit 12,5 % par bord : le dessin occupe les 75 % centraux, donc
     il tient dans la zone sûre d'une icône « maskable » (les 80 % centraux),
     et pwa-assets.config.ts peut prendre ce fichier tel quel pour les deux
     familles d'icônes. */
  const MARGIN = 8;
  const k = (BOX - MARGIN * 2) / Math.max(x1 - x0, y1 - y0);
  const dx = BOX / 2 - ((x0 + x1) / 2) * k;
  const dy = BOX / 2 - ((y0 + y1) / 2) * k;
  return `<svg width="${BOX}" height="${BOX}" viewBox="0 0 ${BOX} ${BOX}" xmlns="http://www.w3.org/2000/svg">
  <!-- L'initiale sur le papier de l'app. Un favicon n'a pas de page dont
       hériter : l'encre ${INK} et le papier ${PAPER} sont écrits en dur, et le
       point garde le vermillon ${ACCENT}.
       Généré par scripts/generate-wordmark.mjs — ne pas éditer à la main. -->
  <rect width="${BOX}" height="${BOX}" rx="14" fill="${PAPER}"/>
  <g transform="translate(${f2(dx)} ${f2(dy)}) scale(${f3(k)})">
    <path d="${glyphs[0].d}" fill="${INK}"/>
    <path d="${glyphs[1].d}" fill="${ACCENT}"/>
  </g>
</svg>
`;
}

/* Les deux PNG que `index.html` déclare à côté du SVG, et que
   `vite.config.ts` liste dans `includeAssets`. Le générateur d'assets PWA
   (`bunx pwa-assets-generator`, préréglage minimal2023) ne les produit PAS —
   il fait les pwa-*, l'apple-touch, le maskable et le .ico. Ils étaient donc
   restés sur l'ancien logo la dernière fois. Ils se dérivent d'ici pour que
   ça ne se reproduise pas.

   Ils sortent de `--check` volontairement : ils dérivent du SVG, que `--check`
   surveille, et un octet de PNG bouge à chaque montée de sharp — un portail
   qui casse tout seul est un portail qu'on désactive. */
async function rasterFavicons(svg) {
  for (const size of [16, 32]) {
    const png = await sharp(Buffer.from(svg), { density: 384 })
      .resize(size, size)
      .png({ compressionLevel: 9 })
      .toBuffer();
    writeFileSync(`public/favicon-${size}x${size}.png`, png);
  }
}

/* --check : le portail. Les deux SVG sont de la sortie générée, comme
   src/components/icons/index.tsx — on édite ce fichier, jamais eux. */
const files = [
  ["src/assets/logo.svg", logoSvg()],
  ["public/favicon.svg", faviconSvg()],
];

if (process.argv.includes("--check")) {
  const stale = files.filter(([p, want]) => {
    try {
      return readFileSync(p, "utf8") !== want;
    } catch {
      return true;
    }
  });
  if (stale.length) {
    console.error(
      `✗ sortie périmée : ${stale.map(([p]) => p).join(", ")}\n  → bun scripts/generate-wordmark.mjs`,
    );
    process.exit(1);
  }
  console.log("✓ logo.svg et favicon.svg à jour");
} else {
  for (const [p, content] of files) writeFileSync(p, content);
  await rasterFavicons(files[1][1]);
  console.log(
    `→ ${files.map(([p]) => p).join(", ")}, public/favicon-16x16.png, public/favicon-32x32.png`,
  );
  console.log("  puis : bunx pwa-assets-generator (pwa-*, apple-touch, maskable, .ico)");
}
