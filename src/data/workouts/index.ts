import type {
  AnyWorkoutTemplate,
  WorkoutTemplate,
  WorkoutCategory,
  WorkoutCategoryFile,
  Discipline,
} from "@/types";
import { normalizeSearch } from "@/lib/search-utils";

/**
 * Cross-discipline file shape: one JSON per non-running discipline.
 * Kept separate from WorkoutCategoryFile so the existing running category
 * loader stays untouched and the new disciplines can use the
 * "category-agnostic" bucket.
 */
interface DisciplineFile {
  discipline: Discipline;
  templates: WorkoutTemplate[];
}

// Export category list for iteration
export const categories: WorkoutCategory[] = [
  "recovery",
  "endurance",
  "tempo",
  "threshold",
  "vma_intervals",
  "long_run",
  "hills",
  "fartlek",
  "race_pace",
  "mixed",
  "assessment",
  "trail",
];

// ============================================================
// Lazy Loading API with Code-Splitting
// Each category is loaded as a separate chunk on demand
// ============================================================

// Cache for loaded categories
const categoryCache: Partial<Record<WorkoutCategory, WorkoutTemplate[]>> = {};

// Cache for all workouts
let allWorkoutsCache: WorkoutTemplate[] | null = null;

// Loading promises to prevent duplicate fetches
const categoryLoadingPromises: Partial<
  Record<WorkoutCategory, Promise<WorkoutTemplate[]>>
> = {};
let allWorkoutsLoadingPromise: Promise<WorkoutTemplate[]> | null = null;

// Dynamic import loaders for each category (explicit for proper code-splitting)
const categoryLoaders: Record<WorkoutCategory, () => Promise<WorkoutCategoryFile>> = {
  recovery: () => import("./recovery.json").then((m) => m.default as WorkoutCategoryFile),
  endurance: () => import("./endurance.json").then((m) => m.default as WorkoutCategoryFile),
  tempo: () => import("./tempo.json").then((m) => m.default as WorkoutCategoryFile),
  threshold: () => import("./threshold.json").then((m) => m.default as WorkoutCategoryFile),
  vma_intervals: () => import("./vma.json").then((m) => m.default as WorkoutCategoryFile),
  long_run: () => import("./long_run.json").then((m) => m.default as WorkoutCategoryFile),
  hills: () => import("./hills.json").then((m) => m.default as WorkoutCategoryFile),
  fartlek: () => import("./fartlek.json").then((m) => m.default as WorkoutCategoryFile),
  race_pace: () => import("./race_pace.json").then((m) => m.default as WorkoutCategoryFile),
  mixed: () => import("./mixed.json").then((m) => m.default as WorkoutCategoryFile),
  assessment: () => import("./assessment.json").then((m) => m.default as WorkoutCategoryFile),
  trail: () => import("./trail.json").then((m) => m.default as WorkoutCategoryFile),
};

// ============================================================
// Discipline-scoped loaders (cycling, swimming)
// Running stays on the per-category loaders above.
// ============================================================

type CrossDiscipline = Exclude<Discipline, "running">;

const disciplineCache: Partial<Record<CrossDiscipline, WorkoutTemplate[]>> = {};
const disciplineLoadingPromises: Partial<
  Record<CrossDiscipline, Promise<WorkoutTemplate[]>>
> = {};

const disciplineLoaders: Record<CrossDiscipline, () => Promise<DisciplineFile>> = {
  cycling: () => import("./cycling.json").then((m) => m.default as DisciplineFile),
  swimming: () => import("./swimming.json").then((m) => m.default as DisciplineFile),
};

/**
 * Load every workout for a non-running discipline lazily.
 * Each discipline is a single JSON file (one chunk) for now; the folder
 * structure of the plan can later split it further without touching the
 * public API.
 */
export async function loadDisciplineWorkouts(
  discipline: CrossDiscipline,
): Promise<WorkoutTemplate[]> {
  if (disciplineCache[discipline]) return disciplineCache[discipline]!;
  if (disciplineLoadingPromises[discipline]) {
    return disciplineLoadingPromises[discipline]!;
  }

  const promise = (async () => {
    const data = await disciplineLoaders[discipline]();
    disciplineCache[discipline] = data.templates;
    delete disciplineLoadingPromises[discipline];
    return data.templates;
  })();

  disciplineLoadingPromises[discipline] = promise;
  return promise;
}

