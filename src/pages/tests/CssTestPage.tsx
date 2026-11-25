import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "@/components/icons";
import { Answer, NextSteps, Provenance, StepChrono, ToolHeader } from "@/components/calc";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { SEOHead } from "@/components/seo";
import {
  calculateSwimmingZones,
  estimateCssFrom400And200,
  formatSwimPace,
  formatSwimPaceRange,
  type SwimZone,
} from "@/lib/planGenerator/swimmingPaceEngine";
import { CSS_SEC_PER_100M_RANGE, loadSwimmingProfile, updateSwimmingBaseData } from "@/lib/athleteProfile";

const ZONE_ORDER: SwimZone[] = ["Z1", "Z2", "Z3", "Z4", "Z5", "Z6"];

/**
 * CSS : un 400 m et un 200 m in, la CSS et six zones d'allure out. Sans
 * saisie, la page part de la CSS enregistrée, lue dans un effet (prérendu).
 */
export function CssTestPage() {
  const { t } = useTranslation("calculators");
  const [time400, setTime400] = useState<number | undefined>();
  const [time200, setTime200] = useState<number | undefined>();
  const [savedCss, setSavedCss] = useState<number | undefined>();
  useEffect(() => setSavedCss(loadSwimmingProfile()?.cssSecPer100m), []);

  const estimated = time400 && time200 ? estimateCssFrom400And200(time400, time200) || undefined : undefined;
  // Both times typed and no answer: the 400 was not slower than the 200.
  const orderError = !!time400 && !!time200 && estimated === undefined;
  const css = estimated ?? (orderError ? undefined : savedCss);
  const zones = css ? calculateSwimmingZones({ cssSecPer100m: css }).zones : undefined;
  const same = estimated !== undefined && estimated === savedCss;
  const savable = estimated !== undefined && estimated >= CSS_SEC_PER_100M_RANGE[0] && estimated <= CSS_SEC_PER_100M_RANGE[1];

  const save = () => {
    if (!savable) return;
    if (!updateSwimmingBaseData({ cssSecPer100m: estimated })) {
      toast.failure(t("profile:base.saveFailed"));
      return;
    }
    setSavedCss(estimated);
  };

  return (
    <>
      <SEOHead
        title={t("calculateurs.css.seoTitle")}
        description={t("calculateurs.css.seoDescription")}
        canonical="/calculators/css"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculateurs.css.seoAppName"),
            description: t("calculateurs.css.seoAppDescription"),
            url: "https://zoned.run/calculators/css",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculateurs.css.seoBreadcrumb") },
            ],
          },
        ]}
      />

      <div className="zn-calc">
        <ToolHeader kicker={t("calculateurs.css.kicker")} title={t("calculateurs.css.title")} />

        <div className="zn-calc-fields">
          <StepChrono
            label={t("calculateurs.css.time400")}
            format="ms"
            value={time400}
            onChange={setTime400}
            step={5}
            max={3599}
            fallback={360}
          />
          <StepChrono
            label={t("calculateurs.css.time200")}
            format="ms"
            value={time200}
            onChange={setTime200}
            step={5}
            max={3599}
            fallback={170}
          />
        </div>
        <p className="zn-calc-hint" role={orderError ? "alert" : undefined}>
          {orderError ? t("calculateurs.css.invalidOrder") : t("calculateurs.css.protocolHelp")}
        </p>

        {css && zones && (
          <>
            <Answer
              label={estimated ? t("calculateurs.css.estimatedCss") : t("calculateurs.css.yourCss")}
              value={formatSwimPace(css)}
              unit={t("calculateurs.css.per100m")}
            >
              {!same && (
                <p className="zn-calc-answer__say">
                  {!estimated
                    ? t("calculateurs.css.fromSaved")
                    : savedCss === undefined
                      ? t("calculateurs.css.noSaved")
                      : t("calculateurs.css.compareSaved", { css: formatSwimPace(savedCss) })}
                </p>
              )}
              {savable && !same && (
                <div className="zn-calc-answer__actions">
                  <Button onClick={save}>{t("calculateurs.css.take", { css: formatSwimPace(estimated) })}</Button>
                </div>
              )}
              {estimated && !savable && <p className="zn-calc-hint">{t("calculateurs.css.unsavable")}</p>}
              {same && (
                <p className="zn-calc-hint zn-zonesaved" aria-live="polite">
                  <Check size={16} />
                  {t("tools.zones.saved")}
                </p>
              )}
            </Answer>

            <section className="zn-calc-section">
              <h2 className="zn-calc-h2">{t("calculateurs.css.zonesPreview")}</h2>
              <div className="zn-calc-tablebox">
                <table className="zn-calc-table">
                  <thead>
                    <tr>
                      <th scope="col">{t("calculateurs.css.zone")}</th>
                      <th scope="col">{t("calculateurs.css.pace")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ZONE_ORDER.map((zone) => (
                      <tr key={zone}>
                        <th scope="row">{t(`calculateurs.css.zoneLabel${zone}`)}</th>
                        <td>{formatSwimPaceRange(zones[zone])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        <Provenance>
          <p>{t("calculateurs.css.provenance")}</p>
        </Provenance>

        <NextSteps links={[{ to: "/library?type=swimming", label: t("calculateurs.css.nextLibrary") }]} />
      </div>
    </>
  );
}
