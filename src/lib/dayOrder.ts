/**
 * L'ordre des séances à l'intérieur d'une journée.
 *
 * La semaine est un tableau de séances trié par jour ; à jour égal, l'ordre
 * du tableau EST l'ordre de la journée, celui que le tableau imprime de haut
 * en bas. Ce module ne lit que `dayOfWeek` et n'écrit rien : il répond aux deux
 * questions que le geste pose avant d'écrire (`moveSession`, planStorage.ts) :
 * qu'est-ce que monter d'un cran, et est-ce que ça change quelque chose.
 *
 * Un repère `before` est, comme dans `moveSession`, l'indice de la séance
 * devant laquelle on se place, `undefined` pour la fin de la journée.
 */

interface Placed {
  dayOfWeek: number;
}

/** Les indices des séances d'un jour, dans l'ordre de la journée. */
function indicesOfDay(sessions: readonly Placed[], day: number): number[] {
  const out: number[] = [];
  sessions.forEach((s, i) => {
    if (s.dayOfWeek === day) out.push(i);
  });
  return out;
}

/**
 * Le repère qui fait monter ou descendre une séance d'un cran dans sa
 * journée, ou `null` quand elle est déjà en tête (monter) ou en queue
 * (descendre). Descendre d'un cran, c'est se placer devant la séance
 * d'après la suivante, ou clore la journée s'il n'y en a pas.
 */
export function dayStep(
  sessions: readonly Placed[],
  index: number,
  direction: "up" | "down",
): { before: number | undefined } | null {
  const session = sessions[index];
  if (!session) return null;
  const day = indicesOfDay(sessions, session.dayOfWeek);
  const at = day.indexOf(index);
  if (direction === "up") return at > 0 ? { before: day[at - 1] } : null;
  return at < day.length - 1 ? { before: day[at + 2] } : null;
}

/**
 * Déposer la séance `index` sur `day`, devant `before`, la laisse-t-elle où
 * elle est ? Un geste qui ne change rien ne doit ni écrire ni faire clignoter
 * la semaine : c'est ce que fait lâcher une séance à peine bougée.
 */
export function staysInPlace(
  sessions: readonly Placed[],
  index: number,
  day: number,
  before: number | undefined,
): boolean {
  const session = sessions[index];
  if (!session || session.dayOfWeek !== day) return false;
  if (before === index) return true;
  const own = indicesOfDay(sessions, day);
  const next = own[own.indexOf(index) + 1];
  return before === next;
}