/**
 * Synchronous accessor for already-loaded discipline workouts. Returns
 * undefined when the chunk has not been requested yet. Use this to skip a
 * loading flash in UIs where the data is already in memory.
 */
export function getDisciplineWorkoutsCached(
  discipline: CrossDiscipline,
): WorkoutTemplate[] | undefined {
  return disciplineCache[discipline];
}

/**
 * Test-only helper to clear the per-discipline workout cache. Real callers
 * should not need this because the cache is keyed by static JSON imports.
 */
export function _clearDisciplineWorkoutCache(): void {
  for (const key of Object.keys(disciplineCache) as CrossDiscipline[]) {
    delete disciplineCache[key];
  }
  for (const key of Object.keys(disciplineLoadingPromises) as CrossDiscipline[]) {
    delete disciplineLoadingPromises[key];
  }
}

/**
 * Load a single category lazily (with dynamic import for code-splitting)
 * Returns immediately from cache if available
 */
export async function loadCategory(
  category: WorkoutCategory
): Promise<WorkoutTemplate[]> {
  // Return from cache if available
  if (categoryCache[category]) {
    return categoryCache[category]!;
  }

  // Return existing promise if already loading
  if (categoryLoadingPromises[category]) {
    return categoryLoadingPromises[category]!;
  }

  // Create loading promise with dynamic import
  const loadPromise = (async () => {
    const loader = categoryLoaders[category];
    const data = await loader();
    categoryCache[category] = data.templates;
    delete categoryLoadingPromises[category];
    return data.templates;
  })();

  categoryLoadingPromises[category] = loadPromise;
  return loadPromise;
}

/**
 * Load all workouts lazily (parallel dynamic imports)
 * Returns immediately from cache if available
 */
export async function loadAllWorkouts(): Promise<WorkoutTemplate[]> {
  if (allWorkoutsCache) {
    return allWorkoutsCache;
  }

  // Return existing promise if already loading
  if (allWorkoutsLoadingPromise) {
    return allWorkoutsLoadingPromise;
  }

  // Create loading promise
  allWorkoutsLoadingPromise = (async () => {
    const results = await Promise.all(categories.map(loadCategory));
    allWorkoutsCache = results.flat();
    allWorkoutsLoadingPromise = null;
    return allWorkoutsCache;
  })();

  return allWorkoutsLoadingPromise;
}

/**
 * Get workouts by category (async)
 */
export async function getWorkoutsByCategory(
  category: WorkoutCategory
): Promise<WorkoutTemplate[]> {
  return loadCategory(category);
}

/**
 * Get workout by ID (async)
 * Loads all workouts if not cached.
 * Checks strength sessions for STR- prefixed IDs.
 *
 * Returns the `AnyWorkoutTemplate` union: an `STR-` id resolves to a strength
 * session, everything else to a running-shaped template. Narrow with
 * `isStrengthWorkout()` / `isRunningWorkout()` from `@/lib/workoutTemplate`.
 */
export async function getWorkoutById(
  id: string
): Promise<AnyWorkoutTemplate | undefined> {
  // Check custom workouts first for CUSTOM- prefixed IDs
  if (id.startsWith("CUSTOM-")) {
    const { getCustomWorkout } = await import("@/lib/customWorkoutStorage");
    return getCustomWorkout(id);
  }
  // Check strength sessions for STR- prefixed IDs
  if (id.startsWith("STR-")) {
    const { getStrengthSessionById } = await import("@/data/strength");
    return getStrengthSessionById(id);
  }
  // Cycling and swimming are on their own discipline loaders.
  if (id.startsWith("CYC-")) {
    const cycling = await loadDisciplineWorkouts("cycling");
    return cycling.find((w) => w.id === id);
  }
  if (id.startsWith("SWM-")) {
    const swimming = await loadDisciplineWorkouts("swimming");
    return swimming.find((w) => w.id === id);
  }
  const workouts = await loadAllWorkouts();
  return workouts.find((w) => w.id === id);
}

// Alias for backward compatibility (same as getWorkoutById but explicit async name)
export const getWorkoutByIdAsync = getWorkoutById;

/**
 * Get related workouts (variations) (async)
 */
