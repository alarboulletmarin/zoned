// src/pages/MethodologyPage.tsx
// The zone atlas — /methodology. Six rows, one per zone: what it's for, the
// visitor's own pace when available, how it feels, and how many sessions in
// the catalogue land there. See docs/workout-format.md for the zone model
// itself; this page is where it's explained to a human.

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Info } from "@/components/icons";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveTable, type ResponsiveTableColumn } from "@/components/ui/responsive-table";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp } from "@/components/editorial";
import { MethodologyTabs } from "@/components/domain/methodology/MethodologyTabs";
import { ConfidenceBadge } from "@/components/domain/methodology/ConfidenceBadge";
import { PageContainer } from "@/components/layout/PageContainer";
import { usePickLang } from "@/lib/i18n-utils";
import { useGlossaryCount } from "@/hooks/useGlossary";
import { countUniqueScienceSources } from "@/lib/scienceReferences";
import { loadAllWorkouts } from "@/data/workouts";
import { getDominantZone, ZONE_META } from "@/types";
import { loadUserZonePrefs, calculatePaceZones, formatPace, VMA_ZONE_PERCENTAGES } from "@/lib/zones";
import type { ZoneNumber } from "@/types";
import { cn } from "@/lib/utils";

const ZONES: readonly ZoneNumber[] = [1, 2, 3, 4, 5, 6];

// Tailwind needs literal class names (see CLAUDE.md) — no `bg-zone-${n}` interpolation.
const ZONE_BG: Record<ZoneNumber, string> = {
  1: "bg-zone-1", 2: "bg-zone-2", 3: "bg-zone-3", 4: "bg-zone-4", 5: "bg-zone-5", 6: "bg-zone-6",
};
const ZONE_TEXT: Record<ZoneNumber, string> = {
  1: "text-zone-1-text", 2: "text-zone-2-text", 3: "text-zone-3-text", 4: "text-zone-4-text", 5: "text-zone-5-text", 6: "text-zone-6-text",
};

/** Illustrative weekly split — a teaching example (see HomePage's
 *  PROGRESSION_WEEKS for the same convention), not a measurement of any
 *  real plan. Shape follows the polarized pattern: mostly Z1-Z2, a little
 *  Z3, and a small hard share spread across Z4-Z6. */
const WEEK_EXAMPLE: Record<ZoneNumber, number> = { 1: 15, 2: 60, 3: 8, 4: 9, 5: 6, 6: 2 };

interface ZoneRow {
  zone: ZoneNumber;
}

