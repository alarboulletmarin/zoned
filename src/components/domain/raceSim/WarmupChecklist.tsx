import { useTranslation } from "react-i18next";
import type { Exercise } from "@/data/guides/warmup/types";
import { usePickLang } from "@/lib/i18n-utils";
import { Checklist, type ChecklistEntry } from "./Checklist";
import {
  exerciseSeconds,
  formatShortDuration,
  minutesToTime,
  timeToMinutes,
} from "./utils";

/**
 * The warm-up, as a timed checklist rather than nine paragraphs.
 *
 * This is the block you read standing in the corral, so every line carries the
 * clock time it starts at and how long it lasts — the block header claimed a
 * total duration that none of the items accounted for.
 */
export function WarmupChecklist({
  exercises,
  startTime,
  totalDurationMin,
  checked,
  onToggle,
}: {
  exercises: Exercise[];
  startTime: string;
  totalDurationMin: number;
  checked: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  const { t } = useTranslation("simulator");
  const pick = usePickLang();

  const startMin = timeToMinutes(startTime);
  let offsetSec = 0;

  const entries: ChecklistEntry[] = exercises.map((ex, i) => {
    const seconds = exerciseSeconds(ex);
    const time = minutesToTime(startMin + Math.round(offsetSec / 60));
    offsetSec += seconds ?? 0;
    return {
      key: `warmup:${i}`,
      time,
      text: pick(ex, "name"),
      detail: pick(ex, "description"),
      meta: seconds ? formatShortDuration(seconds) : undefined,
    };
  });

  const endTime = minutesToTime(startMin + totalDurationMin);

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {t("warmup.window", {
          start: startTime,
          end: endTime,
          minutes: totalDurationMin,
        })}
      </p>
      <Checklist entries={entries} checked={checked} onToggle={onToggle} />
    </div>
  );
}
