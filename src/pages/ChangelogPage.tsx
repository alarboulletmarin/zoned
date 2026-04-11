import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Rocket, RefreshCw } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/seo";
import { changelogVersions } from "@/data/changelog";
import type { ChangeType, ChangelogItem } from "@/data/changelog";
import { useWhatsNew } from "@/hooks/useWhatsNew";

const changeTypeConfig: Record<
  ChangeType,
  { color: string; dotColor: string; icon?: React.ComponentType<{ className?: string; size?: number | string }> }
> = {
  added: {
    color: "text-green-600 dark:text-green-400",
    dotColor: "bg-green-500",
    icon: Sparkles,
  },
  changed: {
    color: "text-blue-600 dark:text-blue-400",
    dotColor: "bg-blue-500",
    icon: RefreshCw,
  },
  fixed: {
    color: "text-amber-600 dark:text-amber-400",
    dotColor: "bg-amber-500",
  },
  performance: {
    color: "text-purple-600 dark:text-purple-400",
    dotColor: "bg-purple-500",
    icon: Rocket,
  },
};

export function ChangelogPage() {
  const { t, i18n } = useTranslation("common");
  const isEn = i18n.language?.startsWith("en") ?? false;
  const { markAsSeen } = useWhatsNew();

  useEffect(() => {
    markAsSeen();
  }, [markAsSeen]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return new Intl.DateTimeFormat(i18n.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getChangeTypeLabel = (type: ChangeType): string => {
    return t(`changelog.${type}`);
  };

  return (
    <>
      <SEOHead
        title={t("changelog.title")}
        description={t("changelog.subtitle")}
        canonical="/changelog"
        jsonLd={{
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: t("article.home"), item: "https://zoned.run/" },
            { "@type": "ListItem", position: 2, name: t("changelog.title") },
          ],
        }}
      />
      <div className="py-8 space-y-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold">{t("changelog.title")}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t("changelog.subtitle")}
          </p>
        </div>

        {/* Timeline */}
        <div className="space-y-10">
          {changelogVersions.map((version) => (
            <div key={version.version} className="space-y-4">
              {/* Version header */}
              <div className="flex items-center gap-3">
                <Badge className="text-sm px-3 py-1">
                  v{version.version}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {formatDate(version.date)}
                </span>
              </div>

              {/* Change sections */}
              <div className="space-y-5 pl-2 border-l-2 border-border ml-3">
                {(
                  Object.entries(version.changes) as [
                    ChangeType,
                    ChangelogItem[],
                  ][]
                ).map(([type, items]) => {
                  const config = changeTypeConfig[type];
                  const Icon = config.icon;

                  return (
                    <div key={type} className="pl-6 space-y-2">
                      <h3
                        className={`flex items-center gap-2 text-sm font-semibold ${config.color}`}
                      >
                        {Icon ? (
                          <Icon className="size-4" />
                        ) : (
                          <span
                            className={`size-2.5 rounded-full ${config.dotColor}`}
                          />
                        )}
                        {getChangeTypeLabel(type)}
                      </h3>
                      <ul className="space-y-1.5">
                        {items.map((item, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <span className="mt-1.5 shrink-0 size-1.5 rounded-full bg-current opacity-40" />
                            <span>
                              {(isEn ? item.categoryEn : item.category) && (
                                <Badge
                                  variant="outline"
                                  className="mr-2 text-[10px] px-1.5 py-0"
                                >
                                  {isEn ? item.categoryEn : item.category}
                                </Badge>
                              )}
                              {isEn ? item.textEn : item.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
