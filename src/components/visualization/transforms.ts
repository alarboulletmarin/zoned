/**
 * Transform structured workout data into visualization-ready segments.
 */

import { pickLang } from "@/lib/i18n-utils";
import {
  flattenWorkoutSegments,
  getStructuredWorkoutDurationMinutes,
  type WorkoutStructureSource,
} from "@/lib/workoutStructure";
import type { ZoneNumber, TimelineSegment, ZoneBreakdown, SessionVisualizationData, SessionBlocks } from "./types";
import { ZONES } from "./types";

type TransformInput = SessionBlocks | WorkoutStructureSource;

function normalizeInput(input: TransformInput): WorkoutStructureSource {
  if ("mainSetTemplate" in input) return input;

  return {
    warmupTemplate: input.warmup,
    mainSetTemplate: input.mainSet,
    cooldownTemplate: input.cooldown,
  };
}

/**
 * Parse zone string to a dominant zone number.
 * Handles ranges and extended syntax like `Z4→Z5+`.
 */
export function parseZoneNumber(zone: string | undefined): ZoneNumber | null {
  if (!zone) return null;
  const matches = zone.match(/[1-6]/g);
  if (!matches || matches.length === 0) return null;
  return Math.max(...matches.map((match) => Number(match))) as ZoneNumber;
}

export function transformSessionBlocks(input: TransformInput): SessionVisualizationData {
  const source = normalizeInput(input);
  const flattened = flattenWorkoutSegments(source);

  const allSegments: TimelineSegment[] = flattened.map((segment, index) => ({
    id: `${segment.phase}-${index}`,
    type: segment.phase,
    description: segment.description,
    durationMin: segment.durationSec / 60,
    zoneNumber: parseZoneNumber(segment.zone ?? undefined),
    widthPercent: 0,
    isRecovery: segment.role === "recovery",
    repetitionIndex: segment.repetitionIndex,
    totalRepetitions: segment.totalRepetitions,
    setIndex: segment.setIndex,
    totalSets: segment.totalSets,
    isSeriesRecovery: segment.isBetweenRepeat && segment.betweenUnit === "sets",
    betweenUnit: segment.betweenUnit,
  }));

  const totalDurationMin = getStructuredWorkoutDurationMinutes(source);

  for (const segment of allSegments) {
    segment.widthPercent = totalDurationMin > 0 ? (segment.durationMin / totalDurationMin) * 100 : 0;
  }

  const zoneTotals = new Map<ZoneNumber, number>();
  for (const segment of allSegments) {
    if (!segment.zoneNumber) continue;
    const current = zoneTotals.get(segment.zoneNumber) ?? 0;
    zoneTotals.set(segment.zoneNumber, current + segment.durationMin);
  }

  const zoneBreakdown: ZoneBreakdown[] = [...zoneTotals.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([zone, durationMin]) => ({
      zone,
      durationMin,
      percent: totalDurationMin > 0 ? (durationMin / totalDurationMin) * 100 : 0,
      label: pickLang(ZONES[zone], "name"),
    }));

  return {
    segments: allSegments,
    zoneBreakdown,
    totalDurationMin,
    hasZoneData: allSegments.some((segment) => segment.zoneNumber !== null),
  };
}

/**
 * Format duration in minutes to human-readable string.
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

export function getWorkoutDuration(workout: WorkoutStructureSource): number {
  return Math.round(getStructuredWorkoutDurationMinutes(workout));
}
