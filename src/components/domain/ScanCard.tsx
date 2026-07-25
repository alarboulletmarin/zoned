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
      className={cn(
        "relative overflow-hidden border border-border",
        compact ? "rounded p-1.5" : "rounded-xl p-5",
        `zone-${zone} bg-gradient-to-br from-zone-${zone}/10 to-transparent`,
        className,
      )}
      aria-hidden="true"
    >
      {/* Accent scan line sweeping across the card */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 35%, transparent), transparent)",
          animation: "draw-scan 0.6s linear infinite",
        }}
      />
      <style>{`@keyframes draw-scan { 0% { transform: translateX(-100%);} 100% { transform: translateX(400%);} }`}</style>
      <p
        className={cn(
          "font-semibold opacity-80",
          compact
            ? "text-[10px] leading-tight line-clamp-3"
            : "text-lg line-clamp-1",
        )}
      >
        {pick(workout, "name")}
      </p>
      {/* The description never fits a day cell — the name alone carries the flicker. */}
      {!compact && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2 opacity-70">
          {pick(workout, "description")}
        </p>
      )}
    </div>
  );
}
