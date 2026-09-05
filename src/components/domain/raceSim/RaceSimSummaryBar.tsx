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
    <div className={cn("zn-rs-summary", className)}>
      <span className="zn-rs-summary__distance">{distanceLabel}</span>
      <span className="zn-rs-summary__time">{timeLabel}</span>
      <span className="zn-rs-summary__fact">{paceLabel}</span>
      <span className="zn-rs-summary__note">
        {t("summary.startAt", { time: startTime })}
      </span>
      {/* A capsule rather than a "·" separator: the row wraps on narrow screens
          and a dangling bullet at the end of a line looks like a typo. */}
      <span className="zn-rs-summary__chip">{strategyLabel}</span>

      <Button variant="outline" size="sm" onClick={onAdjust} className="zn-push">
        <Settings />
        {t("inputs.adjust")}
      </Button>
    </div>
  );
}
