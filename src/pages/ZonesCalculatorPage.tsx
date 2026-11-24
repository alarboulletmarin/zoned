import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ZoneFigures } from "@/components/domain/ZoneFigures";
import { NextSteps, Provenance, StepField, ToolHeader, ZoneBand } from "@/components/calc";
import { SEOHead } from "@/components/seo";
import { useMyNumbers } from "@/hooks/useMyNumbers";
import { useSettings } from "@/hooks/useSettings";
import { usePickLang } from "@/lib/i18n-utils";
import { convertPace, getPaceUnit } from "@/lib/units";
import { calculateAllZones, formatPace, saveUserZonePrefs } from "@/lib/zones";
import { ZONE_META, type ZoneNumber } from "@/types";

function paramNumber(raw: string | null): number | undefined {
  const n = raw === null ? NaN : Number(raw.replace(",", "."));
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Zones : VMA et FC max in, six zones out. A value typed here wins, then the
 * link (?vma= &fcmax=), then the reader's own numbers (useMyNumbers).
 */
export function ZonesCalculatorPage() {
  const { t } = useTranslation("calculators");
  const pickLang = usePickLang();
  const unit = useSettings().settings.unitSystem;
  const [searchParams] = useSearchParams();
  const { numbers, refresh } = useMyNumbers();

  // null: not touched yet, the field follows the link then the saved numbers.
  const [vmaEdit, setVmaEdit] = useState<number | undefined | null>(null);
  const [fcEdit, setFcEdit] = useState<number | undefined | null>(null);
  const [open, setOpen] = useState<ZoneNumber>(2);

  const urlVma = paramNumber(searchParams.get("vma"));
  const urlFc = paramNumber(searchParams.get("fcmax"));
  const vma = vmaEdit !== null ? vmaEdit : (urlVma ?? numbers.vma);
  const fcMax = fcEdit !== null ? fcEdit : (urlFc ?? numbers.fcMax);

  const zones = useMemo(() => calculateAllZones({ vma, fcMax }), [vma, fcMax]);
  const hasValues = vma !== undefined || fcMax !== undefined;
  const dirty = (vma !== undefined && vma !== numbers.vma) || (fcMax !== undefined && fcMax !== numbers.fcMax);
  // A cleared field does not delete the saved number: say saved only when the screen shows it.
  const saved = vma === numbers.vma && fcMax === numbers.fcMax;

  const save = () => {
    saveUserZonePrefs({ vma, fcMax });
    refresh();
  };

  const paceUnit = getPaceUnit(unit);
  const pace = (v: number) => formatPace(convertPace(v, unit));
  const openMeta = ZONE_META[open];

  return (
    <>
      <SEOHead
        title={t("calculateurs.zones.seoTitle")}
        description={t("calculateurs.zones.seoDescription")}
        canonical="/calculators/zones"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculateurs.zones.seoAppName"),
            description: t("calculateurs.zones.seoAppDescription"),
            url: "https://zoned.run/calculators/zones",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculateurs.zones.seoBreadcrumb") },
            ],
          },
        ]}
      />

      <div className="zn-calc">
        <ToolHeader kicker={t("tools.zones.kicker")} title={t("tools.zones.title")} />

        <ZoneFigures label={t("calculateurs.zones.figuresLabel")} zones={zones} />

        <div className="zn-calc-fields">
          <StepField
            label={t("tools.zones.vma")}
            unit="km/h"
            value={vma}
            onChange={setVmaEdit}
            step={0.1}
            min={8}
            max={30}
            decimals={1}
            fallback={15}
          />
          <StepField
            label={t("tools.zones.fcMax")}
            unit="bpm"
            value={fcMax}
            onChange={setFcEdit}
            step={1}
            min={100}
            max={250}
            fallback={180}
          />
        </div>
        <p className="zn-calc-hint">
          {vma !== undefined && vma === numbers.vma ? t("tools.zones.hintFromNumbers") : t("tools.zones.hintFree")}{" "}
          {fcMax === undefined && t("tools.zones.hintNoHr")}
        </p>

        <ZoneBand active={open} />

        <div className="zn-calc-tablebox">
          <table className="zn-calc-table">
            <thead>
              <tr>
                <th scope="col">{t("tools.zones.colZone")}</th>
                <th scope="col">{t("tools.zones.colPace", { unit: paceUnit })}</th>
                <th scope="col">{t("tools.zones.colHr")}</th>
              </tr>
            </thead>
            <tbody>
              {([1, 2, 3, 4, 5, 6] as ZoneNumber[]).map((n) => {
                const z = zones.find((r) => r.zone === n);
                const meta = ZONE_META[n];
                const isOpen = open === n;
                return (
                  <tr key={n} data-ref={isOpen || undefined}>
                    <th scope="row">
                      <button
                        type="button"
                        className="zn-zonerow__btn"
                        aria-expanded={isOpen}
                        onClick={() => setOpen(n)}
                      >
                        <span className="zn-zonerow__code" data-zone={n}>Z{n}</span> {pickLang(meta, "label")}
                      </button>
                    </th>
                    <td>
                      {z?.paceMinPerKm !== undefined && z.paceMaxPerKm !== undefined ? (
                        `${pace(z.paceMinPerKm)}-${pace(z.paceMaxPerKm)}`
                      ) : (
                        <span className="zn-calc-table__muted" aria-label={t("tools.zones.notSet")}>-</span>
                      )}
                    </td>
                    <td>
                      {z?.hrMin !== undefined ? (
                        `${z.hrMin}-${z.hrMax}`
                      ) : (
                        <span className="zn-calc-table__muted" aria-label={t("tools.zones.notSet")}>-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="zn-calc-hint">
          {t("tools.zones.openSay", { zone: open, say: pickLang(openMeta, "benefit") })}{" "}
          <Link to="/library">{t("tools.zones.libraryLink")}</Link>
        </p>

        {hasValues &&
          (dirty ? (
            <div className="zn-calc-answer__actions">
              <Button onClick={save}>{t("tools.zones.save")}</Button>
            </div>
          ) : saved && (
            <p className="zn-calc-hint zn-zonesaved">
              <Check size={16} />
              {t("tools.zones.saved")}
            </p>
          ))}

        <Provenance>
          <p>{t("tools.zones.why")}</p>
        </Provenance>

        <NextSteps
          links={[{ to: "/calculators/vma", label: t("tools.zones.nextVma") }]}
        />
      </div>
    </>
  );
}
