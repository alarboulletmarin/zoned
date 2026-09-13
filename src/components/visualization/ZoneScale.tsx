import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ZoneBadge } from "@/components/domain/ZoneBadge";
import type { ZoneNumber } from "./types";

const ALL_ZONES: ZoneNumber[] = [1, 2, 3, 4, 5, 6];

interface ZoneScaleProps {
  /** Row on a band, column in a sidebar. */
  layout?: "row" | "column";
  /** Restrict the legend to the zones actually painted nearby. Defaults to all
   *  six, a catalogue or a plan can hold any of them. A single session cannot:
   *  naming Z4, Z5 and Z6 under a session that never leaves Z3 is three rows of
   *  legend for colours that are not on the screen. */
  zones?: ZoneNumber[];
  /** Drop the mono title where the surrounding band already names the scale. */
  showTitle?: boolean;
  className?: string;
}

/**
 * The legend for the ink ramp.
 *
 * The ramp orders the zones, darker is harder, but it does not name them, so
 * every screen that paints zone fills shows this once.
 *
 * Each entry is the ZoneBadge itself with its name beside the code: the very
 * chip the reader meets in the steps and on the calendar, printed once and
 * named. It used to be three objects, a grey swatch, a code, a name, that
 * matched nothing else on the page and wrapped ragged on a phone. Names come
 * from ZONE_META through the badge, so the legend can never disagree with the
 * marks it explains.
 */
export function ZoneScale({
  layout = "row",
  zones = ALL_ZONES,
  showTitle = true,
  className,
}: ZoneScaleProps) {
  const { t } = useTranslation("common");

  return (
    <div className={cn("zn-zonescale", className)} data-layout={layout}>
      {showTitle && (
        <span className="zn-kicker zn-kicker--inline">
          {t("zones.scaleTitle")}
        </span>
      )}
      <span className="zn-zonescale__items">
        {zones.map((zone) => (
          <ZoneBadge key={zone} zone={zone} showLabel />
        ))}
      </span>
    </div>
  );
}
