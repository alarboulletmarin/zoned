import { useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Zap,
  Activity,
  ArrowLeft,
  Clock,
  Flame,
  Target,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/seo";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { warmupSections, warmupRoutines } from "@/data/guides/warmup";
import type { ContentBlock, Exercise, WarmupRoutine } from "@/data/guides/warmup";
import { pickLang } from "@/lib/i18n-utils";

const SECTION_ICONS: Record<string, React.ComponentType<IconProps>> = {
  Zap,
  Trophy: Target,
  Wind: Activity,
  ArrowLeftRight: Activity,
  Activity,
};

const ROUTINE_ICONS: Record<string, React.ComponentType<IconProps>> = {
  easy: Activity,
  intervals: Zap,
  long_run: Clock,
  race: Flame,
};

function formatDuration(seconds: number): string {
  if (seconds >= 60) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return sec > 0 ? `${min}min ${sec}s` : `${min} min`;
  }
  return `${seconds}s`;
}

/**
 * One drill of a routine: its rank in mono, its name, its dose as outlined
 * badges, then the sentence that says how to do it.
 */
function ExerciseItem({
  exercise,
  index,
}: {
  exercise: Exercise;
  index: number;
}) {
  const name = pickLang(exercise, "name");
  const description = pickLang(exercise, "description");

  return (
    <li className="zn-guide__exercise">
      <span className="zn-mono zn-guide__rank">{index + 1}</span>
      <div
        className="zn-stack zn-fill"
        style={{ "--gap": "var(--sp-4)" } as CSSProperties}
      >
        <div
          className="zn-cluster"
          style={{ "--gap": "var(--sp-5)" } as CSSProperties}
        >
          <span className="zn-guide__exname">{name}</span>
          {exercise.durationSeconds && (
            <Badge variant="outline">
              {formatDuration(exercise.durationSeconds)}
            </Badge>
          )}
          {exercise.repetitions && (
            <Badge variant="outline">
              {exercise.repetitions} {exercise.sets && exercise.sets > 1 ? `x${exercise.sets}` : "rep"}
            </Badge>
          )}
          {exercise.sets && !exercise.repetitions && exercise.durationSeconds && (
            <Badge variant="outline">x{exercise.sets}</Badge>
          )}
        </div>
        <p className="zn-body zn-body--sm zn-muted">{description}</p>
      </div>
    </li>
  );
}

