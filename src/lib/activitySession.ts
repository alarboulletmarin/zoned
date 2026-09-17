/**
 * Les activités posées DANS une semaine : les séances `__activity_*`.
 *
 * Le journal des activités complémentaires (`types/activity.ts`) est un
 * RELEVÉ daté : ce qu'on a fait mardi. Il ne peut rien dire d'une semaine
 * type, qui n'a pas de dates, et c'est exactement là que le vélotaf
 * disparaissait. On posait un `__activity_cycling__` sur lundi, mercredi et
 * vendredi, et la semaine annonçait trois séances, 3 h et un rythme à plat
 * ces trois jours-là : la carte était sur le tableau, mais elle pesait zéro,
 * sans durée, sans effort, invisible au volume, à la charge et à la
 * polarisation. Trois trajets de 45 min de vélo facile, c'est du volume
 * facile, et une semaine qui ne les compte pas se dit trop intense alors
 * qu'elle ne l'est pas.
 *
 * Une activité de semaine porte donc deux choses, et deux seulement :
 *
 * - une DURÉE, dans `estimatedDurationMin`, le champ que toute séance a déjà,
 *   et la seule métrique qui existe toujours (même règle que le journal) ;
 * - un EFFORT prévu, `intensity`, en trois mots (facile, modéré, dur) et pas
 *   une échelle de dix : on ne prévoit pas un vélotaf à 3/10, on le prévoit
 *   facile. Les trois mots sont le `CrossTrainingIntensity` que le dépôt
 *   avait déjà.
 *
 * L'effort se traduit en ZONE (Z2, Z3, Z4), et c'est la zone qui fait tout le
 * reste : la polarisation classe la séance par sa zone comme n'importe quelle
 * autre (`weekStats.ts`), le rythme la colorie comme les autres, et la charge
 * se calcule au même TSS que les séances de course, `runTssFromZone`. Une
 * unité, la même partout, plutôt qu'une charge à part que personne ne
 * pourrait additionner au reste de la semaine.
 *
 * Le renforcement, le yoga et le repos actif n'ont pas de zone aérobie : ils
 * comptent en temps, jamais dans la polarisation, exactement comme une
 * séance de renfo du catalogue.
 */

import type { CrossTrainingIntensity, PlanSession } from "@/types/plan";
import type { Discipline, SessionType } from "@/types";
import type { CommutePattern } from "@/types/athlete-profile";
import { runTssFromZone } from "@/lib/planGenerator/tss";

export const ACTIVITY_SESSION_PREFIX = "__activity_";

/** Ce qu'une activité de semaine peut être. `commute` est le vélotaf. */
export type ActivityKind =
  | "commute"
  | "cycling"
  | "swimming"
  | "yoga"
  | "rest"
  | "strength"
  | "cross_training";

export interface ActivityKindMeta {
  kind: ActivityKind;
  workoutId: string;
  sessionType: SessionType;
  /** Porte une zone aérobie, donc un effort à choisir et une part de polarisation. */
  aerobic: boolean;
  /** Se pose avec une durée. Le repos actif n'en a pas à demander. */
  timed: boolean;
}

/**
 * Une table, une seule. Le panneau d'ajout, les noms de cartes et les stats
 * lisent tous celle-ci ; trois listes auraient divergé au premier ajout.
 * L'ordre est celui du panneau : le vélotaf d'abord, parce que c'est lui
 * qu'on pose trois fois par semaine.
 */
export const ACTIVITY_KINDS: readonly ActivityKindMeta[] = [
  { kind: "commute", workoutId: "__activity_commute__", sessionType: "cycling", aerobic: true, timed: true },
  { kind: "cycling", workoutId: "__activity_cycling__", sessionType: "cycling", aerobic: true, timed: true },
  { kind: "swimming", workoutId: "__activity_swimming__", sessionType: "swimming", aerobic: true, timed: true },
  { kind: "cross_training", workoutId: "__activity_cross_training__", sessionType: "cross_training", aerobic: true, timed: true },
  { kind: "yoga", workoutId: "__activity_yoga__", sessionType: "yoga", aerobic: false, timed: true },
  { kind: "strength", workoutId: "__activity_strength__", sessionType: "strength", aerobic: false, timed: true },
  { kind: "rest", workoutId: "__activity_rest__", sessionType: "rest", aerobic: false, timed: false },
];

/** Les activités que le panneau propose, dans son ordre. */
export const PANEL_ACTIVITY_KINDS: readonly ActivityKind[] = [
  "commute",
  "cycling",
  "swimming",
  "yoga",
  "rest",
];

export function isActivitySession(workoutId: string): boolean {
  return workoutId.startsWith(ACTIVITY_SESSION_PREFIX);
}

export function activityKindOf(workoutId: string): ActivityKindMeta | null {
  return ACTIVITY_KINDS.find((k) => k.workoutId === workoutId) ?? null;
}

