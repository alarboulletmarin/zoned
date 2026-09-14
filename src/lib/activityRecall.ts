import type {
  ActivityDiscipline,
  ActivityPurpose,
  ComplementaryActivity,
} from "@/types/activity";

/**
 * Ce que l'on a déjà fait, proposé plutôt que redemandé.
 *
 * Le vélotaf est le cas d'usage central de cet écran, et c'est un geste qui se
 * RÉPÈTE : le même trajet, le même temps, quatre fois par semaine. Le
 * formulaire le redemandait entièrement à chaque fois, alors que la réponse
 * était déjà dans le journal, trois lignes plus haut.
 *
 * D'où une rangée de rappels : trois durées déjà enregistrées, dans le même
 * sport et le même motif, qu'un appui repose telles quelles. C'est de la
 * RECONNAISSANCE au lieu du rappel de mémoire, et c'est la différence entre
 * lire trois mots et retrouver un chiffre.
 *
 * ── Ce que ce fichier refuse de faire ────────────────────────────────────
 *
 * Il ne PRÉ-REMPLIT rien. Un rappel s'affiche, il ne se pose pas tout seul
 * dans le champ, et la distinction n'est pas cosmétique : une activité est un
 * relevé, et un relevé rempli par la machine qu'on enregistre sans regarder
 * est un chiffre inventé qui compte ensuite dans la charge. Le motif récurrent
 * du profil (`CommutePattern`), lui, pré-remplit, parce que c'est une valeur
 * que l'utilisateur a explicitement déclarée.
 *
 * Il ne devine pas non plus entre disciplines ni entre motifs : une sortie
 * longue de vélo n'a rien à dire sur la durée d'un trajet à la gare. Un
 * rappel ne se montre que s'il vient d'une activité de MÊME sport et de MÊME
 * motif, sinon il ne se montre pas.
 */

/**
 * Un rappel : la durée qu'il repose, et les précisions qui venaient avec.
 *
 * Les précisions voyagent AVEC la durée parce qu'elles décrivent le même
 * trajet : reposer 1 h 25 sans les 26,6 km qui allaient avec laisserait le
 * kilométrage à saisir à la main pour la seule raison qu'il est dans un
 * repli. L'écran qui les pose les montre, voir `ActivityLogPanel`.
 */
export interface ActivityRecall {
  /** La clé de rendu, et la valeur qui distingue deux rappels. */
  durationMin: number;
  distanceKm?: number;
  elevationGainM?: number;
  avgWatts?: number;
  rpe?: number;
  /** Combien de fois cette durée revient dans le journal filtré. */
  count: number;
}

/** Combien de rappels au plus. Trois tiennent sur une ligne de téléphone. */
export const RECALL_LIMIT = 3;

/**
 * Sur combien d'activités passées on regarde.
 *
 * Le journal peut porter mille entrées et les habitudes changent : un trajet
 * fait deux cents fois l'an dernier et jamais depuis n'est plus une
 * proposition, c'est un souvenir. La fenêtre est comptée en ACTIVITÉS et non
 * en jours, parce que quelqu'un qui note trois fois par an doit garder ses
 * rappels, et que le journal est déjà trié du plus récent au plus ancien.
 */
export const RECALL_WINDOW = 40;

/**
 * Les durées à proposer, de la plus fréquente à la moins fréquente.
 *
 * Le classement est la FRÉQUENCE d'abord, la date ensuite. Le plus récent
 * seul aurait mis en tête la sortie exceptionnelle de dimanche et relégué le
 * trajet fait tous les matins ; la fréquence met devant ce qui a le plus de
 * chances d'être ce qu'on s'apprête à saisir, et la date départage les
 * ex aequo pour que la liste ne change pas d'ordre entre deux ouvertures.
 *
 * `activities` est attendu trié du plus récent au plus ancien, ce que rend
 * `getAllActivities`.
 */
export function recallDurations(
  activities: readonly ComplementaryActivity[],
  discipline: ActivityDiscipline,
  purpose: ActivityPurpose,
  limit: number = RECALL_LIMIT,
): ActivityRecall[] {
  if (limit <= 0) return [];

  const byDuration = new Map<number, ActivityRecall & { rank: number }>();
  let seen = 0;

  for (const activity of activities) {
    if (activity.discipline !== discipline || activity.purpose !== purpose) continue;
    if (seen >= RECALL_WINDOW) break;
    seen += 1;

    const existing = byDuration.get(activity.durationMin);
    if (existing) {
      existing.count += 1;
      continue;
    }
    /* La PREMIÈRE rencontrée est la plus récente, et c'est elle qui donne les
       précisions : le trajet a pu changer de route, et le dernier relevé est
       celui qui décrit le trajet d'aujourd'hui. */
    byDuration.set(activity.durationMin, {
      durationMin: activity.durationMin,
      distanceKm: activity.distanceKm,
      elevationGainM: activity.elevationGainM,
      avgWatts: activity.avgWatts,
      rpe: activity.rpe,
      count: 1,
      rank: byDuration.size,
    });
  }

  return Array.from(byDuration.values())
    .sort((a, b) => (b.count !== a.count ? b.count - a.count : a.rank - b.rank))
    .slice(0, limit)
    .map(({ rank: _rank, ...recall }) => recall);
}
