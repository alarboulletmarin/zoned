import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Shuffle, Lock, LockOpen } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { WorkoutCardChrome } from "@/components/domain/WorkoutCard";
import { StrengthWorkoutCard } from "@/components/domain/StrengthWorkoutCard";
import { usePickLang } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";
import {
  isRunningWorkout,
  isStrengthWorkout,
  getDominantZone,
} from "@/types";
import type { AnyWorkoutTemplate } from "@/types";
import type { WeekSlot, SlotKind } from "@/types/week";

const KIND_LABEL: Record<Exclude<SlotKind, "rest">, string> = {
  easy: "weekly.kinds.easy",
  quality: "weekly.kinds.quality",
  long: "weekly.kinds.long",
};

/**
 * One day of the planned week. Reuses the canonical library cards
 * (WorkoutCardChrome / StrengthWorkoutCard) exactly like the "draw a session"
 * result, so the weekly view matches the rest of the app. The day label and
 * the lock / re-roll controls live outside the card link to avoid nesting an
 * anchor inside an anchor. (Epic #83 — UI pass)
 */
export function WeekDayCard({
  slot,
  flashWorkout,
  onToggleLock,
  onReroll,
}: {
  slot: WeekSlot;
  /** Non-null while this slot is being re-rolled (scan animation). */
  flashWorkout: AnyWorkoutTemplate | null;
  onToggleLock: () => void;
  onReroll: () => void;
}) {
  const { t } = useTranslation("library");
  const pick = usePickLang();
  const w = slot.workout;
  const dayName = t(`weekly.days.${slot.day}`);

  // Rest day — quiet, consistent surface.
  if (slot.kind === "rest" || !w) {
    return (
      <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-3 flex items-center gap-3">
        <span className="text-sm font-semibold text-muted-foreground w-24 shrink-0">
          {dayName}
        </span>
        <span className="text-sm text-muted-foreground">
          {t("weekly.slot.rest")}
        </span>
      </div>
    );
  }

  const zone = isStrengthWorkout(w) ? null : getDominantZone(w);

  return (
    <div className="space-y-2">
      {/* Day header + controls */}
      <div className="flex items-center justify-between gap-2 px-0.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{dayName}</span>
          <Badge
            variant="secondary"
            className={cn("font-medium", zone && `zone-${zone}`)}
            style={
              zone
                ? {
                    backgroundColor: `color-mix(in srgb, var(--zone-${zone}) 16%, transparent)`,
                    color: `var(--zone-${zone})`,
                  }
                : undefined
            }
          >
            {t(KIND_LABEL[slot.kind])}
          </Badge>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onReroll}
            disabled={flashWorkout != null}
            aria-label={t("weekly.slot.reroll")}
            title={t("weekly.slot.reroll")}
          >
            <Shuffle className="size-4" />
          </Button>
          <Button
            variant={slot.locked ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={onToggleLock}
            aria-pressed={slot.locked}
            aria-label={t(slot.locked ? "weekly.slot.unlock" : "weekly.slot.lock")}
            title={t(slot.locked ? "weekly.slot.unlock" : "weekly.slot.lock")}
          >
            {slot.locked ? (
              <Lock className="size-4" />
            ) : (
              <LockOpen className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Session card — scan flash while re-rolling, else the real card. */}
      {flashWorkout ? (
        <ScanCard workout={flashWorkout} pick={pick} />
      ) : (
        <div
          key={w.id}
          className={cn(
            "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-300",
            slot.locked && "rounded-xl ring-2 ring-primary/40",
          )}
        >
          {isRunningWorkout(w) ? (
            <Link to={`/workout/${w.id}`} className="block">
              <WorkoutCardChrome workout={w} showZoneBadges showPeek={false} />
            </Link>
          ) : (
            <Link to={`/workout/${w.id}`} className="block">
              <StrengthWorkoutCard workout={w} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

/** Flashing card shown while a slot is being re-rolled (mirrors DrawSessionPage). */
function ScanCard({
  workout,
  pick,
}: {
  workout: AnyWorkoutTemplate;
  pick: ReturnType<typeof usePickLang>;
}) {
  const zone = isRunningWorkout(workout) ? getDominantZone(workout) : 2;
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border p-5",
        `zone-${zone} bg-gradient-to-br from-zone-${zone}/10 to-transparent`,
      )}
      aria-hidden="true"
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in srgb, var(--primary) 35%, transparent), transparent)",
          animation: "draw-scan 0.6s linear infinite",
        }}
      />
      <style>{`@keyframes draw-scan { 0% { transform: translateX(-100%);} 100% { transform: translateX(400%);} }`}</style>
      <p className="text-lg font-semibold opacity-80 line-clamp-1">
        {pick(workout, "name")}
      </p>
      <p className="mt-2 text-sm text-muted-foreground line-clamp-2 opacity-70">
        {pick(workout, "description")}
      </p>
    </div>
  );
}
