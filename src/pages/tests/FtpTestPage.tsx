import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Save } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import {
  calculateCyclingZones,
  estimateFtpFrom20Min,
  estimateFtpFromRamp,
  formatPowerRange,
  type CogganZone,
} from "@/lib/planGenerator/cyclingPaceEngine";
import { updateCyclingBaseData } from "@/lib/athleteProfile";
import {
  CalculatorHero,
  CalculatorPanel,
  CalculatorLabel,
  CalculatorChip,
  CalculatorResultHeadline,
} from "@/components/calculators";

type Protocol = "20min" | "ramp";

const ZONE_ORDER: CogganZone[] = ["Z1", "Z2", "Z3", "Z4", "Z5", "Z6", "Z7"];

const ZONE_COLOR: Record<CogganZone, string> = {
  Z1: "bg-zone-1",
  Z2: "bg-zone-2",
  Z3: "bg-zone-3",
  Z4: "bg-zone-4",
  Z5: "bg-zone-5",
  Z6: "bg-zone-6",
  Z7: "bg-zone-6",
};

export function FtpTestPage() {
  const { t } = useTranslation("calculators");
  const [protocol, setProtocol] = useState<Protocol>("20min");
  const [powerInput, setPowerInput] = useState<string>("");

  const parsedPower = powerInput === "" ? 0 : parseInt(powerInput, 10);
  const validPower = Number.isFinite(parsedPower) && parsedPower > 0;

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
    if (num > 1500) {
      setPowerInput("1500");
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
      <div className="py-8 max-w-2xl mx-auto">
        <CalculatorHero
          groupLabel={t("calculateurs.groups.performance")}
          title={t("calculateurs.ftp.title")}
          description={t("calculateurs.ftp.description")}
        />

        {/* Input panel */}
        <CalculatorPanel className="mb-6 space-y-6">
          {/* Protocol toggle */}
          <div>
            <CalculatorLabel className="mb-2.5">
              {t("calculateurs.ftp.protocol")}
            </CalculatorLabel>
            <div className="grid grid-cols-2 gap-2">
              <CalculatorChip active={protocol === "20min"} onClick={() => setProtocol("20min")}>
                {t("calculateurs.ftp.protocol20min")}
              </CalculatorChip>
              <CalculatorChip active={protocol === "ramp"} onClick={() => setProtocol("ramp")}>
                {t("calculateurs.ftp.protocolRamp")}
              </CalculatorChip>
            </div>
            <p className="text-xs text-muted-foreground mt-2.5">
              {protocol === "20min"
                ? t("calculateurs.ftp.protocol20minHelp")
                : t("calculateurs.ftp.protocolRampHelp")}
            </p>
          </div>

          {/* Power input */}
          <div>
            <label htmlFor="power" className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              {t("calculateurs.ftp.avgPowerWatts")}
            </label>
            <div className="flex items-baseline gap-3 mt-2">
              <input
                id="power"
                type="number"
                min={0}
                max={1500}
                placeholder="250"
                value={powerInput}
                onChange={(e) => handlePowerInput(e.target.value)}
                className="w-28 border-0 border-b-[3px] border-foreground bg-transparent px-1 py-2 font-mono text-2xl tabular-nums focus-visible:outline-none"
                aria-label={t("calculateurs.ftp.avgPowerWatts")}
              />
              <span className="font-mono text-xs text-muted-foreground">
                {t("calculateurs.ftp.watts")}
              </span>
            </div>
          </div>
        </CalculatorPanel>

        {/* Results */}
        {estimatedFtp > 0 && zones?.power && (
          <div className="space-y-6">
            <CalculatorPanel className="flex flex-col items-center text-center py-8">
              <CalculatorResultHeadline
                label={t("calculateurs.ftp.estimatedFtp")}
                value={estimatedFtp}
                unit={t("calculateurs.ftp.watts")}
              />
            </CalculatorPanel>

            <CalculatorPanel>
              <CalculatorLabel className="mb-4">
                {t("calculateurs.ftp.zonesPreview")}
              </CalculatorLabel>
              <div className="border-2 border-border/70 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-ink text-paper font-mono text-[10px] tracking-[0.1em] uppercase">
                      <th scope="col" className="py-2.5 px-3 font-normal">
                        {t("calculateurs.ftp.zone")}
                      </th>
                      <th scope="col" className="py-2.5 px-3 font-normal">
                        {t("calculateurs.ftp.power")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ZONE_ORDER.map((z) => (
                      <tr key={z} className="border-t border-border/70">
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-2 font-mono text-[13px]">
                            <span className={cn("size-2.5", ZONE_COLOR[z])} />
                            {t(`calculateurs.ftp.zoneLabel${z}`)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[13px] tabular-nums">
                          {formatPowerRange(zones.power![z])}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CalculatorPanel>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleSave} className="flex-1">
                <Save className="size-4" />
                {t("calculateurs.ftp.useThisFtp")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
