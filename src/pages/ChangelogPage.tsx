import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { SEOHead } from "@/components/seo";
import { Button } from "@/components/ui/button";
import { changelogVersions } from "@/data/changelog";
import type { ChangeType, ChangelogItem } from "@/data/changelog";
import { useWhatsNew } from "@/hooks/useWhatsNew";
import { usePickLang } from "@/lib/i18n-utils";

/** How many releases the page opens with. The rest is one click away. */
const VISIBLE_RELEASES = 5;

export function ChangelogPage() {
  const { t, i18n } = useTranslation(["common", "content"]);
  const pickLang = usePickLang();
  const { markAsSeen } = useWhatsNew();
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    markAsSeen();
  }, [markAsSeen]);

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat(i18n.language, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateStr + "T00:00:00"));

  // 37 releases is a long page and most of it is history. The recent ones are
  // what a returning user came for; the rest is named and counted, not hidden.
  const releases = showAll
    ? changelogVersions
    : changelogVersions.slice(0, VISIBLE_RELEASES);
  const hidden = changelogVersions.length - releases.length;

  return (
    <>
      <SEOHead
        title={t("content:changelog.title")}
        description={t("content:changelog.subtitle")}
        canonical="/changelog"
        jsonLd={{
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: t("content:article.home"), item: "https://zoned.run/" },
            { "@type": "ListItem", position: 2, name: t("content:changelog.title") },
          ],
        }}
      />

      <div className="zn-log">
        <section className="zn-section">
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-10)" } as CSSProperties}
          >
            <span className="zn-kicker">
              {t("content:changelogPage.releases", {
                n: changelogVersions.length,
              })}
            </span>
            <h1 className="zn-display" data-level="2">
              {t("content:changelog.title")}
            </h1>
            <p className="zn-body zn-body--lead zn-measure">
              {t("content:changelog.subtitle")}
            </p>
          </div>
        </section>

        {releases.map((version) => {
          const groups = Object.entries(version.changes) as [
            ChangeType,
            ChangelogItem[],
          ][];

          return (
            <section
              key={version.version}
              className="zn-section zn-split"
              style={
                {
                  "--split": "200px 1fr",
                  "--gap": "var(--sp-15)",
                } as CSSProperties
              }
              aria-labelledby={`release-${version.version}`}
            >
              <div
                className="zn-stack"
                style={{ "--gap": "var(--sp-3)" } as CSSProperties}
              >
                <h2 id={`release-${version.version}`} className="zn-log__version">
                  v{version.version}
                </h2>
                <span className="zn-caption zn-faint">
                  {formatDate(version.date)}
                </span>
              </div>

              <div
                className="zn-stack"
                style={{ "--gap": "var(--sp-11)" } as CSSProperties}
              >
                {groups.map(([type, items]) => (
                  <div
                    key={type}
                    className="zn-stack"
                    style={{ "--gap": "var(--sp-5)" } as CSSProperties}
                  >
                    <span className="zn-kicker">
                      {t(`content:changelog.${type}`)} · {items.length}
                    </span>
                    <ul className="zn-log__group">
                      {items.map((item, idx) => (
                        <li key={idx} className="zn-log__entry">
                          {pickLang(item, "category") ? (
                            <span className="zn-kicker zn-kicker--xs">
                              {pickLang(item, "category")}
                            </span>
                          ) : null}
                          <span className="zn-body zn-body--sm zn-muted">
                            {pickLang(item, "text")}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          );
        })}

        {hidden > 0 ? (
          <section className="zn-section">
            <Button variant="outline" onClick={() => setShowAll(true)}>
              {t("content:changelogPage.showOlder", { n: hidden })}
            </Button>
          </section>
        ) : null}
      </div>
    </>
  );
}
