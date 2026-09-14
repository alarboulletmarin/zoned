import {
  ACTIVITY_DISCIPLINES,
  ACTIVITY_LIMITS,
  ACTIVITY_PURPOSES,
  type ActivityDraft,
  type ComplementaryActivity,
} from "@/types/activity";

/**
 * Le journal des activités complémentaires.
 *
 * Une clé à part, `zoned-activities`, et non un champ dans `zoned-plans` :
 * une activité existe SANS plan (on fait du vélotaf entre deux cycles) et
 * survit au plan qui l'a vue passer. Un plan la retrouve par sa date, c'est
 * tout le couplage qu'il y a entre les deux, et il va dans un seul sens.
 *
 * Le tableau est trié par DATE DÉCROISSANTE à la lecture, jamais à l'écriture :
 * un tri à l'écriture se serait promené entre quatre points d'entrée et aurait
 * fini par manquer dans l'un d'eux. Le prix est un tri par lecture, sur
 * quelques centaines d'entrées, dans une app locale. C'est gratuit.
 */

export const ACTIVITY_STORAGE_KEY = "zoned-activities";

/**
 * Au-delà, on avertit sans jamais refuser.
 *
 * Même posture que `ROUTE_STORAGE_SOFT_LIMIT` : `localStorage` a un plafond
 * réel (~5 Mo) et une activité pèse ~150 octets, donc mille entrées coûtent
 * 150 Ko. Le nombre ne protège pas le stockage, il prévient avant que la
 * liste ne devienne illisible.
 */
export const ACTIVITY_STORAGE_SOFT_LIMIT = 1000;

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function clampNumber(
  value: unknown,
  bounds: { min: number; max: number },
): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) return undefined;
  if (value < bounds.min || value > bounds.max) return undefined;
  return value;
}

/**
 * Une entrée stockée, ramenée à une activité valide, ou `null`.
 *
 * `null` et pas une activité par défaut : une ligne de journal qu'on ne sait
 * pas lire est une ligne dont on ne sait rien, et inventer une durée de 0 min
 * la ferait compter dans les totaux pour une valeur qui n'a jamais été saisie.
 * L'appelant la jette.
 */
export function validateActivity(raw: unknown): ComplementaryActivity | null {
  if (typeof raw !== "object" || raw === null) return null;
  const value = raw as Record<string, unknown>;

  if (typeof value.id !== "string" || value.id.length === 0) return null;
  if (typeof value.date !== "string" || !DATE_ONLY.test(value.date)) return null;

  const discipline = ACTIVITY_DISCIPLINES.find((d) => d === value.discipline);
  if (!discipline) return null;

  const purpose = ACTIVITY_PURPOSES.find((p) => p === value.purpose);
  if (!purpose) return null;

  const durationMin = clampNumber(value.durationMin, ACTIVITY_LIMITS.durationMin);
  if (durationMin === undefined) return null;

  const note =
    typeof value.note === "string" && value.note.trim().length > 0
      ? value.note.trim().slice(0, ACTIVITY_LIMITS.noteMaxLength)
      : undefined;

  return {
    id: value.id,
    date: value.date,
    discipline,
    purpose,
    durationMin,
    distanceKm: clampNumber(value.distanceKm, ACTIVITY_LIMITS.distanceKm),
    elevationGainM: clampNumber(value.elevationGainM, ACTIVITY_LIMITS.elevationGainM),
    avgWatts: clampNumber(value.avgWatts, ACTIVITY_LIMITS.avgWatts),
    rpe: clampNumber(value.rpe, ACTIVITY_LIMITS.rpe),
    note,
    createdAt:
      typeof value.createdAt === "string" && value.createdAt.length > 0
        ? value.createdAt
        : new Date().toISOString(),
  };
}

/**
 * Le tri du journal : la plus récente d'abord, et à date égale la dernière
 * saisie d'abord. Sans le second critère, deux trajets du même jour
 * changeraient d'ordre entre deux rendus, ce qui fait sauter une liste sous
 * le doigt pour rien.
 */
function byMostRecent(a: ComplementaryActivity, b: ComplementaryActivity): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0;
}

export function getAllActivities(): ComplementaryActivity[] {
  try {
    const raw = localStorage.getItem(ACTIVITY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(validateActivity)
      .filter((a): a is ComplementaryActivity => a !== null)
      .sort(byMostRecent);
  } catch (err) {
    console.warn("activityStorage: journal illisible, il est ignoré", err);
    return [];
  }
}

function persist(activities: ComplementaryActivity[]): boolean {
  try {
    localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(activities));
    return true;
  } catch (err) {
    console.warn("activityStorage: écriture refusée (quota ou sérialisation)", err);
    return false;
  }
}

/**
 * Enregistrer une activité. Rend l'activité écrite, ou `null` si le brouillon
 * ne passe pas la validation ou si le stockage refuse.
 *
 * L'appelant a besoin de l'objet et pas d'un booléen : c'est lui qui porte
 * l'`id`, donc la seule adresse qui permette ensuite de la modifier ou de la
 * supprimer.
 */
export function addActivity(draft: ActivityDraft): ComplementaryActivity | null {
  const candidate = validateActivity({
    ...draft,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  });
  if (!candidate) return null;

  const activities = getAllActivities();
  activities.push(candidate);
  return persist(activities) ? candidate : null;
}

/** Modifier une activité existante. L'`id` et la date de création ne bougent pas. */
export function updateActivity(id: string, draft: ActivityDraft): ComplementaryActivity | null {
  const activities = getAllActivities();
  const index = activities.findIndex((a) => a.id === id);
  if (index === -1) return null;

  const candidate = validateActivity({
    ...draft,
    id,
    createdAt: activities[index].createdAt,
  });
  if (!candidate) return null;

  activities[index] = candidate;
  return persist(activities) ? candidate : null;
}

export function deleteActivity(id: string): boolean {
  const activities = getAllActivities();
  const next = activities.filter((a) => a.id !== id);
  if (next.length === activities.length) return false;
  return persist(next);
}

/**
 * Les activités d'un intervalle de dates, bornes COMPRISES.
 *
 * Les deux bornes sont des "YYYY-MM-DD" et la comparaison est celle des
 * chaînes : ce format se compare lexicographiquement dans l'ordre
 * chronologique, ce qui évite de construire deux `Date` par entrée et surtout
 * d'y perdre un jour au passage à l'heure d'été. C'est la même raison qui
 * fait que la date d'une activité est une date SEULE.
 */
export function activitiesBetween(
  activities: readonly ComplementaryActivity[],
  fromDate: string,
  toDate: string,
): ComplementaryActivity[] {
  return activities.filter((a) => a.date >= fromDate && a.date <= toDate);
}

/** Les activités d'un jour donné. */
export function activitiesOn(
  activities: readonly ComplementaryActivity[],
  date: string,
): ComplementaryActivity[] {
  return activities.filter((a) => a.date === date);
}
