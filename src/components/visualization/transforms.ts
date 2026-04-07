/**
 * Transform session blocks into visualization-ready data
 * Key feature: Expands repetitions into individual segments
 * Handles complex patterns like "2x(12x 30s VMA / 30s récup)"
 */

import type { WorkoutBlock } from "@/types";
import type {
  TimelineSegment,
  ZoneBreakdown,
  SessionVisualizationData,
  ZoneNumber,
  SessionBlocks,
  BlockType,
} from "./types";
import { ZONES } from "./types";

/**
 * Parse zone string to zone number
 * Handles formats: "Z2", "z2", "Z1-Z2" (takes high), "80% VMA" → Z5, etc.
 */
export function parseZoneNumber(zone: string | undefined): ZoneNumber | null {
  if (!zone) return null;

  const normalized = zone.toLowerCase().trim();

  // Zone range: "z1-z2", "z3-4", "Z1-Z2" → take high zone
  const rangeMatch = normalized.match(/z(\d)\s*[-–—]\s*z?(\d)/);
  if (rangeMatch) {
    const high = parseInt(rangeMatch[2], 10);
    if (high >= 1 && high <= 6) return high as ZoneNumber;
  }

  // Direct zone reference: "z1", "z2", etc.
  const zMatch = normalized.match(/z(\d)/);
  if (zMatch) {
    const num = parseInt(zMatch[1], 10);
    if (num >= 1 && num <= 6) return num as ZoneNumber;
  }

  // VMA percentage mapping
  const vmaMatch = normalized.match(/(\d+)%?\s*vma/);
  if (vmaMatch) {
    const pct = parseInt(vmaMatch[1], 10);
    if (pct <= 60) return 1;
    if (pct <= 75) return 2;
    if (pct <= 85) return 3;
    if (pct <= 92) return 4;
    if (pct <= 100) return 5;
    return 6;
  }

  // HR zone keywords
  if (normalized.includes("récup") || normalized.includes("recovery")) return 1;
  if (normalized.includes("endurance") || normalized.includes("easy")) return 2;
  if (normalized.includes("tempo") || normalized.includes("allure")) return 3;
  if (normalized.includes("threshold") || normalized.includes("seuil")) return 4;
  if (normalized.includes("vo2") || normalized.includes("vma")) return 5;
  if (normalized.includes("sprint") || normalized.includes("anaerob")) return 6;

  return null;
}

/**
 * Parse duration from string
 * Handles: "30s", "1min", "1'30", "90s", "2min", "400m" (estimate)
 */
