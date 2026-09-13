import { useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { ZoneCalculator } from "@/components/domain/ZoneCalculator";
import { PaceCalculator } from "@/components/domain/PaceCalculator";
import { ZoneFigures } from "@/components/domain/ZoneFigures";
import { SEOHead } from "@/components/seo";
import type { ZoneRange } from "@/types";

/**
 * Mes zones, the two calculators that turn one measured value into six
 * zones and a table of race paces. The zone plate appears once, above both:
 * six figures on one rule, and once the reader's numbers are known each
 * figure carries its own range under its code.
 */
export function MyZonesPage() {
  const { t } = useTranslation("common");
  const [zones, setZones] = useState<ZoneRange[]>([]);

  return (
    <>
      <SEOHead noindex={true} title={t("seo.myZones")} canonical="/my-zones" />

      <div className="zn-num">
        <section
          className="zn-num__head zn-stack"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <span className="zn-kicker">{t("myZones.kicker")}</span>
          <h1 className="zn-display" data-level="2">
            {t("myZones.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-num__lede">
            {t("myZones.description")}
          </p>
        </section>

        <ZoneFigures
          label={t("calculators:calculateurs.zones.figuresLabel")}
          zones={zones}
        />

        <section
          className="zn-num__panel zn-stack"
          style={{ "--gap": "var(--sp-15)" } as CSSProperties}
        >
          <ZoneCalculator onZonesChange={setZones} />
          <PaceCalculator />

          {/* A computed pace is a target, not a contract, and the source that
              says so, printed in mono under the block it backs. */}
          <div className="zn-num__caveat">
            <p className="zn-body zn-body--sm zn-muted">{t("myZones.caveat")}</p>
            <span className="zn-source">{t("myZones.source")}</span>
          </div>
        </section>
      </div>
    </>
  );
}
