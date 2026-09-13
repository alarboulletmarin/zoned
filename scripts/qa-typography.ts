/**
 * Garde-fou typographique.
 *
 * Regle de la maison, posee le 13 septembre 2026 : ni chevrons francais, ni
 * cadratin, ni demi-cadratin. Nulle part : texte visible, donnees
 * editoriales, commentaires de code et tests compris.
 *
 * Pourquoi un script plutot qu'une relecture : les 2 256 occurrences retirees
 * ce jour-la etaient a 70 % dans des commentaires. Ce depot ecrit sa
 * documentation en prose francaise, et la prose francaise appelle le cadratin
 * toute seule. Sans garde, ils reviennent au premier commit.
 *
 * Ce qui remplace quoi, quand on en ecrit un par reflexe :
 *
 *   chevrons autour d'un libelle  ->  le libelle nu, il se suffit
 *   cadratin d'incise             ->  une virgule, elle fait le meme travail
 *   cadratin entre deux libelles  ->  un point median, le separateur maison
 *   demi-cadratin d'une plage     ->  un trait d'union
 *   une chaine qui n'est qu'un cadratin  ->  un trait d'union (pas de valeur)
 *
 * Le trait d'union, le point median, le signe moins et les guillemets droits
 * ne sont PAS vises.
 *
 * Ce fichier s'analyse lui-meme : il est donc ecrit sans accent sur les
 * caracteres qu'il interdit, et ne les nomme qu'en echappement unicode.
 */

import { readdirSync, readFileSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = join(import.meta.dirname, "..");
const ROOTS = ["src", "scripts"];
const EXT = [".ts", ".tsx", ".json", ".css", ".mjs", ".cjs"];

const BANNED: Record<string, string> = {
  "\u00ab": "chevron ouvrant",
  "\u00bb": "chevron fermant",
  "\u2014": "cadratin",
  "\u2013": "demi-cadratin",
};

/**
 * La seule exception, et elle est fonctionnelle, pas typographique : une
 * classe de caracteres qui ANALYSE un tiret dans de la donnee utilisateur.
 * Une seance personnalisee enregistree avant ce lot peut en contenir un ;
 * retirer le caractere de la regex casserait sa lecture.
 */
const ALLOWED = [
  {
    file: "src/components/visualization/MiniElevationProfile.tsx",
    snippet: "[-\u2013]",
  },
];

const SELF = "scripts/qa-typography.ts";

/** Les memes caracteres, ecrits autrement. Rendus, ils sont identiques. */
const ESCAPED: Record<string, string> = {
  "\\u2014": "cadratin echappe",
  "\\u2013": "demi-cadratin echappe",
  "\\u00ab": "chevron ouvrant echappe",
  "\\u00bb": "chevron fermant echappe",
  "&mdash;": "cadratin en entite HTML",
  "&ndash;": "demi-cadratin en entite HTML",
  "&laquo;": "chevron ouvrant en entite HTML",
  "&raquo;": "chevron fermant en entite HTML",
};

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (EXT.some((e) => entry.endsWith(e))) out.push(full);
  }
  return out;
}

let violations = 0;

for (const root of ROOTS) {
  for (const file of walk(join(ROOT, root))) {
    const rel = relative(ROOT, file);
    const lines = readFileSync(file, "utf8").split("\n");

    lines.forEach((line, i) => {
      for (const [char, label] of Object.entries(BANNED)) {
        if (!line.includes(char)) continue;
        if (ALLOWED.some((a) => rel === a.file && line.includes(a.snippet))) continue;
        violations++;
        console.error(`${rel}:${i + 1}  ${label}`);
        console.error(`    ${line.trim().slice(0, 110)}`);
      }

      /* Les formes ECHAPPEES comptent autant que les litterales : un
         `\\u2014` dans une chaine et un `&mdash;` dans du JSX rendent le meme
         caractere a l'ecran. Onze occurrences avaient survecu au premier
         passage exactement par la, invisibles a une recherche litterale, et
         elles sortaient dans l'export PDF et dans les libelles de semaine.
         Ce fichier est exclu : il doit nommer ce qu'il interdit. */
      if (rel === SELF) return;
      for (const [pattern, label] of Object.entries(ESCAPED)) {
        if (!line.includes(pattern)) continue;
        violations++;
        console.error(`${rel}:${i + 1}  ${label}`);
        console.error(`    ${line.trim().slice(0, 110)}`);
      }
    });
  }
}

if (violations > 0) {
  console.error(`\n${violations} occurrence(s). Voir l'en-tete de ce fichier pour les remplacements.`);
  process.exit(1);
}

console.log("Typographie : ni chevrons, ni cadratin, ni demi-cadratin.");
