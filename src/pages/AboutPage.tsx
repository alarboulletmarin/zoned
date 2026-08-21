import { useTranslation } from "react-i18next";
import { GithubIcon, Shield, Code, Sparkles, ExternalLink } from "@/components/icons";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp, StaggerGrid, StaggerItem, useCountUp } from "@/components/editorial";
import { useAppStats } from "@/hooks/useAppStats";

export function AboutPage() {
  const { t } = useTranslation("common");
  const stats = useAppStats();

  return (
    <>
      <SEOHead
        title={t("content:about.seoHeroLabel")}
        description={t("pages.about.seoDescription")}
        canonical="/about"
        jsonLd={[
          {
            "@type": "Organization",
            name: "Zoned",
            url: "https://zoned.run",
            description: t("pages.about.seoOrgDescription"),
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("nav.home"), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: t("nav.about") },
            ],
          },
        ]}
      />

      <div className="space-y-12 md:space-y-16 py-10 md:py-14">
        {/* Hero */}
        <section>
          <div className="max-w-3xl">
            <span className="font-mono text-[11px] tracking-[0.14em] uppercase text-accent-acid mb-4 block">
              {t("content:about.seoHeroLabel")}
            </span>
            <EditorialTitle as="h1" size="xl" className="mb-4 !leading-[1.1]">
              {t("content:about.title")}
            </EditorialTitle>
            <FadeUp as="p" delay={0.1} className="text-base md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              {t("content:about.description")}
            </FadeUp>
          </div>
        </section>

        {/* Stats Bento Grid */}
        <StaggerGrid className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {[
            { target: stats.workouts, label: t("content:about.statsWorkouts") },
            { target: stats.calculators, label: t("content:about.statsCalculators") },
            { target: stats.plans, label: "Plans" },
            { target: stats.collections, label: "Collections" },
            { target: stats.articles, label: "Articles" },
            { target: stats.zones, label: "Zones" },
          ].map((stat) => (
            <StaggerItem key={stat.label}>
              <AboutStatCard {...stat} />
            </StaggerItem>
          ))}
        </StaggerGrid>

        {/* Personal + Links */}
        <section>
          <div className="border-2 border-foreground bg-card p-6 md:p-10">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
              <div className="flex-1 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold">{t("content:about.personal.title")}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t("content:about.personal.bio")}
                </p>
              </div>
              <div className="flex flex-row md:flex-col gap-4 md:gap-3 md:justify-center shrink-0">
                <a
                  href="https://www.strava.com/athletes/115001213"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="size-4" />
                  Strava
                </a>
                <a
                  href="https://github.com/alarboulletmarin/zoned"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground hover:text-foreground transition-colors"
                >
                  <GithubIcon className="size-4" />
                  GitHub
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Feature cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Open Source */}
          <div className="border-2 border-foreground bg-card p-6 space-y-3">
            <div className="size-9 bg-secondary flex items-center justify-center">
              <GithubIcon className="size-5" />
            </div>
            <h3 className="font-bold">{t("content:about.openSource.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("content:about.openSource.contributions")}
            </p>
          </div>

          {/* Vibe Coded */}
          <div className="border-2 border-foreground bg-card p-6 space-y-3">
            <div className="size-9 bg-secondary flex items-center justify-center">
              <Sparkles className="size-5" />
            </div>
            <h3 className="font-bold">{t("content:about.vibeCoded.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("content:about.vibeCoded.claude")}
            </p>
          </div>

          {/* Privacy */}
          <div className="border-2 border-foreground bg-card p-6 space-y-3">
            <div className="size-9 bg-secondary flex items-center justify-center">
              <Shield className="size-5" />
            </div>
            <h3 className="font-bold">{t("content:about.privacy.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("content:about.privacy.noServer")}
            </p>
          </div>

          {/* Credits */}
          <div className="border-2 border-foreground bg-card p-6 space-y-3">
            <div className="size-9 bg-secondary flex items-center justify-center">
              <Code className="size-5" />
            </div>
            <h3 className="font-bold">{t("content:about.credits.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("content:about.credits.framework")} · {t("content:about.credits.ui")}
            </p>
          </div>
        </section>

        {/* Support */}
        <section className="text-center space-y-4">
          <p className="text-muted-foreground">{t("donate.description")}</p>
          <a
            href="https://ko-fi.com/T6T01WC5ZC"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <img
              src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
              alt="Buy Me a Coffee at ko-fi.com"
              className="h-9 border-0"
            />
          </a>
        </section>
      </div>
    </>
  );
}

/** One flat tile in the About stats grid. Count-up on mount. */
function AboutStatCard({ target, label }: { target: number; label: string }) {
  const value = useCountUp(target);
  return (
    <div className="border-2 border-foreground bg-card p-4 md:p-5 text-center">
      <span className="font-mono font-bold text-2xl md:text-3xl block tabular-nums">
        {value}
      </span>
      <span className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
