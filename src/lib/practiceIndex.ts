import type { AnyWorkoutTemplate, TerrainType, WorkoutStep, WorkoutBlock } from "@/types";
import { getWorkoutDiscipline, isStrengthWorkout } from "@/types";
import type { Practice } from "@/types/practice";

/**
 * Classer une séance par pratique, la seule définition de ce qui est trail.
 *
 * La bande de la bibliothèque, les compteurs des cartes de pratique et les
 * états vides lisent tous ce module. S'ils se mettaient à recalculer chacun
 * leur critère, une carte annoncerait 28 séances et la bibliothèque en
 * montrerait 12.
 *
 * Pourquoi pas une `Map` construite au chargement du module : le catalogue est
 * découpé en chunks chargés à la demande (`src/data/workouts/index.ts`), donc
 * il n'existe aucun instant où toutes les séances sont là. La
 * classification est donc une fonction pure, **mémoïsée par id** : chaque
 * séance est traversée une fois par session, jamais à chaque rendu ni à chaque
 * frappe au clavier dans les filtres.
 *
 * Route ou trail, rien d'autre (l'ultra et le triathlon ont été retirés le
 * 25 novembre 2026, docs/pratiques.md). Une séance de course est trail par
 * sa catégorie ou son terrain, route sinon. Le renfo est transversal, le vélo
 * et la natation n'appartiennent à aucune pratique : on les atteint par Autres
 * sports, qui court-circuite la pratique.
 */

/** Un terrain qui n'est pas de la route. `road` ne qualifie pas le trail. */
const TRAIL_TERRAIN: ReadonlySet<TerrainType> = new Set<TerrainType>([
  "trail_runnable",
  "trail_technical",
  "mountain",
]);

/**
 * Une séance transversale ne revendique aucune pratique, liste vide, et
 * `workoutMatchesPractice` la laisse alors passer sous n'importe laquelle.
 * C'est le cas du renforcement : un coureur sur route ne doit pas perdre son
 * gainage parce qu'il a choisi route.
 */
const AGNOSTIC: readonly Practice[] = [];

/**
 * Hors pratique : le vélo et la natation. Ni route ni trail, et pas
 * transversaux non plus, sinon le rayon Route montrerait des séances de vélo.
 * `workoutMatchesPractice` les écarte dès qu'une pratique est choisie.
 */
const OUTSIDE = "outside" as const;

const memo = new Map<string, readonly Practice[] | typeof OUTSIDE>();

/** `terrainType` vit sur les blocs ET sur les segments du tableau structuré. */
function hasTrailTerrain(steps: readonly (WorkoutStep | WorkoutBlock)[] | undefined): boolean {
  if (!steps) return false;
  for (const step of steps) {
    if ("kind" in step && step.kind === "repeat") {
      if (hasTrailTerrain(step.steps)) return true;
      if (hasTrailTerrain(step.between)) return true;
      continue;
    }
    const terrain = (step as { terrainType?: TerrainType }).terrainType;
    if (terrain && TRAIL_TERRAIN.has(terrain)) return true;
  }
  return false;
}

function classify(workout: AnyWorkoutTemplate): readonly Practice[] | typeof OUTSIDE {
  // Le renforcement est transversal : il sert les deux pratiques, donc il
  // n'en revendique aucune et passe partout.
  if (isStrengthWorkout(workout)) return AGNOSTIC;

  // Vélo et natation : du cross-training, rangé sous Autres sports.
  if (getWorkoutDiscipline(workout) !== "running") return OUTSIDE;

  // Surcharge explicite : une séance peut se ranger elle-même. Ajout sûr,
  // `scripts/qa-workout-schema.ts` ne rejette pas les clés racine inconnues.
  const declared = (workout as { practices?: Practice[] }).practices;
  if (declared && declared.length > 0) return declared;

  const isTrail =
    workout.category === "trail" ||
    hasTrailTerrain(workout.mainSetStructure) ||
    hasTrailTerrain(workout.warmupStructure) ||
    hasTrailTerrain(workout.cooldownStructure) ||
    hasTrailTerrain(workout.mainSetTemplate) ||
    hasTrailTerrain(workout.warmupTemplate) ||
    hasTrailTerrain(workout.cooldownTemplate);

  return isTrail ? ["trail"] : ["road"];
}

function classified(workout: AnyWorkoutTemplate): readonly Practice[] | typeof OUTSIDE {
  const cached = memo.get(workout.id);
  if (cached) return cached;
  const practices = classify(workout);
  memo.set(workout.id, practices);
  return practices;
}

/**
 * Les pratiques auxquelles une séance appartient. Mémoïsé par id. Vide pour
 * une séance transversale (renfo) comme pour une séance hors pratique (vélo,
 * natation) : c'est `workoutMatchesPractice` qui les distingue.
 */
export function practicesOfWorkout(workout: AnyWorkoutTemplate): readonly Practice[] {
  const practices = classified(workout);
  return practices === OUTSIDE ? AGNOSTIC : practices;
}

/**
 * Vrai si la séance a sa place sous cette pratique.
 *
 * Une séance transversale (le renfo) passe sous toutes les pratiques : c'est
 * ce qui garde le gainage visible quelle que soit la pratique choisie. Le vélo
 * et la natation ne passent sous aucune.
 */
export function workoutMatchesPractice(
  workout: AnyWorkoutTemplate,
  practice: Practice,
): boolean {
  const practices = classified(workout);
  if (practices === OUTSIDE) return false;
  return practices.length === 0 || practices.includes(practice);
}

/**
 * Les vrais compteurs des cartes de pratique. Jamais un nombre en dur.
 *
 * On ne compte que les séances qui **revendiquent** la pratique : les
 * transversales ne gonflent aucun chiffre, sinon les deux cartes
 * afficheraient le même surplus et le nombre cesserait de discriminer.
 */
export function countByPractice(
  workouts: readonly AnyWorkoutTemplate[],
): Record<Practice, number> {
  const counts: Record<Practice, number> = { road: 0, trail: 0 };
  for (const workout of workouts) {
    for (const practice of practicesOfWorkout(workout)) counts[practice] += 1;
  }
  return counts;
}

/** Pour les tests : repartir d'un cache vide. */
export function __resetPracticeIndexCache(): void {
  memo.clear();
}
