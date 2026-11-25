import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Answer, formatDecimal, NextSteps, Provenance, StepChrono, StepField, ToolHeader, zoneOfVmaPct } from "@/components/calc";
import { Segmented } from "@/components/ui/segmented";
import { SEOHead } from "@/components/seo";
import { useMyNumbers } from "@/hooks/useMyNumbers";
import { usePickLang } from "@/lib/i18n-utils";
import { flatToTreadmillKmh, treadmillToFlatKmh } from "@/lib/treadmill";
import { formatPace } from "@/lib/zones";
import { ZONE_META } from "@/types";

type Way = "toOutside" | "toTreadmill";

function paramNumber(raw: string | null, fallback: number): number {
  const n = raw === null ? NaN : Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

/** Treadmill speed and incline to the flat pace it costs, and back. */
export function TreadmillConverterPage() {
  const { t, i18n } = useTranslation("calculators");
  const pickLang = usePickLang();
  const [searchParams] = useSearchParams();
  const { numbers } = useMyNumbers();
  const lang = i18n.language;

  const [way, setWay] = useState<Way>("toOutside");
  const [speed, setSpeed] = useState<number | undefined>(() => paramNumber(searchParams.get("speed"), 12));
  const [incline, setIncline] = useState<number | undefined>(() => paramNumber(searchParams.get("incline"), 1));
  // Outdoor pace in seconds per km, for the other direction.
  const [outPace, setOutPace] = useState<number | undefined>(300);

  const slope = incline ?? 0;
  const flatKmh = way === "toOutside" && speed !== undefined ? treadmillToFlatKmh(speed, slope) : undefined;
  const setKmh = way === "toTreadmill" && outPace !== undefined ? flatToTreadmillKmh(3600 / outPace, slope) : undefined;

  const vmaPct = flatKmh !== undefined && numbers.vma !== undefined ? Math.round((flatKmh / numbers.vma) * 100) : undefined;
  const zone = vmaPct === undefined ? undefined : zoneOfVmaPct(vmaPct);
  const km = (v: number) => formatDecimal(v, 1, lang);

  return (
    <>
      <SEOHead
        title={t("calculateurs.treadmill.seoTitle")}
        description={t("calculateurs.treadmill.seoDescription")}
        canonical="/calculators/tapis-roulant"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculateurs.treadmill.seoAppName"),
            description: t("calculateurs.treadmill.seoAppDescription"),
            url: "https://zoned.run/calculators/tapis-roulant",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculateurs.treadmill.seoBreadcrumb") },
            ],
          },
        ]}
      />

      <div className="zn-calc">
        <ToolHeader kicker={t("tools.tapis.kicker")} title={t("tools.tapis.title")} />

        <Segmented<Way>
          label={t("tools.tapis.way")}
          value={way}
          onChange={setWay}
          options={[
            { value: "toOutside", label: t("tools.tapis.toOutside") },
            { value: "toTreadmill", label: t("tools.tapis.toTreadmill") },
          ]}
        />

        <div className="zn-calc-fields">
          {way === "toOutside" ? (
            <StepField
              label={t("tools.tapis.speed")}
              unit="km/h"
              value={speed}
              onChange={setSpeed}
              step={0.1}
              min={4}
              max={25}
              decimals={1}
              fallback={10}
            />
          ) : (
            <StepChrono
              label={t("tools.tapis.outPace")}
              unit="/km"
              format="ms"
              value={outPace}
              onChange={setOutPace}
              step={5}
              min={140}
              max={900}
              fallback={300}
            />
          )}
          <StepField
            label={t("tools.tapis.incline")}
            unit="%"
            value={incline}
            onChange={setIncline}
            step={0.5}
            min={0}
            max={15}
            decimals={1}
            fallback={1}
          />
        </div>

        {way === "toOutside" ? (
          <Answer
            label={t("tools.tapis.answerOutside")}
            value={flatKmh === undefined ? "-" : formatPace(60 / flatKmh)}
            unit={flatKmh === undefined ? undefined : "/km"}
          >
            {flatKmh !== undefined && (
              <p className="zn-calc-answer__say">
                {vmaPct !== undefined && zone !== undefined ? (
                  t("tools.tapis.sayVma", {
                    kmh: km(flatKmh),
                    pct: vmaPct,
                    zone: `Z${zone} ${pickLang(ZONE_META[zone as 1], "label")}`,
                  })
                ) : (
                  <>
                    {t("tools.tapis.sayFlat", { kmh: km(flatKmh) })} <Link to="/calculators/zones">{t("tools.tapis.setVma")}</Link>
                  </>
                )}
              </p>
            )}
          </Answer>
        ) : (
          <Answer
            label={t("tools.tapis.answerTreadmill")}
            value={setKmh === undefined ? "-" : km(setKmh)}
            unit={setKmh === undefined ? undefined : "km/h"}
          >
            {setKmh !== undefined && (
              <p className="zn-calc-answer__say">{t("tools.tapis.sayTreadmill", { incline: formatDecimal(slope, 1, lang) })}</p>
            )}
          </Answer>
        )}

        <Provenance>
          <p>{t("tools.tapis.why")}</p>
        </Provenance>

        <NextSteps links={[{ to: "/calculators/zones", label: t("tools.tapis.nextZones") }]} />
      </div>
    </>
  );
}
