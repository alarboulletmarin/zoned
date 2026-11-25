/**
 * La bibliothèque de séances, sans React : ce qu'un filtre garde, l'ordre d'un
 * tri, l'index des familles et la forme de l'URL.
 *
 * Tout vivait dans `LibraryPage`, dans un `useCallback` de cent quarante lignes
 * qu'aucun test ne pouvait atteindre. C'est là que le filtre Terrain a pu dire
 * une chose et en faire une autre pendant des mois : Côtes requises gardait
 * toute séance qui n'exigeait pas de piste, plat compris. Sorti ici, chaque
 * prédicat a son test (`libraryFilters.test.ts`).
 *
 * Une seule mesure de chaque séance, partagée avec la page séance : la durée
 * est `getWorkoutDuration` (1 h 03 des deux côtés, plus 63 min d'un
 * côté), le pic est `getPeakZone`, le D+ est `computeTrailMetrics`. Les mesures
 * sont mémorisées par séance, un tri sur deux cent soixante séances les relit
 * chacune plusieurs fois.
 */

import { getWorkoutDuration } from "@/components/visualization/transforms";
import { categories } from "@/data/workouts";
import { strengthCategories } from "@/data/strength";
import { normalizeSearch } from "@/lib/search-utils";
import { workoutMatchesPractice } from "@/lib/practiceIndex";
import { computeTrailMetrics } from "@/lib/workoutMetrics";
import type {
  AnyWorkoutTemplate,
  Difficulty,
  WorkoutCategory,
  ZoneNumber,
} from "@/types";
import { getPeakZone, getWorkoutDiscipline, isStrengthWorkout } from "@/types";
import type { Practice } from "@/types/practice";
import type {
  MuscleGroup,
  StrengthCategory,
  StrengthEquipment,
} from "@/types/strength";

// ── Les valeurs ──────────────────────────────────────────────────────────

/** La bande des sports. "all" est une vue du catalogue, pas un sport. */
export type ActivityType = "all" | "running" | "cycling" | "swimming" | "strength";

export const ACTIVITY_TYPES: readonly ActivityType[] = [
  "all",
  "running",
  "cycling",
  "swimming",
  "strength",
];

/**
 * Le terrain, trois puces qui se cumulent (ET).
 *
 * - `no_track` : je n'ai pas de piste, la séance n'en exige pas.
 * - `climb` : je veux du dénivelé, D+ mesuré ou côtes exigées.
 * - `no_hills` : je n'ai pas de côte, ni D+ ni côtes exigées.
 *
 * `climb` et `no_hills` s'excluent, `toggleTerrain` y veille.
 */
export type TerrainFilter = "no_track" | "climb" | "no_hills";

export const TERRAIN_FILTERS: readonly TerrainFilter[] = ["no_track", "climb", "no_hills"];

export type LibrarySort = "duration" | "intensity" | "level";

export const LIBRARY_SORTS: readonly LibrarySort[] = ["duration", "intensity", "level"];

export const DEFAULT_SORT: LibrarySort = "duration";

export const DIFFICULTIES: readonly Difficulty[] = [
  "beginner",
  "intermediate",
  "advanced",
  "elite",
];

export const PEAK_ZONES: readonly ZoneNumber[] = [1, 2, 3, 4, 5, 6];

/** Pas de borne haute : la tranche plus long et l'état par défaut. */
export const DURATION_OPEN = Number.POSITIVE_INFINITY;

export type DurationBucket = "le30" | "30_45" | "45_60" | "60_90" | "gt90";

/**
 * Les tranches de durée, à choix unique. Une borne basse est exclusive, une
 * borne haute inclusive : une séance de 30 min est dans 30 min ou moins,
 * pas dans 30 à 45. Elles remplacent un curseur de 0 à 300 min, imprécis
 * au pouce, dont la borne haute ne correspondait à aucune séance.
 */
export const DURATION_BUCKETS: readonly { id: DurationBucket; range: [number, number] }[] = [
  { id: "le30", range: [0, 30] },
  { id: "30_45", range: [30, 45] },
  { id: "45_60", range: [45, 60] },
  { id: "60_90", range: [60, 90] },
  { id: "gt90", range: [90, DURATION_OPEN] },
];

