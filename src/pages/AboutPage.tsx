import { useTranslation } from "react-i18next";
import { GitlabIcon, Shield, Heart, Code, Sparkles, ExternalLink, Mail } from "@/components/icons";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
        jsonLd={{
          "@type": "Organization",
          name: "Zoned",
          url: "https://zoned.run",
          description: isEn
            ? "An open-source running workout library with zone-based training."
            : "Une bibliothèque open-source de séances de course à pied basée sur les zones.",
        }}
      />
      <div className="py-6 md:py-8 max-w-6xl mx-auto space-y-6">
        {/* Header + Personal — side by side on desktop */}
        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold">{t("about.title")}</h1>
            <p className="text-muted-foreground">
              {t("about.description")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:gap-4">
            <a
              href="mailto:contact@zoned.run"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="size-4" />
              contact@zoned.run
            </a>
            <a
              href="https://www.strava.com/athletes/115001213"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="size-3.5" />
              Strava
            </a>
            <a
              href="https://gitlab.com/alarboulletmarin-oss/zoned"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <GitlabIcon className="size-4" />
              GitLab
            </a>
          </div>
        </div>

        {/* Main grid — 3 columns on large screens */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Personal */}
          <Card className="lg:row-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{t("about.personal.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("about.personal.bio")}
              </p>
            </CardContent>
          </Card>

          {/* Open Source */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-orange-500/10">
                  <GitlabIcon className="size-4 text-orange-500" />
                </div>
                <CardTitle className="text-base">{t("about.openSource.title")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t("about.openSource.contributions")}
              </p>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://gitlab.com/alarboulletmarin-oss/zoned"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2"
                >
                  <GitlabIcon className="size-4" />
                  {t("about.openSource.viewRepo")}
                  <ExternalLink className="size-3" />
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Vibe Coded */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-purple-500/10">
                  <Sparkles className="size-4 text-purple-500" />
                </div>
                <CardTitle className="text-base">{t("about.vibeCoded.title")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>{t("about.vibeCoded.claude")}</li>
                <li>{t("about.vibeCoded.human")}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-green-500/10">
                  <Shield className="size-4 text-green-500" />
                </div>
                <CardTitle className="text-base">{t("about.privacy.title")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>{t("about.privacy.noServer")}</li>
                <li>{t("about.privacy.noAccount")}</li>
                <li>{t("about.privacy.analytics")}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Credits */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-red-500/10">
                  <Heart className="size-4 text-red-500" />
                </div>
                <CardTitle className="text-base">{t("about.credits.title")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li><Code className="size-3 inline mr-1.5" />{t("about.credits.framework")}</li>
                <li><Code className="size-3 inline mr-1.5" />{t("about.credits.ui")}</li>
                <li><Code className="size-3 inline mr-1.5" />{t("about.credits.icons")}</li>
              </ul>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-yellow-500/10">
                  <Heart className="size-4 text-yellow-500" />
                </div>
                <CardTitle className="text-base">{t("donate.title")}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{t("donate.description")}</p>
              <a
                href="https://ko-fi.com/T6T01WC5ZC"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://storage.ko-fi.com/cdn/kofi6.png?v=6"
                  alt="Buy Me a Coffee at ko-fi.com"
                  className="h-9 border-0"
                />
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
