import type { RaceDistance } from "@/types/plan";
import type {
  RunnerProfile,
  RaceTime,
  BenchmarkEntry,
  PersonalRecord,
} from "@/types/runner-profile";

const STORAGE_KEY = "zoned-runner-profile";

export function createEmptyProfile(): RunnerProfile {
  const now = new Date().toISOString();
  return {
    version: 1,
    performanceReferences: {},
    benchmarks: [],
    personalRecords: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function validateProfile(profile: RunnerProfile): RunnerProfile {
  const result = { ...profile };

  if (result.fcMax !== undefined) {
    if (!Number.isFinite(result.fcMax) || result.fcMax < 100 || result.fcMax > 250) {
      result.fcMax = undefined;
    }
  }

  if (result.vma !== undefined) {
    if (!Number.isFinite(result.vma) || result.vma < 8 || result.vma > 30) {
      result.vma = undefined;
    }
  }

  if (result.currentWeeklyKm !== undefined) {
    if (!Number.isFinite(result.currentWeeklyKm) || result.currentWeeklyKm < 0 || result.currentWeeklyKm > 500) {
      result.currentWeeklyKm = undefined;
    }
  }

  if (result.currentLongRunKm !== undefined) {
    if (!Number.isFinite(result.currentLongRunKm) || result.currentLongRunKm < 0 || result.currentLongRunKm > 200) {
      result.currentLongRunKm = undefined;
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

export function loadRunnerProfile(): RunnerProfile | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as RunnerProfile;
    return validateProfile(parsed);
  } catch {
    return null;
  }
}

export function saveRunnerProfile(profile: RunnerProfile): boolean {
  try {
    const validated = validateProfile(profile);
    validated.updatedAt = new Date().toISOString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(validated));
    return true;
  } catch {
    return false;
  }
}

export function clearRunnerProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function loadOrCreate(): RunnerProfile {
  return loadRunnerProfile() ?? createEmptyProfile();
}

export function updateBaseData(
  data: Partial<Pick<RunnerProfile, "fcMax" | "vma" | "currentWeeklyKm" | "currentLongRunKm" | "runnerLevel">>,
): boolean {
  const profile = loadOrCreate();
  Object.assign(profile, data);
  return saveRunnerProfile(profile);
}

export function setPerformanceReference(distance: RaceDistance, time: RaceTime): boolean {
  const profile = loadOrCreate();
  profile.performanceReferences[distance] = time;
  return saveRunnerProfile(profile);
}

export function removePerformanceReference(distance: RaceDistance): boolean {
  const profile = loadOrCreate();
  delete profile.performanceReferences[distance];
  return saveRunnerProfile(profile);
}

export function addBenchmark(entry: Omit<BenchmarkEntry, "id">): boolean {
  const profile = loadOrCreate();
  profile.benchmarks.push({ ...entry, id: crypto.randomUUID() });
  return saveRunnerProfile(profile);
}

export function updateBenchmark(id: string, updates: Partial<BenchmarkEntry>): boolean {
  const profile = loadOrCreate();
  const index = profile.benchmarks.findIndex((b) => b.id === id);
  if (index === -1) return false;
  profile.benchmarks[index] = { ...profile.benchmarks[index], ...updates };
  return saveRunnerProfile(profile);
}

export function deleteBenchmark(id: string): boolean {
  const profile = loadOrCreate();
  const before = profile.benchmarks.length;
  profile.benchmarks = profile.benchmarks.filter((b) => b.id !== id);
  if (profile.benchmarks.length === before) return false;
  return saveRunnerProfile(profile);
}

export function addPersonalRecord(record: PersonalRecord): boolean {
  const profile = loadOrCreate();
  profile.personalRecords.push(record);
  return saveRunnerProfile(profile);
}

export function updatePersonalRecord(index: number, record: PersonalRecord): boolean {
  const profile = loadOrCreate();
  if (index < 0 || index >= profile.personalRecords.length) return false;
  profile.personalRecords[index] = record;
  return saveRunnerProfile(profile);
}

export function deletePersonalRecord(index: number): boolean {
  const profile = loadOrCreate();
  if (index < 0 || index >= profile.personalRecords.length) return false;
  profile.personalRecords.splice(index, 1);
  return saveRunnerProfile(profile);
}

interface LegacyZonePrefs {
  fcMax?: number;
  vma?: number;
}

interface LegacyPlanConfig {
  currentWeeklyKm?: number;
  currentLongRunKm?: number;
  runnerLevel?: string;
  vma?: number;
  createdAt: string;
}

interface LegacyPlan {
  config: LegacyPlanConfig;
}

interface LegacyScenarioShared {
  runnerLevel?: string;
  currentWeeklyKm?: number;
  currentLongRunKm?: number;
}

interface LegacyScenario {
  savedAt: string;
  shared: LegacyScenarioShared;
}

export function migrateFromLegacyStorage(): RunnerProfile | null {
  try {
    const profile = createEmptyProfile();
    let hasData = false;

    // 1. zoned-userZones -> fcMax, vma
    const zonesRaw = localStorage.getItem("zoned-userZones");
    if (zonesRaw) {
      const zones = JSON.parse(zonesRaw) as LegacyZonePrefs;
      if (zones.fcMax !== undefined) { profile.fcMax = zones.fcMax; hasData = true; }
      if (zones.vma !== undefined) { profile.vma = zones.vma; hasData = true; }
    }

    // 2. zoned-plans -> most recent plan's config
    const plansRaw = localStorage.getItem("zoned-plans");
    if (plansRaw) {
      const plans = JSON.parse(plansRaw) as LegacyPlan[];
      if (Array.isArray(plans) && plans.length > 0) {
        const sorted = [...plans].sort(
          (a, b) => new Date(b.config.createdAt).getTime() - new Date(a.config.createdAt).getTime(),
        );
        const cfg = sorted[0].config;
        if (cfg.currentWeeklyKm !== undefined) { profile.currentWeeklyKm = cfg.currentWeeklyKm; hasData = true; }
        if (cfg.currentLongRunKm !== undefined) { profile.currentLongRunKm = cfg.currentLongRunKm; hasData = true; }
        if (cfg.runnerLevel !== undefined) {
          profile.runnerLevel = cfg.runnerLevel as RunnerProfile["runnerLevel"];
          hasData = true;
        }
        if (profile.vma === undefined && cfg.vma !== undefined) {
          profile.vma = cfg.vma;
          hasData = true;
        }
      }
    }

    // 3. zoned-whatif-scenarios -> fill remaining gaps
    const whatifRaw = localStorage.getItem("zoned-whatif-scenarios");
    if (whatifRaw) {
      const scenarios = JSON.parse(whatifRaw) as LegacyScenario[];
      if (Array.isArray(scenarios) && scenarios.length > 0) {
        const sorted = [...scenarios].sort(
          (a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime(),
        );
        const shared = sorted[0].shared;
        if (profile.runnerLevel === undefined && shared.runnerLevel !== undefined) {
          profile.runnerLevel = shared.runnerLevel as RunnerProfile["runnerLevel"];
          hasData = true;
        }
        if (profile.currentWeeklyKm === undefined && shared.currentWeeklyKm !== undefined) {
          profile.currentWeeklyKm = shared.currentWeeklyKm;
          hasData = true;
        }
        if (profile.currentLongRunKm === undefined && shared.currentLongRunKm !== undefined) {
          profile.currentLongRunKm = shared.currentLongRunKm;
          hasData = true;
        }
      }
    }

    return hasData ? validateProfile(profile) : null;
  } catch {
    return null;
  }
}

export function getRunnerProfileOrMigrate(): RunnerProfile | null {
  const existing = loadRunnerProfile();
  if (existing) return existing;

  const migrated = migrateFromLegacyStorage();
  if (migrated) {
    saveRunnerProfile(migrated);
    return loadRunnerProfile();
  }

  return null;
}