export interface WorkoutFiltersState {
  /** Les familles. Une famille ouverte est `[famille]` ; un vieux lien peut en porter plusieurs. */
  category: WorkoutCategory[];
  difficulty: Difficulty[];
  /** Minutes, borne basse exclusive (sauf 0), borne haute inclusive. */
  durationRange: [number, number];
  searchQuery: string;
  terrain: TerrainFilter[];
  /** Le pic d'intensité, `getPeakZone`. */
  peak: ZoneNumber[];
  favoritesOnly: boolean;
  strengthCategory: StrengthCategory[];
  equipment: StrengthEquipment[];
  muscleGroup: MuscleGroup[];
}

export const defaultFilters: WorkoutFiltersState = {
  category: [],
  difficulty: [],
  durationRange: [0, DURATION_OPEN],
  searchQuery: "",
  terrain: [],
  peak: [],
  favoritesOnly: false,
  strengthCategory: [],
  equipment: [],
  muscleGroup: [],
};

export interface FilterContext {
  favorites: readonly string[];
  /** `null` : toutes les pratiques. */
  practice: Practice | null;
  activityType: ActivityType;
}

// ── Les mesures d'une séance ─────────────────────────────────────────────

interface WorkoutMeasures {
  /** Minutes, celles de la page séance. */
  duration: number;
  /** `null` pour le renfo, qui n'a pas de zone. */
  peak: ZoneNumber | null;
  /** Mètres de D+, 0 hors course. */
  climbM: number;
  needsTrack: boolean;
  needsHills: boolean;
}

const measuresCache = new WeakMap<AnyWorkoutTemplate, WorkoutMeasures>();

export function measureWorkout(workout: AnyWorkoutTemplate): WorkoutMeasures {
  const cached = measuresCache.get(workout);
  if (cached) return cached;
  let measures: WorkoutMeasures;
  if (isStrengthWorkout(workout)) {
    measures = {
      duration: Math.round((workout.typicalDuration.min + workout.typicalDuration.max) / 2),
      peak: null,
      climbM: 0,
      needsTrack: false,
      needsHills: false,
    };
  } else {
    const running = getWorkoutDiscipline(workout) === "running";
    measures = {
      duration: getWorkoutDuration(workout),
      peak: getPeakZone(workout),
      climbM: running ? computeTrailMetrics(workout).totalElevationGainM : 0,
      needsTrack: running && workout.environment.requiresTrack,
      needsHills: running && workout.environment.requiresHills,
    };
  }
  measuresCache.set(workout, measures);
  return measures;
}

/** Une séance à D+ : du dénivelé mesuré, ou des côtes exigées. */
function hasClimb(m: WorkoutMeasures): boolean {
  return m.climbM > 0 || m.needsHills;
}

function matchesTerrain(m: WorkoutMeasures, terrain: TerrainFilter): boolean {
  switch (terrain) {
    case "no_track":
      return !m.needsTrack;
    case "climb":
      return hasClimb(m);
    case "no_hills":
      return !hasClimb(m);
  }
}

/** La pratique ne s'applique que sous Tout ou Course : choisir le vélo est plus précis qu'elle. */
function matchesPracticeContext(workout: AnyWorkoutTemplate, ctx: Pick<FilterContext, "practice" | "activityType">): boolean {
  if (ctx.practice === null) return true;
  if (ctx.activityType !== "all" && ctx.activityType !== "running") return true;
  return workoutMatchesPractice(workout, ctx.practice);
}

export function matchesSearch(workout: AnyWorkoutTemplate, query: string): boolean {
  const q = normalizeSearch(query);
  if (!q) return true;
  return (
    normalizeSearch(workout.name).includes(q) ||
    normalizeSearch(workout.nameEn).includes(q) ||
    normalizeSearch(workout.description).includes(q) ||
    normalizeSearch(workout.descriptionEn).includes(q)
  );
}

// ── Filtrer ──────────────────────────────────────────────────────────────

