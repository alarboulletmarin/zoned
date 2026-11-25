import type { Discipline } from "@/types";
import type { RaceDistance } from "@/types/plan";

/**
 * La pratique, l'axe produit : route ou trail.
 *
 * L'app segmentait son catalogue par *modalité* (course, vélo, natation,
 * renforcement). Quelqu'un qui s'entraîne, lui, pense en *pratique* : je cours
 * sur route, je fais du trail. C'est cet axe qui porte la nav, la
 * bibliothèque et la première question du parcours de plan.
 *
 * Deux pratiques, et seulement deux. L'ultra et le triathlon ont été nommés,
 * annoncés bientôt, puis retirés le 25 novembre 2026 par décision du
 * propriétaire : une pratique qu'on peut toucher mais qui ne mène à rien est
 * une promesse que l'écran ne tient pas. Leurs séances restent dans le
 * catalogue (les longues sorties sous le trail et la route, le vélo et la
 * natation sous Autres sports). Voir docs/pratiques.md.
 *
 * La pratique ne se stocke pas : elle se **déduit** de `RaceDistance`, déjà
 * persistée dans `zoned-plans`. Donc aucune migration. Le seul cas que la
 * déduction ne couvre pas est un plan sans course visée (base, reprise,
 * débutant) : celui-là porte un `PlanConfig.practice` optionnel.
 */

export type Practice = "road" | "trail";

export const PRACTICES: readonly Practice[] = ["road", "trail"] as const;

export interface PracticeMeta {
  id: Practice;
  /** FR/EN en ligne, comme RACE_DISTANCE_META, CALCULATEURS et collections/data.ts. */
  label: string;
  labelEn: string;
  /** Une ligne, au tutoiement. Pas un paragraphe. */
  blurb: string;
  blurbEn: string;
  /** Les distances que le parcours propose pour cette pratique. */
  raceDistances: readonly RaceDistance[];
  /** Les modalités dont la bibliothèque montre les séances sous cette pratique. */
  disciplines: readonly Discipline[];
}

export const PRACTICE_META: Record<Practice, PracticeMeta> = {
  road: {
    id: "road",
    label: "Route",
    labelEn: "Road",
    blurb: "Du 5 km au marathon, sur le bitume.",
    blurbEn: "From 5K to the marathon, on the road.",
    raceDistances: ["5K", "10K", "semi", "marathon"],
    disciplines: ["running"],
  },
  trail: {
    id: "trail",
    label: "Trail",
    labelEn: "Trail",
    blurb: "Du trail court au 60 km : dénivelé, terrain, descente.",
    blurbEn: "From short trail to 60K: elevation, terrain, descent.",
    raceDistances: ["trail_short", "trail"],
    disciplines: ["running"],
  },
};

/**
 * La projection qui évite la migration.
 *
 * `switch` exhaustif, **sans `default`** : le jour où `RaceDistance` gagne une
 * valeur (les distances de triathlon, par exemple), `tsc` échoue ici au lieu de
 * la faire tomber silencieusement dans route.
 */
export function practiceFromRaceDistance(distance: RaceDistance): Practice {
  switch (distance) {
    case "5K":
    case "10K":
    case "semi":
    case "marathon":
      return "road";
    case "trail_short":
    case "trail":
    // Le générateur ne propose plus la distance ultra, mais des plans déjà
    // enregistrés la portent et doivent continuer de s'ouvrir : c'est du trail.
    case "ultra":
      return "trail";
  }
}

/** Les distances proposées par une pratique. */
export function distancesOfPractice(practice: Practice): readonly RaceDistance[] {
  return PRACTICE_META[practice].raceDistances;
}
