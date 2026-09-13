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
 * Ce que dit la donnée réelle, mesuré sur le catalogue : route 197, trail 33,
 * ultra 49 (dont 16 spécifiques). Les 28 séances trail et 44 ultra du premier
 * relevé ne devaient RIEN à ce chantier, le terrain et les tags étaient déjà
 * renseignés, c'est le critère qui manquait. Les cinq qui les complètent
 * (TRL-015, TRL-017…TRL-020) sont, elles, écrites pour l'ultra : marche rapide
 * en montée, nuit, ravitaillement, montées de dix minutes, double sortie.
 */

/** Un terrain qui n'est pas de la route. `road` ne qualifie pas le trail. */
const TRAIL_TERRAIN: ReadonlySet<TerrainType> = new Set<TerrainType>([
  "trail_runnable",
  "trail_technical",
  "mountain",
]);

/**
 * Les tags qui disent ultra quand le reste ne le dit pas.
 *
 * `estimatedDistanceKm` serait le signal évident, mais il n'est renseigné que
 * sur 4 séances du catalogue (toutes vélo ou natation) : inutilisable. Les tags
 * de `selectionCriteria`, eux, sont riches et déjà écrits.
 */
const ULTRA_TAGS: ReadonlySet<string> = new Set([
  "ultra",
  "back_to_back",
  "time-on-feet",
  "long-trail",
  "trail_long",
  "hike-run",
  "power-hike",
  "double-day",
  "cumulative-fatigue",
  "glycogen-depletion",
  "durability",
]);

/**
 * Une séance transversale ne revendique aucune pratique, liste vide, et
 * `workoutMatchesPractice` la laisse alors passer sous n'importe laquelle.
 * C'est le cas du renforcement : un coureur sur route ne doit pas perdre son
 * gainage parce qu'il a choisi route.
 */
const AGNOSTIC: readonly Practice[] = [];

const memo = new Map<string, readonly Practice[]>();

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

function classify(workout: AnyWorkoutTemplate): readonly Practice[] {
  // Le renforcement est transversal : il sert les quatre pratiques, donc il
  // n'en revendique aucune et passe partout.
  if (isStrengthWorkout(workout)) return AGNOSTIC;

  // Vélo et natation sont les disciplines du triathlon (PRACTICE_META le
  // déclare), et c'est tout ce qui existe de tri aujourd'hui. Un coureur sur
  // route qui veut du cross-training passe par le filtre de modalité, qui
  // court-circuite alors la pratique, voir workoutFilters.
  if (getWorkoutDiscipline(workout) !== "running") return ["triathlon"];

  // Surcharge explicite : une séance peut se ranger elle-même. Ajout sûr,
  // `scripts/qa-workout-schema.ts` ne rejette pas les clés racine inconnues.
  const declared = (workout as { practices?: Practice[] }).practices;
  if (declared && declared.length > 0) return declared;

  const tags = workout.selectionCriteria?.tags ?? [];
  const isTrail =
    workout.category === "trail" ||
    hasTrailTerrain(workout.mainSetStructure) ||
    hasTrailTerrain(workout.warmupStructure) ||
    hasTrailTerrain(workout.cooldownStructure) ||
    hasTrailTerrain(workout.mainSetTemplate) ||
    hasTrailTerrain(workout.warmupTemplate) ||
    hasTrailTerrain(workout.cooldownTemplate);

  // L'ultra puise dans le trail et dans le volume : une sortie longue et une
  // descente technique servent un 100 km autant qu'une séance tagguée ultra.
  // On ne montre pas 11 séances à quelqu'un pour qui 44 sont utiles.
  const isUltra =
    isTrail || workout.category === "long_run" || tags.some((t) => ULTRA_TAGS.has(t));

  const practices: Practice[] = [];
  if (!isTrail) practices.push("road");
  if (isTrail) practices.push("trail");
  if (isUltra) practices.push("ultra");
  return practices;
}

/** Les pratiques auxquelles une séance appartient. Mémoïsé par id. */
export function practicesOfWorkout(workout: AnyWorkoutTemplate): readonly Practice[] {
  const cached = memo.get(workout.id);
  if (cached) return cached;
  const practices = classify(workout);
  memo.set(workout.id, practices);
  return practices;
}

/**
 * Vrai si la séance a sa place sous cette pratique.
 *
 * Une séance transversale (liste vide) passe sous toutes les pratiques : c'est
 * ce qui garde le renforcement visible quelle que soit la pratique choisie.
 */
export function workoutMatchesPractice(
  workout: AnyWorkoutTemplate,
  practice: Practice,
): boolean {
  const practices = practicesOfWorkout(workout);
  return practices.length === 0 || practices.includes(practice);
}

/**
 * Les vrais compteurs des cartes de pratique. Jamais un nombre en dur.
 *
 * On ne compte que les séances qui **revendiquent** la pratique : les
 * transversales ne gonflent aucun chiffre, sinon les quatre cartes
 * afficheraient le même surplus et le nombre cesserait de discriminer.
 */
export function countByPractice(
  workouts: readonly AnyWorkoutTemplate[],
): Record<Practice, number> {
  const counts = { road: 0, trail: 0, ultra: 0, triathlon: 0 } as Record<Practice, number>;
  for (const workout of workouts) {
    for (const practice of practicesOfWorkout(workout)) counts[practice] += 1;
  }
  return counts;
}

/** Les séances écrites *pour* l'ultra, par opposition à celles qui y servent. */
export function isUltraSpecific(workout: AnyWorkoutTemplate): boolean {
  if (isStrengthWorkout(workout)) return false;
  return (workout.selectionCriteria?.tags ?? []).some((t) => ULTRA_TAGS.has(t));
}

/** Pour les tests : repartir d'un cache vide. */
export function __resetPracticeIndexCache(): void {
  memo.clear();
}
