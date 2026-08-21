// src/pages/MethodologyPolarisePage.tsx
// /methodology/polarise — long-form article on why the polarized (80/20)
// training-intensity distribution works, backed by four studies already
// vetted in src/data/science (see getAllScienceReferences).

import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp } from "@/components/editorial";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { MethodologyTabs } from "@/components/domain/methodology/MethodologyTabs";
import { ConfidenceBadge } from "@/components/domain/methodology/ConfidenceBadge";
import { PageContainer } from "@/components/layout/PageContainer";
import { getAllScienceReferences } from "@/lib/scienceReferences";
import { useReadingSize } from "@/hooks/useReadingSize";
import { cn } from "@/lib/utils";

// The four studies backing this article — see the header comment: real
// citations already present in src/data/science/data.ts, filtered by title.
const ARTICLE_TITLES = [
  "What is best practice for training intensity and duration distribution in endurance athletes?",
  "Polarized training has greater impact on key endurance variables than threshold, high intensity, or high volume training",
  "Intermittent runs at the velocity associated with maximal oxygen uptake enables subjects to remain at maximal oxygen uptake for a longer time than intense but submaximal runs",
  "Lactate threshold concepts: how valid are they?",
];

// Rounded, illustrative polarized-volume split (see the "teaching values"
// convention used on the zone atlas) — not a per-study measurement.
const DISTRIBUTION = [
  { key: "distributionEasy", pct: 80, cls: "bg-zone-2" },
  { key: "distributionGrey", pct: 8, cls: "bg-zone-3" },
  { key: "distributionHard", pct: 12, cls: "bg-zone-4" },
] as const;

const TERMS_USED = ["seuil ventilatoire", "polarisé", "zone grise", "économie de course"];