export async function getRelatedWorkouts(
  workout: WorkoutTemplate
): Promise<WorkoutTemplate[]> {
  const workouts = await loadAllWorkouts();
  return workout.variationIds
    .map((vid) => workouts.find((w) => w.id === vid))
    .filter((w): w is WorkoutTemplate => w !== undefined);
}

// Alias for backward compatibility
export const getRelatedWorkoutsAsync = getRelatedWorkouts;

/**
 * Search workouts by name (supports both FR and EN) (async)
 */
export async function searchWorkouts(
  query: string
): Promise<WorkoutTemplate[]> {
  const workouts = await loadAllWorkouts();
  const { getCustomWorkouts } = await import("@/lib/customWorkoutStorage");
  const all = [...workouts, ...getCustomWorkouts()];
  const lowerQuery = normalizeSearch(query);
  return all.filter(
    (w) =>
      normalizeSearch(w.name).includes(lowerQuery) ||
      normalizeSearch(w.nameEn).includes(lowerQuery) ||
      normalizeSearch(w.description).includes(lowerQuery) ||
      normalizeSearch(w.descriptionEn).includes(lowerQuery)
  );
}

/**
 * Get category statistics (async)
 */
export async function getCategoryStats(): Promise<
  { category: WorkoutCategory; count: number }[]
> {
  const results = await Promise.all(
    categories.map(async (category) => {
      const workouts = await loadCategory(category);
      return { category, count: workouts.length };
    })
  );
  return results;
}


/**
 * Get total workout count (async)
 */
export async function getTotalWorkoutCount(): Promise<number> {
  const workouts = await loadAllWorkouts();
  return workouts.length;
}

/**
 * Check if all workouts are loaded in cache
 */
export function isAllWorkoutsLoaded(): boolean {
  return allWorkoutsCache !== null;
}

/**
 * Check if a category is loaded in cache
 */
export function isCategoryLoaded(category: WorkoutCategory): boolean {
  return categoryCache[category] !== undefined;
}

/**
 * Get all workouts from cache synchronously
 * Returns empty array if not loaded yet (use loadAllWorkouts for async loading)
 */
export function getAllWorkoutsSync(): WorkoutTemplate[] {
  return allWorkoutsCache || [];
}

/**
 * Get workouts by category from cache synchronously
 * Returns empty array if not loaded yet (use loadCategory for async loading)
 */
export function getWorkoutsByCategorySync(
  category: WorkoutCategory
): WorkoutTemplate[] {
  return categoryCache[category] || [];
}

// ============================================================
// Backward Compatibility Layer (DEPRECATED)
// Use async versions above instead
// These return empty/0 until loadAllWorkouts() is called via hooks
// ============================================================

/**
 * @deprecated Use loadAllWorkouts() with useWorkouts() hook instead
 * Returns all workouts from cache (empty array if not loaded)
 */
export const allWorkouts: WorkoutTemplate[] = new Proxy([] as WorkoutTemplate[], {
  get(target, prop) {
    if (allWorkoutsCache) {
      return Reflect.get(allWorkoutsCache, prop);
    }
    return Reflect.get(target, prop);
  },
});

/**
 * @deprecated Use loadCategory() or getWorkoutsByCategory() instead
 * Returns workouts by category from cache (empty array if not loaded)
 */
export const workoutsByCategory: Record<WorkoutCategory, WorkoutTemplate[]> = new Proxy(
  {} as Record<WorkoutCategory, WorkoutTemplate[]>,
  {
    get(target, prop) {
      if (prop in categoryCache) {
        return categoryCache[prop as WorkoutCategory];
      }
      // Return empty array for category access before load
      if (categories.includes(prop as WorkoutCategory)) {
        return [];
      }
      return Reflect.get(target, prop);
    },
  }
);

/**
 * @deprecated Use getTotalWorkoutCount() instead
 * Returns total workout count from cache (0 if not loaded)
 */
export const totalWorkoutCount = new Proxy({ value: 0 }, {
  get(_target, prop) {
    const count = allWorkoutsCache?.length ?? 0;
    if (prop === "valueOf" || prop === Symbol.toPrimitive) {
      return () => count;
    }
    if (prop === "toString") {
      return () => String(count);
    }
    return count;
  },
}) as unknown as number;

/**
 * @deprecated No longer needed - data loads on demand via hooks
 * Returns a resolved promise for backward compatibility
 */
export const workoutsReady: Promise<WorkoutTemplate[]> = Promise.resolve([]);
