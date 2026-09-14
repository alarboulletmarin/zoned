/**
 * Une durée saisie dans UN champ, au masque `h:mm`.
 *
 * Le champ unique en minutes demandait une conversion mentale avant la
 * première frappe : personne ne pense son vélotaf en 85 minutes, on pense
 * 1 h 25. Deux champs, heures et minutes, supprimaient la conversion mais
 * posaient deux cases à remplir et un saut de l'une à l'autre là où il y a
 * une seule question. Un champ, un masque.
 *
 * ── Les chiffres entrent par la DROITE ───────────────────────────────────
 *
 * C'est la règle qui tient tout le reste, et c'est celle du chronomètre : les
 * deux derniers chiffres tapés sont TOUJOURS les minutes, ceux d'avant les
 * heures. On tape 45 et on lit 0:45 ; on tape 125 et on lit 1:25 ; on tape
 * 1245 et on lit 12:45.
 *
 * L'autre sens, remplir les heures puis les minutes, aurait rendu la saisie
 * courte ambiguë et coûteuse à la fois : 45 voudrait dire 45 h autant que
 * 45 min, et un trajet d'une demi-heure se serait tapé 0030. Le cas le plus
 * fréquent de l'écran est une durée de moins d'une heure ; c'est lui qui doit
 * coûter deux frappes, pas quatre.
 *
 * ── Trois règles de plus ─────────────────────────────────────────────────
 *
 * 1. **Le stockage ne change pas.** `ComplementaryActivity.durationMin` reste
 *    des minutes, une seule unité en mémoire. Le masque est une forme de
 *    SAISIE, la conversion vit ici, à la frontière, et nulle part ailleurs.
 * 2. **Rien n'est refusé.** 0:90 est une durée valide, pas une faute : elle
 *    vaut 1 h 30 et se range toute seule quand le champ est quitté. Refuser
 *    90 pour exiger 130 serait apprendre à l'utilisateur une règle que la
 *    machine sait appliquer.
 * 3. **Le rangement est visible.** La normalisation réécrit le champ à
 *    l'écran, elle ne corrige pas en douce une valeur qu'on ne verra
 *    qu'après l'enregistrement.
 */

/** La borne haute d'une durée saisissable : une activité tient dans sa date. */
export const DURATION_MAX_MIN = 24 * 60;

/**
 * Au plus quatre chiffres, `hh:mm`. Le cinquième est ignoré plutôt que de
 * chasser le premier : 24 h est le plafond, donc une frappe de plus est une
 * frappe de trop, et faire glisser la valeur ferait disparaître un chiffre
 * déjà saisi sans le dire.
 */
export const DURATION_MAX_DIGITS = 4;

/**
 * Les zéros de tête retirés. C'est la forme CANONIQUE de l'état.
 *
 * Sans elle, le champ ne se vide jamais : le masque affiche 0:01, l'effacement
 * rend 0:0, donc les chiffres `00`, que le masque réaffiche 0:00, que
 * l'effacement rend 0:0... et ainsi de suite. Un zéro de tête ne porte aucune
 * information ici, puisque les minutes sont toujours les deux derniers
 * chiffres : le retirer rend l'effacement fini.
 */
function trimLeadingZeros(digits: string): string {
  return digits.replace(/^0+/, "");
}

/**
 * Les chiffres d'une frappe, le masque retiré.
 *
 * Prend la valeur BRUTE du champ, deux-points compris : le champ affiche
 * `1:25`, taper un 5 à la fin donne `1:255`, donc `1255`, donc 12:55. Le
 * masque n'a jamais besoin d'être retiré à la main par l'appelant.
 */
export function durationDigits(raw: string): string {
  return trimLeadingZeros(raw.replace(/\D/g, "")).slice(0, DURATION_MAX_DIGITS);
}

/**
 * Les chiffres, mis au masque. Chaîne vide en entrée, chaîne vide en sortie :
 * un champ vide montre son indice, pas un 0:00 qui aurait l'air saisi.
 */
export function formatDurationDigits(digits: string): string {
  if (digits === "") return "";
  // Trois chiffres au minimum, pour que les deux derniers soient les minutes
  // et qu'il reste toujours une heure à afficher, fût-elle zéro.
  const padded = digits.padStart(3, "0");
  const minutes = padded.slice(-2);
  const hours = Number.parseInt(padded.slice(0, -2), 10);
  return `${hours}:${minutes}`;
}

/**
 * Le total en minutes, ou `undefined` si rien n'est saisi.
 *
 * Tolérant par construction : les minutes ne sont pas plafonnées à 59, donc
 * 0:90 vaut 90 et personne n'a eu à le dire.
 */
export function durationToMinutes(digits: string): number | undefined {
  if (digits === "") return undefined;
  const padded = digits.padStart(3, "0");
  const minutes = Number.parseInt(padded.slice(-2), 10);
  const hours = Number.parseInt(padded.slice(0, -2), 10);
  if (!Number.isFinite(minutes) || !Number.isFinite(hours)) return undefined;
  return hours * 60 + minutes;
}

/** Des minutes stockées, remises dans le champ. `0` donne un champ vide. */
export function minutesToDurationDigits(totalMin: number): string {
  if (!Number.isFinite(totalMin) || totalMin <= 0) return "";
  const total = Math.min(Math.round(totalMin), DURATION_MAX_MIN);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return trimLeadingZeros(`${hours}${String(minutes).padStart(2, "0")}`);
}

/**
 * Le champ rangé : les minutes qui débordent passent dans les heures, et le
 * total est plafonné à une journée.
 *
 * Appelé quand le champ est QUITTÉ, pas à chaque frappe : ranger pendant la
 * saisie transformerait le 9 de 90 en 0:09 avant que le second chiffre
 * n'arrive, ce qui est la façon la plus sûre de rendre un champ inutilisable.
 */
export function normalizeDurationDigits(digits: string): string {
  const total = durationToMinutes(digits);
  if (total === undefined || total <= 0) return "";
  return minutesToDurationDigits(total);
}