function parseDuration(text: string | undefined, defaultMin: number = 1): number {
  if (!text) return defaultMin;

  const normalized = text.toLowerCase().trim();

  // Match "Xmin" or "X min"
  const minMatch = normalized.match(/(\d+(?:\.\d+)?)\s*min/);
  if (minMatch) return parseFloat(minMatch[1]);

  // Match "X'YY" format (e.g., "1'30")
  const primeMatch = normalized.match(/(\d+)'(\d+)/);
  if (primeMatch) {
    return parseInt(primeMatch[1], 10) + parseInt(primeMatch[2], 10) / 60;
  }

  // Match "Xs" or "X sec" or "Xsec"
  const secMatch = normalized.match(/(\d+)\s*s(?:ec)?/);
  if (secMatch) return parseInt(secMatch[1], 10) / 60;

  // Match distance "Xm" - estimate based on Z5 pace (~4min/km)
  const meterMatch = normalized.match(/(\d+)\s*m(?:ètre)?s?\b/);
  if (meterMatch) {
    const meters = parseInt(meterMatch[1], 10);
    return (meters / 1000) * 4; // ~4min/km at VO2max
  }

  return defaultMin;
}

/**
 * Estimate duration from distance (meters) and zone.
 * Uses zone-appropriate pace: easy zones are slower, intense zones faster.
 */
function estimateMinutesFromDistance(
  distanceM: number | undefined,
  zone: ZoneNumber | null,
): number {
  if (!distanceM) return 5; // fallback default
  // Pace in min/km by zone
  const paceByZone: Record<number, number> = {
    1: 6.5, 2: 6.0, 3: 5.5, 4: 5.0, 5: 4.0, 6: 3.5,
  };
  const pace = paceByZone[zone ?? 3] ?? 5.0;
  return (distanceM / 1000) * pace;
}

/**
 * Parse interval pattern from description
 * Handles: "2x(12x 30s VMA / 30s récup)", "3x(8x 400m / 200m récup)"
 * Returns: { sets, repsPerSet, workDuration, recoveryDuration }
 */
interface IntervalPattern {
  sets: number;
  repsPerSet: number;
  workDuration: number; // minutes
  recoveryDuration: number; // minutes (between reps)
  recoveryZone: ZoneNumber; // zone for recovery segments
  seriesRecovery: number; // minutes (between sets)
}

/**
 * Extract duration from description patterns like "6x(2min VMA...)" or "8x 30s..."
 */
function parseDurationFromDescription(desc: string): number {
  // Match "Nx(Ymin ..." or "Nx Ys ..." patterns
  const match = desc.match(/\d+\s*x\s*\(?\s*(\d+\s*(?:s|sec|min|m))/i);
  return match ? parseDuration(match[1]) : 1;
}

function parseIntervalPattern(description: string, block: WorkoutBlock): IntervalPattern | null {
  const desc = description.toLowerCase();

  // Pattern: Nx(Mx duration / duration récup)
  // Examples: "2x(12x 30s VMA / 30s récup)", "3x(8x 400m / 200m récup)"
  const fullPattern = desc.match(/(\d+)\s*x\s*\((\d+)\s*x\s*(\d+\s*(?:s|sec|min|m|'?\d*))[^/]*\/\s*(\d+\s*(?:s|sec|min|m|'?\d*)[^)]*)\)/i);

  if (fullPattern) {
    const sets = parseInt(fullPattern[1], 10);
    const repsPerSet = parseInt(fullPattern[2], 10);
    const workDuration = parseDuration(fullPattern[3]);
    const recovText = fullPattern[4];
    const recoveryDuration = parseDuration(recovText);
    const recoveryZone = parseZoneNumber(recovText) ?? 1;

    return {
      sets,
      repsPerSet,
      workDuration,
      recoveryDuration,
      recoveryZone,
      seriesRecovery: 3, // Default 3 minutes between sets
    };
  }

  // Pattern: Nx(duration zone / duration zone) or Nx(duration zone + duration zone)
  // Examples: "6x(2min VMA / 2min float Z3)", "8x(1min VMA + 2min Z2)"
  const parenPattern = desc.match(
    /(\d+)\s*x\s*\(\s*(\d+\s*(?:s|sec|min|m)[^/)+-]*)[/+]\s*(\d+\s*(?:s|sec|min|m)[^)]*)\)/i
  );

  if (parenPattern) {
    const reps = parseInt(parenPattern[1], 10);
    const workText = parenPattern[2];
    const recovText = parenPattern[3];
    const workDuration = parseDuration(workText);
    const recoveryDuration = parseDuration(recovText);
    const recoveryZone = parseZoneNumber(recovText) ?? 1;

    return {
      sets: 1,
      repsPerSet: reps,
      workDuration,
      recoveryDuration,
      recoveryZone,
      seriesRecovery: 0,
    };
  }

  // Simpler pattern: Nx duration / duration (like "12x 30s / 30s")
  const simplePattern = desc.match(/(\d+)\s*x\s*(\d+\s*(?:s|sec|min|m|'?\d*))[^/]*\/\s*(\d+\s*(?:s|sec|min|m|'?\d*)?)/i);

  if (simplePattern) {
    const reps = parseInt(simplePattern[1], 10);
    const workDuration = parseDuration(simplePattern[2]);
    const recovText = simplePattern[3];
    const recoveryDuration = parseDuration(recovText);
    const recoveryZone = parseZoneNumber(recovText) ?? 1;

    return {
      sets: 1,
      repsPerSet: reps,
      workDuration,
      recoveryDuration,
      recoveryZone,
      seriesRecovery: 0,
    };
  }

  // Fallback: use block.repetitions if present
  if (block.repetitions && block.repetitions > 1) {
    // Try to extract duration from distance, then description, fallback to 1
    const workDuration = block.durationMin
      ?? (block.distanceM ? estimateMinutesFromDistance(block.distanceM, parseZoneNumber(block.zone)) : null)
      ?? parseDurationFromDescription(description);
    // Use recovery field (or rest for backwards compatibility)
    const recoveryText = block.recovery ?? block.rest;
    const recoveryDuration = parseDuration(recoveryText);
    const recoveryZone = parseZoneNumber(recoveryText) ?? 1;

    return {
      sets: 1,
      repsPerSet: block.repetitions,
      workDuration,
      recoveryDuration,
      recoveryZone,
      seriesRecovery: 0,
    };
  }

  return null;
}

