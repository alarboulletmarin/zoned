import type { ZoneNumber, ZoneRange, UserZonePreferences } from "@/types";
import { loadRunnerProfile, saveRunnerProfile } from "@/lib/runnerProfile";

// HR Zone percentages (% of FCmax)
const HR_ZONE_PERCENTAGES: Record<ZoneNumber, [number, number]> = {
  1: [50, 60],
  2: [60, 70],
  3: [70, 80],
  4: [80, 90],
  5: [90, 100],
  6: [100, 110], // Sprint zone can exceed max
};

// VMA Zone percentages (% of VMA)
const VMA_ZONE_PERCENTAGES: Record<ZoneNumber, [number, number]> = {
  1: [50, 60],
  2: [60, 75],
  3: [75, 85],
  4: [85, 92],
  5: [92, 100],
  6: [100, 120], // Sprint can exceed VMA
};

/**
 * Calculate HR zones from max heart rate
 */
export function calculateHRZones(fcMax: number): ZoneRange[] {
  return ([1, 2, 3, 4, 5, 6] as ZoneNumber[]).map((zone) => {
    const [minPct, maxPct] = HR_ZONE_PERCENTAGES[zone];
    return {
      zone,
      hrMin: Math.round(fcMax * (minPct / 100)),
      hrMax: Math.round(fcMax * (maxPct / 100)),
    };
  });
}

/**
 * Convert VMA (km/h) to pace (min/km)
 */
function vmaToPace(vma: number, percentage: number): number {
  const speedKmh = vma * (percentage / 100);
  if (speedKmh <= 0) return 15; // Cap at 15 min/km for very slow
  const paceMinPerKm = 60 / speedKmh;
  return Math.round(paceMinPerKm * 100) / 100; // Round to 2 decimals
}

/**
 * Format pace as mm:ss
 */
export function formatPace(paceMinPerKm: number): string {
  const minutes = Math.floor(paceMinPerKm);
  const seconds = Math.round((paceMinPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Calculate pace zones from VMA
 */
export function calculatePaceZones(vma: number): ZoneRange[] {
  return ([1, 2, 3, 4, 5, 6] as ZoneNumber[]).map((zone) => {
    const [minPct, maxPct] = VMA_ZONE_PERCENTAGES[zone];
    // Note: higher % = faster speed = lower pace (min/km)
    return {
      zone,
      paceMinPerKm: vmaToPace(vma, maxPct), // Faster pace (lower number)
      paceMaxPerKm: vmaToPace(vma, minPct), // Slower pace (higher number)
    };
  });
}

/**
 * Validate user zone preferences, replacing invalid values with undefined
 */
export function validateZonePrefs(
  prefs: UserZonePreferences
): UserZonePreferences {
  const result: UserZonePreferences = { ...prefs };

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

  return result;
}

/**
 * Get combined zones with both HR and pace if available
 */
export function calculateAllZones(prefs: UserZonePreferences): ZoneRange[] {
  const validated = validateZonePrefs(prefs);
  const hrZones = validated.fcMax ? calculateHRZones(validated.fcMax) : null;
  const paceZones = validated.vma ? calculatePaceZones(validated.vma) : null;

  if (!hrZones && !paceZones) {
    return [];
  }

  return ([1, 2, 3, 4, 5, 6] as ZoneNumber[]).map((zone) => {
    const hr = hrZones?.find((z) => z.zone === zone);
    const pace = paceZones?.find((z) => z.zone === zone);

    return {
      zone,
      hrMin: hr?.hrMin,
      hrMax: hr?.hrMax,
      paceMinPerKm: pace?.paceMinPerKm,
      paceMaxPerKm: pace?.paceMaxPerKm,
    };
  });
}

// localStorage key
const STORAGE_KEY = "zoned-userZones";

/**
 * Save user zone preferences to localStorage.
 * Also syncs to runner profile if it exists (dual-write).
 */
export function saveUserZonePrefs(prefs: UserZonePreferences): void {
  const validated = validateZonePrefs(prefs);
  const data = { ...validated, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

  // Dual-write: sync to runner profile if it exists
  const profile = loadRunnerProfile();
  if (profile) {
    if (validated.fcMax !== undefined) profile.fcMax = validated.fcMax;
    if (validated.vma !== undefined) profile.vma = validated.vma;
    saveRunnerProfile(profile);
  }
}

/**
 * Load user zone preferences from localStorage.
 * Checks runner profile first (source of truth), falls back to legacy key.
 */
export function loadUserZonePrefs(): UserZonePreferences | null {
  try {
    const profile = loadRunnerProfile();
    if (profile && (profile.fcMax !== undefined || profile.vma !== undefined)) {
      return validateZonePrefs({ fcMax: profile.fcMax, vma: profile.vma });
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as UserZonePreferences;
    return validateZonePrefs(parsed);
  } catch {
    return null;
  }
}

/**
 * Clear user zone preferences
 */
export function clearUserZonePrefs(): void {
  localStorage.removeItem(STORAGE_KEY);
}
