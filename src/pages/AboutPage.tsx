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
            <span className="text-primary font-bold tracking-widest text-sm uppercase mb-4 block">
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
            { target: stats.workouts, label: t("content:about.statsWorkouts"), color: "primary", gradient: "from-primary/10 dark:from-primary/20" },
            { target: stats.calculators, label: t("content:about.statsCalculators"), color: "zone-3", gradient: "from-zone-3/10 dark:from-zone-3/20" },
            { target: stats.plans, label: "Plans", color: "zone-2", gradient: "from-zone-2/10 dark:from-zone-2/20" },
            { target: stats.collections, label: "Collections", color: "zone-5", gradient: "from-zone-5/10 dark:from-zone-5/20" },
            { target: stats.articles, label: "Articles", color: "zone-4", gradient: "from-zone-4/10 dark:from-zone-4/20" },
            { target: stats.zones, label: "Zones", color: "zone-6", gradient: "from-zone-6/10 dark:from-zone-6/20" },
          ].map((stat) => (
            <StaggerItem key={stat.label}>
              <AboutStatCard {...stat} />
            </StaggerItem>
          ))}
        </StaggerGrid>

        {/* Personal + Links */}
        <section>
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent p-6 md:p-10">
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
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="size-4" />
                  Strava
                </a>
                <a
                  href="https://github.com/alarboulletmarin/zoned"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
          <div className="bg-gradient-to-br from-orange-500/10 dark:from-orange-500/20 to-transparent rounded-xl border border-border/50 p-6 space-y-3">
            <div className="p-2 rounded-lg bg-orange-500/15 w-fit">
              <GithubIcon className="size-5 text-orange-500" />
            </div>
            <h3 className="font-bold">{t("content:about.openSource.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("content:about.openSource.contributions")}
            </p>
          </div>

          {/* Vibe Coded */}
          <div className="bg-gradient-to-br from-purple-500/10 dark:from-purple-500/20 to-transparent rounded-xl border border-border/50 p-6 space-y-3">
            <div className="p-2 rounded-lg bg-purple-500/15 w-fit">
              <Sparkles className="size-5 text-purple-500" />
            </div>
            <h3 className="font-bold">{t("content:about.vibeCoded.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("content:about.vibeCoded.claude")}
            </p>
          </div>

          {/* Privacy */}
          <div className="bg-gradient-to-br from-green-500/10 dark:from-green-500/20 to-transparent rounded-xl border border-border/50 p-6 space-y-3">
            <div className="p-2 rounded-lg bg-green-500/15 w-fit">
              <Shield className="size-5 text-green-500" />
            </div>
            <h3 className="font-bold">{t("content:about.privacy.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("content:about.privacy.noServer")}
            </p>
          </div>

          {/* Credits */}
          <div className="bg-gradient-to-br from-red-500/10 dark:from-red-500/20 to-transparent rounded-xl border border-border/50 p-6 space-y-3">
            <div className="p-2 rounded-lg bg-red-500/15 w-fit">
              <Code className="size-5 text-red-500" />
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

/** One bento-tile in the About stats grid. Count-up on mount. */
function AboutStatCard({
  target,
  label,
  color,
  gradient,
}: {
  target: number;
  label: string;
  color: string;
  gradient: string;
}) {
  const value = useCountUp(target);
  return (
    <div
      className={`bg-gradient-to-br ${gradient} to-transparent p-4 md:p-5 rounded-xl border border-border/50 text-center`}
    >
      <span
        className={`text-${color} font-bold text-2xl md:text-3xl block tabular-nums`}
      >
        {value}
      </span>
      <span className="text-muted-foreground text-xs md:text-sm">{label}</span>
    </div>
  );
}
