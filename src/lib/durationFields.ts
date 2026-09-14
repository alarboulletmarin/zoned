/**
 * Une durée saisie en DEUX champs, des heures et des minutes.
 *
 * Le champ unique en minutes demandait une conversion mentale avant la
 * première frappe : personne ne pense son vélotaf en minutes, on pense 1 h 25
 * et on tape 85. La conversion est petite, elle est faite dix fois par
 * semaine, et elle se rate. Deux champs la suppriment, au prix de ce fichier.
 *
 * Trois règles tiennent tout ce qui suit :
 *
 * 1. **Le stockage ne change pas.** `ComplementaryActivity.durationMin` reste
 *    des minutes, une seule unité en mémoire. Les deux champs sont une forme
 *    de SAISIE, la conversion vit ici, à la frontière, et nulle part ailleurs.
 * 2. **Rien n'est refusé.** 90 dans le champ des minutes est une durée valide,
 *    pas une faute : elle vaut 1 h 30 et elle se range toute seule au moment
 *    où le champ est quitté. Refuser 90 pour exiger 1 et 30 serait apprendre à
 *    l'utilisateur une règle que la machine sait appliquer.
 * 3. **Le rangement est visible.** La normalisation réécrit les deux champs à
 *    l'écran, elle ne corrige pas en douce une valeur qu'on ne verra qu'après
 *    l'enregistrement.
 */

/** La borne haute d'une durée saisissable : une activité tient dans sa date. */
export const DURATION_MAX_MIN = 24 * 60;

/** Les deux champs, tels qu'ils sont affichés. Vides, ils valent "". */
export interface DurationFields {
  hours: string;
  minutes: string;
}

export const EMPTY_DURATION: DurationFields = { hours: "", minutes: "" };

/** Les chiffres d'une frappe, au plus `max` d'entre eux. Le reste est jeté. */
export function digitsOnly(raw: string, max: number): string {
  return raw.replace(/\D/g, "").slice(0, max);
}

/**
 * Le total en minutes, ou `undefined` si les deux champs sont vides.
 *
 * Tolérant par construction : les deux champs sont simplement additionnés,
 * donc 2 h et 90 min font 3 h 30 sans que personne ait eu à le dire. Un champ
 * vide vaut zéro, jamais `undefined` : taper seulement 45 dans les minutes
 * doit donner 45 min, et taper seulement 1 dans les heures doit donner 1 h.
 */
export function combineDuration({ hours, minutes }: DurationFields): number | undefined {
  const h = hours.trim();
  const m = minutes.trim();
  if (h === "" && m === "") return undefined;
  const hoursValue = h === "" ? 0 : Number.parseInt(h, 10);
  const minutesValue = m === "" ? 0 : Number.parseInt(m, 10);
  if (!Number.isFinite(hoursValue) || !Number.isFinite(minutesValue)) return undefined;
  return hoursValue * 60 + minutesValue;
}

/** Des minutes stockées, remises dans les deux champs. `0` donne des champs vides. */
export function splitDuration(totalMin: number): DurationFields {
  if (!Number.isFinite(totalMin) || totalMin <= 0) return EMPTY_DURATION;
  const total = Math.round(totalMin);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return {
    hours: hours > 0 ? String(hours) : "",
    minutes: minutes > 0 ? String(minutes) : "",
  };
}

/**
 * Les deux champs rangés : les minutes au-delà de 60 passent dans les heures,
 * et le total est plafonné à une journée.
 *
 * Appelé quand le champ des minutes est QUITTÉ, pas à chaque frappe : ranger
 * pendant la saisie réécrirait 9 en 0 h 09 avant que le second chiffre de 90
 * n'ait été tapé, ce qui est la façon la plus sûre de rendre un champ
 * inutilisable.
 */
export function normalizeDuration(fields: DurationFields): DurationFields {
  const total = combineDuration(fields);
  if (total === undefined) return EMPTY_DURATION;
  if (total <= 0) return EMPTY_DURATION;
  return splitDuration(Math.min(total, DURATION_MAX_MIN));
}

/**
 * Faut-il passer au champ des minutes après cette frappe dans les heures ?
 *
 * Oui quand le champ ne peut plus grandir : deux chiffres sont posés, ou le
 * premier chiffre est un 3 ou plus, auquel cas un second chiffre donnerait au
 * moins 30 h et une activité tient dans sa date. Un 1 ou un 2 attendent, eux :
 * ils peuvent encore devenir 12 ou 24.
 *
 * Ce saut fait gagner une frappe sur le geste le plus fréquent de l'écran. Il
 * ne verrouille rien, la tabulation arrière revient aux heures.
 */
export function shouldAdvanceFromHours(hours: string): boolean {
  if (hours.length >= 2) return true;
  if (hours.length === 0) return false;
  return Number.parseInt(hours, 10) >= 3;
}
