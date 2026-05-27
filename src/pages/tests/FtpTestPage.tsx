import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Zap, Save } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp } from "@/components/editorial";
import { cn } from "@/lib/utils";
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
        {/* Header */}
        <div className="mb-8">
          <EditorialTitle as="h1" className="mb-2 flex items-center gap-3">
            <Zap className="size-8 text-primary shrink-0" />
            {t("calculateurs.ftp.title")}
          </EditorialTitle>
          <FadeUp as="p" delay={0.1} className="text-muted-foreground text-lg">
            {t("calculateurs.ftp.description")}
          </FadeUp>
        </div>

        {/* Input card */}
        <Card className="mb-6">
          <CardContent className="pt-6 space-y-6">
            {/* Protocol toggle */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t("calculateurs.ftp.protocol")}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setProtocol("20min")}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    protocol === "20min"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input bg-background hover:bg-muted",
                  )}
                >
                  {t("calculateurs.ftp.protocol20min")}
                </button>
                <button
                  type="button"
                  onClick={() => setProtocol("ramp")}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
                    protocol === "ramp"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input bg-background hover:bg-muted",
                  )}
                >
                  {t("calculateurs.ftp.protocolRamp")}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {protocol === "20min"
                  ? t("calculateurs.ftp.protocol20minHelp")
                  : t("calculateurs.ftp.protocolRampHelp")}
              </p>
            </div>

            {/* Power input */}
            <div className="space-y-2">
              <label htmlFor="power" className="text-sm font-medium">
                {t("calculateurs.ftp.avgPowerWatts")}
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="power"
                  type="number"
                  min={0}
                  max={1500}
                  placeholder="250"
                  value={powerInput}
                  onChange={(e) => handlePowerInput(e.target.value)}
                  className="flex h-12 w-32 rounded-md border border-input bg-transparent px-3 py-1 text-center text-lg tabular-nums shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label={t("calculateurs.ftp.avgPowerWatts")}
                />
                <span className="text-sm text-muted-foreground">
                  {t("calculateurs.ftp.watts")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {estimatedFtp > 0 && zones?.power && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent rounded-xl border border-border/50">
              <CardContent className="py-8 flex flex-col items-center text-center">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t("calculateurs.ftp.estimatedFtp")}
                </p>
                <p className="text-5xl font-bold text-primary tabular-nums">
                  {estimatedFtp}
                </p>
                <p className="text-lg text-muted-foreground mt-1">
                  {t("calculateurs.ftp.watts")}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent rounded-xl border border-border/50">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">
                  {t("calculateurs.ftp.zonesPreview")}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th scope="col" className="py-2 px-3 text-left font-medium">
                          {t("calculateurs.ftp.zone")}
                        </th>
                        <th scope="col" className="py-2 px-3 text-left font-medium">
                          {t("calculateurs.ftp.power")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ZONE_ORDER.map((z) => (
                        <tr key={z} className="border-b last:border-b-0">
                          <td className="py-2 px-3">
                            <span className="inline-flex items-center gap-2 font-medium">
                              <span className={cn("size-3 rounded-full", ZONE_COLOR[z])} />
                              {t(`calculateurs.ftp.zoneLabel${z}`)}
                            </span>
                          </td>
                          <td className="py-2 px-3 tabular-nums">
                            {formatPowerRange(zones.power![z])}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

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
