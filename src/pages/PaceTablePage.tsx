import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { ToolHeader, formatDecimal } from "@/components/calc";
import { useMyNumbers } from "@/hooks/useMyNumbers";
import { clock } from "@/lib/clock";

const MILE_KM = 1.609344;
const ROWS: number[] = Array.from({ length: 43 }, (_, i) => 180 + i * 10); // 3:00 to 10:00/km

/** The table row nearest to a pace in seconds per km. */
const nearest = (s: number) => Math.min(600, Math.max(180, Math.round(s / 10) * 10));

export function PaceTablePage() {
  const { t, i18n } = useTranslation("calculators");
  const { numbers } = useMyNumbers();
  const [params] = useSearchParams();
  const [mile, setMile] = useState(false);

  const fromLink = Number(params.get("pace"));
  const linked = fromLink > 0 ? nearest(fromLink) : undefined;
  const threshold = numbers.threshold ? nearest(((numbers.threshold.fast + numbers.threshold.slow) / 2) * 60) : undefined;
  const ref = linked ?? threshold;

  // Land on the row Allures sent us to.
  useEffect(() => {
    if (linked) document.getElementById(`p${linked}`)?.scrollIntoView({ block: "center" });
  }, [linked]);

  return (
    <>
      <SEOHead
        title={t("calculateurs.paceTable.seoTitle")}
        description={t("calculateurs.paceTable.seoDescription")}
        canonical="/calculators/table-allures"
        jsonLd={[
          {
            "@type": "WebApplication",
            name: t("calculateurs.paceTable.seoAppName"),
            description: t("calculateurs.paceTable.seoAppDescription"),
            url: "https://zoned.run/calculators/table-allures",
            applicationCategory: "SportsApplication",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("calculateurs.breadcrumb"), item: "https://zoned.run/calculators" },
              { "@type": "ListItem", position: 3, name: t("calculateurs.paceTable.seoBreadcrumb") },
            ],
          },
        ]}
      />

      <div className="zn-calc">
        <ToolHeader kicker={t("tools.table.kicker")} title={t("tools.table.title")} lede={t("tools.table.lede")} />

        <div className="zn-calc-fields">
          {threshold && (
            <a href={`#p${threshold}`} className="zn-allures-jump">
              {t("tools.table.jump", { pace: clock(threshold) })}
            </a>
          )}
          <label className="zn-allures-opt">
            <input type="checkbox" checked={mile} onChange={(e) => setMile(e.target.checked)} />
            {t("tools.table.showMile")}
          </label>
        </div>

        <div className="zn-calc-tablebox zn-allures-tablebox">
          <table className="zn-calc-table">
            <caption className="sr-only">{t("tools.table.caption")}</caption>
            <thead>
              <tr>
                <th scope="col">{t("tools.table.pace")}</th>
                <th scope="col">{t("tools.table.kmh")}</th>
                {mile && <th scope="col">{t("tools.table.mile")}</th>}
                <th scope="col">{t("tools.table.k5")}</th>
                <th scope="col">{t("tools.table.k10")}</th>
                <th scope="col">{t("tools.table.half")}</th>
                <th scope="col">{t("tools.table.marathon")}</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((s) => (
                <tr key={s} id={`p${s}`} data-ref={s === ref || undefined}>
                  <th scope="row">{clock(s)}</th>
                  <td>{formatDecimal(3600 / s, 1, i18n.language)}</td>
                  {mile && <td>{clock(s * MILE_KM)}</td>}
                  <td>{clock(s * 5)}</td>
                  <td>{clock(s * 10)}</td>
                  <td>{clock(s * 21.0975)}</td>
                  <td>{clock(s * 42.195)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
