import {
  ACTIVITY_DISCIPLINES,
  defaultRpe,
  isTravel,
  type ActivityDiscipline,
  type ComplementaryActivity,
} from "@/types/activity";

/**
 * Ce que les activités complémentaires pèsent, et dans quelle unité.
 *
 * Une règle porte tout ce fichier : **on n'additionne que ce qui s'additionne.**
 *
 * - Le TEMPS s'additionne entre disciplines. Une heure de vélo et une heure de
 *   course font deux heures d'entraînement, dans n'importe quel sport.
 * - Les KILOMÈTRES ne s'additionnent pas. 30 km de vélo et 10 km de course ne
 *   font pas 40 km, et le chiffre de 40 serait exactement le genre de total
 *   qui se retient et se répète. La distance est donc rendue PAR DISCIPLINE,
 *   et il n'existe aucune fonction qui en fasse un total.
 * - Le DÉNIVELÉ s'additionne : un mètre monté est un mètre monté, à pied comme
 *   à vélo.
 *
 * ── La charge ────────────────────────────────────────────────────────────
 *
 * Elle se calcule en **durée fois effort perçu** (session-RPE, Foster 2001),
 * qui est la méthode que le dépôt utilise déjà pour ses séances, et qui a le
 * mérite de valoir pour tous les sports sans coefficient de conversion entre
 * eux. Une conversion vélo-vers-course par la distance aurait demandé un
 * facteur inventé ; celle-ci ne demande rien de plus que les deux champs
 * qu'on a.
 *
 * L'unité est arbitraire (unités de charge, AU) et elle n'est comparable
 * qu'à elle-même, d'une semaine à l'autre. C'est ce qu'on lui demande : dire
 * si cette semaine a pesé plus lourd que la précédente.
 *
 * Les WATTS ne comptent pas dans la charge. Ils sont une mesure d'intensité
 * qui n'existe qu'à vélo et seulement chez qui a un capteur : les faire entrer
 * dans la charge donnerait deux charges incomparables selon l'équipement. Ils
 * sont rendus à part, moyennés au prorata du temps.
 */

/** La charge d'une activité, en unités de charge (durée fois RPE). */
export function activityLoad(activity: ComplementaryActivity): number {
  return Math.round(activity.durationMin * (activity.rpe ?? defaultRpe(activity.purpose)));
}

export interface DisciplineVolume {
  discipline: ActivityDiscipline;
  count: number;
  minutes: number;
  /** Kilomètres. `0` quand aucune activité de la discipline n'en portait. */
  distanceKm: number;
  elevationGainM: number;
  load: number;
  /** Watts moyens, pondérés par le temps, ou `null` si personne n'en a saisi. */
  avgWatts: number | null;
}

export interface ActivitySummary {
  count: number;
  minutes: number;
  load: number;
  /** Le dénivelé total, toutes disciplines. Un mètre monté est un mètre monté. */
  elevationGainM: number;
  /** Le détail, dans l'ordre de `ACTIVITY_DISCIPLINES`, disciplines vides exclues. */
  byDiscipline: DisciplineVolume[];
  /** Minutes de déplacement (vélotaf et autres trajets). */
  travelMinutes: number;
  /** Minutes d'entraînement hors plan. */
  trainingMinutes: number;
}

export const EMPTY_ACTIVITY_SUMMARY: ActivitySummary = {
  count: 0,
  minutes: 0,
  load: 0,
  elevationGainM: 0,
  byDiscipline: [],
  travelMinutes: 0,
  trainingMinutes: 0,
};

/**
 * Le relevé d'un lot d'activités.
 *
 * Les disciplines VIDES sont retirées : une ligne natation 0 min sur l'écran
 * de quelqu'un qui ne nage pas est du bruit, et surtout elle laisse croire
 * qu'il manque quelque chose. Ce qui n'a pas eu lieu ne se dit pas.
 */
export function summarizeActivities(
  activities: readonly ComplementaryActivity[],
): ActivitySummary {
  if (activities.length === 0) return EMPTY_ACTIVITY_SUMMARY;

  const buckets = new Map<
    ActivityDiscipline,
    DisciplineVolume & { wattMinutes: number; wattedMinutes: number }
  >();

  let minutes = 0;
  let load = 0;
  let elevationGainM = 0;
  let travelMinutes = 0;
  let trainingMinutes = 0;

  for (const activity of activities) {
    const bucket = buckets.get(activity.discipline) ?? {
      discipline: activity.discipline,
      count: 0,
      minutes: 0,
      distanceKm: 0,
      elevationGainM: 0,
      load: 0,
      avgWatts: null,
      wattMinutes: 0,
      wattedMinutes: 0,
    };

    const activityMinutes = activity.durationMin;
    const thisLoad = activityLoad(activity);

    bucket.count += 1;
    bucket.minutes += activityMinutes;
    bucket.distanceKm += activity.distanceKm ?? 0;
    bucket.elevationGainM += activity.elevationGainM ?? 0;
    bucket.load += thisLoad;
    if (activity.avgWatts !== undefined) {
      // Pondérés par le TEMPS : une moyenne de moyennes donnerait autant de
      // poids à un trajet de dix minutes qu'à une sortie de trois heures.
      bucket.wattMinutes += activity.avgWatts * activityMinutes;
      bucket.wattedMinutes += activityMinutes;
    }
    buckets.set(activity.discipline, bucket);

    minutes += activityMinutes;
    load += thisLoad;
    elevationGainM += activity.elevationGainM ?? 0;
    if (isTravel(activity.purpose)) travelMinutes += activityMinutes;
    else trainingMinutes += activityMinutes;
  }

  const byDiscipline: DisciplineVolume[] = [];
  for (const discipline of ACTIVITY_DISCIPLINES) {
    const bucket = buckets.get(discipline);
    if (!bucket || bucket.count === 0) continue;
    const { wattMinutes, wattedMinutes, ...volume } = bucket;
    byDiscipline.push({
      ...volume,
      distanceKm: Math.round(volume.distanceKm * 10) / 10,
      avgWatts: wattedMinutes > 0 ? Math.round(wattMinutes / wattedMinutes) : null,
    });
  }

  return {
    count: activities.length,
    minutes,
    load,
    elevationGainM,
    byDiscipline,
    travelMinutes,
    trainingMinutes,
  };
}

/**
 * La part que les activités prennent dans le temps total de la période.
 *
 * C'est LE chiffre qui manquait au plan : quatre trajets de 25 min font
 * 1 h 40, soit un quart d'une semaine à 5 h. Tant qu'il n'était nulle part,
 * la semaine s'annonçait à 5 h et se vivait à 6 h 40.
 *
 * Rend une part entre 0 et 1. `0` quand rien n'a eu lieu, des deux côtés :
 * une part de 100 % sur zéro minute de plan serait vraie et illisible.
 */
export function complementaryShare(
  plannedMinutes: number,
  activityMinutes: number,
): number {
  const total = plannedMinutes + activityMinutes;
  if (total <= 0) return 0;
  return activityMinutes / total;
}
