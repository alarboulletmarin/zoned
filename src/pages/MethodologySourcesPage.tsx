// src/pages/MethodologySourcesPage.tsx
// /methodology/sources — every scientific reference cited across Zoned's
// science data (src/data/science), plus what Zoned explicitly does not
// claim and its license.

import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { Card } from "@/components/ui/card";
import { EditorialTitle, FadeUp } from "@/components/editorial";
import { ResponsiveTable, type ResponsiveTableColumn } from "@/components/ui/responsive-table";
import { MethodologyTabs } from "@/components/domain/methodology/MethodologyTabs";
import { PageContainer } from "@/components/layout/PageContainer";
import { getAllScienceReferences, type ScienceReferenceEntry } from "@/lib/scienceReferences";

type SourceRow =
  | { kind: "reference"; ref: ScienceReferenceEntry }
  | { kind: "editorial" };

export function MethodologySourcesPage() {
  const { t } = useTranslation(["content", "session"]);
  const references = getAllScienceReferences();
  const rows: SourceRow[] = [
    ...references.map((ref): SourceRow => ({ kind: "reference", ref })),
    { kind: "editorial" },
  ];

  const columns: ResponsiveTableColumn<SourceRow>[] = [
    {
      key: "year",
      header: t("content:methodology.sources.colYear"),
      cell: (row) => (
        <span className={row.kind === "editorial" ? "text-zone-3" : "text-muted-foreground"}>
          {row.kind === "reference" ? row.ref.year : "—"}
        </span>
      ),
      className: "w-16",
    },
    {
      key: "reference",
      header: t("content:methodology.sources.colReference"),
      cell: (row) =>
        row.kind === "reference" ? (
          <a
            href={row.ref.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block no-underline hover:text-primary"
          >
            <div className="text-[15px] font-medium">
              {row.ref.authors} — {row.ref.title}
            </div>
          </a>
        ) : (
          <div>
            <div className="text-[15px] font-medium">{t("content:methodology.sources.editorialChoiceText")}</div>
            <div className="mt-1 font-mono text-[11px] text-zone-3">
              {t("content:methodology.sources.editorialChoiceDetail")}
            </div>
          </div>
        ),
    },
    {
      key: "use",
      header: t("content:methodology.sources.colUse"),
      cell: (row) =>
        row.kind === "reference"
          ? t(`session:targetSystems.${row.ref.targetSystem}`)
          : t("content:methodology.sources.editorialChoiceUse"),
      className: "text-sm text-muted-foreground",
    },
    {
      key: "journal",
      header: t("content:methodology.sources.colJournal"),
      cell: (row) => (row.kind === "reference" ? row.ref.journal : ""),
      className: "font-mono text-xs text-muted-foreground",
      hideOnMobile: true,
    },
  ];

  return (
    <>
      <SEOHead
        title={t("content:methodology.sources.title")}
        description={t("content:methodology.sources.seoDescription")}
        canonical="/methodology/sources"
        jsonLd={[
          {
            "@type": "WebPage",
            name: t("content:methodology.sources.title"),
            url: "https://zoned.run/methodology/sources",
            description: t("content:methodology.sources.seoDescription"),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("content:article.home"), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("content:methodology.title"), item: "https://zoned.run/methodology" },
              { "@type": "ListItem", position: 3, name: t("content:methodology.sources.title") },
            ],
          },
        ]}
      />

      <PageContainer width="wide" as="div" className="py-8 space-y-6">
        <MethodologyTabs />

        <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-start">
          <div>
            <EditorialTitle as="h1" size="lg">
              {t("content:methodology.sources.heading", { count: references.length })}
            </EditorialTitle>
            <FadeUp as="p" delay={0.1} className="mt-3 max-w-[62ch] text-muted-foreground">
              {t("content:methodology.sources.intro")}
            </FadeUp>

            <ResponsiveTable className="mt-6" data={rows} columns={columns} rowKey={(row, i) => (row.kind === "reference" ? row.ref.link ?? row.ref.title : `editorial-${i}`)} />
          </div>

          <Card size="compact" className="p-5">
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
              {t("content:methodology.sources.notClaimTitle")}
            </div>
            <div className="mt-3 flex flex-col gap-4">
              {(["notMedical", "notMeasure", "notCoach"] as const).map((k) => (
                <div key={k} className="border-t-2 border-foreground pt-3.5">
                  <div className="font-bold uppercase tracking-tight">{t(`content:methodology.sources.${k}Title`)}</div>
                  <p className="mt-1.5 text-sm text-muted-foreground">{t(`content:methodology.sources.${k}Text`)}</p>
                </div>
              ))}
            </div>
            <div className="mt-5 bg-ink text-paper p-4 font-mono text-[11px] leading-relaxed">
              <div className="tracking-[0.06em]">{t("content:methodology.sources.licenseTitle")}</div>
              <p className="mt-1.5 opacity-80">{t("content:methodology.sources.licenseText")}</p>
            </div>
          </Card>
        </div>
      </PageContainer>
    </>
  );
}