/**
 * Transform a single block into timeline segments
 * CRITICAL: Handles complex interval patterns with multiple sets
 */
function blockToSegments(
  block: WorkoutBlock,
  type: BlockType,
  startIndex: number
): TimelineSegment[] {
  const segments: TimelineSegment[] = [];
  const zoneNumber = parseZoneNumber(block.zone);

  // Try to parse interval pattern from description
  const pattern = parseIntervalPattern(block.description, block);

  if (pattern) {
    // Complex interval block with parsed pattern
    const { sets, repsPerSet, workDuration, recoveryDuration, recoveryZone, seriesRecovery } = pattern;
    const totalReps = sets * repsPerSet;
    let globalRepIndex = 0;
    const recoveryDesc = block.recovery || block.rest || "Récup";

    for (let set = 0; set < sets; set++) {
      // Add series recovery before this set (except first)
      if (set > 0 && seriesRecovery > 0) {
        segments.push({
          id: `${type}-${startIndex}-series-recov-${set}`,
          type,
          description: `Récup série ${set + 1}`,
          durationMin: seriesRecovery,
          zoneNumber: 1, // Series recovery is always easy
          widthPercent: 0,
          isRecovery: true,
          isSeriesRecovery: true,
        });
      }

      // Add reps for this set
      for (let rep = 0; rep < repsPerSet; rep++) {
        globalRepIndex++;

        // Work segment
        segments.push({
          id: `${type}-${startIndex}-work-${set}-${rep}`,
          type,
          description: block.description,
          durationMin: workDuration,
          zoneNumber,
          widthPercent: 0,
          isRecovery: false,
          repetitionIndex: globalRepIndex,
          totalRepetitions: totalReps,
          setIndex: sets > 1 ? set + 1 : undefined,
          totalSets: sets > 1 ? sets : undefined,
        });

        // Recovery segment (except after last rep of last set)
        const isLastRepOfSet = rep === repsPerSet - 1;
        const isLastSet = set === sets - 1;

        if (!(isLastRepOfSet && isLastSet) && !isLastRepOfSet) {
          segments.push({
            id: `${type}-${startIndex}-recov-${set}-${rep}`,
            type,
            description: recoveryDesc,
            durationMin: recoveryDuration,
            zoneNumber: recoveryZone,
            widthPercent: 0,
            isRecovery: true,
          });
        }
      }
    }

    return segments;
  }

  // Simple block without interval pattern
  const baseDuration = block.durationMin ?? estimateMinutesFromDistance(block.distanceM, zoneNumber);
  const repetitions = block.repetitions ?? 1;
  const recoveryText = block.recovery ?? block.rest;
  const recoveryDuration = parseDuration(recoveryText);
  const simpleRecoveryZone = parseZoneNumber(recoveryText) ?? 1;

  for (let rep = 0; rep < repetitions; rep++) {
    // Work segment
    segments.push({
      id: `${type}-${startIndex}-work-${rep}`,
      type,
      description: block.description,
      durationMin: baseDuration,
      zoneNumber,
      widthPercent: 0,
      isRecovery: false,
      repetitionIndex: repetitions > 1 ? rep + 1 : undefined,
      totalRepetitions: repetitions > 1 ? repetitions : undefined,
    });

    // Recovery segment (except after last rep)
    if (rep < repetitions - 1 && recoveryText) {
      segments.push({
        id: `${type}-${startIndex}-recov-${rep}`,
        type,
        description: recoveryText,
        durationMin: recoveryDuration,
        zoneNumber: simpleRecoveryZone,
        widthPercent: 0,
        isRecovery: true,
      });
    }
  }

  return segments;
}