export function MethodologyPage() {
  const { t } = useTranslation("content");
  const pickLang = usePickLang();
  const { count: glossaryCount } = useGlossaryCount();
  const [compareModel, setCompareModel] = useState<"coggan" | "seiler" | null>(null);

  const [zoneCounts, setZoneCounts] = useState<Partial<Record<ZoneNumber, number>>>({});
  useEffect(() => {
    let cancelled = false;
    loadAllWorkouts().then((workouts) => {
      if (cancelled) return;
      const counts: Partial<Record<ZoneNumber, number>> = {};
      for (const w of workouts) {
        const z = getDominantZone(w);
        counts[z] = (counts[z] ?? 0) + 1;
      }
      setZoneCounts(counts);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const prefs = loadUserZonePrefs();
  const paceZones = prefs?.vma ? calculatePaceZones(prefs.vma) : null;

  const sourcesCount = countUniqueScienceSources();
  const rows: ZoneRow[] = ZONES.map((zone) => ({ zone }));

  const columns: ResponsiveTableColumn<ZoneRow>[] = [
    {
      key: "zone",
      header: t("content:methodology.colZone"),
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
      header: t("content:methodology.colName"),
      cell: (row) => (
        <span className="font-sans text-base font-semibold not-italic">
          {pickLang(ZONE_META[row.zone], "label")}
        </span>
      ),
    },
    {
      key: "use",
      header: t("content:methodology.colUse"),
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{pickLang(ZONE_META[row.zone], "benefit")}</span>
      ),
      hideOnMobile: false,
    },
    {
      key: "pace",
      header: t("content:methodology.colPace"),
      cell: (row) => {
        if (paceZones) {
          const pz = paceZones.find((p) => p.zone === row.zone);
          if (pz?.paceMinPerKm && pz?.paceMaxPerKm) {
            return <span className="font-mono text-sm">{formatPace(pz.paceMinPerKm)}–{formatPace(pz.paceMaxPerKm)}</span>;
          }
        }
        const [min, max] = VMA_ZONE_PERCENTAGES[row.zone];
        return <span className="font-mono text-sm text-muted-foreground">{min}–{max}%</span>;
      },
      mobileLabel: paceZones ? t("content:methodology.colPace") : t("content:methodology.colPaceGeneric"),
    },
    {
      key: "feel",
      header: t("content:methodology.colFeel"),
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{pickLang(ZONE_META[row.zone], "sensation")}</span>
      ),
      hideOnMobile: true,
    },
    {
      key: "sessions",
      header: t("content:methodology.colSessions"),
      cell: (row) => (
        <span className="font-mono text-sm text-muted-foreground">{zoneCounts[row.zone] ?? "…"}</span>
      ),
      className: "text-right",
    },
  ];

  return (
    <>
      <SEOHead
        title={t("content:methodology.title")}
        description={t("content:methodology.seoDescription")}
        canonical="/methodology"
        jsonLd={[
          {
            "@type": "WebPage",
            name: t("content:methodology.title"),
            url: "https://zoned.run/methodology",
            description: t("content:methodology.seoDescription"),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("content:article.home"), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("content:methodology.title") },
            ],
          },
        ]}
      />

      <PageContainer width="wide" as="div" className="py-8 space-y-8">
        <MethodologyTabs />

        <div className="grid gap-8 lg:grid-cols-[1fr_360px] items-end">
          <div>
            <EditorialTitle as="h1" size="xl" className="whitespace-pre-line">
              {t("content:methodology.heading")}
            </EditorialTitle>
            <FadeUp as="p" delay={0.1} className="mt-4 max-w-[58ch] text-muted-foreground">
              {t("content:methodology.intro")}
            </FadeUp>
          </div>
          <Card size="compact" className="p-5">
            <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
              <Info className="size-3.5" />
              {t("content:methodology.notMeasuredTitle")}
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground list-disc pl-4">
              {(t("content:methodology.notMeasured", { returnObjects: true }) as string[]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Zone scale */}
        <div>
          <div className="flex h-4">
            {ZONES.map((z) => (
              <div
                key={z}
                className={ZONE_BG[z]}
                style={{ width: `${VMA_ZONE_PERCENTAGES[z][1] - VMA_ZONE_PERCENTAGES[z][0]}%` }}
              />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
              {t("content:methodology.scaleCaption")}
            </span>
            <ConfidenceBadge level="estimated" />
          </div>
          <div className="mt-1 font-mono text-[10px] text-muted-foreground leading-relaxed">
            {t("content:methodology.scaleNote")}
          </div>
        </div>

        {/* Zone table */}
        <ResponsiveTable data={rows} columns={columns} rowKey="zone" />

        {/* Three panels */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card size="compact" className="p-5">
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
              {t("content:methodology.threeWaysTitle")}
            </div>
            <div className="mt-3 flex flex-col divide-y divide-filet text-sm">
              {(["Pace", "Hr", "Feel"] as const).map((k) => (
                <div key={k} className="py-2.5">
                  <strong className="font-semibold">{t(`content:methodology.way${k}`)}</strong>{" "}
                  <span className="text-muted-foreground">{t(`content:methodology.way${k}Desc`)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card size="compact" className="p-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                {t("content:methodology.zonedChoiceTitle")}
              </span>
              <ConfidenceBadge level="choice" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{t("content:methodology.zonedChoiceText")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompareModel(compareModel === "coggan" ? null : "coggan")}
              >
                {t("content:methodology.compareCoggan")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompareModel(compareModel === "seiler" ? null : "seiler")}
              >
                {t("content:methodology.compareSeiler")}
              </Button>
            </div>
            {compareModel && (
              <div className="mt-3 border-t border-filet pt-3 text-sm">
                <p className="font-semibold">{t(`content:methodology.${compareModel}Title`)}</p>
                <p className="mt-1.5 text-muted-foreground">{t(`content:methodology.${compareModel}Text`)}</p>
              </div>
            )}
          </Card>

          <Card size="compact" className="bg-ink text-paper p-5">
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase opacity-65">
              {t("content:methodology.weekTitle")}
            </div>
            <div className="mt-4 flex h-24 items-end gap-2">
              {ZONES.map((z) => (
                <div key={z} className="flex flex-1 h-full flex-col justify-end gap-1.5">
                  <span className="font-mono text-[11px] opacity-70">{WEEK_EXAMPLE[z]}%</span>
                  <div className={ZONE_BG[z]} style={{ height: `${(WEEK_EXAMPLE[z] / 60) * 100}%` }} />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] opacity-55">
              {ZONES.map((z) => (
                <span key={z}>Z{z}</span>
              ))}
            </div>
            <div className="mt-2.5 font-mono text-[11px] leading-relaxed opacity-70">
              {t("content:methodology.weekCaption")}
              <br />
              {t("content:methodology.weekNote")}
            </div>
          </Card>
        </div>

        {/* Footer bar */}
        <div className="flex flex-wrap gap-6 border-t border-filet pt-5 font-mono text-[11px] tracking-[0.08em] uppercase text-muted-foreground">
          <span>{t("content:methodology.footerSources", { count: sourcesCount })}</span>
          <span>{t("content:methodology.footerMedical")}</span>
          <Link to="/glossary" className="ml-auto text-foreground hover:text-primary">
            {t("content:methodology.footerGlossary", { count: glossaryCount })}
          </Link>
        </div>

        {/* Why this atlas — editorial 3-column block, mirrors the design mockup */}
        <div className="border-2 border-foreground bg-card p-6 md:p-10">
          <p className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
            {t("content:methodology.whyAtlas.eyebrow")}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-7 mt-4 text-sm leading-[1.6] text-foreground/75">
            {(["oneRow", "limitsFirst", "choiceOwned"] as const).map((key) => (
              <p key={key}>
                <strong className="font-semibold text-foreground">
                  {t(`content:methodology.whyAtlas.${key}.title`)}
                </strong>{" "}
                {t(`content:methodology.whyAtlas.${key}.body`)}
              </p>
            ))}
          </div>
        </div>
      </PageContainer>
    </>
  );
}
