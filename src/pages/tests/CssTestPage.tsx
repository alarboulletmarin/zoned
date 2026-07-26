import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Pool, Save } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp } from "@/components/editorial";
import { cn } from "@/lib/utils";
import {
  calculateSwimmingZones,
  estimateCssFrom400And200,
  formatSwimPace,
  formatSwimPaceRange,
  type SwimZone,
} from "@/lib/planGenerator/swimmingPaceEngine";
import { updateSwimmingBaseData } from "@/lib/athleteProfile";

const ZONE_ORDER: SwimZone[] = ["Z1", "Z2", "Z3", "Z4", "Z5", "Z6"];

const ZONE_COLOR: Record<SwimZone, string> = {
  Z1: "bg-zone-1",
  Z2: "bg-zone-2",
  Z3: "bg-zone-3",
  Z4: "bg-zone-4",
  Z5: "bg-zone-5",
  Z6: "bg-zone-6",
};

interface TimeInputProps {
  label: string;
  minutes: string;
  seconds: string;
  onMinutesChange: (v: string) => void;
  onSecondsChange: (v: string) => void;
  minutesLabel: string;
  secondsLabel: string;
}

function TimeInput({
  label,
  minutes,
  seconds,
  onMinutesChange,
  onSecondsChange,
  minutesLabel,
  secondsLabel,
}: TimeInputProps) {
  const handle = (value: string, setter: (v: string) => void, max: number) => {
    if (value === "") {
      setter("");
      return;
    }
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 0) return;
    if (num > max) {
      setter(String(max));
      return;
    }
    setter(String(num));
  };
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <input
            type="number"
            min={0}
            max={59}
            placeholder="0"
            value={minutes}
            onChange={(e) => handle(e.target.value, onMinutesChange, 59)}
            className="flex h-12 w-16 rounded-md border border-input bg-transparent px-2 py-1 text-center text-lg tabular-nums shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={minutesLabel}
          />
          <span className="text-xs text-muted-foreground mt-1">
            {minutesLabel}
          </span>
        </div>
        <span className="text-xl font-bold text-muted-foreground pb-4">:</span>
        <div className="flex flex-col items-center">
          <input
            type="number"
            min={0}
            max={59}
            placeholder="00"
            value={seconds}
            onChange={(e) => handle(e.target.value, onSecondsChange, 59)}
            className="flex h-12 w-16 rounded-md border border-input bg-transparent px-2 py-1 text-center text-lg tabular-nums shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={secondsLabel}
          />
          <span className="text-xs text-muted-foreground mt-1">
            {secondsLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

function parseSeconds(minutes: string, seconds: string): number {
  const m = minutes === "" ? 0 : parseInt(minutes, 10);
  const s = seconds === "" ? 0 : parseInt(seconds, 10);
  if (!Number.isFinite(m) || !Number.isFinite(s)) return 0;
  return m * 60 + s;
}

export function CssTestPage() {
  const { t } = useTranslation("calculators");

  const [m400, setM400] = useState<string>("");
  const [s400, setS400] = useState<string>("");
  const [m200, setM200] = useState<string>("");
  const [s200, setS200] = useState<string>("");

  const time400 = parseSeconds(m400, s400);
  const time200 = parseSeconds(m200, s200);

  const cssSecPer100m = useMemo(() => {
    if (time400 <= 0 || time200 <= 0) return 0;
    return estimateCssFrom400And200(time400, time200);
  }, [time400, time200]);

  const zones = useMemo(() => {
    if (cssSecPer100m <= 0) return null;
    return calculateSwimmingZones({ cssSecPer100m });
  }, [cssSecPer100m]);

  const handleSave = () => {
    if (cssSecPer100m <= 0) return;
    updateSwimmingBaseData({ cssSecPer100m });
    toast.success(
      t("calculateurs.css.cssSaved", { css: formatSwimPace(cssSecPer100m) }),
    );
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
      <div className="py-8 max-w-2xl mx-auto">
        <div className="mb-8">
          <EditorialTitle as="h1" className="mb-2 flex items-center gap-3">
            <Pool className="size-8 text-primary shrink-0" />
            {t("calculateurs.css.title")}
          </EditorialTitle>
          <FadeUp as="p" delay={0.1} className="text-muted-foreground text-lg">
            {t("calculateurs.css.description")}
          </FadeUp>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-6">
            <p className="text-xs text-muted-foreground">
              {t("calculateurs.css.protocolHelp")}
            </p>

            <TimeInput
              label={t("calculateurs.css.time400")}
              minutes={m400}
              seconds={s400}
              onMinutesChange={setM400}
              onSecondsChange={setS400}
              minutesLabel={t("calculateurs.css.minutes")}
              secondsLabel={t("calculateurs.css.seconds")}
            />

            <TimeInput
              label={t("calculateurs.css.time200")}
              minutes={m200}
              seconds={s200}
              onMinutesChange={setM200}
              onSecondsChange={setS200}
              minutesLabel={t("calculateurs.css.minutes")}
              secondsLabel={t("calculateurs.css.seconds")}
            />
          </CardContent>
        </Card>

        {cssSecPer100m > 0 && zones && (
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent rounded-xl border border-border/50">
              <CardContent className="py-8 flex flex-col items-center text-center">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  {t("calculateurs.css.estimatedCss")}
                </p>
                <p className="text-5xl font-bold text-primary tabular-nums">
                  {formatSwimPace(cssSecPer100m)}
                </p>
                <p className="text-lg text-muted-foreground mt-1">
                  {t("calculateurs.css.per100m")}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent rounded-xl border border-border/50">
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">
                  {t("calculateurs.css.zonesPreview")}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th scope="col" className="py-2 px-3 text-left font-medium">
                          {t("calculateurs.css.zone")}
                        </th>
                        <th scope="col" className="py-2 px-3 text-left font-medium">
                          {t("calculateurs.css.pace")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {ZONE_ORDER.map((z) => (
                        <tr key={z} className="border-b last:border-b-0">
                          <td className="py-2 px-3">
                            <span className="inline-flex items-center gap-2 font-medium">
                              <span className={cn("size-3 rounded-full", ZONE_COLOR[z])} />
                              {t(`calculateurs.css.zoneLabel${z}`)}
                            </span>
                          </td>
                          <td className="py-2 px-3 tabular-nums">
                            {formatSwimPaceRange(zones.zones[z])}
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
                {t("calculateurs.css.useThisCss")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
