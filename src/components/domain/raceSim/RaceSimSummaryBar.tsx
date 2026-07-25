import { useTranslation } from "react-i18next";
import { Settings } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The generated plan's inputs, folded into one line.
 *
 * Once a plan exists the form has done its job — keeping it expanded costs a
 * full column for values the reader already chose. This states them back and
 * hands the column to the plan.
 */
export function RaceSimSummaryBar({
  distanceLabel,
  timeLabel,
  paceLabel,
  startTime,
  strategyLabel,
  onAdjust,
  className,
}: {
  distanceLabel: string;
  timeLabel: string;
  paceLabel: string;
  startTime: string;
  strategyLabel: string;
  onAdjust: () => void;
  className?: string;
}) {
  const { t } = useTranslation("simulator");

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl border bg-card px-4 py-3",
        className,
      )}
    >
      <span className="text-base font-semibold tracking-tight">
        {distanceLabel}
      </span>
      <span className="font-mono text-base font-semibold tabular-nums tracking-tight">
        {timeLabel}
      </span>
      <span className="text-sm tabular-nums text-muted-foreground">
        {paceLabel}
      </span>
      <span className="text-sm text-muted-foreground">
        {t("summary.startAt", { time: startTime })}
      </span>
      {/* A chip rather than a "·" separator: the row wraps on narrow screens
          and a dangling bullet at the end of a line looks like a typo. */}
      <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
        {strategyLabel}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={onAdjust}
        className="ml-auto shrink-0"
      >
        <Settings className="size-3.5" />
        {t("inputs.adjust")}
      </Button>
    </div>
  );
}
