import type {
  StrengthCategory,
  StrengthExercise,
  StrengthWorkoutTemplate,
  StrengthCategoryFile,
  StrengthSessionFile,
} from "@/types/strength";

// ── Category lists ────────────────────────────────────────────────

export const strengthCategories: StrengthCategory[] = [
  "runner_full_body",
  "runner_lower",
  "runner_core",
  "runner_upper",
  "plyometrics",
  "mobility",
  "prehab",
];

// ============================================================
// Lazy Loading API with Code-Splitting
// Mirrors the pattern from src/data/workouts/index.ts
// ============================================================

// ── Exercise caches ──────────────────────────────────────────────

const exerciseCache: Partial<Record<string, StrengthExercise[]>> = {};
let allExercisesCache: StrengthExercise[] | null = null;

const exerciseLoaders: Record<string, () => Promise<StrengthCategoryFile>> = {
  lower_body: () =>
    import("./exercises/lower_body.json").then((m) => m.default as unknown as StrengthCategoryFile),
  core: () =>
    import("./exercises/core.json").then((m) => m.default as unknown as StrengthCategoryFile),
  plyometrics: () =>
    import("./exercises/plyometrics.json").then((m) => m.default as unknown as StrengthCategoryFile),
  mobility: () =>
    import("./exercises/mobility.json").then((m) => m.default as unknown as StrengthCategoryFile),
  upper_body: () =>
    import("./exercises/upper_body.json").then((m) => m.default as unknown as StrengthCategoryFile),
};

const exerciseLoadingPromises: Partial<Record<string, Promise<StrengthExercise[]>>> = {};

export async function loadExercises(file: string): Promise<StrengthExercise[]> {
  if (exerciseCache[file]) return exerciseCache[file]!;
  if (exerciseLoadingPromises[file]) return exerciseLoadingPromises[file]!;

  const promise = (async () => {
    const loader = exerciseLoaders[file];
    if (!loader) return [];
    const data = await loader();
    exerciseCache[file] = data.exercises;
    delete exerciseLoadingPromises[file];
    return data.exercises;
  })();

  exerciseLoadingPromises[file] = promise;
  return promise;
}

export async function loadAllExercises(): Promise<StrengthExercise[]> {
  if (allExercisesCache) return allExercisesCache;

  const results = await Promise.all(
    Object.keys(exerciseLoaders).map(loadExercises)
  );
  allExercisesCache = results.flat();
  return allExercisesCache;
}

export async function getExerciseById(
  id: string
): Promise<StrengthExercise | undefined> {
  const exercises = await loadAllExercises();
  return exercises.find((e) => e.id === id);
}

// ── Session template caches ──────────────────────────────────────

const sessionCache: Partial<Record<StrengthCategory, StrengthWorkoutTemplate[]>> = {};
let allSessionsCache: StrengthWorkoutTemplate[] | null = null;

const sessionLoaders: Partial<
  Record<StrengthCategory, () => Promise<StrengthSessionFile>>
> = {
  runner_full_body: () =>
    import("./sessions/runner_full_body.json").then((m) => m.default as unknown as StrengthSessionFile),
  runner_lower: () =>
    import("./sessions/runner_lower.json").then((m) => m.default as unknown as StrengthSessionFile),
  runner_core: () =>
    import("./sessions/runner_core.json").then((m) => m.default as unknown as StrengthSessionFile),
  plyometrics: () =>
    import("./sessions/plyometrics.json").then((m) => m.default as unknown as StrengthSessionFile),
  mobility: () =>
    import("./sessions/mobility.json").then((m) => m.default as unknown as StrengthSessionFile),
};

const sessionLoadingPromises: Partial<
  Record<StrengthCategory, Promise<StrengthWorkoutTemplate[]>>
> = {};

export async function loadStrengthCategory(
  category: StrengthCategory
): Promise<StrengthWorkoutTemplate[]> {
  if (sessionCache[category]) return sessionCache[category]!;
  if (sessionLoadingPromises[category]) return sessionLoadingPromises[category]!;

  const promise = (async () => {
    const loader = sessionLoaders[category];
    if (!loader) return [];
    const data = await loader();
    sessionCache[category] = data.templates;
    delete sessionLoadingPromises[category];
    return data.templates;
  })();

  sessionLoadingPromises[category] = promise;
  return promise;
}

export async function loadAllStrengthSessions(): Promise<StrengthWorkoutTemplate[]> {
  if (allSessionsCache) return allSessionsCache;

  const cats = Object.keys(sessionLoaders) as StrengthCategory[];
  const results = await Promise.all(cats.map(loadStrengthCategory));
  allSessionsCache = results.flat();
  return allSessionsCache;
}

export async function getStrengthSessionById(
  id: string
): Promise<StrengthWorkoutTemplate | undefined> {
  const sessions = await loadAllStrengthSessions();
  return sessions.find((s) => s.id === id);
}

export async function searchStrengthSessions(
  query: string
): Promise<StrengthWorkoutTemplate[]> {
  const sessions = await loadAllStrengthSessions();
  const q = query.toLowerCase();
  return sessions.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.nameEn.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q) ||
      s.descriptionEn.toLowerCase().includes(q)
  );
}

export async function getStrengthCategoryStats(): Promise<
  { category: StrengthCategory; count: number }[]
> {
  const cats = Object.keys(sessionLoaders) as StrengthCategory[];
  const results = await Promise.all(
    cats.map(async (category) => {
      const sessions = await loadStrengthCategory(category);
      return { category, count: sessions.length };
    })
  );
  return results;
}

export async function getTotalStrengthCount(): Promise<number> {
  const sessions = await loadAllStrengthSessions();
  return sessions.length;
}

// ── Sync accessors (from cache) ──────────────────────────────────

export function getAllStrengthSessionsSync(): StrengthWorkoutTemplate[] {
  return allSessionsCache || [];
}

export function isStrengthLoaded(): boolean {
  return allSessionsCache !== null;
}