/**
 * Transform session blocks into complete visualization data.
 */
export function transformSessionBlocks(
  blocks: SessionBlocks,
  isEn: boolean = false,
): SessionVisualizationData {
  const allSegments: TimelineSegment[] = [];
  let segmentIndex = 0;

  // Process each block type in order
  const blockTypes: Array<{ type: BlockType; blocks: WorkoutBlock[] }> = [
    { type: "warmup", blocks: blocks.warmup },
    { type: "main", blocks: blocks.mainSet },
    { type: "cooldown", blocks: blocks.cooldown },
  ];

  for (const { type, blocks: typeBlocks } of blockTypes) {
    for (const block of typeBlocks) {
      const segments = blockToSegments(block, type, segmentIndex);
      allSegments.push(...segments);
      segmentIndex++;
    }
  }

  // Calculate total duration
  const totalDurationMin = allSegments.reduce(
    (sum, seg) => sum + seg.durationMin,
    0
  );

  // Calculate width percentages
  for (const segment of allSegments) {
    segment.widthPercent =
      totalDurationMin > 0 ? (segment.durationMin / totalDurationMin) * 100 : 0;
  }

  // Calculate zone breakdown
  const zoneTotals = new Map<ZoneNumber, number>();
  for (const segment of allSegments) {
    if (segment.zoneNumber) {
      const current = zoneTotals.get(segment.zoneNumber) ?? 0;
      zoneTotals.set(segment.zoneNumber, current + segment.durationMin);
    }
  }

  const zoneBreakdown: ZoneBreakdown[] = [];
  for (const [zone, duration] of zoneTotals) {
    const zoneInfo = ZONES[zone];
    zoneBreakdown.push({
      zone,
      durationMin: duration,
      percent: totalDurationMin > 0 ? (duration / totalDurationMin) * 100 : 0,
      label: isEn ? zoneInfo.nameEn : zoneInfo.name,
    });
  }
  // Sort by zone number
  zoneBreakdown.sort((a, b) => a.zone - b.zone);

  const hasZoneData = allSegments.some((s) => s.zoneNumber !== null);

  return {
    segments: allSegments,
    zoneBreakdown,
    totalDurationMin,
    hasZoneData,
  };
}

/**
 * Format duration in minutes to human-readable string
 */
export function formatDurationMinutes(minutes: number): string {
  if (minutes < 1) {
    return `${Math.round(minutes * 60)}s`;
  }
  if (minutes < 60) {
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    if (secs === 0) return `${mins}min`;
    return `${mins}min${secs.toString().padStart(2, "0")}`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h${mins.toString().padStart(2, "0")}` : `${hours}h`;
}

/**
 * Get accurate workout duration by parsing all blocks including complex interval patterns
 * This is the single source of truth for workout duration calculations
 */
export function getWorkoutDuration(workout: {
  warmupTemplate?: WorkoutBlock[];
  mainSetTemplate: WorkoutBlock[];
  cooldownTemplate?: WorkoutBlock[];
}): number {
  const { totalDurationMin } = transformSessionBlocks(
    {
      warmup: workout.warmupTemplate ?? [],
      mainSet: workout.mainSetTemplate,
      cooldown: workout.cooldownTemplate ?? [],
    },
    false // isEn doesn't matter for duration calculation
  );
  return Math.round(totalDurationMin);
}
