import type {
  AthleteProfile,
  CyclingProfile,
  CyclingBenchmarkEntry,
  SwimmingProfile,
  SwimBenchmarkEntry,
  CommutePattern,
} from "@/types/athlete-profile";
import { loadRunnerProfile } from "@/lib/runnerProfile";

/**
 * Multi-discipline athlete profile storage.
 *
 * The existing running profile (zoned-runner-profile) is kept untouched —
 * this module only adds cycling/swimming/commute storage on the side. Users
 * with a pure running profile see zero change in behaviour.
 */

export const CYCLING_PROFILE_KEY = "zoned-cycling-profile";
export const SWIMMING_PROFILE_KEY = "zoned-swimming-profile";
export const COMMUTE_PATTERN_KEY = "zoned-commute-pattern";

// ── Cycling profile ────────────────────────────────────────────────

export function createEmptyCyclingProfile(): CyclingProfile {
  const now = new Date().toISOString();
  return {
    version: 1,
    benchmarks: [],
    personalRecords: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function validateCyclingProfile(profile: CyclingProfile): CyclingProfile {
  const result = { ...profile };

  if (result.ftpWatts !== undefined) {
    if (!Number.isFinite(result.ftpWatts) || result.ftpWatts < 50 || result.ftpWatts > 600) {
      result.ftpWatts = undefined;
    }
  }

  if (result.thresholdHr !== undefined) {
    if (!Number.isFinite(result.thresholdHr) || result.thresholdHr < 100 || result.thresholdHr > 220) {
      result.thresholdHr = undefined;
    }
  }

  if (result.fcMax !== undefined) {
    if (!Number.isFinite(result.fcMax) || result.fcMax < 100 || result.fcMax > 250) {
      result.fcMax = undefined;
    }
  }

  if (result.criticalPowerWatts !== undefined) {
    if (
      !Number.isFinite(result.criticalPowerWatts) ||
      result.criticalPowerWatts < 50 ||
      result.criticalPowerWatts > 700
    ) {
      result.criticalPowerWatts = undefined;
    }
  }

  if (result.currentWeeklyHours !== undefined) {
    if (
      !Number.isFinite(result.currentWeeklyHours) ||
      result.currentWeeklyHours < 0 ||
      result.currentWeeklyHours > 40
    ) {
      result.currentWeeklyHours = undefined;
    }
  }

  if (result.currentLongRideKm !== undefined) {
    if (
      !Number.isFinite(result.currentLongRideKm) ||
      result.currentLongRideKm < 0 ||
      result.currentLongRideKm > 500
    ) {
      result.currentLongRideKm = undefined;
    }
  }

  result.benchmarks = (result.benchmarks ?? []).filter(
    (b) => b.id && b.type && b.date && Number.isFinite(b.result) && b.result > 0,
  );

  result.personalRecords = (result.personalRecords ?? []).filter(
    (r) => Number.isFinite(r.timeSeconds) && r.timeSeconds > 0,
  );

  return result;
}

export function loadCyclingProfile(): CyclingProfile | null {
  try {
    const stored = localStorage.getItem(CYCLING_PROFILE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as CyclingProfile;
    return validateCyclingProfile(parsed);
  } catch {
    return null;
  }
}

export function saveCyclingProfile(profile: CyclingProfile): boolean {
  try {
    const validated = validateCyclingProfile(profile);
    validated.updatedAt = new Date().toISOString();
    localStorage.setItem(CYCLING_PROFILE_KEY, JSON.stringify(validated));
    return true;
  } catch {
    return false;
  }
}

export function clearCyclingProfile(): void {
  localStorage.removeItem(CYCLING_PROFILE_KEY);
}

function loadOrCreateCycling(): CyclingProfile {
  return loadCyclingProfile() ?? createEmptyCyclingProfile();
}

export function updateCyclingBaseData(
  data: Partial<
    Pick<
      CyclingProfile,
      | "ftpWatts"
      | "thresholdHr"
      | "fcMax"
      | "criticalPowerWatts"
      | "currentWeeklyHours"
      | "currentLongRideKm"
    >
  >,
): boolean {
  const profile = loadOrCreateCycling();
  Object.assign(profile, data);
  return saveCyclingProfile(profile);
}

export function addCyclingBenchmark(entry: Omit<CyclingBenchmarkEntry, "id">): boolean {
  const profile = loadOrCreateCycling();
  profile.benchmarks.push({ ...entry, id: crypto.randomUUID() });
  return saveCyclingProfile(profile);
}

export function deleteCyclingBenchmark(id: string): boolean {
  const profile = loadOrCreateCycling();
  const before = profile.benchmarks.length;
  profile.benchmarks = profile.benchmarks.filter((b) => b.id !== id);
  if (profile.benchmarks.length === before) return false;
  return saveCyclingProfile(profile);
}

// ── Swimming profile ───────────────────────────────────────────────

export function createEmptySwimmingProfile(): SwimmingProfile {
  const now = new Date().toISOString();
  return {
    version: 1,
    benchmarks: [],
    personalRecords: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function validateSwimmingProfile(profile: SwimmingProfile): SwimmingProfile {
  const result = { ...profile };

  if (result.cssSecPer100m !== undefined) {
    if (
      !Number.isFinite(result.cssSecPer100m) ||
      result.cssSecPer100m < 60 ||
      result.cssSecPer100m > 300
    ) {
      result.cssSecPer100m = undefined;
    }
  }

  if (result.thresholdHr !== undefined) {
    if (!Number.isFinite(result.thresholdHr) || result.thresholdHr < 100 || result.thresholdHr > 220) {
      result.thresholdHr = undefined;
    }
  }

  if (result.currentWeeklyMeters !== undefined) {
    if (
      !Number.isFinite(result.currentWeeklyMeters) ||
      result.currentWeeklyMeters < 0 ||
      result.currentWeeklyMeters > 100_000
    ) {
      result.currentWeeklyMeters = undefined;
    }
  }

  if (result.currentLongSwimMeters !== undefined) {
    if (
      !Number.isFinite(result.currentLongSwimMeters) ||
      result.currentLongSwimMeters < 0 ||
      result.currentLongSwimMeters > 20_000
    ) {
      result.currentLongSwimMeters = undefined;
    }
  }

  if (result.preferredPoolLength !== undefined) {
    if (result.preferredPoolLength !== 25 && result.preferredPoolLength !== 50) {
      result.preferredPoolLength = undefined;
    }
  }

  result.benchmarks = (result.benchmarks ?? []).filter(
    (b) => b.id && b.type && b.date && Number.isFinite(b.result) && b.result > 0,
  );

  result.personalRecords = (result.personalRecords ?? []).filter(
    (r) => Number.isFinite(r.timeSeconds) && r.timeSeconds > 0,
  );

  return result;
}

export function loadSwimmingProfile(): SwimmingProfile | null {
  try {
    const stored = localStorage.getItem(SWIMMING_PROFILE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as SwimmingProfile;
    return validateSwimmingProfile(parsed);
  } catch {
    return null;
  }
}

export function saveSwimmingProfile(profile: SwimmingProfile): boolean {
  try {
    const validated = validateSwimmingProfile(profile);
    validated.updatedAt = new Date().toISOString();
    localStorage.setItem(SWIMMING_PROFILE_KEY, JSON.stringify(validated));
    return true;
  } catch {
    return false;
  }
}

export function clearSwimmingProfile(): void {
  localStorage.removeItem(SWIMMING_PROFILE_KEY);
}

function loadOrCreateSwimming(): SwimmingProfile {
  return loadSwimmingProfile() ?? createEmptySwimmingProfile();
}

export function updateSwimmingBaseData(
  data: Partial<
    Pick<
      SwimmingProfile,
      | "cssSecPer100m"
      | "thresholdHr"
      | "currentWeeklyMeters"
      | "currentLongSwimMeters"
      | "preferredPoolLength"
    >
  >,
): boolean {
  const profile = loadOrCreateSwimming();
  Object.assign(profile, data);
  return saveSwimmingProfile(profile);
}

export function addSwimmingBenchmark(entry: Omit<SwimBenchmarkEntry, "id">): boolean {
  const profile = loadOrCreateSwimming();
  profile.benchmarks.push({ ...entry, id: crypto.randomUUID() });
  return saveSwimmingProfile(profile);
}

export function deleteSwimmingBenchmark(id: string): boolean {
  const profile = loadOrCreateSwimming();
  const before = profile.benchmarks.length;
  profile.benchmarks = profile.benchmarks.filter((b) => b.id !== id);
  if (profile.benchmarks.length === before) return false;
  return saveSwimmingProfile(profile);
}

// ── Commute pattern ────────────────────────────────────────────────

export function validateCommutePattern(pattern: CommutePattern): CommutePattern | null {
  if (pattern.discipline !== "cycling" && pattern.discipline !== "running") return null;
  if (!Array.isArray(pattern.daysOfWeek)) return null;
  const days = Array.from(
    new Set(pattern.daysOfWeek.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)),
  ).sort();
  if (days.length === 0) return null;
  if (!Number.isFinite(pattern.durationMin) || pattern.durationMin <= 0 || pattern.durationMin > 240) {
    return null;
  }
  return {
    version: 1,
    discipline: pattern.discipline,
    daysOfWeek: days,
    durationMin: pattern.durationMin,
    includeInPlan: Boolean(pattern.includeInPlan),
    updatedAt: new Date().toISOString(),
  };
}

export function loadCommutePattern(): CommutePattern | null {
  try {
    const stored = localStorage.getItem(COMMUTE_PATTERN_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as CommutePattern;
    return validateCommutePattern(parsed);
  } catch {
    return null;
  }
}

export function saveCommutePattern(pattern: CommutePattern): boolean {
  const validated = validateCommutePattern(pattern);
  if (!validated) return false;
  try {
    localStorage.setItem(COMMUTE_PATTERN_KEY, JSON.stringify(validated));
    return true;
  } catch {
    return false;
  }
}

export function clearCommutePattern(): void {
  localStorage.removeItem(COMMUTE_PATTERN_KEY);
}

// ── Composite athlete profile ──────────────────────────────────────

/**
 * Assemble the multi-discipline athlete profile from the three independent
 * storage keys. Any missing section is returned as `null` — callers opt in
 * to cross-training features per discipline.
 */
export function loadAthleteProfile(): AthleteProfile {
  return {
    version: 1,
    running: loadRunnerProfile(),
    cycling: loadCyclingProfile(),
    swimming: loadSwimmingProfile(),
    commute: loadCommutePattern(),
  };
}

/** True if the athlete has meaningful data in at least one non-running discipline. */
export function hasCrossTrainingData(profile: AthleteProfile): boolean {
  const c = profile.cycling;
  if (c && (c.ftpWatts !== undefined || c.thresholdHr !== undefined || c.currentWeeklyHours !== undefined)) {
    return true;
  }
  const s = profile.swimming;
  if (s && (s.cssSecPer100m !== undefined || s.currentWeeklyMeters !== undefined)) {
    return true;
  }
  if (profile.commute) return true;
  return false;
}
