/**
 * Transform session blocks into visualization-ready data
 * Key feature: Expands repetitions into individual segments
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
 * Parse recovery/rest string to get duration in minutes
 * "1min", "1'30", "90s", "récup 2min", "30s"
 */
function parseRecoveryDuration(recovery: string | undefined): number {
  if (!recovery) return 1; // Default 1 min

  const normalized = recovery.toLowerCase();

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

  return 1; // Fallback
}

/**
 * Transform a single block into timeline segments
 * CRITICAL: Expands repetitions into individual segments with recovery gaps
 */
function blockToSegments(
  block: WorkoutBlock,
  type: BlockType,
  startIndex: number
): TimelineSegment[] {
  const segments: TimelineSegment[] = [];
  const zoneNumber = parseZoneNumber(block.zone);

  // Calculate base duration for one rep
  let baseDuration = block.durationMin ?? 5; // Fallback 5 min

  const repetitions = block.repetitions ?? 1;
  const recoveryDuration = parseRecoveryDuration(block.rest);

  for (let rep = 0; rep < repetitions; rep++) {
    // Work segment
    segments.push({
      id: `${type}-${startIndex}-work-${rep}`,
      type,
      description: block.description,
      durationMin: baseDuration,
      zoneNumber,
      widthPercent: 0, // Calculated later
      isRecovery: false,
      repetitionIndex: repetitions > 1 ? rep + 1 : undefined,
      totalRepetitions: repetitions > 1 ? repetitions : undefined,
    });

    // Recovery segment (except after last rep)
    if (rep < repetitions - 1 && block.rest) {
      segments.push({
        id: `${type}-${startIndex}-recov-${rep}`,
        type,
        description: block.rest,
        durationMin: recoveryDuration,
        zoneNumber: 1, // Recovery is always Z1
        widthPercent: 0,
        isRecovery: true,
      });
    }
  }

  return segments;
}

/**
 * Transform session blocks into complete visualization data
 */
export function transformSessionBlocks(
  blocks: SessionBlocks,
  isEn: boolean = false
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
