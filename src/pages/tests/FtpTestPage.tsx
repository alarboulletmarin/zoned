import { useState, useMemo, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Save } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Segmented } from "@/components/ui/segmented";
import { PageContainer } from "@/components/layout/PageContainer";
import { SEOHead } from "@/components/seo";
import {
  calculateCyclingZones,
  estimateFtpFrom20Min,
  estimateFtpFromRamp,
  formatPowerRange,
  type CogganZone,
} from "@/lib/planGenerator/cyclingPaceEngine";
import { updateCyclingBaseData } from "@/lib/athleteProfile";

type Protocol = "20min" | "ramp";

const ZONE_ORDER: CogganZone[] = ["Z1", "Z2", "Z3", "Z4", "Z5", "Z6", "Z7"];

const MAX_WATTS = 1500;

export function FtpTestPage() {
  const { t } = useTranslation("calculators");
  const [protocol, setProtocol] = useState<Protocol>("20min");
  const [powerInput, setPowerInput] = useState<string>("");

  const parsedPower = powerInput === "" ? 0 : parseInt(powerInput, 10);
  const validPower = Number.isFinite(parsedPower) && parsedPower > 0;
  // Empty is not wrong, it is unanswered. A typed zero is wrong, and until now
  // it produced silence: the field says so out loud.
  const powerError = powerInput !== "" && !validPower;

  const estimatedFtp = useMemo(() => {
    if (!validPower) return 0;
    return protocol === "20min"
      ? estimateFtpFrom20Min(parsedPower)
      : estimateFtpFromRamp(parsedPower);
  }, [parsedPower, protocol, validPower]);

  const zones = useMemo(() => {
    if (estimatedFtp <= 0) return null;
    return calculateCyclingZones({ ftpWatts: estimatedFtp });
  }, [estimatedFtp]);

  const handleSave = () => {
    if (estimatedFtp <= 0) return;
    updateCyclingBaseData({ ftpWatts: estimatedFtp });
    toast.success(t("calculateurs.ftp.ftpSaved", { ftp: estimatedFtp }));
  };

  const handlePowerInput = (value: string) => {
    if (value === "") {
      setPowerInput("");
      return;
    }
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 0) return;
    if (num > MAX_WATTS) {
      setPowerInput(String(MAX_WATTS));
      return;
    }
    setPowerInput(String(num));
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

      <PageContainer width="narrow" className="zn-ct">
        {/* Mono kicker, display title, one sentence. */}
        <header
          className="zn-ct__head zn-stack"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <span className="zn-kicker">{t("calculateurs.ftp.kicker")}</span>
          <h1 className="zn-display" data-level="2">
            {t("calculateurs.ftp.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-ct__lede">
            {t("calculateurs.ftp.description")}
          </p>
        </header>

        {/* The test you did, and what it measured. */}
        <section className="zn-ct__band">
          <Card>
            <CardContent
              className="zn-stack"
              style={{ "--gap": "var(--sp-12)" } as CSSProperties}
            >
              <div
                className="zn-ct__field"
                style={{ "--gap": "var(--sp-5)" } as CSSProperties}
              >
                <span className="zn-kicker zn-kicker--inline">
                  {t("calculateurs.ftp.protocol")}
                </span>
                <Segmented
                  label={t("calculateurs.ftp.protocol")}
                  value={protocol}
                  onChange={setProtocol}
                  options={[
                    { value: "20min", label: t("calculateurs.ftp.protocol20min") },
                    { value: "ramp", label: t("calculateurs.ftp.protocolRamp") },
                  ]}
                />
                <p className="zn-ct__hint">
                  {protocol === "20min"
                    ? t("calculateurs.ftp.protocol20minHelp")
                    : t("calculateurs.ftp.protocolRampHelp")}
                </p>
              </div>

              <div className="zn-ct__field">
                <label htmlFor="power" className="zn-label">
                  {t("calculateurs.ftp.avgPowerWatts")}
                </label>
                <span
                  className="zn-numfield zn-ct__numfield"
                  data-invalid={powerError ? "true" : undefined}
                >
                  <input
                    id="power"
                    type="number"
                    min={0}
                    max={MAX_WATTS}
                    placeholder="250"
                    value={powerInput}
                    onChange={(e) => handlePowerInput(e.target.value)}
                    aria-invalid={powerError || undefined}
                    aria-describedby={powerError ? "power-error" : undefined}
                    className="zn-numfield__input"
                  />
                  <span className="zn-numfield__unit">
                    {t("calculateurs.ftp.watts")}
                  </span>
                </span>
                {powerError && (
                  <p id="power-error" className="zn-ct__error">
                    {t("calculateurs.ftp.invalidPower", { max: MAX_WATTS })}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {estimatedFtp > 0 && zones?.power && (
          <>
            {/* The answer, then what it implies, then the way to keep it. */}
            <section className="zn-ct__band">
              <div className="zn-ct__figure">
                <span className="zn-kicker">
                  {t("calculateurs.ftp.estimatedFtp")}
                </span>
                <p className="zn-ct__figure-value">{estimatedFtp}</p>
                <span className="zn-ct__figure-unit">
                  {t("calculateurs.ftp.watts")}
                </span>
              </div>
            </section>

            <section
              className="zn-ct__band zn-stack"
              style={{ "--gap": "var(--sp-13)" } as CSSProperties}
              aria-labelledby="ftp-zones"
            >
              <h2 id="ftp-zones" className="zn-title" data-level="3">
                {t("calculateurs.ftp.zonesPreview")}
              </h2>

              {/* Every zone is named in words in the first column, so this
                  table is its own legend: no ink ramp is painted here, and the
                  seven Coggan zones would not fit the six-step ramp anyway. */}
              <ResponsiveTable
                data={ZONE_ORDER}
                rowKey={(zone) => zone}
                columns={[
                  {
                    key: "zone",
                    header: t("calculateurs.ftp.zone"),
                    cell: (zone) => (
                      <span className="zn-ct__zonename">
                        {t(`calculateurs.ftp.zoneLabel${zone}`)}
                      </span>
                    ),
                  },
                  {
                    key: "power",
                    header: t("calculateurs.ftp.power"),
                    className: "zn-ct__num",
                    cell: (zone) => formatPowerRange(zones.power![zone]),
                  },
                ]}
                mobileCardTitle={(zone) =>
                  t(`calculateurs.ftp.zoneLabel${zone}`)
                }
              />

              <div className="zn-cluster" style={{ "--gap": "var(--sp-6)" } as CSSProperties}>
                <Button onClick={handleSave}>
                  <Save size={15} />
                  {t("calculateurs.ftp.useThisFtp")}
                </Button>
              </div>
            </section>
          </>
        )}
      </PageContainer>
    </>
  );
}