export function activityWorkoutId(kind: ActivityKind): string {
  return `${ACTIVITY_SESSION_PREFIX}${kind}__`;
}

export const ACTIVITY_INTENSITIES: readonly CrossTrainingIntensity[] = ["easy", "moderate", "hard"];

/**
 * L'effort en zone. Facile est Z2 et pas Z1 : un vélotaf est de l'endurance
 * de base, pas de la récupération, et Z1 aurait fait de trois trajets une
 * semaine plus facile qu'elle n'est. Dur est Z4 : au-delà, on ne parle
 * plus d'une activité posée à la louche mais d'une séance, et elle a sa place
 * dans le catalogue.
 */
export const ACTIVITY_INTENSITY_ZONE: Record<CrossTrainingIntensity, number> = {
  easy: 2,
  moderate: 3,
  hard: 4,
};

export const DEFAULT_ACTIVITY_INTENSITY: CrossTrainingIntensity = "easy";

export function isActivityIntensity(value: unknown): value is CrossTrainingIntensity {
  return value === "easy" || value === "moderate" || value === "hard";
}

/** La zone d'une activité, `null` quand elle n'en a pas (renfo, yoga, repos). */
export function activitySessionZone(session: PlanSession): number | null {
  const meta = activityKindOf(session.workoutId);
  if (!meta || !meta.aerobic) return null;
  return ACTIVITY_INTENSITY_ZONE[session.intensity ?? DEFAULT_ACTIVITY_INTENSITY];
}

/** La charge d'une activité, au TSS des séances, zéro sans zone ou sans durée. */
export function activitySessionTss(session: PlanSession): number {
  const zone = activitySessionZone(session);
  if (zone === null || session.estimatedDurationMin <= 0) return 0;
  return runTssFromZone(session.estimatedDurationMin, zone);
}

/** Ce qu'une semaine sait d'une activité, résolu une fois pour les stats et le rythme. */
export interface ActivitySlotInfo {
  workoutId: string;
  durationMin: number;
  zone: number | null;
  tss: number;
}

export function activitySlotInfo(session: PlanSession): ActivitySlotInfo {
  return {
    workoutId: session.workoutId,
    durationMin: Math.max(0, session.estimatedDurationMin),
    zone: activitySessionZone(session),
    tss: activitySessionTss(session),
  };
}

export interface ActivityDraft {
  durationMin: number;
  intensity: CrossTrainingIntensity;
}

/**
 * Le vélotaf se pré-remplit depuis le profil, parce que c'est une valeur
 * DÉCLARÉE : la personne a dit combien dure son trajet. La durée du profil est
 * reprise telle quelle, sans doubler pour un aller-retour que personne n'a
 * annoncé ; l'écran la montre et se corrige d'un geste.
 */
export function defaultActivityDraft(
  kind: ActivityKind,
  pattern: CommutePattern | null,
): ActivityDraft {
  return {
    durationMin: kind === "commute" && pattern ? pattern.durationMin : 0,
    intensity: DEFAULT_ACTIVITY_INTENSITY,
  };
}

/**
 * Le sport d'un vélotaf, celui du profil quand il le dit. Vélotaf se
 * fait aussi en footing, et le profil le sait ; la séance porte alors la
 * course, pour que les stats par sport ne rangent pas un footing dans le
 * vélo.
 */
function commuteDiscipline(pattern: CommutePattern | null): Discipline {
  return pattern?.discipline === "running" ? "running" : "cycling";
}

export function makeActivitySession(
  kind: ActivityKind,
  day: number,
  draft: ActivityDraft,
  pattern: CommutePattern | null = null,
): PlanSession {
  const meta = activityKindOf(activityWorkoutId(kind));
  if (!meta) throw new Error(`Unknown activity kind: ${kind}`);
  const discipline: Discipline | undefined =
    kind === "commute"
      ? commuteDiscipline(pattern)
      : kind === "cycling" || kind === "swimming"
        ? kind
        : undefined;
  const sessionType: SessionType =
    kind === "commute" && discipline === "running" ? "recovery" : meta.sessionType;
  return {
    dayOfWeek: day,
    workoutId: meta.workoutId,
    ...(discipline && { discipline }),
    sessionType,
    isKeySession: false,
    estimatedDurationMin: meta.timed ? Math.max(0, Math.round(draft.durationMin)) : 0,
    ...(meta.aerobic && { intensity: draft.intensity }),
  };
}

/** Une activité reçoit une nouvelle durée et un nouvel effort, le reste ne bouge pas. */
export function applyActivityDraft(session: PlanSession, draft: ActivityDraft): PlanSession {
  const meta = activityKindOf(session.workoutId);
  const next: PlanSession = {
    ...session,
    estimatedDurationMin: Math.max(0, Math.round(draft.durationMin)),
  };
  if (meta?.aerobic) next.intensity = draft.intensity;
  else delete next.intensity;
  return next;
}