export function workoutPassesFilters(
  workout: AnyWorkoutTemplate,
  f: WorkoutFiltersState,
  ctx: FilterContext,
): boolean {
  if (f.favoritesOnly && !ctx.favorites.includes(workout.id)) return false;
  if (f.difficulty.length > 0 && !f.difficulty.includes(workout.difficulty)) return false;

  const m = measureWorkout(workout);
  const [min, max] = f.durationRange;
  if (min > 0 && m.duration <= min) return false;
  if (max < DURATION_OPEN && m.duration > max) return false;

  if (!matchesPracticeContext(workout, ctx)) return false;
  if (f.searchQuery && !matchesSearch(workout, f.searchQuery)) return false;

  if (isStrengthWorkout(workout)) {
    // Une famille et un pic sont des notions d'endurance : le renfo n'en a pas.
    if (f.category.length > 0 || f.peak.length > 0) return false;
    if (f.strengthCategory.length > 0 && !f.strengthCategory.includes(workout.category)) return false;
    if (f.equipment.length > 0) {
      const matchesEquipment = f.equipment.some((eq) =>
        eq === "none"
          ? workout.equipment.every((e) => e === "none")
          : workout.equipment.includes(eq),
      );
      if (!matchesEquipment) return false;
    }
    if (f.muscleGroup.length > 0 && !f.muscleGroup.some((g) => workout.primaryMuscleGroups.includes(g))) {
      return false;
    }
  } else {
    // Un filtre de renfo posé écarte tout ce qui n'en est pas.
    if (f.strengthCategory.length > 0 || f.equipment.length > 0 || f.muscleGroup.length > 0) return false;
    if (f.category.length > 0 && !f.category.includes(workout.category)) return false;
    if (f.peak.length > 0 && (m.peak === null || !f.peak.includes(m.peak))) return false;
  }

  // Le terrain se lit sur les mesures : hors course, ni piste ni D+, donc
  // Sans piste et Sans côte laissent passer le renfo, Avec D+ non.
  if (!f.terrain.every((t) => matchesTerrain(m, t))) return false;

  return true;
}

export function filterWorkouts(
  list: readonly AnyWorkoutTemplate[],
  filters: WorkoutFiltersState,
  ctx: FilterContext,
): AnyWorkoutTemplate[] {
  return list.filter((w) => workoutPassesFilters(w, filters, ctx));
}

/**
 * Ce que compte le bouton Filtres : ce qui se pose dans le panneau, sport
 * compris. Ni la famille, que le titre des résultats nomme, ni la recherche,
 * qui est dans son champ.
 */
export function countActiveFilters(f: WorkoutFiltersState, activityType: ActivityType): number {
  let count = 0;
  if (activityType !== "all") count += 1;
  count += f.peak.length;
  if (f.durationRange[0] !== 0 || f.durationRange[1] !== DURATION_OPEN) count += 1;
  count += f.difficulty.length;
  count += f.terrain.length;
  if (f.favoritesOnly) count += 1;
  count += f.strengthCategory.length;
  count += f.equipment.length;
  count += f.muscleGroup.length;
  return count;
}

/** Le repos : ni famille, ni recherche, ni filtre. Sur téléphone, l'index des familles. */
export function isLibraryAtRest(f: WorkoutFiltersState, activityType: ActivityType): boolean {
  return f.category.length === 0 && f.searchQuery.trim() === "" && countActiveFilters(f, activityType) === 0;
}

/** La tranche que pose une plage, `null` si la plage n'en est pas une (un vieux `maxDuration=40`). */
export function bucketOfRange(range: readonly [number, number]): DurationBucket | null {
  return DURATION_BUCKETS.find((b) => b.range[0] === range[0] && b.range[1] === range[1])?.id ?? null;
}

export function rangeOfBucket(bucket: DurationBucket): [number, number] {
  const found = DURATION_BUCKETS.find((b) => b.id === bucket);
  return found ? [found.range[0], found.range[1]] : [0, DURATION_OPEN];
}

/** Cocher Avec D+ décoche Sans côte, et l'inverse. */
export function toggleTerrain(current: readonly TerrainFilter[], value: TerrainFilter): TerrainFilter[] {
  if (current.includes(value)) return current.filter((t) => t !== value);
  const opposite: TerrainFilter | null = value === "climb" ? "no_hills" : value === "no_hills" ? "climb" : null;
  return [...current.filter((t) => t !== opposite), value];
}

// ── Trier ────────────────────────────────────────────────────────────────

