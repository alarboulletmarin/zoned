/* Le logo de Zoned : le mot, tracé en courbes.
 *
 *   bun scripts/generate-wordmark.mjs
 *
 * Écrit src/assets/logo.svg (le mot entier), public/favicon.svg (le z. dans
 * un carré de papier, pour un onglet) et public/app-icon.svg (le même z. sur
 * un carré d'encre à fond perdu, pour un écran d'accueil), puis rasterise les
 * PNG que les deux dernières familles réclament. Sortie générée : on édite ce
 * fichier, jamais les SVG ni les PNG.
 *
 * ── Pourquoi le mot, et pas une figure ─────────────────────────────────────
 *
 * Un signe dessiné a été construit, regardé neuf fois, et écarté. Deux raisons,
 * les deux mesurées sur le rendu plutôt que débattues :
 *
 * 1. Le gréement (scripts/doodles/rig.mjs) sait dessiner la famille debout,
 *    marcher, courir, se pencher, lever un bras. Il ne sait PAS dessiner un
 *    cycliste assis ni un nageur : au-delà d'environ 90° de flexion le trait
 *    fait un nœud au lieu d'un chevauchement (docs/doodles.md). Une figure
 *    unique issue de ce gréement lit donc toujours un coureur, jamais
 *    du sport. Trois disciplines dans une silhouette n'était pas un
 *    réglage à trouver, c'était hors de portée du trait.
 * 2. À 16 et 32 px la figure devient un pâté. Les boucles de main se ferment
 *    les premières ; les retirer donne une personne sans bras, ce qui se voit.
 *
 * Et une raison de fond : les doodles sont déjà l'identité, la coquille de
 * chargement, le hero, le menu, les cartes de partage, l'image Open Graph. Un
 * logo figuratif entrerait en concurrence avec vingt-trois dessins de la même
 * main et perdrait. Le mot ne concurrence rien : il les nomme.
 *
 * Ce que le mot remplace : une ligne de pouls en zigzag, en segments droits,
 * exactement ce que la direction artistique interdit.
 *
 * ── Pourquoi des courbes et non du <text> ──────────────────────────────────
 *
 * Le mot est déjà dans l'app en CSS (`Wordmark.tsx` + `wordmark.css`), et il y
 * reste : dans une page, du texte est meilleur qu'un dessin, il se sélectionne,
 * il suit le thème, il ne pèse rien. Ce fichier sert les trois endroits où le
 * CSS n'arrive pas :
 *
 *   - le favicon, qui n'a pas de page dont hériter la police ;
 *   - les cartes de partage, rendues par `html-to-image` avec `skipFonts: true`
 *     (src/lib/shareImage.ts), le mot y tombait en Arial ;
 *   - l'OG, la bannière du README et la vidéo, rendus hors navigateur.
 *
 * Les contours viennent du MÊME fichier que l'app charge,
 * public/fonts/bricolage-grotesque-latin.woff2, à la graisse 800 (le défaut de
 * cette instance) et au crénage que le navigateur applique, plus -0,04 em
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
   Dans le mot, le point suit un d dont le fût droit laisse un blanc net à
   -0,04 em, c'est de la bonne typographie serrée. Le z, lui, finit par une
   barre basse qui déborde à droite : à -0,04 le point mord dedans, et à 16 px
   les deux fondent en un seul pâté avec une écharde rouge. +0,04 est la
   première valeur où le contre-poinçon de la barre et le point restent
   séparés, mesuré en regardant -0,04, 0, +0,04 et +0,09 à 96, 32 et 16 px. */
const MONO_TRACKING = 0.04;
const INK = "#171614";
const PAPER = "#F6F5F2";
const ACCENT = "#E8452A";

const font = fontkit.openSync(FONT);
const EM = font.unitsPerEm;
const f1 = (n) => (Math.round(n * 10) / 10).toString();
/* Trois décimales pour l'échelle et deux pour la translation du favicon. `f1`
   suffit aux contours, qui vivent dans une grille de 1000 unités par em ; il
   ruine une échelle. Arrondie au dixième, 0,067 devient 0,1, le dessin sort
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
    point porte l'accent, c'est le seul vermillon du logo, et c'est une
    ponctuation, pas une action (cf. l'en-tête de wordmark.css). */
