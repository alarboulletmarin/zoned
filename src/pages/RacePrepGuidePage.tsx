import { useState, useCallback, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ClipboardCheck,
  Calendar,
  Flame,
  TrendingUp,
  Heart,
  RotateCcw,
  ArrowLeft,
  CheckIcon,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { racePrepSections, recoveryTimelines } from "@/data/guides/race-prep";
import type { ContentBlock, RecoveryTimeline } from "@/data/guides/race-prep";
import { usePickLang } from "@/lib/i18n-utils";

const SECTION_ICONS: Record<string, React.ComponentType<IconProps>> = {
  ClipboardCheck,
  Calendar,
  Flame,
  TrendingUp,
  Heart,
  RotateCcw,
};

const STORAGE_KEY = "zoned-racechecklist";

/** The ink ramp has six steps; a timeline never has more than four phases,
 *  but the clamp keeps the paint honest if one ever does. */
function rampStep(index: number): number {
  return Math.min(index + 1, 6);
}

export function RacePrepGuidePage() {
  const { t } = useTranslation("guides");
  const pick = usePickLang();

  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const toggleCheck = useCallback((key: string) => {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch { /* ignore */ }
      return next;
    });
  }, []);

  /**
   * A block of a section, in the article's own reading treatment — .zn-prose
   * and its parts, written once in learn.css. Tips and warnings are the same
   * pulled-out callout the articles use.
   */
  function renderBlock(block: ContentBlock, blockIdx: number) {
    const text = pick(block, "text");

    switch (block.type) {
      case "paragraph":
        return (
          <GlossaryLinkedText
            key={blockIdx}
            as="p"
            className="zn-prose__p"
            text={text ?? ""}
          />
        );

      case "list":
        return (
          <figure key={blockIdx} className="zn-prose__figure">
            {text && <figcaption>{text}</figcaption>}
            <ul className="zn-prose__list">
              {block.items?.map((item, i) => (
                <li key={i}>{pick(item, "text")}</li>
              ))}
            </ul>
          </figure>
        );

      case "checklist":
        return (
          <figure key={blockIdx} className="zn-prose__figure">
            {text && <figcaption>{text}</figcaption>}
            <div
              className="zn-stack"
              style={{ "--gap": "var(--sp-2)" } as CSSProperties}
            >
              {block.items?.map((item, i) => {
                const key = `${blockIdx}-${i}`;
                const isChecked = !!checked[key];
                return (
                  <label key={i} className="zn-guide__checkrow">
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => toggleCheck(key)}
                      className="zn-guide__check"
                    >
                      <CheckIcon aria-hidden="true" />
                    </button>
                    <span className="zn-guide__checktext">
                      {pick(item, "text")}
                    </span>
                  </label>
                );
              })}
            </div>
          </figure>
        );

      case "table":
        return (
          <figure key={blockIdx} className="zn-prose__figure">
            {text && <figcaption>{text}</figcaption>}
            <div className="zn-scroll-x">
              <table className="zn-prose__table">
                <tbody>
                  {block.rows?.map((row, i) => (
                    <tr key={i}>
                      <td>{pick(row, "label")}</td>
                      <td>{pick(row, "value")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </figure>
        );

      case "tip":
      case "warning":
        return (
          <aside key={blockIdx} className="zn-prose__callout" data-kind={block.type}>
            <span className="zn-kicker zn-prose__callout-label">
              {t(`content:article.callout.${block.type}`)}
            </span>
            <GlossaryLinkedText
              as="p"
              className="zn-prose__callout-text"
              text={text ?? ""}
            />
          </aside>
        );

      default:
        return null;
    }
  }

  /**
   * How long a distance takes to come back from. The bar is an ordered scale,
   * so it is painted with the ink ramp — density says "first, then, then" —
   * and every step is named under it, so the bar never asks the reader to
   * decode a shade on its own.
   */
  function renderRecoveryTimeline(timeline: RecoveryTimeline) {
    const distance = pick(timeline, "distance");
    return (
      <Card key={timeline.distance} size="compact">
        <CardHeader>
          <CardTitle className="zn-row zn-row--split">
            <span>{distance}</span>
            <span className="zn-mono zn-faint">
              {timeline.totalDays} {t("racePrep.days")}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent
          className="zn-stack"
          style={{ "--gap": "var(--sp-9)" } as CSSProperties}
        >
          <div className="zn-guide__bar" aria-hidden="true">
            {timeline.phases.map((phase, i) => {
              const match = phase.dayRange.match(/\d+/g);
              const start = match ? parseInt(match[0]) : 1;
              const end = match && match.length > 1 ? parseInt(match[1]) : start;
              const days = end - start + 1;
              const pct = (days / timeline.totalDays) * 100;
              return (
                <span
                  key={i}
                  className="zn-guide__step"
                  data-step={rampStep(i)}
                  style={{ width: `${pct}%` }}
                />
              );
            })}
          </div>

          <ul
            className="zn-stack"
            style={
              {
                "--gap": "var(--sp-6)",
                listStyle: "none",
                margin: 0,
                padding: 0,
              } as CSSProperties
            }
          >
            {timeline.phases.map((phase, i) => (
              <li
                key={i}
                className="zn-row zn-row--start"
                style={{ "--gap": "var(--sp-6)" } as CSSProperties}
              >
                <span
                  className="zn-guide__swatch zn-guide__step"
                  data-step={rampStep(i)}
                  aria-hidden="true"
                />
                <div
                  className="zn-stack zn-fill"
                  style={{ "--gap": "var(--sp-2)" } as CSSProperties}
                >
                  <span className="zn-mono">{phase.dayRange}</span>
                  <span className="zn-body zn-body--sm zn-muted">
                    {pick(phase, "activity")}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <SEOHead
        title={t("racePrep.title")}
        description={t("racePrep.seoDescription")}
        canonical="/guides/race-prep"
        jsonLd={[
          {
            "@type": "Article",
            name: t("racePrep.seoArticleName"),
            description: t("racePrep.seoArticleDescription"),
            url: "https://zoned.run/guides/race-prep",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("home"), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: "Guides", item: "https://zoned.run/guides" },
              { "@type": "ListItem", position: 3, name: t("racePrep.title") },
            ],
          },
          {
            "@type": "HowTo",
            name: t("racePrep.seoHowToName"),
            description: t("racePrep.seoHowToDescription"),
            step: [
              {
                "@type": "HowToStep",
                name: t("racePrep.seoSteps.gear"),
                text: t("racePrep.seoSteps.gearText"),
              },
              {
                "@type": "HowToStep",
                name: t("racePrep.seoSteps.nutrition"),
                text: t("racePrep.seoSteps.nutritionText"),
              },
              {
                "@type": "HowToStep",
                name: t("racePrep.seoSteps.logistics"),
                text: t("racePrep.seoSteps.logisticsText"),
              },
              {
                "@type": "HowToStep",
                name: t("racePrep.seoSteps.taper"),
                text: t("racePrep.seoSteps.taperText"),
              },
              {
                "@type": "HowToStep",
                name: t("racePrep.seoSteps.warmup"),
                text: t("racePrep.seoSteps.warmupText"),
              },
              {
                "@type": "HowToStep",
                name: t("racePrep.seoSteps.pacing"),
                text: t("racePrep.seoSteps.pacingText"),
              },
            ],
          },
        ]}
      />

      <div className="zn-guide">
        {/* 1 — the way back, then what this page is */}
        <section
          className="zn-stack zn-guide__head"
          style={{ "--gap": "var(--sp-6)" } as CSSProperties}
        >
          <Link
            to="/guides"
            className="zn-row zn-mono zn-guide__back"
            style={{ "--gap": "var(--sp-3)" } as CSSProperties}
          >
            <ArrowLeft />
            {t("backToGuides")}
          </Link>
          <span className="zn-kicker">
            {t("racePrep.kicker", { n: racePrepSections.length })}
          </span>
          <h1 className="zn-display" data-level="2">
            {t("racePrep.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-guide__lede">
            {t("racePrep.subtitle")}
          </p>
        </section>

        {/* 2 — the reading: one moment of the preparation per tab */}
        <section className="zn-guide__band">
          <Tabs defaultValue={racePrepSections[0].id}>
            <TabsList className="zn-guide__tabs">
              {racePrepSections.map((section) => {
                const Icon = SECTION_ICONS[section.icon];
                return (
                  <TabsTrigger key={section.id} value={section.id}>
                    {Icon && <Icon aria-hidden="true" />}
                    {pick(section, "title")}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {racePrepSections.map((section) => (
              <TabsContent key={section.id} value={section.id}>
                <div className="zn-guide__panel">
                  <h2 className="zn-title zn-guide__bandhead" data-level="2">
                    {pick(section, "title")}
                  </h2>
                  <div className="zn-prose zn-measure">
                    {section.content.map((block, i) => renderBlock(block, i))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>

        {/* 3 — and afterwards: how many days each distance costs */}
        <section className="zn-guide__band" aria-labelledby="raceprep-recovery">
          <div
            className="zn-stack zn-guide__bandhead"
            style={{ "--gap": "var(--sp-4)" } as CSSProperties}
          >
            <h2 id="raceprep-recovery" className="zn-title" data-level="2">
              {t("racePrep.recoveryTimelines")}
            </h2>
            <p className="zn-body zn-body--sm zn-muted zn-measure">
              {t("racePrep.recoveryTimelinesDescription")}
            </p>
          </div>

          <div
            className="zn-grid"
            style={{ "--cols": 2, "--cols-md": 2 } as CSSProperties}
          >
            {recoveryTimelines.map((tl) => renderRecoveryTimeline(tl))}
          </div>
        </section>
      </div>
    </>
  );
}
