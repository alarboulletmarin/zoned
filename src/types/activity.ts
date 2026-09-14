import type { Discipline } from "@/types";

/**
 * L'activité complémentaire : ce que l'on fait EN PLUS du plan.
 *
 * Le trou qu'elle bouche est concret. Quelqu'un prépare un marathon et va au
 * travail à vélo quatre fois par semaine. Ces quatre trajets sont du temps
 * passé à pédaler, de la fatigue, du dénivelé, et le plan n'en sait rien : il
 * annonce 4 h de semaine là où la personne en a fait 6, et la charge qu'il
 * calcule est fausse dans le seul sens qui blesse, elle sous-estime.
 *
 * Trois façons de ne PAS résoudre ça, et pourquoi elles sont écartées :
 *
 * 1. **Une séance de plus dans le plan.** C'est ce que l'app savait faire
 *    (`__activity_cycling__`, cf. `PlanWorkoutPanel`), et c'est une séance
 *    VIDE, sans métrique, qu'il faut poser à la main dans la bonne semaine.
 *    Elle disparaît aussi avec le plan : le vélotaf, lui, ne s'arrête pas
 *    entre deux plans.
 * 2. **Le motif récurrent** (`CommutePattern`, `types/athlete-profile.ts`).
 *    Il dit ce que l'on fait D'HABITUDE, pas ce qu'on a fait mardi. C'est une
 *    hypothèse, pas un relevé, et il reste utile pour ça : il pré-remplit le
 *    formulaire. Il ne le remplace pas.
 * 3. **Rien, et on arrondit à la louche.** C'est l'état d'avant.
 *
 * Une activité est donc un RELEVÉ, daté, qui vit hors des plans, dans sa
 * propre clé (`zoned-activities`). Elle existe sans plan, elle survit au
 * plan, et un plan la lit par sa date quand elle tombe dans ses semaines.
 *
 * ── Le terrain préparé pour le triathlon ─────────────────────────────────
 *
 * `discipline` est l'union `Discipline` du dépôt, course, vélo, natation, plus
 * `other`. Ce n'est pas une largeur gratuite : le jour où l'objectif est un
 * triathlon, ce même relevé porte les trois disciplines sans changer de
 * forme, et `purpose` continue de distinguer le déplacement de
 * l'entraînement. Voir `docs/activites-complementaires.md`.
 */

/** Course, vélo, natation, et le reste. Le reste existe, il ne se déduit pas. */
export type ActivityDiscipline = Discipline | "other";

export const ACTIVITY_DISCIPLINES: readonly ActivityDiscipline[] = [
  "cycling",
  "running",
  "swimming",
  "other",
] as const;

/**
 * Pourquoi c'était fait, et c'est une information d'ENTRAÎNEMENT, pas une
 * étiquette de rangement.
 *
 * Un trajet domicile-travail et une sortie longue de vélo ne se lisent pas
 * pareil : le premier est du volume et de la fatigue sans être un stimulus
 * (allure basse, arrêts, sac sur le dos), la seconde est une séance. Les
 * confondre ferait dire au plan qu'on a fait six heures de qualité dans la
 * semaine, ce qui est le mensonge inverse de celui qu'on corrige.
 *
 * D'où trois valeurs, et pas deux :
 *
 * - `commute`, le vélotaf, le trajet qui revient ;
 * - `transport`, le déplacement quelconque, les courses, la gare. Même nature,
 *   mais il ne se répète pas, donc il ne se pré-remplit pas ;
 * - `training`, une vraie séance faite hors du plan.
 *
 * Les deux premiers sont des DÉPLACEMENTS et se comptent ensemble partout où
 * l'écran dit déplacement, voir `isTravel`.
 */
export type ActivityPurpose = "commute" | "transport" | "training";

export const ACTIVITY_PURPOSES: readonly ActivityPurpose[] = [
  "commute",
  "transport",
  "training",
] as const;

/** Un déplacement, par opposition à une séance. Une seule définition. */
export function isTravel(purpose: ActivityPurpose): boolean {
  return purpose === "commute" || purpose === "transport";
}

/**
 * Une activité complémentaire, telle qu'elle est enregistrée.
 *
 * **`durationMin` est le seul champ obligatoire**, et ce n'est pas une
 * facilité : c'est la seule métrique qui existe toujours (on sait toujours
 * combien de temps on a pédalé, pas toujours combien de kilomètres), et c'est
 * la seule dont la charge se calcule. La distance, le dénivelé et les watts
 * sont des précisions ; une activité qui n'en porte aucune compte quand même,
 * elle compte juste en minutes.
 *
 * Les watts sont le dernier de la liste et c'est voulu : ils demandent un
 * capteur, donc les exiger exclurait presque tout le monde. Quand ils sont là
 * ils ne servent pas au volume mais à l'intensité, voir `activityStats.ts`.
 */
