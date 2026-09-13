/**
 * La promesse de `pdfText` : tout ce qui part chez pdfmake se dessine.
 *
 * Le test ne croit pas sur parole la liste de remplacements du module, il
 * interroge la fonte que pdfmake embarque, Roboto, avec `fontkit`, et refuse
 * tout caractere qui y tombe sur le glyphe .notdef, c'est a dire le carre vide
 * qu'on voyait dans les PDF.
 *
 * Le corpus n'est pas un echantillon choisi : ce sont les chaines reelles de
 * l'app, catalogue de seances, exercices de renfo, plans prets et libelles
 * d'export dans les deux langues. C'est ce qui fait de ce fichier une garde
 * plutot qu'une illustration : une fleche ajoutee demain dans un conseil de
 * seance fait echouer la CI, la ou personne n'ouvre un PDF avant de livrer.
 */

import { describe, expect, test } from "bun:test";
import { readdirSync, readFileSync, statSync } from "fs";
import { join } from "path";

// `fontkit` et le VFS de pdfmake sont deux modules CommonJS sans export par
// defaut sous Bun ; ils se chargent donc par `createRequire`.
import { createRequire } from "module";

const require_ = createRequire(import.meta.url);
const fontkit = require_("fontkit") as { create(buffer: Buffer): unknown };
const vfs = require_("pdfmake/build/vfs_fonts") as Record<string, string>;

import { pdfSafeDocument, pdfText } from "./pdfText";

// ── La fonte, telle que pdfmake la sert ─────────────────────────────

const FACES = [
  "Roboto-Regular.ttf",
  "Roboto-Medium.ttf",
  "Roboto-Italic.ttf",
  "Roboto-MediumItalic.ttf",
] as const;

type Font = { glyphsForString(text: string): { id: number }[] };

const fonts: Font[] = FACES.map((face) => {
  const base64 = vfs[face];
  if (!base64) throw new Error(`pdfmake no longer ships ${face}`);
  return fontkit.create(Buffer.from(base64, "base64")) as unknown as Font;
});

/** Les caracteres de `text` qu'au moins une des quatre fontes ne sait pas dessiner. */
function undrawable(text: string): string[] {
  const missing = new Set<string>();
  for (const char of text) {
    if (char === "\n" || char === "\t" || char === "\r") continue;
    for (const font of fonts) {
      const glyph = font.glyphsForString(char)[0];
      if (!glyph || glyph.id === 0) {
        missing.add(`${char} U+${char.codePointAt(0)?.toString(16).toUpperCase()}`);
        break;
      }
    }
  }
  return [...missing];
}

// ── Le corpus : ce que l'app imprime vraiment ───────────────────────

function jsonFilesIn(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) jsonFilesIn(full, out);
    else if (entry.endsWith(".json")) out.push(full);
  }
  return out;
}

function stringsOf(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) for (const item of value) stringsOf(item, out);
  else if (value && typeof value === "object") {
    for (const item of Object.values(value)) stringsOf(item, out);
  }
  return out;
}

const ROOT = join(import.meta.dirname, "..", "..");

/** Les sources qui alimentent les trois exports PDF. */
const CORPUS_DIRS = [
  join(ROOT, "data", "workouts"),
  join(ROOT, "data", "strength"),
  join(ROOT, "data", "prebuilt-plans"),
  join(ROOT, "i18n", "locales"),
];

const corpus: string[] = CORPUS_DIRS.flatMap((dir) =>
  jsonFilesIn(dir).flatMap((file) => stringsOf(JSON.parse(readFileSync(file, "utf8")))),
);

// ── Tests ───────────────────────────────────────────────────────────

describe("pdfText: ce qui sort se dessine", () => {
  test("le corpus de l'app passe entierement dans Roboto une fois traduit", () => {
    expect(corpus.length).toBeGreaterThan(1000);

    const offenders: string[] = [];
    for (const text of corpus) {
      const missing = undrawable(pdfText(text));
      if (missing.length > 0) offenders.push(`${missing.join(", ")} dans ${text.slice(0, 80)}`);
    }

    expect(offenders).toEqual([]);
  });

  test("le corpus brut, lui, ne passe pas : sans traduction il reste des carres vides", () => {
    // Sans cette contre-epreuve, le test precedent resterait vert le jour ou
    // `pdfText` deviendrait l'identite.
    const raw = corpus.filter((text) => undrawable(text).length > 0);
    expect(raw.length).toBeGreaterThan(0);
  });

  test("les trois caracteres qui abimaient les PDF ont un equivalent lisible", () => {
    // L'etoile du marqueur de seance cle du plan.
    expect(pdfText("★ Tempo court")).toBe("● Tempo court");
    // La fleche des conseils de RP-013.
    expect(pdfText("Progression semi → 10K → 5K")).toBe("Progression semi -> 10K -> 5K");
    // L'exposant ordinal de TRL-018.
    expect(pdfText("a la 20ᵉ minute")).toBe("a la 20e minute");
  });

  test("le texte latin ressort intact, accents compris", () => {
    const text = "Récupération : 3 x 1 km à 4:30/km, 90 % FCM, pause 2'30\"";
    expect(pdfText(text)).toBe(text);
  });

  test("un emoji est retire plutot que dessine en carre", () => {
    expect(pdfText("Séance du dimanche 🏃‍♀️")).toBe("Séance du dimanche ");
  });
});

describe("pdfSafeDocument: l'arbre entier, fonctions comprises", () => {
  test("traduit les chaines en profondeur et laisse le reste tel quel", () => {
    const doc = {
      content: [{ text: ["★ ", { text: "Sortie longue" }] }, { text: "20ᵉ km" }],
      styles: { header: { fontSize: 12, bold: true, color: "#854d0e" } },
    };

    expect(pdfSafeDocument(doc)).toEqual({
      content: [{ text: ["● ", { text: "Sortie longue" }] }, { text: "20e km" }],
      styles: { header: { fontSize: 12, bold: true, color: "#854d0e" } },
    });
  });

  test("le pied de page, qui n'existe qu'au rendu, passe aussi par la traduction", () => {
    const doc = { footer: (page: number) => ({ text: `★ Plan, page ${page}` }) };
    const safe = pdfSafeDocument(doc);

    expect(safe.footer(3)).toEqual({ text: "● Plan, page 3" });
  });
});
