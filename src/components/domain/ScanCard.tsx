import { getDominantZone, isRunningWorkout } from "@/types";
import type { AnyWorkoutTemplate } from "@/types";
import { usePickLang } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";

/** Flashing card shown while a catalogue is being scanned (draw / week generator). */
export function ScanCard({
  workout,
  pick,
  className,
  compact = false,
}: {
  workout: AnyWorkoutTemplate;
  pick: ReturnType<typeof usePickLang>;
  className?: string;
  /** Board-cell sizing: matches a real day card so the flicker reads as one. */
  compact?: boolean;
}) {
  const zone = isRunningWorkout(workout) ? getDominantZone(workout) : 2;
  return (
    <div
      className={cn("zn-scan zn-zone-edge", className)}
      data-zone={zone}
      data-compact={compact ? "true" : undefined}
      aria-hidden="true"
    >
      {/* Accent band sweeping across the card */}
      <span className="zn-scan__sweep" />
      <p className="zn-scan__name">{pick(workout, "name")}</p>
      {/* The description never fits a day cell — the name alone carries the flicker. */}
      {!compact && <p className="zn-scan__desc">{pick(workout, "description")}</p>}
    </div>
  );
}
