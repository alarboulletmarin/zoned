// src/pages/MethodologyPacesPage.tsx
// /methodology/allures — where every pace displayed in Zoned comes from.
// The page publishes the calibration in clear: one input (VMA), one formula,
// the percentage tables from src/lib/zones.ts, and the race percentages from
// src/lib/paceCalculator.ts. Every number rendered here is read from those
// modules, never retyped, so the page cannot drift from the engine.

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp } from "@/components/editorial";
import { MethodologyTabs } from "@/components/domain/methodology/MethodologyTabs";
import { PageContainer } from "@/components/layout/PageContainer";
import { ResponsiveTable, type ResponsiveTableColumn } from "@/components/ui/responsive-table";
import {
  VMA_ZONE_PERCENTAGES,
  HR_ZONE_PERCENTAGES,
  calculatePaceZones,
  formatPace,
} from "@/lib/zones";
import { calculateRaceTimes } from "@/lib/paceCalculator";
import { usePickLang } from "@/lib/i18n-utils";
import { ZONE_META, type ZoneNumber } from "@/types";
import { cn } from "@/lib/utils";

const ZONES: readonly ZoneNumber[] = [1, 2, 3, 4, 5, 6];

// Tailwind needs literal class names (see CLAUDE.md) — no `bg-zone-${n}`.
const ZONE_BG: Record<ZoneNumber, string> = {
  1: "bg-zone-1", 2: "bg-zone-2", 3: "bg-zone-3", 4: "bg-zone-4", 5: "bg-zone-5", 6: "bg-zone-6",
};
const ZONE_TEXT: Record<ZoneNumber, string> = {
  1: "text-zone-1-text", 2: "text-zone-2-text", 3: "text-zone-3-text", 4: "text-zone-4-text", 5: "text-zone-5-text", 6: "text-zone-6-text",
};

/** Teaching value used all over the Zoned Brut mockups — the example runner's
 *  VMA. Only ever used to *illustrate* the formula, never to compute anything
 *  for the visitor: their own paces live on /methodology and /me/zones. */
const EXAMPLE_VMA = 16.5;

interface PaceRow {
  zone: ZoneNumber;
}