export interface ComplementaryActivity {
  id: string;
  /** "YYYY-MM-DD", date seule. Une activité appartient à un JOUR, pas à un instant. */
  date: string;
  discipline: ActivityDiscipline;
  purpose: ActivityPurpose;
  /** Minutes. Le seul champ obligatoire. */
  durationMin: number;
  distanceKm?: number;
  /** Dénivelé positif, en mètres. */
  elevationGainM?: number;
  /** Puissance moyenne, en watts. Vélo uniquement en pratique, jamais exigée. */
  avgWatts?: number;
  /** 1-10, effort perçu. Absent, il se déduit du motif, voir `defaultRpe`. */
  rpe?: number;
  note?: string;
  createdAt: string;
}

/** Une activité en cours de saisie : tout est optionnel sauf ce qui la définit. */
export type ActivityDraft = Omit<ComplementaryActivity, "id" | "createdAt">;

// ── Bornes de validation ───────────────────────────────────────────
//
// Larges à dessein. Ce sont des garde-fous contre une faute de frappe et
// contre une donnée corrompue, pas un jugement sur ce qui est plausible : une
// diagonale de 400 km à vélo existe, et refuser de l'enregistrer serait dire
// à quelqu'un que sa journée n'a pas eu lieu.

export const ACTIVITY_LIMITS = {
  durationMin: { min: 1, max: 24 * 60 },
  distanceKm: { min: 0, max: 1000 },
  elevationGainM: { min: 0, max: 20000 },
  avgWatts: { min: 1, max: 999 },
  rpe: { min: 1, max: 10 },
  noteMaxLength: 280,
} as const;

/**
 * L'effort perçu par défaut, quand personne ne l'a dit.
 *
 * Il FAUT une valeur : la charge se calcule en durée fois RPE (Foster 2001),
 * donc une activité sans RPE vaudrait zéro, c'est-à-dire disparaîtrait de la
 * charge tout en apparaissant dans le volume. Deux chiffres qui se
 * contredisent valent moins qu'un seul.
 *
 * Les valeurs sont basses et c'est le bon sens du défaut : un trajet se fait
 * en tenue de ville, avec des feux rouges et un sac. Quelqu'un qui monte un
 * col en rentrant le corrigera lui-même, et le formulaire lui montre le
 * curseur. Se tromper vers le bas sur un défaut coûte moins que gonfler la
 * charge de tout le monde.
 */
export function defaultRpe(purpose: ActivityPurpose): number {
  return purpose === "training" ? 5 : 3;
}

export interface ActivityDisciplineMeta {
  id: ActivityDiscipline;
  label: string;
  labelEn: string;
  /**
   * L'unité dans laquelle la distance se SAISIT et s'AFFICHE. Le stockage,
   * lui, est toujours en kilomètres, `ComplementaryActivity.distanceKm` : une
   * seule unité en mémoire, une conversion à l'affichage, jamais l'inverse.
   */
  distance: "km" | "meters" | "none";
  /** Le dénivelé n'existe qu'au sol. */
  elevation: boolean;
  /** Les watts n'existent qu'à vélo, en pratique. */
  watts: boolean;
}

/**
 * Ce que chaque discipline sait porter.
 *
 * Une table, et une seule, parce que trois écrans montrent ces champs et que
 * trois `if (discipline === "cycling")` auraient divergé au premier ajout.
 * La natation se SAISIT en mètres, jamais en kilomètres : 1,5 km de nage
 * s'écrit 1500 m partout ailleurs dans l'app (`SwimmingProfile`), et changer
 * d'unité entre deux écrans est une façon sûre de faire saisir un facteur
 * mille. En mémoire elle reste des kilomètres comme le reste.
 */
export const ACTIVITY_DISCIPLINE_META: Record<ActivityDiscipline, ActivityDisciplineMeta> = {
  cycling: {
    id: "cycling",
    label: "Vélo",
    labelEn: "Cycling",
    distance: "km",
    elevation: true,
    watts: true,
  },
  running: {
    id: "running",
    label: "Course",
    labelEn: "Running",
    distance: "km",
    elevation: true,
    watts: false,
  },
  swimming: {
    id: "swimming",
    label: "Natation",
    labelEn: "Swimming",
    distance: "meters",
    elevation: false,
    watts: false,
  },
  other: {
    id: "other",
    label: "Autre",
    labelEn: "Other",
    distance: "none",
    elevation: false,
    watts: false,
  },
};
