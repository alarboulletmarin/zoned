import { useTranslation } from "react-i18next";
import { GithubIcon, Shield, Code, Sparkles, ExternalLink } from "@/components/icons";
import { SEOHead } from "@/components/seo";

export function AboutPage() {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;

  return (
    <>
      <SEOHead
        title={isEn ? "About" : "À propos"}
        description={isEn
          ? "Learn about Zoned, an open-source running workout library with zone-based training."
          : "Découvrez Zoned, une bibliothèque open-source de séances de course à pied basée sur les zones."}
        canonical="/about"
        jsonLd={[
          {
            "@type": "Organization",
            name: "Zoned",
            url: "https://zoned.run",
            description: isEn
              ? "An open-source running workout library with zone-based training."
              : "Une bibliothèque open-source de séances de course à pied basée sur les zones.",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: isEn ? "About" : "À propos" },
            ],
          },
        ]}
      />

      <div className="space-y-12 md:space-y-16 py-10 md:py-14">
        {/* Hero */}
        <section>
          <div className="max-w-3xl">
            <span className="text-primary font-bold tracking-widest text-sm uppercase mb-4 block">
              {isEn ? "About" : "À propos"}
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-[1.1]">
              {t("about.title")}
            </h1>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              {t("about.description")}
            </p>
          </div>
        </section>

        {/* Stats Bento Grid */}
        <section className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
          {[
            { value: "200", label: isEn ? "Workouts" : "Séances", color: "primary", gradient: "from-primary/10 dark:from-primary/20" },
            { value: "9", label: isEn ? "Calculators" : "Calculateurs", color: "zone-3", gradient: "from-zone-3/10 dark:from-zone-3/20" },
            { value: "8", label: "Plans", color: "zone-2", gradient: "from-zone-2/10 dark:from-zone-2/20" },
            { value: "16", label: "Collections", color: "zone-5", gradient: "from-zone-5/10 dark:from-zone-5/20" },
            { value: "12", label: "Articles", color: "zone-4", gradient: "from-zone-4/10 dark:from-zone-4/20" },
            { value: "6", label: "Zones", color: "zone-6", gradient: "from-zone-6/10 dark:from-zone-6/20" },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`bg-gradient-to-br ${stat.gradient} to-transparent p-4 md:p-5 rounded-xl border border-border/50 text-center`}
            >
              <span className={`text-${stat.color} font-bold text-2xl md:text-3xl block`}>
                {stat.value}
              </span>
              <span className="text-muted-foreground text-xs md:text-sm">
                {stat.label}
              </span>
            </div>
          ))}
        </section>

        {/* Personal + Links */}
        <section>
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent p-6 md:p-10">
            <div className="flex flex-col md:flex-row gap-6 md:gap-10">
              <div className="flex-1 space-y-4">
                <h2 className="text-xl md:text-2xl font-bold">{t("about.personal.title")}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {t("about.personal.bio")}
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
            <h3 className="font-bold">{t("about.openSource.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("about.openSource.contributions")}
            </p>
          </div>

          {/* Vibe Coded */}
          <div className="bg-gradient-to-br from-purple-500/10 dark:from-purple-500/20 to-transparent rounded-xl border border-border/50 p-6 space-y-3">
            <div className="p-2 rounded-lg bg-purple-500/15 w-fit">
              <Sparkles className="size-5 text-purple-500" />
            </div>
            <h3 className="font-bold">{t("about.vibeCoded.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("about.vibeCoded.claude")}
            </p>
          </div>

          {/* Privacy */}
          <div className="bg-gradient-to-br from-green-500/10 dark:from-green-500/20 to-transparent rounded-xl border border-border/50 p-6 space-y-3">
            <div className="p-2 rounded-lg bg-green-500/15 w-fit">
              <Shield className="size-5 text-green-500" />
            </div>
            <h3 className="font-bold">{t("about.privacy.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("about.privacy.noServer")}
            </p>
          </div>

          {/* Credits */}
          <div className="bg-gradient-to-br from-red-500/10 dark:from-red-500/20 to-transparent rounded-xl border border-border/50 p-6 space-y-3">
            <div className="p-2 rounded-lg bg-red-500/15 w-fit">
              <Code className="size-5 text-red-500" />
            </div>
            <h3 className="font-bold">{t("about.credits.title")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("about.credits.framework")} · {t("about.credits.ui")}
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
