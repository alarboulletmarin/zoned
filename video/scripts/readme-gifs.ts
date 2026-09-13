/**
 * USAGE:
 *   bun run render Feature-Polarise-Story-EN Feature-Zones-Story-EN Feature-Library-Story-EN
 *   bun run gifs
 *
 * Les trois vignettes « In motion » du README, faites depuis les films.
 *
 * Elles n'avaient pas de générateur. C'est précisément pour ça qu'elles ont
 * pourri : refonte passée, elles montraient encore l'ancien logotype, l'accent
 * orange et les six couleurs de zones, et leurs titres citaient une version de
 * `copy.tsx` qui n'existait plus. Rien ne pouvait le signaler, puisque rien ne
 * savait d'où elles venaient.
 *
 * EN ANGLAIS, comme le README. Les anciennes étaient françaises sous des
 * légendes anglaises.
 *
 * La coupe 9:16, parce que le README les range dans un tableau de trois
 * colonnes et qu'un portrait y tient sans écraser la ligne.
 *
 * Le générique de fin est coupé : les trois vignettes s'achèveraient sur la
 * même carte, côte à côte, dans un tableau qui porte déjà ses propres légendes.
 *
 * LE POIDS EST LA CONTRAINTE. Le fond des films dérive en permanence — c'est
 * voulu, un sol immobile sous du contenu qui bouge se lit comme un diaporama —
 * et un dégradé qui dérive est ce qu'un GIF compresse le plus mal : chaque
 * pixel change à chaque image. D'où 6 images par seconde, 300 px de large,
 * 64 couleurs et AUCUN tramage. Le tramage est le piège : il fait du bruit
 * là où le film est plat, et le bruit ne se compresse pas. La palette du
 * design, papier, encre et un vermillon, tient dans 64 couleurs sans y perdre.
 */

import { execFileSync } from "child_process";
import { existsSync, mkdirSync, statSync } from "fs";
import { join } from "path";

const ROOT = join(import.meta.dirname, "..");
const OUT = join(ROOT, "out");
const ASSETS = join(ROOT, "..", "assets");
const TMP = join(OUT, "palette.png");

/** Film → fichier du README. Les légendes du README suivent cette table. */
const GIFS = [
  { composition: "Feature-Polarise-Story-EN", file: "polarise.gif" },
  { composition: "Feature-Zones-Story-EN", file: "zones.gif" },
  { composition: "Feature-Library-Story-EN", file: "workouts.gif" },
];

const FPS = 6;
const WIDTH = 300;
const COLORS = 64;
/** Secondes gardées : tout le film sauf la carte de fin. */
const DURATION = 11.8;
/** Au-delà, une vignette de README coûte plus qu'elle ne montre. */
const SIZE_BUDGET_BYTES = 2 * 1024 * 1024;

const SCALE = `fps=${FPS},scale=${WIDTH}:-1:flags=lanczos`;

function ffmpeg(args: string[]) {
  execFileSync("ffmpeg", ["-y", "-v", "error", ...args], { stdio: "inherit" });
}

function main() {
  const missing = GIFS.filter((g) => !existsSync(join(OUT, `${g.composition}.mp4`)));
  if (missing.length) {
    console.error("Films manquants :\n  " + missing.map((g) => g.composition).join("\n  "));
    console.error(`\nLes rendre d'abord : bun run render ${missing.map((g) => g.composition).join(" ")}`);
    process.exit(1);
  }

  mkdirSync(OUT, { recursive: true });
  let over = 0;

  for (const { composition, file } of GIFS) {
    const src = join(OUT, `${composition}.mp4`);
    const dest = join(ASSETS, file);

    // Deux passes. Une palette globale donnerait une rampe d'encre étagée en
    // marches visibles sur le fond ; `stats_mode=diff` pèse ce qui BOUGE, donc
    // les 64 couleurs partent aux plans qui en ont besoin.
    ffmpeg(["-t", String(DURATION), "-i", src, "-vf", `${SCALE},palettegen=max_colors=${COLORS}:stats_mode=diff`, TMP]);
    ffmpeg([
      "-t", String(DURATION),
      "-i", src,
      "-i", TMP,
      "-lavfi", `${SCALE}[x];[x][1:v]paletteuse=dither=none:diff_mode=rectangle`,
      "-loop", "0",
      dest,
    ]);

    const bytes = statSync(dest).size;
    const mb = (bytes / 1024 / 1024).toFixed(1);
    if (bytes > SIZE_BUDGET_BYTES) {
      over++;
      console.log(`  ✗ assets/${file} — ${mb} Mo, au-dessus du budget`);
    } else {
      console.log(`  ✓ assets/${file} — ${mb} Mo`);
    }
  }

  if (over) {
    console.error(
      `\n${over} vignette(s) au-dessus de ${SIZE_BUDGET_BYTES / 1024 / 1024} Mo.` +
        " Baisser FPS ou WIDTH plutôt que de laisser passer : le README les affiche à 240 px.",
    );
    process.exit(1);
  }
}

main();
