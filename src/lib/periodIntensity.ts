import type { PlanSession } from "@/types/plan";
import type { AnyWorkoutTemplate } from "@/types";
import { getDominantZone, isStrengthWorkout } from "@/types";
import { defaultRpe, type ComplementaryActivity } from "@/types/activity";
import { activitySessionZone, isActivitySession } from "@/lib/activitySession";
import type { PolarisedSplit } from "@/lib/weekStats";

/**
 * Ce que la période a pesé en intensité : facile, tempo, intense.
 *
 * C'est le 80/20 que la méthodologie du site prêche, et le seul chiffre que
 * le bilan ne savait pas dire sur du RÉALISÉ. Il se calcule comme la semaine
 * type le calcule déjà (`weekStats.ts`), et pour la même raison : PAR SÉANCE,
 * classée par sa zone caractéristique, et non en temps passé dans chaque
 * zone. Une séance de VO2 compte comme de l'intensité même si l'essentiel de
 * ses minutes est de l'échauffement ; au temps en zone, toute semaine
 * paraît faite à 95 % de facile, ce qui ne dit rien.
 *
 * Trois sources, trois façons d'obtenir une zone, et aucune n'invente :
 *
 * - une séance FAITE du catalogue prend la zone dominante de son gabarit,
 *   à hauteur de ses minutes réelles ; le renforcement n'a pas de zone et
 *   ne compte pas ici, il compte en temps ailleurs ;
 * - une activité posée dans la semaine (`__activity_*`) porte un effort
 *   prévu que `activitySessionZone` traduit déjà en zone ;
 * - une activité du journal se classe par son EFFORT PERÇU, saisi ou déduit
 *   du motif : un vélotaf sans RPE vaut 3, donc facile. Les bornes sont
 *   celles de la clôture des séances (`getDefaultRpe`) : l'endurance se clôt
 *   à 4, le tempo à 6, le seuil à 7.
 *
 * Un gabarit qui n'est pas (encore) chargé ne se devine pas : ses minutes
 * vont dans `unclassifiedMinutes`, et l'écran peut le dire. Une estimation
 * étiquetée vaut mieux qu'un pourcentage sûr de lui.
 */

/** RPE 1-4 facile, 5-6 tempo, 7 et plus intense. */
export function zoneFromRpe(rpe: number): number {
  if (rpe <= 4) return 2;
  if (rpe <= 6) return 3;
  return 4;
}

export interface IntensitySplit extends PolarisedSplit {
  /** Minutes faites dont la zone ne se connaît pas : gabarit absent, ou sans zone. */
  unclassifiedMinutes: number;
}

function isDone(session: PlanSession): boolean {
  return session.status === "completed" || session.status === "modified";
}

export function intensitySplit(params: {
  sessions: readonly PlanSession[];
  activities: readonly ComplementaryActivity[];
  /** Le gabarit d'une séance, `undefined` tant qu'il n'est pas chargé. */
  workoutOf: (workoutId: string) => AnyWorkoutTemplate | undefined;
}): IntensitySplit {
  let lowMinutes = 0;
  let midMinutes = 0;
  let highMinutes = 0;
  let unclassifiedMinutes = 0;

  const add = (zone: number | null, minutes: number) => {
    if (minutes <= 0) return;
    if (zone === null) unclassifiedMinutes += minutes;
    else if (zone <= 2) lowMinutes += minutes;
    else if (zone === 3) midMinutes += minutes;
    else highMinutes += minutes;
  };

  for (const session of params.sessions) {
    if (!isDone(session)) continue;
    if (session.workoutId === "__race_day__") continue;
    const minutes = session.actualDurationMin ?? session.estimatedDurationMin ?? 0;
    if (isActivitySession(session.workoutId)) {
      add(activitySessionZone(session), minutes);
      continue;
    }
    const workout = params.workoutOf(session.workoutId);
    if (!workout || isStrengthWorkout(workout)) {
      add(null, minutes);
      continue;
    }
    add(getDominantZone(workout), minutes);
  }

  for (const activity of params.activities) {
    add(zoneFromRpe(activity.rpe ?? defaultRpe(activity.purpose)), activity.durationMin);
  }

  const zonedMinutes = lowMinutes + midMinutes + highMinutes;
  return {
    lowMinutes,
    midMinutes,
    highMinutes,
    zonedMinutes,
    lowShare: zonedMinutes > 0 ? lowMinutes / zonedMinutes : 0,
    midShare: zonedMinutes > 0 ? midMinutes / zonedMinutes : 0,
    highShare: zonedMinutes > 0 ? highMinutes / zonedMinutes : 0,
    unclassifiedMinutes,
  };
}