export function MethodologyPolarisePage() {
  const { t } = useTranslation("content");
  const { readingSize, setReadingSize, sizes } = useReadingSize();
  const allSources = getAllScienceReferences();
  const articleSources = allSources.filter((r) => ARTICLE_TITLES.includes(r.title));

  return (
    <>
      <SEOHead
        title={t("content:methodology.polarise.title")}
        description={t("content:methodology.polarise.seoDescription")}
        canonical="/methodology/polarise"
        jsonLd={[
          {
            "@type": "Article",
            headline: t("content:methodology.polarise.title"),
            url: "https://zoned.run/methodology/polarise",
            description: t("content:methodology.polarise.seoDescription"),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("content:article.home"), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("content:methodology.title"), item: "https://zoned.run/methodology" },
              { "@type": "ListItem", position: 3, name: t("content:methodology.polarise.title") },
            ],
          },
        ]}
      />

      <PageContainer width="wide" as="div" className="py-8 space-y-6">
        <MethodologyTabs />

        <div className="grid gap-8 lg:grid-cols-[200px_1fr_280px]">
          {/* Left: table of contents */}
          <aside className="hidden lg:block">
            <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
              {t("content:methodology.polarise.tocLabel")}
            </div>
            <nav className="mt-3.5 flex flex-col text-sm">
              {(["toc1", "toc2", "toc3", "toc4", "toc5"] as const).map((key, i) => (
                <a
                  key={key}
                  href={`#section-${i + 1}`}
                  className="border-l-2 border-transparent py-2 pl-2.5 text-muted-foreground hover:border-primary hover:text-foreground"
                >
                  {t(`content:methodology.polarise.${key}`)}
                </a>
              ))}
            </nav>
            <div className="mt-5 border-t border-filet pt-4 font-mono text-[11px] leading-loose text-muted-foreground">
              {t("content:methodology.polarise.readingTime")}
              <br />
              {t("content:methodology.polarise.sourcesCount", { count: articleSources.length })}
            </div>
          </aside>

          {/* Center: article */}
          <article className="max-w-[66ch]" style={{ fontSize: `${readingSize}px` }}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="font-mono text-[11px] tracking-[0.12em] uppercase text-muted-foreground">
                {t("content:methodology.polarise.eyebrow")}
              </div>
              <div
                role="group"
                aria-label={t("content:methodology.polarise.readingSizeLabel")}
                className="flex items-center gap-1.5"
              >
                {sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setReadingSize(size)}
                    aria-pressed={readingSize === size}
                    className={cn(
                      "border px-2.5 py-1.5 font-mono text-[10px] tracking-[0.08em] uppercase transition-colors",
                      readingSize === size
                        ? "border-foreground bg-ink text-paper"
                        : "border-filet text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Aa {size} px
                  </button>
                ))}
              </div>
            </div>
            <EditorialTitle as="h1" size="xl" className="mt-3">
              {t("content:methodology.polarise.title")}
            </EditorialTitle>
            <FadeUp as="p" delay={0.1} className="mt-4 text-lg text-muted-foreground leading-relaxed">
              {t("content:methodology.polarise.lede")}
            </FadeUp>

            <div className="mt-7 border-t-2 border-foreground pt-6">
              <div className="flex flex-wrap items-baseline gap-3">
                <h2 id="section-1" className="scroll-mt-20 text-xl font-bold uppercase tracking-tight">
                  {t("content:methodology.polarise.measuredTitle")}
                </h2>
                <ConfidenceBadge level="measured" />
              </div>
              <GlossaryLinkedText
                as="p"
                className="mt-3.5 leading-relaxed text-muted-foreground"
                text={t("content:methodology.polarise.measuredText1")}
              />
              <GlossaryLinkedText
                as="p"
                className="mt-3.5 leading-relaxed text-muted-foreground"
                text={t("content:methodology.polarise.measuredText2")}
              />

              <div className="mt-6 bg-card p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
                    {t("content:methodology.polarise.distributionCaption")}
                  </span>
                  <ConfidenceBadge level="choice" />
                </div>
                <div className="mt-4 flex h-3.5">
                  {DISTRIBUTION.map((d) => (
                    <div key={d.key} className={d.cls} style={{ width: `${d.pct}%` }} />
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-5 font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground">
                  {DISTRIBUTION.map((d) => (
                    <span key={d.key} className="flex items-center gap-1.5">
                      <span className={`size-2.5 ${d.cls}`} />
                      {t(`content:methodology.polarise.${d.key}`)} · {d.pct}%
                    </span>
                  ))}
                </div>
              </div>

              <h2 id="section-2" className="scroll-mt-20 mt-8 text-xl font-bold uppercase tracking-tight">
                {t("content:methodology.polarise.whyTitle")}
              </h2>
              <GlossaryLinkedText
                as="p"
                className="mt-3.5 leading-relaxed text-muted-foreground"
                text={t("content:methodology.polarise.whyText1")}
              />
              <GlossaryLinkedText
                as="p"
                className="mt-3.5 leading-relaxed text-muted-foreground"
                text={t("content:methodology.polarise.whyText2")}
              />

              <div id="section-3" className="scroll-mt-20 mt-6 border-2 border-zone-3 p-5">
                <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-zone-3">
                  {t("content:methodology.polarise.greyZoneTitle")}
                </div>
                <GlossaryLinkedText
                  as="p"
                  className="mt-2.5 text-[16px] leading-relaxed text-muted-foreground"
                  text={t("content:methodology.polarise.greyZoneText")}
                />
              </div>

              <div className="mt-8 flex flex-wrap items-baseline gap-3">
                <h2 id="section-4" className="scroll-mt-20 text-xl font-bold uppercase tracking-tight">
                  {t("content:methodology.polarise.changeTitle")}
                </h2>
                <ConfidenceBadge level="estimated" />
              </div>
              <div className="mt-4 grid gap-5 sm:grid-cols-2">
                <div className="border-t-2 border-foreground pt-3.5">
                  <div className="font-mono text-xl">{t("content:methodology.polarise.change4h")}</div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t("content:methodology.polarise.change4hText")}
                  </p>
                </div>
                <div className="border-t-2 border-foreground pt-3.5">
                  <div className="font-mono text-xl">{t("content:methodology.polarise.change8h")}</div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t("content:methodology.polarise.change8hText")}
                  </p>
                </div>
              </div>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {t("content:methodology.polarise.changeText")}
              </p>

              <h2 id="section-5" className="scroll-mt-20 mt-8 text-xl font-bold uppercase tracking-tight">
                {t("content:methodology.polarise.limitsTitle")}
              </h2>
              <ul className="mt-3.5 list-disc space-y-2 pl-5 leading-relaxed text-muted-foreground">
                {(t("content:methodology.polarise.limits", { returnObjects: true }) as string[]).map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-filet pt-5 font-mono text-[11px] tracking-[0.08em] uppercase">
              <Button asChild>
                <Link to="/plan/new">{t("content:methodology.polarise.ctaCheckWeek")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/library?category=endurance">{t("content:methodology.polarise.ctaSeeSessions")}</Link>
              </Button>
              <Link to="/methodology" className="text-muted-foreground hover:text-foreground">
                {t("content:methodology.polarise.ctaBackToAtlas")}
              </Link>
            </div>
          </article>

          {/* Right: sources + terms */}
          <aside className="flex flex-col gap-6">
            <div>
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                {t("content:methodology.polarise.sourcesTitle")}
              </div>
              <div className="mt-3 flex flex-col text-[13px]">
                {articleSources.map((ref) => (
                  <a
                    key={ref.link ?? ref.title}
                    href={ref.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border-t border-filet py-2.5 no-underline hover:text-primary"
                  >
                    <div>{ref.authors} &middot; {ref.year}</div>
                    <div className="mt-1 font-mono text-[11px] text-muted-foreground">{ref.journal}</div>
                  </a>
                ))}
              </div>
              <Link
                to="/methodology/sources"
                className="mt-3 block font-mono text-[10px] tracking-[0.1em] uppercase text-muted-foreground underline hover:text-foreground"
              >
                {t("content:methodology.polarise.allSourcesLink", { count: allSources.length })}
              </Link>
            </div>

            <div className="border-t border-filet pt-5">
              <div className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                {t("content:methodology.polarise.termsTitle")}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {TERMS_USED.map((term) => (
                  <Badge key={term} variant="outline" className="normal-case">
                    {term}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="mt-auto border border-filet p-4 font-mono text-[11px] leading-relaxed text-muted-foreground">
              {t("content:methodology.polarise.medicalDisclaimer")}
            </div>
          </aside>
        </div>
      </PageContainer>
    </>
  );
}