function byId(a: AnyWorkoutTemplate, b: AnyWorkoutTemplate): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

/**
 * Durée (défaut) : la plus courte d'abord. Intensité : le pic, puis la durée,
 * le renfo en dernier puisqu'il n'a pas de pic. Niveau : débutant à élite,
 * puis la durée. L'identifiant départage, pour qu'un même tri rende toujours
 * le même ordre.
 */
export function sortWorkouts(list: readonly AnyWorkoutTemplate[], sort: LibrarySort): AnyWorkoutTemplate[] {
  const out = list.slice();
  out.sort((a, b) => {
    const ma = measureWorkout(a);
    const mb = measureWorkout(b);
    let diff = 0;
    if (sort === "intensity") {
      const pa = ma.peak ?? 7;
      const pb = mb.peak ?? 7;
      diff = pa - pb;
    } else if (sort === "level") {
      diff = DIFFICULTIES.indexOf(a.difficulty) - DIFFICULTIES.indexOf(b.difficulty);
    }
    return diff || ma.duration - mb.duration || byId(a, b);
  });
  return out;
}

// ── L'index des familles ─────────────────────────────────────────────────

export interface FamilyEntry {
  category: WorkoutCategory;
  count: number;
  minDuration: number;
  maxDuration: number;
  minPeak: ZoneNumber;
  maxPeak: ZoneNumber;
}

/**
 * Chaque famille qui a au moins une séance dans la pratique et le sport
 * regardés, dans l'ordre du catalogue, avec son nombre de séances, sa plage
 * de durées réelles et sa plage de pics. Une famille vide n'y est pas : une
 * rangée qui ouvre sur zéro séance est une impasse.
 */
export function familyIndex(
  list: readonly AnyWorkoutTemplate[],
  ctx: Pick<FilterContext, "practice" | "activityType">,
): FamilyEntry[] {
  const groups = new Map<WorkoutCategory, FamilyEntry>();
  for (const workout of list) {
    if (isStrengthWorkout(workout)) continue;
    if (!matchesPracticeContext(workout, ctx)) continue;
    const m = measureWorkout(workout);
    const peak = m.peak ?? 2;
    const entry = groups.get(workout.category);
    if (!entry) {
      groups.set(workout.category, {
        category: workout.category,
        count: 1,
        minDuration: m.duration,
        maxDuration: m.duration,
        minPeak: peak,
        maxPeak: peak,
      });
      continue;
    }
    entry.count += 1;
    entry.minDuration = Math.min(entry.minDuration, m.duration);
    entry.maxDuration = Math.max(entry.maxDuration, m.duration);
    entry.minPeak = Math.min(entry.minPeak, peak) as ZoneNumber;
    entry.maxPeak = Math.max(entry.maxPeak, peak) as ZoneNumber;
  }
  return categories.flatMap((c) => {
    const entry = groups.get(c);
    return entry ? [entry] : [];
  });
}

// ── L'URL ────────────────────────────────────────────────────────────────

export interface LibraryParams {
  activityType: ActivityType;
  /** Brute : la page la borne aux pratiques gardées (`resolvePractice`). */
  practice: string | null;
  filters: WorkoutFiltersState;
  sort: LibrarySort;
}

function listParam<T extends string>(params: URLSearchParams, key: string, allowed: readonly T[]): T[] {
  const raw = params.get(key);
  if (!raw) return [];
  const seen = new Set<T>();
  for (const part of raw.split(",")) {
    const value = part.trim() as T;
    if (allowed.includes(value)) seen.add(value);
  }
  return [...seen];
}

function minutesParam(params: URLSearchParams, key: string): number | null {
  const raw = params.get(key);
  if (raw === null || raw.trim() === "") return null;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : null;
}

const STRENGTH_EQUIPMENT: readonly StrengthEquipment[] = [
  "none", "resistance_band", "dumbbells", "kettlebell", "barbell",
  "pull_up_bar", "box", "foam_roller", "medicine_ball",
];

const MUSCLE_GROUPS: readonly MuscleGroup[] = [
  "quadriceps", "hamstrings", "glutes", "calves", "hip_flexors", "adductors",
  "core_anterior", "core_lateral", "core_posterior", "upper_back", "shoulders", "chest",
];

