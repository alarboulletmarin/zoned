/**
 * Types for session visualization components
 */

import type { WorkoutBlock, WorkoutRepeatUnit } from "@/types";

/**
 * Valid zone numbers (1-6)
 */
export type ZoneNumber = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * A segment in the timeline visualization
 * Each block (or repetition within a block) becomes a segment
 */
export interface TimelineSegment {
  id: string;
  type: BlockType;
  description: string;
  durationMin: number;
  zoneNumber: ZoneNumber | null;
  widthPercent: number;
  isRecovery: boolean;
  /** For repetition blocks: which rep is this (1-based) */
  repetitionIndex?: number;
  /** For repetition blocks: total reps in parent block */
  totalRepetitions?: number;
  /** For multi-set blocks: which set (1-based) */
  setIndex?: number;
  /** For multi-set blocks: total sets */
  totalSets?: number;
  /** Is this a longer recovery between sets? */
  isSeriesRecovery?: boolean;
  /** Unit of the loop this recovery belongs to */
  betweenUnit?: WorkoutRepeatUnit;
}

/**
 * Zone breakdown for distribution chart
 */
export interface ZoneBreakdown {
  zone: ZoneNumber;
  durationMin: number;
  percent: number;
  label: string;
}

/**
 * Complete visualization data for a session
 */
export interface SessionVisualizationData {
  segments: TimelineSegment[];
  zoneBreakdown: ZoneBreakdown[];
  totalDurationMin: number;
  hasZoneData: boolean;
}

/**
 * Props for block type sections
 */
export type BlockType = "warmup" | "main" | "cooldown";

/**
 * Raw blocks from session data
 */
export interface SessionBlocks {
  warmup: WorkoutBlock[];
  mainSet: WorkoutBlock[];
  cooldown: WorkoutBlock[];
}

/**
 * Zone metadata for display
 */
export const ZONES: Record<ZoneNumber, { name: string; nameEn: string }> = {
  1: { name: "Récupération", nameEn: "Recovery" },
  2: { name: "Endurance", nameEn: "Endurance" },
  3: { name: "Tempo", nameEn: "Tempo" },
  4: { name: "Seuil", nameEn: "Threshold" },
  5: { name: "VO2max", nameEn: "VO2max" },
  6: { name: "Sprint", nameEn: "Sprint" },
};