export function MethodologyPacesPage() {
  const { t } = useTranslation("content");
  const pickLang = usePickLang();

  const examplePaces = calculatePaceZones(EXAMPLE_VMA);
  const exampleZ2 = examplePaces.find((p) => p.zone === 2);
  const raceEstimates = calculateRaceTimes(EXAMPLE_VMA);
  const rows: PaceRow[] = ZONES.map((zone) => ({ zone }));

  const columns: ResponsiveTableColumn<PaceRow>[] = [
    {
      key: "zone",
      header: t("content:methodology.paces.colZone"),
      cell: (row) => (
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 font-mono text-xs font-bold",
            ZONE_BG[row.zone],
            ZONE_TEXT[row.zone],
          )}
        >
          Z{row.zone}
        </span>
      ),
      className: "w-16",
    },
    {
      key: "name",
      header: t("content:methodology.paces.colName"),
      cell: (row) => (
        <span className="font-sans text-base font-semibold not-italic">
          {pickLang(ZONE_META[row.zone], "label")}
        </span>
      ),
    },
    {
      key: "vma",
      header: t("content:methodology.paces.colVma"),
      cell: (row) => (
        <span className="font-mono text-sm">
          {VMA_ZONE_PERCENTAGES[row.zone][0]}–{VMA_ZONE_PERCENTAGES[row.zone][1]}%
        </span>
      ),
    },
    {
      key: "hr",
      header: t("content:methodology.paces.colHr"),
      cell: (row) => (
        <span className="font-mono text-sm text-muted-foreground">
          {HR_ZONE_PERCENTAGES[row.zone][0]}–{HR_ZONE_PERCENTAGES[row.zone][1]}%
        </span>
      ),
      hideOnMobile: true,
    },
    {
      key: "example",
      header: t("content:methodology.paces.colExample", { vma: EXAMPLE_VMA }),
      cell: (row) => {
        const pz = examplePaces.find((p) => p.zone === row.zone);
        return pz?.paceMinPerKm && pz?.paceMaxPerKm ? (
          <span className="font-mono text-sm text-muted-foreground">
            {formatPace(pz.paceMinPerKm)}–{formatPace(pz.paceMaxPerKm)}
          </span>
        ) : (
          <span className="font-mono text-sm text-muted-foreground">—</span>
        );
      },
      className: "text-right",
    },
  ];

  return (
    <>
      <SEOHead
        title={t("content:methodology.paces.title")}
        description={t("content:methodology.paces.seoDescription")}
        canonical="/methodology/allures"
        jsonLd={[
          {
            "@type": "WebPage",
            name: t("content:methodology.paces.title"),
            url: "https://zoned.run/methodology/allures",
            description: t("content:methodology.paces.seoDescription"),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("content:article.home"), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("content:methodology.title"), item: "https://zoned.run/methodology" },
              { "@type": "ListItem", position: 3, name: t("content:methodology.paces.title") },
            ],
          },
        ]}
      />

      <PageContainer width="wide" as="div" className="py-8 space-y-8">
        <MethodologyTabs />

        <div className="grid gap-8 lg:grid-cols-[1fr_360px] items-end">
          <div>
            <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-muted-foreground">
              {t("content:methodology.paces.eyebrow")}
            </div>
            <EditorialTitle as="h1" size="xl" className="mt-3">
              {t("content:methodology.paces.heading")}
            </EditorialTitle>
            <FadeUp as="p" delay={0.1} className="mt-4 max-w-[58ch] text-muted-foreground">
              {t("content:methodology.paces.intro")}
            </FadeUp>
          </div>
          <Card size="compact" className="p-5">
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
              {t("content:methodology.paces.formulaTitle")}
            </div>
            <div className="mt-3 font-mono text-[15px] leading-relaxed">
              {t("content:methodology.paces.formula")}
            </div>
            <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted-foreground">
              {t("content:methodology.paces.formulaExample", {
                vma: EXAMPLE_VMA,
                pctSlow: VMA_ZONE_PERCENTAGES[2][0],
                pctFast: VMA_ZONE_PERCENTAGES[2][1],
                paceSlow: exampleZ2?.paceMaxPerKm ? formatPace(exampleZ2.paceMaxPerKm) : "—",
                paceFast: exampleZ2?.paceMinPerKm ? formatPace(exampleZ2.paceMinPerKm) : "—",
              })}
            </p>
          </Card>
        </div>

        {/* One input, two derivations */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="border-t-2 border-foreground pt-4">
            <h2 className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
              {t("content:methodology.paces.inputTitle")}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {t("content:methodology.paces.inputText")}
            </p>
          </div>
          <div className="border-t-2 border-foreground pt-4">
            <h2 className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
              {t("content:methodology.paces.hrTitle")}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
              {t("content:methodology.paces.hrText")}
            </p>
          </div>
        </div>

        {/* Percentage table */}
        <div>
          <h2 className="font-mono text-[11px] tracking-[0.12em] uppercase text-muted-foreground">
            {t("content:methodology.paces.tableTitle")}
          </h2>
          <div className="mt-4">
            <ResponsiveTable data={rows} columns={columns} rowKey="zone" />
          </div>
          <p className="mt-3 font-mono text-[10px] leading-relaxed text-muted-foreground">
            {t("content:methodology.paces.tableNote")}
          </p>
        </div>

        {/* Race percentages */}
        <div>
          <h2 className="font-mono text-[11px] tracking-[0.12em] uppercase text-muted-foreground">
            {t("content:methodology.paces.raceTitle")}
          </h2>
          <p className="mt-3 max-w-[66ch] text-[15px] leading-relaxed text-muted-foreground">
            {t("content:methodology.paces.raceText")}
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {raceEstimates.map((race) => (
              <div key={race.distance} className="border-t-2 border-foreground pt-3.5">
                <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                  {race.distance}
                </div>
                <div className="mt-2 font-mono text-xl">{race.vmaPercentage}% VMA</div>
                <div className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                  {t("content:methodology.paces.raceExample", {
                    vma: EXAMPLE_VMA,
                    pace: race.paceMinKm,
                    time: race.estimatedTime,
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Limits */}
        <Card size="compact" className="p-5">
          <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
            {t("content:methodology.paces.limitsTitle")}
          </div>
          <ul className="mt-3 list-disc space-y-2 pl-4 text-sm leading-relaxed text-muted-foreground">
            {(t("content:methodology.paces.limits", { returnObjects: true }) as string[]).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Card>

        <div className="flex flex-wrap items-center gap-4 border-t border-filet pt-5 font-mono text-[11px] tracking-[0.08em] uppercase">
          <Button asChild>
            <Link to="/me/zones">{t("content:methodology.paces.ctaMyZones")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/calculators/vma">{t("content:methodology.paces.ctaVmaTest")}</Link>
          </Button>
          <Link to="/methodology" className="text-muted-foreground hover:text-foreground">
            {t("content:methodology.paces.ctaBackToAtlas")}
          </Link>
        </div>
      </PageContainer>
    </>
  );
}
