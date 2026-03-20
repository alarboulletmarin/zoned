import { useTranslation } from "react-i18next";
import { GitlabIcon, Shield, Heart, Code, Sparkles, ExternalLink, Mail } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
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
      <div className="py-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">{t("about.title")}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("about.description")}
        </p>
      </div>

      {/* Personal Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1 space-y-3">
              <h2 className="text-lg font-semibold">{t("about.personal.title")}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t("about.personal.bio")}
              </p>
              <div className="flex flex-wrap gap-3 pt-1">
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
          </div>
        </CardContent>
      </Card>

      {/* Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Open Source */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <GitlabIcon className="size-5 text-orange-500" />
              </div>
              <CardTitle>{t("about.openSource.title")}</CardTitle>
            </div>
            <CardDescription>{t("about.openSource.description")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Sparkles className="size-5 text-purple-500" />
              </div>
              <CardTitle>{t("about.vibeCoded.title")}</CardTitle>
            </div>
            <CardDescription>{t("about.vibeCoded.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>{t("about.vibeCoded.claude")}</li>
              <li>{t("about.vibeCoded.human")}</li>
              <li>{t("about.vibeCoded.experience")}</li>
            </ul>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Shield className="size-5 text-green-500" />
              </div>
              <CardTitle>{t("about.privacy.title")}</CardTitle>
            </div>
            <CardDescription>{t("about.privacy.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>{t("about.privacy.noServer")}</li>
              <li>{t("about.privacy.localStorage")}</li>
              <li>{t("about.privacy.noAccount")}</li>
              <li>{t("about.privacy.analytics")}</li>
            </ul>
          </CardContent>
        </Card>

        {/* Credits */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Heart className="size-5 text-red-500" />
              </div>
              <CardTitle>{t("about.credits.title")}</CardTitle>
            </div>
            <CardDescription>{t("about.credits.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>
                <Code className="size-3 inline mr-2" />
                {t("about.credits.framework")}
              </li>
              <li>
                <Code className="size-3 inline mr-2" />
                {t("about.credits.ui")}
              </li>
              <li>
                <Code className="size-3 inline mr-2" />
                {t("about.credits.icons")}
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Support */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Heart className="size-5 text-yellow-500" />
            </div>
            <CardTitle>{t("donate.title")}</CardTitle>
          </div>
          <CardDescription>{t("donate.description")}</CardDescription>
        </CardHeader>
        <CardContent>
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
    </>
  );
}
