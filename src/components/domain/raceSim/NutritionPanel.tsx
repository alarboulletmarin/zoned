import { useTranslation } from "react-i18next";
import { Info } from "@/components/icons";
import type { FuelingResult } from "@/data/guides/nutrition/calculator";
import { usePickLang } from "@/lib/i18n-utils";
import { Stat } from "./RaceSimSection";

/**
 * Fuelling figures — but only the ones that carry a number.
 *
 * Under an hour the correct plan is "eat nothing", and rendering that as
 * `0 g`, `0` gels and `—` reads like a failed calculation rather than advice.
 * The zero case gets a sentence instead, and the hydration figure stays
 * because it is the one thing that still matters.
 */
export function NutritionPanel({
  fuelingPlan,
  durationMin,
}: {
  fuelingPlan: FuelingResult;
  durationMin: number;
}) {
  const { t } = useTranslation("simulator");
  const pick = usePickLang();

  const needsCarbs = fuelingPlan.carbsPerHourG > 0;
  const durationLabel = formatEffortDuration(durationMin, t);

  return (
    <div
      className="zn-stack"
      style={{ "--gap": "var(--sp-10)" } as React.CSSProperties}
    >
      {needsCarbs ? (
        <div className="zn-rs-stats">
          <Stat
            label={t("nutrition.carbsPerHour")}
            value={`${fuelingPlan.carbsPerHourG} g`}
            hint={t("nutrition.totalCarbs", { total: fuelingPlan.totalCarbsG })}
          />
          <Stat
            label={t("nutrition.fluidPerHour")}
            value={`${fuelingPlan.fluidMlPerHour} ml`}
            hint={t("nutrition.totalFluid", { total: fuelingPlan.totalFluidMl })}
          />
          {fuelingPlan.gelCount > 0 && (
            <Stat
              label={t("nutrition.gelCount")}
              value={fuelingPlan.gelCount}
              hint={
                fuelingPlan.gelFrequencyMin > 0
                  ? t("nutrition.everyMin", {
                      min: fuelingPlan.gelFrequencyMin,
                    })
                  : undefined
              }
            />
          )}
        </div>
      ) : (
        <div
          className="zn-stack"
          style={{ "--gap": "var(--sp-8)" } as React.CSSProperties}
        >
          <p className="zn-rs-note">
            {t("nutrition.noCarbs", { duration: durationLabel })}
          </p>
          <Stat
            label={t("nutrition.fluidPerHour")}
            value={`${fuelingPlan.fluidMlPerHour} ml`}
            hint={t("nutrition.toThirst")}
          />
        </div>
      )}

      {fuelingPlan.tips.length > 0 && (
        <div
          className="zn-stack zn-rs-tips"
          style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}
        >
          <p className="zn-kicker">{t("nutrition.tips")}</p>
          <ul
            className="zn-stack zn-rs-tips__list"
            style={{ "--gap": "var(--sp-3)" } as React.CSSProperties}
          >
            {fuelingPlan.tips.map((tip, i) => (
              <li key={i} className="zn-rs-tips__item">
                <Info size={14} />
                <span>{pick(tip, "text")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatEffortDuration(
  minutes: number,
  t: (key: string, opts?: Record<string, unknown>) => string,
): string {
  const rounded = Math.round(minutes);
  if (rounded < 60) return t("nutrition.durationMin", { min: rounded });
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  return m === 0
    ? t("nutrition.durationH", { h })
    : t("nutrition.durationHM", { h, min: m });
}
