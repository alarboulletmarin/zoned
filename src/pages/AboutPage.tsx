import { useTranslation } from "react-i18next";
import { GitlabIcon, Shield, Heart, Code, Sparkles, ExternalLink } from "@/components/icons";
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
        title={isEn ? "About" : "A propos"}
        description={isEn
          ? "Learn about Zoned, an open-source running workout library with zone-based training."
          : "Decouvrez Zoned, une bibliotheque open-source de seances de course a pied basee sur les zones."}
        canonical="/about"
      />
      <div className="py-8 space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">{t("about.title")}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {t("about.description")}
        </p>
      </div>

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
    </div>
    </>
  );
}
