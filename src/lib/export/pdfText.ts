/**
 * Ce que la police du PDF sait dessiner, et ce qu'il faut lui traduire.
 *
 * pdfmake embarque Roboto, et Roboto s'arrete au latin etendu : 1 326 glyphes,
 * pas un de plus. Une fleche, une etoile, un exposant modificateur ou un
 * emoji n'y sont pas, et un glyphe absent ne se voit pas comme un manque : il
 * se dessine en carre vide, au milieu de la phrase, dans le document que
 * l'utilisateur imprime ou envoie a son coach.
 *
 * Trois occurrences vivaient dans l'app avant ce lot, dans les trois exports :
 *
 *   - l'etoile du marqueur de seance cle du plan (`★`), donc une a trois
 *     par semaine sur les neuf pages d'un plan de huit semaines ;
 *   - la fleche de la progression de RP-013, "Progression semi > 10K > 5K" ;
 *   - l'exposant ordinal de TRL-018, "a la 20e minute", deux fois.
 *
 * Les corriger une par une dans les donnees aurait abime l'app, ou la fleche
 * et l'exposant se dessinent tres bien, et n'aurait rien promis pour la suite :
 * une seance personnalisee porte le texte que son auteur veut, emoji compris.
 * La traduction se fait donc ici, au seul endroit qui a une police a
 * respecter, juste avant que la definition de document parte chez pdfmake.
 *
 * `pdfText.test.ts` verifie la promesse sur le catalogue reel, en interrogeant
 * la fonte que pdfmake embarque : aucun caractere produit par cette fonction
 * ne doit tomber sur le glyphe .notdef.
 */

/**
 * Ce qui a un equivalent lisible. Le reste est retire plutot que remplace :
 * un emoji decoratif absent vaut mieux qu'un point d'interrogation invente.
 */
const REPLACEMENTS: Record<string, string> = {
  // Fleches. La direction est du sens, elle se garde.
  "←": "<-",
  "↑": "^",
  "→": "->",
  "↓": "v",
  "↔": "<->",
  "⇐": "<=",
  "⇒": "=>",
  "➔": "->",
  "➙": "->",
  "➡": "->",
  // Marqueurs et puces. Roboto connait le point median et la puce ronde.
  "★": "●",
  "☆": "○",
  "▪": "•",
  "▫": "•",
  "‣": "•",
  "⁃": "-",
  "∙": "·",
  "▲": "^",
  "▼": "v",
  "◆": "●",
  // Coches et croix, celles des listes a cocher.
  "✓": "OK",
  "✔": "OK",
  "✗": "X",
  "✘": "X",
  "☐": "[ ]",
  "☑": "[x]",
  "☒": "[x]",
  // Lettres modificatives en exposant. "20e", pas "20".
  "ᵃ": "a",
  "ᵈ": "d",
  "ᵉ": "e",
  "ᵐ": "m",
  "ᵒ": "o",
  "ʳ": "r",
  "ˢ": "s",
  "ᵗ": "t",
  // Divers rencontres dans du texte colle depuis ailleurs.
  "⌀": "diam.",
  "≈": "~",
  "≠": "!=",
  "≤": "<=",
  "≥": ">=",
};

/**
 * Blocs qu'on retire faute de traduction possible : emojis et leurs
 * selecteurs, symboles techniques, fleches restantes, formes geometriques et
 * casseau, lettres modificatives restantes. Roboto n'en couvre aucun.
 */
const UNSUPPORTED_BLOCKS = new RegExp(
  "[" +
    "\\u02b0-\\u02ff" + // lettres modificatives
    "\\u1d2c-\\u1d7f" + // lettres modificatives, supplement
    "\\u2190-\\u21ff" + // fleches
    "\\u2300-\\u23ff" + // divers techniques
    "\\u25a0-\\u27bf" + // formes geometriques, symboles, casseau
    "\\u2b00-\\u2bff" + // fleches et symboles supplementaires
    "\\ufe00-\\ufe0f" + // selecteurs de variante
    "\\u200d" + // liant sans chasse des emojis composes
    "]",
  "gu",
);

/** Emojis proprement dits, hors du plan multilingue de base. */
const EMOJI = /[\u{1f000}-\u{1faff}]/gu;

/**
 * Les rares glyphes du bloc des formes que Roboto connait, et qu'il ne faut
 * donc pas emporter avec le bloc : la puce ronde des listes du plan.
 */
const KEPT_FROM_UNSUPPORTED_BLOCKS = new Set(["○", "●"]);

/**
 * Traduit une chaine vers ce que Roboto sait dessiner. Une chaine purement
 * latine ressort identique, ce qui est le cas de l'immense majorite du
 * catalogue.
 */
export function pdfText(value: string): string {
  let out = "";
  for (const char of value) {
    const replacement = REPLACEMENTS[char];
    out += replacement !== undefined ? replacement : char;
  }

  return out
    .replace(EMOJI, "")
    .replace(UNSUPPORTED_BLOCKS, (char) =>
      KEPT_FROM_UNSUPPORTED_BLOCKS.has(char) ? char : "",
    );
}

/**
 * Applique {@link pdfText} a toutes les chaines d'une definition de document
 * pdfmake, en profondeur.
 *
 * Passer l'arbre entier plutot que d'appeler `pdfText()` a chaque texte est
 * volontaire : un export produit des centaines de noeuds, en oublier un est
 * une question de temps, et les seules autres chaines de l'arbre (noms de
 * style, couleurs hexadecimales, ancres de lien) sont en ASCII, que cette
 * fonction laisse intact.
 *
 * Les fonctions de l'arbre, `header` et `footer`, ne produisent leur contenu
 * qu'au rendu : elles sont enveloppees pour que leur resultat passe par la
 * meme traduction. Le pied de page d'un plan porte le nom du plan, qui vient
 * de l'utilisateur.
 */
export function pdfSafeDocument<T>(node: T): T {
  if (typeof node === "string") return pdfText(node) as T;
  if (typeof node === "function") {
    const fn = node as (...args: unknown[]) => unknown;
    return ((...args: unknown[]) => pdfSafeDocument(fn(...args))) as T;
  }
  if (Array.isArray(node)) return node.map(pdfSafeDocument) as T;
  if (node instanceof Date) return node;
  if (node !== null && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      out[key] = pdfSafeDocument(value);
    }
    return out as T;
  }
  return node;
}