export function WarmupGuidePage() {
  const { t } = useTranslation("guides");

  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);

  const activeRoutine = warmupRoutines.find((r) => r.id === selectedRoutine) ?? null;

  /**
   * A block of a section, rendered with the article's own reading treatment —
   * .zn-prose and its parts, written once in learn.css. A tip and a warning
   * are the same pulled-out callout the articles use: two ink rules and a mono
   * label saying which kind it is.
   */
  function renderBlock(block: ContentBlock, blockIdx: number) {
    const text = pickLang(block, "text");

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
                <li key={i}>{pickLang(item, "text")}</li>
              ))}
            </ul>
          </figure>
        );

      case "exercise":
        return (
          <figure key={blockIdx} className="zn-prose__figure">
            {text && <figcaption>{text}</figcaption>}
            <ul
              className="zn-stack"
              style={
                {
                  "--gap": "var(--sp-9)",
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                } as CSSProperties
              }
            >
              {block.exercises?.map((ex, i) => (
                <ExerciseItem key={i} exercise={ex} index={i} />
              ))}
            </ul>
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
   * One of the four routines. A toggle, not a link: pressing it opens the
   * detail below and pressing it again closes it, which is what `aria-pressed`
   * says. Chosen is the 2.5px vermillon frame — never a tint.
   */
  function renderRoutineCard(routine: WarmupRoutine) {
    const name = pickLang(routine, "name");
    const isActive = selectedRoutine === routine.id;
    const Icon = ROUTINE_ICONS[routine.targetSessionType] ?? Activity;

    return (
      <button
        key={routine.id}
        type="button"
        aria-pressed={isActive}
        onClick={() => setSelectedRoutine(isActive ? null : routine.id)}
        className="zn-guide__routine"
      >
        <Icon aria-hidden="true" />
        <span className="zn-guide__routinename">{name}</span>
        <span className="zn-mono zn-faint">
          {routine.totalDurationMin} {t("min")}
        </span>
      </button>
    );
  }

  return (
    <>
      <SEOHead
        title={t("warmup.title")}
        description={t("warmup.seoDescription")}
        canonical="/guides/warmup"
        jsonLd={[
          {
            "@type": "Article",
            name: t("warmup.seoArticleName"),
            description: t("warmup.seoArticleDescription"),
            url: "https://zoned.run/guides/warmup",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("home"), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: "Guides", item: "https://zoned.run/guides" },
              { "@type": "ListItem", position: 3, name: t("warmup.title") },
            ],
          },
          {
            "@type": "HowTo",
            name: t("warmup.seoHowToName"),
            description: t("warmup.seoHowToDescription"),
            totalTime: "PT18M",
            step: [
              {
                "@type": "HowToStep",
                name: t("warmup.seoSteps.jog"),
                text: t("warmup.seoSteps.jogText"),
              },
              {
                "@type": "HowToStep",
                name: t("warmup.seoSteps.drills"),
                text: t("warmup.seoSteps.drillsText"),
              },
              {
                "@type": "HowToStep",
                name: t("warmup.seoSteps.swings"),
                text: t("warmup.seoSteps.swingsText"),
              },
              {
                "@type": "HowToStep",
                name: t("warmup.seoSteps.strides"),
                text: t("warmup.seoSteps.stridesText"),
              },
              {
                "@type": "HowToStep",
                name: t("warmup.seoSteps.rest"),
                text: t("warmup.seoSteps.restText"),
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
            {t("warmup.kicker", { n: warmupRoutines.length })}
          </span>
          <h1 className="zn-display" data-level="2">
            {t("warmup.title")}
          </h1>
          <p className="zn-body zn-body--lead zn-guide__lede">
            {t("warmup.subtitle")}
          </p>
        </section>

        {/* 2 — pick a routine, read its drills */}
        <section className="zn-guide__band" aria-labelledby="warmup-routines">
          <div className="zn-row zn-row--split zn-guide__bandhead">
            <h2 id="warmup-routines" className="zn-title" data-level="2">
              {t("warmup.routines")}
            </h2>
            <span className="zn-mono zn-faint">{t("warmup.selectRoutine")}</span>
          </div>

          <div
            className="zn-grid"
            style={{ "--cols": 4, "--cols-md": 2 } as CSSProperties}
          >
            {warmupRoutines.map((routine) => renderRoutineCard(routine))}
          </div>

          {activeRoutine && (
            <div
              className="zn-stack"
              style={{ "--gap": "var(--sp-11)", marginBlockStart: "var(--sp-13)" } as CSSProperties}
            >
              <div className="zn-row zn-row--split">
                <h3 className="zn-title" data-level="4">
                  {pickLang(activeRoutine, "name")}
                </h3>
                <span className="zn-mono zn-faint">
                  {activeRoutine.totalDurationMin} {t("min")}
                </span>
              </div>
              <ul
                className="zn-stack zn-measure"
                style={
                  {
                    "--gap": "var(--sp-9)",
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                  } as CSSProperties
                }
              >
                {activeRoutine.exercises.map((ex, i) => (
                  <ExerciseItem key={i} exercise={ex} index={i} />
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* 3 — the reading: one section per tab, in the article's own column */}
        <section className="zn-guide__band">
          <Tabs defaultValue={warmupSections[0].id}>
            <TabsList className="zn-guide__tabs">
              {warmupSections.map((section) => {
                const Icon = SECTION_ICONS[section.icon];
                return (
                  <TabsTrigger key={section.id} value={section.id}>
                    {Icon && <Icon aria-hidden="true" />}
                    {pickLang(section, "title")}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {warmupSections.map((section) => (
              <TabsContent key={section.id} value={section.id}>
                <div className="zn-guide__panel">
                  <h2 className="zn-title zn-guide__bandhead" data-level="2">
                    {pickLang(section, "title")}
                  </h2>
                  <div className="zn-prose zn-measure">
                    {section.content.map((block, i) => renderBlock(block, i))}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>
      </div>
    </>
  );
}
