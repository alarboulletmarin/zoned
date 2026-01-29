import type {
  WorkoutTemplate,
  WorkoutCategory,
  WorkoutCategoryFile,
} from "@/types";

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
};

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
 * Loads all workouts if not cached
 */
export async function getWorkoutById(
  id: string
): Promise<WorkoutTemplate | undefined> {
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
  const lowerQuery = query.toLowerCase();
  return workouts.filter(
    (w) =>
      w.name.toLowerCase().includes(lowerQuery) ||
      w.nameEn.toLowerCase().includes(lowerQuery) ||
      w.description.toLowerCase().includes(lowerQuery) ||
      w.descriptionEn.toLowerCase().includes(lowerQuery)
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
 * Get workout of the day (deterministic based on date) (async)
 */
export async function getWorkoutOfTheDay(): Promise<WorkoutTemplate> {
  const workouts = await loadAllWorkouts();
  const today = new Date();
  const seed =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
  const index = seed % workouts.length;
  return workouts[index];
}

// Alias for backward compatibility
export const getWorkoutOfTheDayAsync = getWorkoutOfTheDay;

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
// Backward Compatibility Layer
// These synchronous exports are DEPRECATED - use async versions above
// They will load all data on first access and return empty until loaded
// ============================================================

// Lazy-initialized sync access
let _allWorkoutsSync: WorkoutTemplate[] | null = null;
let _workoutsByCategorySync: Record<WorkoutCategory, WorkoutTemplate[]> | null = null;
let _totalWorkoutCountSync: number | null = null;

// Start loading immediately for backward compatibility
const initPromise = loadAllWorkouts().then((workouts) => {
  _allWorkoutsSync = workouts;
  _totalWorkoutCountSync = workouts.length;
  _workoutsByCategorySync = {} as Record<WorkoutCategory, WorkoutTemplate[]>;
  for (const cat of categories) {
    _workoutsByCategorySync[cat] = categoryCache[cat] || [];
  }
});

/**
 * @deprecated Use loadAllWorkouts() instead
 * Returns all workouts synchronously (may be empty on first access)
 */
export const allWorkouts: WorkoutTemplate[] = new Proxy([] as WorkoutTemplate[], {
  get(target, prop) {
    if (_allWorkoutsSync) {
      return Reflect.get(_allWorkoutsSync, prop);
    }
    return Reflect.get(target, prop);
  },
});

/**
 * @deprecated Use loadCategory() or getWorkoutsByCategory() instead
 * Returns workouts by category synchronously (may be empty on first access)
 */
export const workoutsByCategory: Record<WorkoutCategory, WorkoutTemplate[]> = new Proxy(
  {} as Record<WorkoutCategory, WorkoutTemplate[]>,
  {
    get(target, prop) {
      if (_workoutsByCategorySync && prop in _workoutsByCategorySync) {
        return _workoutsByCategorySync[prop as WorkoutCategory];
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
 * Returns total workout count (may be 0 on first access)
 */
export const totalWorkoutCount = new Proxy({ value: 0 }, {
  get(_target, prop) {
    if (prop === "valueOf" || prop === Symbol.toPrimitive) {
      return () => _totalWorkoutCountSync ?? 0;
    }
    if (prop === "toString") {
      return () => String(_totalWorkoutCountSync ?? 0);
    }
    return _totalWorkoutCountSync ?? 0;
  },
}) as unknown as number;

// Export init promise for components that need to wait
export { initPromise as workoutsReady };