function logoSvg(text = "zoned.") {
  const glyphs = setText(text);
  const { x0, y0, x1, y1 } = inkBox(glyphs);
  const letters = glyphs.slice(0, -1).map((g) => g.d).join(" ");
  const dot = glyphs.at(-1).d;
  const vb = [x0, y0, x1 - x0, y1 - y0].map(f1).join(" ");
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">
  <!-- Le mot en Bricolage Grotesque 800, approche -0,04 em, vectorisé.
       Généré par scripts/generate-wordmark.mjs, ne pas éditer à la main. -->
  <path d="${letters}" fill="currentColor"/>
  <path d="${dot}" fill="var(--accent, ${ACCENT})"/>
</svg>
`;
}

/** Le favicon : un carré, parce qu'un onglet et une tuile en réclament un.
 *
 *  Le mot entier ne tient pas dans 16 px, six lettres y font deux pixels
 *  chacune. C'est donc l'initiale et le point : la même paire que le mot, dont
 *  le point reste vermillon, et à 16 px il occupe encore deux pixels sur seize.
 *
 *  Rien n'est à l'échelle du trait ici : ce sont des contours remplis, donc
 *  réduire ne les amincit pas, c'était tout le problème de la figure. */
function faviconSvg() {
  const glyphs = setText("z.", MONO_TRACKING);
  const { x0, y0, x1, y1 } = inkBox(glyphs);
  const BOX = 64;
  /* 8 de 64, soit 12,5 % par bord : le dessin occupe les 75 % centraux, ce
     qui laisse la plaque respirer dans une barre d'onglets. Ce fichier ne
     sert QUE l'onglet ; l'icône d'app se dessine plus bas, à part, et la
     raison est écrite là-bas. */
  const MARGIN = 8;
  const k = (BOX - MARGIN * 2) / Math.max(x1 - x0, y1 - y0);
  const dx = BOX / 2 - ((x0 + x1) / 2) * k;
  const dy = BOX / 2 - ((y0 + y1) / 2) * k;
  return `<svg width="${BOX}" height="${BOX}" viewBox="0 0 ${BOX} ${BOX}" xmlns="http://www.w3.org/2000/svg">
  <!-- L'initiale sur le papier de l'app. Un favicon n'a pas de page dont
       hériter : l'encre ${INK} et le papier ${PAPER} sont écrits en dur, et le
       point garde le vermillon ${ACCENT}.
       Généré par scripts/generate-wordmark.mjs, ne pas éditer à la main. -->
  <rect width="${BOX}" height="${BOX}" rx="14" fill="${PAPER}"/>
  <g transform="translate(${f2(dx)} ${f2(dy)}) scale(${f3(k)})">
    <path d="${glyphs[0].d}" fill="${INK}"/>
    <path d="${glyphs[1].d}" fill="${ACCENT}"/>
  </g>
</svg>
`;
}

/** L'icône de l'app : le même z., sur un carré d'encre, à fond perdu.
 *
 *  Ce n'est PAS le favicon agrandi, et c'est tout le sujet. Un favicon vit
 *  dans une barre d'onglets claire : il lui faut sa plaque arrondie de papier
 *  pour s'en détacher. Une icône d'app vit sur un écran d'accueil, où iOS et
 *  Android posent LEUR masque par-dessus. La plaque de papier y devenait
 *  invisible, parce que le générateur d'assets la posait sur du blanc pur,
 *  après lui avoir ajouté 30 % de marge.
 *
 *  Mesuré sur l'ancienne apple-touch-icon avant de la remplacer : 52 % de la
 *  tuile en FFFFFF, le signe sur 52 % de large et 38 % de haut, 9 % de pixels
 *  d'encre. Sur un téléphone, ça ne se lisait pas comme un logo trop petit,
 *  ça se lisait comme une tuile blanche : le logo ne s'était pas mis. Les
 *  icônes des trois autres apps de la maison remplissent leur carré, d'où la
 *  comparaison qui a levé le lièvre.
 *
 *  Donc : l'encre, pas le papier, parce qu'une tuile à 96 % de blanc disparaît
 *  sur un fond d'écran clair, et le fond perdu, sans aucun arrondi, parce que
 *  le système fait le sien et que deux arrondis concentriques se voient.
 */
const APP_BOX = 512;

/* La part du côté que prend la plus grande dimension du signe.

   0,62 pour les icônes ordinaires : c'est la proportion des icônes système,
   et elle laisse la marge dans laquelle le masque d'iOS mord.

   0,54 pour la maskable, et le chiffre est CONTRAINT, pas choisi. La zone sûre
   d'une icône maskable est le disque inscrit à 80 % du côté : tout ce qui en
   sort peut être rogné. Le signe est un rectangle couché, c'est donc sa
   DIAGONALE qui doit tenir dans ce disque, pas sa largeur. Le portail plus bas
   refait le calcul depuis les contours réels, parce qu'il dépend de la fonte :
   une montée de Bricolage Grotesque qui élargirait le z. ferait sortir de la
   zone sûre une valeur restée juste. */
const ICON_FILL = 0.62;
const MASKABLE_FILL = 0.54;

function appIconSvg(fill) {
  const glyphs = setText("z.", MONO_TRACKING);
  const { x0, y0, x1, y1 } = inkBox(glyphs);
  const k = (APP_BOX * fill) / Math.max(x1 - x0, y1 - y0);
  const dx = APP_BOX / 2 - ((x0 + x1) / 2) * k;
  const dy = APP_BOX / 2 - ((y0 + y1) / 2) * k;
  return `<svg width="${APP_BOX}" height="${APP_BOX}" viewBox="0 0 ${APP_BOX} ${APP_BOX}" xmlns="http://www.w3.org/2000/svg">
  <!-- L'initiale sur l'encre de l'app, à fond perdu : le carré va jusqu'au
       bord, le masque de l'écran d'accueil est celui du système.
       Généré par scripts/generate-wordmark.mjs, ne pas éditer à la main. -->
  <rect width="${APP_BOX}" height="${APP_BOX}" fill="${INK}"/>
  <g transform="translate(${f2(dx)} ${f2(dy)}) scale(${f3(k)})">
    <path d="${glyphs[0].d}" fill="${PAPER}"/>
    <path d="${glyphs[1].d}" fill="${ACCENT}"/>
  </g>
</svg>
`;
}

/** La diagonale du signe, en fraction du côté, pour un `fill` donné. */
function markDiagonal(fill) {
  const { x0, y0, x1, y1 } = inkBox(setText("z.", MONO_TRACKING));
  const long = Math.max(x1 - x0, y1 - y0);
  return Math.hypot(((x1 - x0) / long) * fill, ((y1 - y0) / long) * fill);
}

/* Les cinq PNG d'icône, le nom de fichier tel que `vite.config.ts` et
   `index.html` les déclarent. Ils sortent de `--check` pour la raison écrite
   au-dessus de rasterFavicons ; ce que `--check` surveille, c'est le SVG dont
   ils dérivent. */
const APP_ICONS = [
  ["public/pwa-64x64.png", 64, ICON_FILL],
  ["public/pwa-192x192.png", 192, ICON_FILL],
  ["public/pwa-512x512.png", 512, ICON_FILL],
  ["public/apple-touch-icon-180x180.png", 180, ICON_FILL],
  ["public/maskable-icon-512x512.png", 512, MASKABLE_FILL],
];

/* `flatten` n'est pas une précaution de style : une icône d'app ne doit porter
   AUCUNE transparence. Les anciens pwa-*.png en avaient 13 %, dans les coins
   laissés libres par la plaque arrondie, et iOS peint le transparent en noir.
   Le fond est déjà opaque dans le SVG, `flatten` retire le canal alpha que
   rsvg ajoute quand même, et le PNG sort en RGB. */
async function rasterAppIcons() {
  for (const [path, size, fill] of APP_ICONS) {
    const png = await sharp(Buffer.from(appIconSvg(fill)), {
      // Sur-échantillonnage 4x puis réduction, comme pour les favicons : les
      // courbes du z. tiennent mieux qu'une rasterisation directe à 64 px.
      density: (72 * 4 * size) / APP_BOX,
    })
      .resize(size, size)
      .flatten({ background: INK })
      .png({ compressionLevel: 9 })
      .toBuffer();
    writeFileSync(path, png);
  }
}

/* Les PNG d'onglet que `index.html` déclare à côté du SVG, et que
   `vite.config.ts` liste dans `includeAssets`, plus le .ico que personne ne
   déclare mais que les agents sondant /favicon.ico vont chercher. Le
   générateur d'assets PWA en produisait une partie ; il est parti avec la
   configuration qui cassait les icônes d'app, donc tout se dérive d'ici. Les
   deux PNG étaient d'ailleurs déjà restés sur l'ancien logo la fois où il
   était seul à les faire.

   Ils sortent de `--check` volontairement : ils dérivent du SVG, que `--check`
   surveille, et un octet de PNG bouge à chaque montée de sharp, un portail
   qui casse tout seul est un portail qu'on désactive. */
async function rasterFavicons(svg) {
  const rendus = new Map();
  for (const size of [16, 32, 48]) {
    rendus.set(
      size,
      await sharp(Buffer.from(svg), { density: 384 })
        .resize(size, size)
        .png({ compressionLevel: 9 })
        .toBuffer(),
    );
  }
  for (const size of [16, 32]) {
    writeFileSync(`public/favicon-${size}x${size}.png`, rendus.get(size));
  }
  writeFileSync("public/favicon.ico", ico(rendus));
}

/* Le .ico est un conteneur, pas un format d'image : six octets d'en-tête, une
   entrée de seize par taille, puis les images bout à bout. Depuis Vista elles
   peuvent être des PNG, ce qui évite d'écrire un encodeur BMP avec son masque
   de transparence pour un fichier que plus rien ne lit vraiment. */
function ico(rendus) {
  const tailles = [...rendus.keys()];
  const entete = Buffer.alloc(6);
  entete.writeUInt16LE(1, 2); // type : 1 = icône
  entete.writeUInt16LE(tailles.length, 4);

  let position = 6 + tailles.length * 16;
  const entrees = tailles.map((size) => {
    const png = rendus.get(size);
    const e = Buffer.alloc(16);
    e[0] = size; // 0 voudrait dire 256, aucune taille ici ne l'atteint
    e[1] = size;
    e.writeUInt16LE(1, 4); // plans
    e.writeUInt16LE(32, 6); // bits par pixel
    e.writeUInt32LE(png.length, 8);
    e.writeUInt32LE(position, 12);
    position += png.length;
    return e;
  });

  return Buffer.concat([entete, ...entrees, ...tailles.map((s) => rendus.get(s))]);
}

/* --check : le portail. Les trois SVG sont de la sortie générée, comme
   src/components/icons/index.tsx, on édite ce fichier, jamais eux. */
const files = [
  ["src/assets/logo.svg", logoSvg()],
  ["public/favicon.svg", faviconSvg()],
  ["public/app-icon.svg", appIconSvg(ICON_FILL)],
];

/* Le portail de la zone sûre. Il tourne dans les deux modes, y compris
   --check, parce qu'un maskable qui déborde ne se voit pas dans un diff : il
   se voit sur un téléphone Android, une fois publié. */
const diagonale = markDiagonal(MASKABLE_FILL);
if (diagonale > 0.8) {
  console.error(
    `✗ maskable hors zone sûre : diagonale ${(diagonale * 100).toFixed(1)} % du côté, ` +
      `maximum 80 %\n  → baisser MASKABLE_FILL`,
  );
  process.exit(1);
}

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
  console.log("✓ logo.svg, favicon.svg et app-icon.svg à jour");
} else {
  for (const [p, content] of files) writeFileSync(p, content);
  await rasterFavicons(files[1][1]);
  await rasterAppIcons();
  console.log(
    `→ ${files.map(([p]) => p).join(", ")}, public/favicon-16x16.png, ` +
      `public/favicon-32x32.png, public/favicon.ico, ` +
      `${APP_ICONS.map(([p]) => p).join(", ")}`,
  );
}
