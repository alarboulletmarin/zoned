import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { ZoneCalculator } from "@/components/domain/ZoneCalculator";
import { PaceCalculator } from "@/components/domain/PaceCalculator";
import { ZoneScale } from "@/components/visualization";
import { SEOHead } from "@/components/seo";

/**
 * Mes zones — the two calculators that turn one measured value into six
 * zones and a table of race paces. The legend appears once, above both,
 * because the ramp orders the zones without naming them.
 */
export function MyZonesPage() {
  const { t } = useTranslation("common");

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

        <div className="zn-num__legend">
          <ZoneScale />
        </div>

        <section
          className="zn-num__panel zn-stack"
          style={{ "--gap": "var(--sp-15)" } as CSSProperties}
        >
          <ZoneCalculator />
          <PaceCalculator />

          {/* A computed pace is a target, not a contract — and the source that
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
