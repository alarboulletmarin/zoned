import type { Discipline } from "@/types";
import type { RaceDistance } from "@/types/plan";

/**
 * La pratique, l'axe produit qui manquait.
 *
 * L'app segmentait son catalogue par *modalité* (course, vélo, natation,
 * renforcement). Quelqu'un qui s'entraîne, lui, pense en *pratique* : je fais
 * du trail, je prépare un ultra. C'est cet axe qui porte la nav, la
 * bibliothèque et la première question du parcours de plan.
 *
 * Une pratique peut être NOMMÉE sans que ses plans existent, voir
 * `PracticeStatus`. Ses séances restent alors consultables : l'ultra en a
 * quarante-neuf dans la bibliothèque, le triathlon les siennes en vélo et en
 * natation. C'est la génération de plan qui est fermée, pas le contenu.
 *
 * La pratique ne se stocke pas : elle se **déduit** de `RaceDistance`, qui est
 * déjà persistée dans `zoned-plans` et porte déjà `trail_short`, `trail` et
 * `ultra` en première classe. Donc aucune migration, et un plan enregistré
 * avant l'existence de ce fichier a quand même une pratique.
 *
 * Le seul cas que la déduction ne couvre pas est un plan sans course visée
 * (base, reprise, débutant) : celui-là porte un `PlanConfig.practice`
 * optionnel.
 */

export type Practice = "road" | "trail" | "ultra" | "triathlon";

export const PRACTICES: readonly Practice[] = [
  "road",
  "trail",
  "ultra",
  "triathlon",
] as const;

/**
 * `announced` = la pratique est nommée dans l'app mais ne génère pas de plan.
 *
 * C'est LE drapeau que toute l'UI lit, carte de pratique, bibliothèque,
 * `/plans`, étape 1 du parcours. Aucun écran ne re-décide dans son coin, et
 * basculer une pratique en `live` le jour où ses plans existent est un
 * changement d'une ligne.
 *
 * Deux pratiques le portent : le triathlon, dont les plans n'ont jamais été
 * écrits, et l'ULTRA depuis le 12 septembre 2026, décision du propriétaire,
 * qui juge ce que le générateur produit à cette distance pas assez fiable pour
 * être proposé. Le moteur garde ses tables d'ultra : un plan déjà enregistré
 * continue de s'ouvrir et de se dérouler, c'est la PORTE qui se ferme, pas la
 * machine.
 */
export type PracticeStatus = "live" | "announced";

export interface PracticeMeta {
  id: Practice;
  status: PracticeStatus;
  /** FR/EN en ligne, comme RACE_DISTANCE_META, CALCULATEURS et collections/data.ts. */
  label: string;
  labelEn: string;
  /** Une ligne, au tutoiement. Pas un paragraphe. */
  blurb: string;
  blurbEn: string;
  /** Les distances que le parcours propose pour cette pratique. Vide = annoncée. */
  raceDistances: readonly RaceDistance[];
  /** Les modalités dont la bibliothèque montre les séances sous cette pratique. */
  disciplines: readonly Discipline[];
}

export const PRACTICE_META: Record<Practice, PracticeMeta> = {
  road: {
    id: "road",
    status: "live",
    label: "Route",
    labelEn: "Road",
    blurb: "Du 5 km au marathon, sur le bitume.",
    blurbEn: "From 5K to the marathon, on the road.",
    raceDistances: ["5K", "10K", "semi", "marathon"],
    disciplines: ["running"],
  },
  trail: {
    id: "trail",
    status: "live",
    label: "Trail",
    labelEn: "Trail",
    blurb: "Du trail court au 60 km : dénivelé, terrain, descente.",
    blurbEn: "From short trail to 60K: elevation, terrain, descent.",
    raceDistances: ["trail_short", "trail"],
    disciplines: ["running"],
  },
  ultra: {
    id: "ultra",
    status: "announced",
    label: "Ultra",
    labelEn: "Ultra",
    blurb: "Au-delà du trail : temps sur les pieds, nuit, ravitaillement. Les séances sont là, les plans arrivent.",
    blurbEn: "Beyond trail: time on feet, night running, fuelling. The sessions are here, the plans are coming.",
    /* Vide, comme toute pratique annoncée : c'est ce que lit l'étape distance,
       et le parcours s'arrête de toute façon à la première question. */
    raceDistances: [],
    disciplines: ["running"],
  },
  triathlon: {
    id: "triathlon",
    status: "announced",
    label: "Triathlon",
    labelEn: "Triathlon",
    blurb: "Nage, vélo, course. Les séances sont là, les plans arrivent.",
    blurbEn: "Swim, bike, run. The sessions are here, the plans are coming.",
    raceDistances: [],
    disciplines: ["swimming", "cycling", "running"],
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
      return "trail";
    case "ultra":
      return "ultra";
  }
}

/** Les distances proposées par une pratique. Vide pour une pratique annoncée. */
export function distancesOfPractice(practice: Practice): readonly RaceDistance[] {
  return PRACTICE_META[practice].raceDistances;
}

/** Une pratique annoncée ne génère pas de plan. Voir `PracticeStatus`. */
export function isPracticeLive(practice: Practice): boolean {
  return PRACTICE_META[practice].status === "live";
}
