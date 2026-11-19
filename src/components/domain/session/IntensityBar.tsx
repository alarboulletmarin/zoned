import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { QUALITY_FROM_ZONE, type IntensitySplit } from "@/lib/sessionFacts";
import type { ZoneNumber } from "@/types";

/** `Z1-Z2` et `Z3+`, écrits depuis la frontière des anneaux, jamais en dur. */
export const ENDURANCE_RANGE = `Z1-Z${QUALITY_FROM_ZONE - 1}`;
export const QUALITY_RANGE = `Z${QUALITY_FROM_ZONE}+`;

/**
 * La séance en deux segments, Endurance et Qualité, larges de leurs minutes.
 * C'est le résumé du profil qui la suit, sur la règle des anneaux de la
 * semaine (`enduranceQualityMinutes`). Les mots au-dessus disent ce que la
 * barre montre, l'`aria-label` le redit pour qui ne la voit pas.
 */
export function IntensityBar({
  split,
  peakZone,
}: {
  split: IntensitySplit;
  peakZone: ZoneNumber | null;
}) {
  const { t } = useTranslation("session");
  const endurance = formatDurationMinutes(split.enduranceMin);
  const quality = formatDurationMinutes(split.qualityMin);
  const label =
    t("page.intensityLabel", { endurance, quality }) +
    (peakZone != null ? t("page.intensityPeak", { zone: peakZone }) : "");

  return (
    <div className="zn-ibar" role="img" aria-label={label}>
      <div className="zn-ibar__legend" aria-hidden="true">
        <span>
          {t("page.endurance")} <span className="zn-ibar__range">{ENDURANCE_RANGE}</span> · {endurance}
        </span>
        <span>
          {t("page.quality")} <span className="zn-ibar__range">{QUALITY_RANGE}</span> · {quality}
        </span>
      </div>
      <div className="zn-ibar__bar" aria-hidden="true">
        {split.enduranceMin > 0 && (
          <span
            className="zn-ibar__part"
            data-kind="endurance"
            style={{ "--flex": split.enduranceMin } as CSSProperties}
          />
        )}
        {split.qualityMin > 0 && (
          <span
            className="zn-ibar__part"
            data-kind="quality"
            style={{ "--flex": split.qualityMin } as CSSProperties}
          />
        )}
      </div>
    </div>
  );
}