/**
 * Les anciens liens restent valides. `terrain=flat` voulait dire plat
 * préféré, ni côte ni piste : il devient `no_hills,no_track`. `hills`
 * devient `climb`. `track` (piste requise) n'a plus d'équivalent, et
 * un filtre qui garderait les seules séances de piste n'a jamais existé
 * malgré son nom : il est ignoré.
 */
function parseTerrain(params: URLSearchParams): TerrainFilter[] {
  const raw = params.get("terrain");
  if (!raw) return [];
  let out: TerrainFilter[] = [];
  for (const part of raw.split(",").map((p) => p.trim())) {
    const converted: TerrainFilter[] =
      part === "flat" ? ["no_hills", "no_track"]
      : part === "hills" ? ["climb"]
      : (TERRAIN_FILTERS as readonly string[]).includes(part) ? [part as TerrainFilter]
      : [];
    for (const t of converted) if (!out.includes(t)) out = toggleTerrain(out, t);
  }
  return out;
}

export function parseLibraryParams(params: URLSearchParams): LibraryParams {
  const type = params.get("type");
  const activityType: ActivityType = (ACTIVITY_TYPES as readonly string[]).includes(type ?? "")
    ? (type as ActivityType)
    : "all";

  const min = minutesParam(params, "minDuration") ?? 0;
  const max = minutesParam(params, "maxDuration") ?? DURATION_OPEN;

  const peak = listParam(params, "peak", PEAK_ZONES.map(String)).map(Number) as ZoneNumber[];
  peak.sort((a, b) => a - b);

  const sortRaw = params.get("sort");
  const sort: LibrarySort = (LIBRARY_SORTS as readonly string[]).includes(sortRaw ?? "")
    ? (sortRaw as LibrarySort)
    : DEFAULT_SORT;

  return {
    activityType,
    practice: params.get("practice"),
    sort,
    filters: {
      category: listParam(params, "category", categories),
      difficulty: listParam(params, "difficulty", DIFFICULTIES),
      durationRange: min < max ? [min, max] : [0, DURATION_OPEN],
      // La palette de commandes envoie `?search=`, le SearchAction déclaré aux
      // moteurs promet `?q=`.
      searchQuery: params.get("search") ?? params.get("q") ?? "",
      terrain: parseTerrain(params),
      peak,
      favoritesOnly: params.get("favorites") === "1",
      strengthCategory: listParam(params, "strengthCategory", strengthCategories),
      equipment: listParam(params, "equipment", STRENGTH_EQUIPMENT),
      muscleGroup: listParam(params, "muscleGroup", MUSCLE_GROUPS),
    },
  };
}

/** L'inverse de `parseLibraryParams`, sans rien d'écrit pour ce qui est par défaut. */
export function serializeLibraryParams(state: {
  activityType: ActivityType;
  practice: Practice | null;
  filters: WorkoutFiltersState;
  sort: LibrarySort;
}): URLSearchParams {
  const { activityType, practice, filters: f, sort } = state;
  const params = new URLSearchParams();
  if (activityType !== "all") params.set("type", activityType);
  if (practice !== null) params.set("practice", practice);
  if (f.category.length > 0) params.set("category", f.category.join(","));
  if (f.peak.length > 0) params.set("peak", [...f.peak].sort((a, b) => a - b).join(","));
  if (f.durationRange[0] > 0) params.set("minDuration", String(f.durationRange[0]));
  if (f.durationRange[1] < DURATION_OPEN) params.set("maxDuration", String(f.durationRange[1]));
  if (f.difficulty.length > 0) params.set("difficulty", f.difficulty.join(","));
  if (f.terrain.length > 0) params.set("terrain", f.terrain.join(","));
  if (f.favoritesOnly) params.set("favorites", "1");
  if (f.strengthCategory.length > 0) params.set("strengthCategory", f.strengthCategory.join(","));
  if (f.equipment.length > 0) params.set("equipment", f.equipment.join(","));
  if (f.muscleGroup.length > 0) params.set("muscleGroup", f.muscleGroup.join(","));
  if (sort !== DEFAULT_SORT) params.set("sort", sort);
  if (f.searchQuery) params.set("search", f.searchQuery);
  return params;
}
