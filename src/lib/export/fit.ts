/**
 * FIT Export - Garmin format
 *
 * Creates Garmin FIT workout files from workout templates
 */

import type { WorkoutTemplate } from "@/types";
import { transformSessionBlocks } from "@/components/visualization/transforms";
import type { TimelineSegment, BlockType } from "@/components/visualization/types";

/**
 * FIT file type constants (from profile.js)
 */
const FIT_FILE_WORKOUT = 5;
const FIT_SPORT_RUNNING = 1;

/**
 * FIT intensity values (from profile.js)
 * 0 = active, 1 = rest, 2 = warmup, 3 = cooldown, 4 = recovery
 */
const FIT_INTENSITY = {
  ACTIVE: 0,
  REST: 1,
  WARMUP: 2,
  COOLDOWN: 3,
} as const;

/**
 * FIT workout step duration type (from profile.js)
 * 0 = time
 */
const FIT_WKT_STEP_DURATION_TIME = 0;

/**
 * FIT workout step target type (from profile.js)
 * 1 = heart_rate
 */
const FIT_WKT_STEP_TARGET_HEART_RATE = 1;

/**
 * Map block type to FIT workout step intensity
 */
function getIntensity(type: BlockType, isRecovery: boolean): number {
  if (isRecovery) return FIT_INTENSITY.REST;
  switch (type) {
    case "warmup":
      return FIT_INTENSITY.WARMUP;
    case "cooldown":
      return FIT_INTENSITY.COOLDOWN;
    case "main":
    default:
      return FIT_INTENSITY.ACTIVE;
  }
}

/**
 * Export workout to Garmin FIT format
 *
 * @param workout - The workout template to export
 * @returns Promise that resolves when download is triggered
 */
export async function exportToFIT(workout: WorkoutTemplate): Promise<void> {
  try {
    // @ts-expect-error - @garmin/fitsdk doesn't ship type definitions
    const { Encoder } = await import("@garmin/fitsdk");

    // Transform workout into segments using existing logic
    const { segments } = transformSessionBlocks(workout);

    // Create FIT encoder
    const encoder = new Encoder();

    // Write file ID message (required first message)
    encoder.onMesg(0, {
      // fileId message number = 0
      type: FIT_FILE_WORKOUT,
      manufacturer: 1, // Garmin
      product: 0,
      serialNumber: Date.now(),
      timeCreated: new Date(),
    });

    // Write workout message (message number = 26)
    encoder.onMesg(26, {
      sport: FIT_SPORT_RUNNING,
      numValidSteps: segments.length,
      wktName: (workout.nameEn || workout.name).substring(0, 64), // FIT string limit
    });

    // Write workout steps (message number = 27)
    segments.forEach((segment: TimelineSegment, index: number) => {
      const intensity = getIntensity(segment.type, segment.isRecovery);
      const targetHrZone = segment.zoneNumber || 2;
      // Duration in milliseconds (scale 1000 for seconds)
      const durationValue = Math.round(segment.durationMin * 60 * 1000);

      encoder.onMesg(27, {
        messageIndex: index,
        wktStepName: segment.description.substring(0, 32),
        durationType: FIT_WKT_STEP_DURATION_TIME,
        durationValue: durationValue, // milliseconds, will be scaled to seconds
        targetType: FIT_WKT_STEP_TARGET_HEART_RATE,
        targetHrZone,
        intensity,
      });
    });

    // Finish encoding and get file data
    const fitData = encoder.close();

    // Trigger download
    const blob = new Blob([fitData], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${workout.id}.fit`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Export failed:", error);
    throw error;
  }
}
