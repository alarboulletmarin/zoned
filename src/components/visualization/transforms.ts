/**
 * Transform structured workout data into visualization-ready segments.
 */

import { pickLang } from "@/lib/i18n-utils";
import { parseZoneSpan } from "@/types";
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
 *
 * Delegates to `parseZoneSpan` so the timeline, the phase badges and the
 * breakdown can never disagree about what a zone string means.
 */
export function parseZoneNumber(zone: string | undefined): ZoneNumber | null {
  return parseZoneSpan(zone)?.max ?? null;
}

const UNZONED_LABEL = { name: "Sans zone", nameEn: "No zone" };

export function transformSessionBlocks(input: TransformInput): SessionVisualizationData {
  const source = normalizeInput(input);
  const flattened = flattenWorkoutSegments(source);

  const allSegments: TimelineSegment[] = flattened.map((segment, index) => ({
    id: `${segment.phase}-${index}`,
    type: segment.phase,
    description: segment.description,
    durationMin: segment.durationSec / 60,
    zoneSpec: segment.zone ?? undefined,
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

  // A range spec (`Z1-Z2`, `Z1-Z6`) spends time in every zone it spans, so
  // it is split evenly across them rather than dumped entirely on the hardest
  // one, a free fartlek is not 100% sprint. Segments with no zone at all
  // (drills, strides) get their own bar: they count toward the total, so
  // hiding them made the bars sum to less than 100%.
  const zoneTotals = new Map<ZoneNumber, number>();
  let unzonedMin = 0;

  for (const segment of allSegments) {
    const span = parseZoneSpan(segment.zoneSpec);
    if (!span) {
      unzonedMin += segment.durationMin;
      continue;
    }
    const zoneCount = span.max - span.min + 1;
    const share = segment.durationMin / zoneCount;
    for (let zone = span.min; zone <= span.max; zone++) {
      zoneTotals.set(zone as ZoneNumber, (zoneTotals.get(zone as ZoneNumber) ?? 0) + share);
    }
  }

  const toPercent = (durationMin: number) =>
    totalDurationMin > 0 ? (durationMin / totalDurationMin) * 100 : 0;

  const zoneBreakdown: ZoneBreakdown[] = [...zoneTotals.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([zone, durationMin]) => ({
      zone,
      durationMin,
      percent: toPercent(durationMin),
      label: pickLang(ZONES[zone], "name"),
    }));

  if (unzonedMin > 0.01) {
    zoneBreakdown.push({
      zone: null,
      durationMin: unzonedMin,
      percent: toPercent(unzonedMin),
      label: pickLang(UNZONED_LABEL, "name"),
    });
  }

  return {
    segments: allSegments,
    zoneBreakdown,
    totalDurationMin,
    hasZoneData: allSegments.some((segment) => segment.zoneNumber !== null),
  };
}

/** Espace insécable : 37 min ne se coupe jamais entre le nombre et l'unité. */
const NBSP = "\u00a0";

/**
 * Une durée en minutes, écrite d'une seule façon dans toute l'app, cartes de
 * partage et frises comprises : `37 min`, `2 min 30`, `1 h 05`, `2 h`,
 * `30 s`, avec une espace insécable entre le nombre et l'unité. Mêmes
 * sorties en français et en anglais.
 *
 * L'arrondi se fait une fois, à la seconde, avant le découpage : 59,999 min
 * donne `1 h` et pas `59 min 60`. Au-delà de l'heure, la minute suffit.
 * Zéro s'écrit `0`, sans unité : un compteur vide n'a pas besoin qu'on lui
 * dise en quoi il est vide.
 */
export function formatDurationMinutes(minutes: number): string {
  const totalSec = Math.max(0, Math.round((Number.isFinite(minutes) ? minutes : 0) * 60));
  if (totalSec === 0) return "0";
  if (totalSec < 60) return `${totalSec}${NBSP}s`;
  if (totalSec < 3600) {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (secs === 0) return `${mins}${NBSP}min`;
    return `${mins}${NBSP}min${NBSP}${secs.toString().padStart(2, "0")}`;
  }
  const totalMin = Math.round(totalSec / 60);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (mins === 0) return `${hours}${NBSP}h`;
  return `${hours}${NBSP}h${NBSP}${mins.toString().padStart(2, "0")}`;
}

export function getWorkoutDuration(workout: WorkoutStructureSource): number {
  return Math.round(getStructuredWorkoutDurationMinutes(workout));
}
