import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { usePickLang } from "@/lib/i18n-utils";
import { ZONE_META } from "@/types";
import type { ZoneNumber } from "./types";

const ALL_ZONES: ZoneNumber[] = [1, 2, 3, 4, 5, 6];

interface ZoneScaleProps {
  /** Row on a band, column in a sidebar. */
  layout?: "row" | "column";
  /** Restrict the legend to the zones actually painted nearby. Defaults to all
   *  six — a catalogue or a plan can hold any of them. A single session cannot:
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
 * The ramp orders the zones — darker is harder — but it does not name them, so
 * every screen that paints zone fills shows this once. Names come from
 * ZONE_META, the same table the zone pages and badges read, so the legend can
 * never disagree with them.
 */
export function ZoneScale({
  layout = "row",
  zones = ALL_ZONES,
  showTitle = true,
  className,
}: ZoneScaleProps) {
  const { t } = useTranslation("common");
  const pick = usePickLang();

  return (
    <div className={cn("zn-zonescale", className)} data-layout={layout}>
      {showTitle && (
        <span className="zn-kicker zn-kicker--inline">
          {t("zones.scaleTitle")}
        </span>
      )}
      {zones.map((zone) => (
        <span key={zone} className="zn-zonescale__item">
          <span className="zn-zonescale__swatch" aria-hidden="true">
            <span className="zn-zonescale__fill" data-zone={zone} />
          </span>
          <span className="zn-zonescale__code">Z{zone}</span>
          <span className="zn-zonescale__name">
            {pick(ZONE_META[zone], "label")}
          </span>
        </span>
      ))}
    </div>
  );
}
