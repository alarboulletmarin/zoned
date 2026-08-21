import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Save } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import {
  calculateSwimmingZones,
  estimateCssFrom400And200,
  formatSwimPace,
  formatSwimPaceRange,
  type SwimZone,
} from "@/lib/planGenerator/swimmingPaceEngine";
import { updateSwimmingBaseData } from "@/lib/athleteProfile";
import {
  CalculatorHero,
  CalculatorPanel,
  CalculatorLabel,
  CalculatorTimeField,
  CalculatorResultHeadline,
} from "@/components/calculators";

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
    <div>
      <CalculatorLabel className="mb-2.5">{label}</CalculatorLabel>
      <div className="flex items-end gap-2">
        <CalculatorTimeField
          value={minutes}
          onChange={(v) => handle(v, onMinutesChange, 59)}
          max={59}
          placeholder="0"
          unitLabel={minutesLabel}
          ariaLabel={minutesLabel}
        />
        <span className="pb-6 font-mono text-xl text-muted-foreground">:</span>
        <CalculatorTimeField
          value={seconds}
          onChange={(v) => handle(v, onSecondsChange, 59)}
          max={59}
          placeholder="00"
          unitLabel={secondsLabel}
          ariaLabel={secondsLabel}
        />
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
        <CalculatorHero
          groupLabel={t("calculateurs.groups.performance")}
          title={t("calculateurs.css.title")}
          description={t("calculateurs.css.description")}
        />

        <CalculatorPanel className="mb-6 space-y-6">
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
        </CalculatorPanel>

        {cssSecPer100m > 0 && zones && (
          <div className="space-y-6">
            <CalculatorPanel className="flex flex-col items-center text-center py-8">
              <CalculatorResultHeadline
                label={t("calculateurs.css.estimatedCss")}
                value={formatSwimPace(cssSecPer100m)}
                unit={t("calculateurs.css.per100m")}
              />
            </CalculatorPanel>

            <CalculatorPanel>
              <CalculatorLabel className="mb-4">
                {t("calculateurs.css.zonesPreview")}
              </CalculatorLabel>
              <div className="border-2 border-border/70 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-ink text-paper font-mono text-[10px] tracking-[0.1em] uppercase">
                      <th scope="col" className="py-2.5 px-3 font-normal">
                        {t("calculateurs.css.zone")}
                      </th>
                      <th scope="col" className="py-2.5 px-3 font-normal">
                        {t("calculateurs.css.pace")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ZONE_ORDER.map((z) => (
                      <tr key={z} className="border-t border-border/70">
                        <td className="py-2.5 px-3">
                          <span className="inline-flex items-center gap-2 font-mono text-[13px]">
                            <span className={cn("size-2.5", ZONE_COLOR[z])} />
                            {t(`calculateurs.css.zoneLabel${z}`)}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[13px] tabular-nums">
                          {formatSwimPaceRange(zones.zones[z])}
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
                {t("calculateurs.css.useThisCss")}
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
