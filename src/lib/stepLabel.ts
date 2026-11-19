/**
 * Le libellé d'une étape, sans la durée qu'il répète.
 *
 * Beaucoup de blocs du catalogue commencent par leur durée : `5min allure
 * course`, `1min footing`, `30s rapide`, `15' en sweet-spot`. La page de
 * séance écrit déjà la durée dans sa colonne de droite, et la lire deux fois
 * sur la même ligne (`5min allure course · 5 min`) ne dit rien de plus.
 *
 * On retire la durée À L'AFFICHAGE, jamais dans le catalogue, et seulement
 * quand elle est sûre :
 *
 * - elle est EN TÊTE du libellé, suivie d'une espace, d'une ponctuation ou
 *   de la fin ;
 * - elle vaut EXACTEMENT la durée du bloc. `5min walk then slow jog` sur un
 *   bloc de 10 minutes garde son texte : la durée y dit autre chose ;
 * - ce qui reste n'est pas vide. Un bloc nommé `60s` reste `60s`.
 *
 * Une distance (`400m`, `2km`) n'est pas une durée et reste. Une répétition
 * (`3x30s rapide`) ne commence pas par une durée et reste.
 */

const LEADING_DURATION =
  /^\s*(\d+(?:[.,]\d+)?)\s*(h|min|mn|sec|s|'|")(?:\s*(\d{1,2})(?:\s*(?:s|sec|"))?)?(?=[\s,:;.·-]|$)/i;

/** Les mots de liaison qu'une durée retirée laisse en tête. */
const LEADING_LINK = /^(?:de\s+|d'|d’|of\s+)/i;

/** La durée en tête d'un libellé, en secondes, et sa longueur, ou `null`. */
export function parseLeadingDuration(label: string): { seconds: number; length: number } | null {
  const match = LEADING_DURATION.exec(label);
  if (!match) return null;
  const value = Number(match[1].replace(",", "."));
  const unit = match[2].toLowerCase();
  const tail = match[3] != null ? Number(match[3]) : 0;
  let seconds: number;
  if (unit === "h") seconds = value * 3600 + tail * 60;
  else if (unit === "min" || unit === "mn" || unit === "'") seconds = value * 60 + tail;
  else {
    // Des secondes n'ont pas de reste : `30s 2` n'est pas une durée.
    if (match[3] != null) return null;
    seconds = value;
  }
  return { seconds: Math.round(seconds), length: match[0].length };
}

/**
 * Le libellé sans la durée en tête, quand elle vaut `durationSec` à la
 * seconde près. Sinon, le libellé tel quel.
 */
export function stripLeadingDuration(label: string, durationSec: number | null | undefined): string {
  if (durationSec == null || !Number.isFinite(durationSec)) return label;
  const parsed = parseLeadingDuration(label);
  if (!parsed || Math.abs(parsed.seconds - durationSec) > 1) return label;

  const rest = label
    .slice(parsed.length)
    .replace(/^[\s,:;.·-]+/, "")
    .replace(LEADING_LINK, "")
    .trim();
  if (!rest) return label;
  return rest.charAt(0).toLocaleUpperCase("fr") + rest.slice(1);
}
