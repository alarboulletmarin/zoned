import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check } from "@/components/icons";
import { Answer, NextSteps, Provenance, StepField, ToolHeader } from "@/components/calc";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { toast } from "@/components/ui/toast";
import { SEOHead } from "@/components/seo";
import {
  calculateCyclingZones,
  estimateFtpFrom20Min,
  estimateFtpFromRamp,
  formatPowerRange,
  type CogganZone,
} from "@/lib/planGenerator/cyclingPaceEngine";
import { FTP_WATTS_RANGE, loadCyclingProfile, updateCyclingBaseData } from "@/lib/athleteProfile";

type Protocol = "20min" | "ramp";

const ZONE_ORDER: CogganZone[] = ["Z1", "Z2", "Z3", "Z4", "Z5", "Z6", "Z7"];

/**
 * FTP : un test de puissance in, la FTP et les sept zones Coggan out. Sans
 * saisie, la page part de la FTP enregistrée, lue dans un effet (prérendu).
 */
export function FtpTestPage() {
  const { t } = useTranslation("calculators");
  const [protocol, setProtocol] = useState<Protocol>("20min");
  const [power, setPower] = useState<number | undefined>();
  const [savedFtp, setSavedFtp] = useState<number | undefined>();
  useEffect(() => setSavedFtp(loadCyclingProfile()?.ftpWatts), []);

  const estimated = power
    ? protocol === "20min"
      ? estimateFtpFrom20Min(power)
      : estimateFtpFromRamp(power)
    : undefined;
  const ftp = estimated || savedFtp;
  const zones = ftp ? calculateCyclingZones({ ftpWatts: ftp }).power : undefined;
  const same = estimated !== undefined && estimated === savedFtp;
  const savable = estimated !== undefined && estimated >= FTP_WATTS_RANGE[0] && estimated <= FTP_WATTS_RANGE[1];

  const save = () => {
    if (!savable) return;
    if (!updateCyclingBaseData({ ftpWatts: estimated })) {
      toast.failure(t("profile:base.saveFailed"));
      return;
    }
    setSavedFtp(estimated);
  };

  return (
    <>
      <SEOHead
        title={t("calculateurs.ftp.seoTitle")}
        description={t("calculateurs.ftp.seoDescription")}
        canonical="/calculators/ftp"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculateurs.ftp.seoAppName"),
            description: t("calculateurs.ftp.seoAppDescription"),
            url: "https://zoned.run/calculators/ftp",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculateurs.ftp.seoBreadcrumb") },
            ],
          },
        ]}
      />

      <div className="zn-calc">
        <ToolHeader kicker={t("calculateurs.ftp.kicker")} title={t("calculateurs.ftp.title")} />

        <div className="zn-calc-fields">
          <div className="zn-calc-field zn-calc-field--wide">
            <span className="zn-calc-field__label">{t("calculateurs.ftp.protocol")}</span>
            <Segmented
              label={t("calculateurs.ftp.protocol")}
              value={protocol}
              onChange={setProtocol}
              options={[
                { value: "20min", label: t("calculateurs.ftp.protocol20min") },
                { value: "ramp", label: t("calculateurs.ftp.protocolRamp") },
              ]}
            />
          </div>
          <StepField
            label={t("calculateurs.ftp.powerField")}
            unit="W"
            value={power}
            onChange={setPower}
            step={5}
            min={1}
            max={1500}
            fallback={protocol === "20min" ? 250 : 300}
          />
        </div>
        <p className="zn-calc-hint">
          {protocol === "20min" ? t("calculateurs.ftp.protocol20minHelp") : t("calculateurs.ftp.protocolRampHelp")}
        </p>

        {ftp && zones && (
          <>
            <Answer
              label={estimated ? t("calculateurs.ftp.estimatedFtp") : t("calculateurs.ftp.yourFtp")}
              value={ftp}
              unit="W"
            >
              {!same && (
                <p className="zn-calc-answer__say">
                  {!estimated
                    ? t("calculateurs.ftp.fromSaved")
                    : savedFtp === undefined
                      ? t("calculateurs.ftp.noSaved")
                      : t("calculateurs.ftp.compareSaved", { ftp: savedFtp })}
                </p>
              )}
              {savable && !same && (
                <div className="zn-calc-answer__actions">
                  <Button onClick={save}>{t("calculateurs.ftp.take", { ftp: estimated })}</Button>
                </div>
              )}
              {estimated && !savable && <p className="zn-calc-hint">{t("calculateurs.ftp.unsavable")}</p>}
              {estimated && same && (
                <p className="zn-calc-hint zn-zonesaved" aria-live="polite">
                  <Check size={16} />
                  {t("tools.zones.saved")}
                </p>
              )}
            </Answer>

            <section className="zn-calc-section">
              <h2 className="zn-calc-h2">{t("calculateurs.ftp.zonesPreview")}</h2>
              <div className="zn-calc-tablebox">
                <table className="zn-calc-table">
                  <thead>
                    <tr>
                      <th scope="col">{t("calculateurs.ftp.zone")}</th>
                      <th scope="col">{t("calculateurs.ftp.power")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ZONE_ORDER.map((zone) => (
                      <tr key={zone}>
                        <th scope="row">{t(`calculateurs.ftp.zoneLabel${zone}`)}</th>
                        <td>{formatPowerRange(zones[zone])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        <Provenance>
          <p>{t("calculateurs.ftp.provenance")}</p>
        </Provenance>

        <NextSteps links={[{ to: "/library?type=cycling", label: t("calculateurs.ftp.nextLibrary") }]} />
      </div>
    </>
  );
}
