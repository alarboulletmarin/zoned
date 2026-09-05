import { useState, useCallback, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Utensils,
  Droplets,
  Clock,
  Zap,
  Heart as HeartIcon,
  Leaf,
  Flame,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Segmented, type SegmentedOption } from "@/components/ui/segmented";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SEOHead } from "@/components/seo";
import { StatBlock } from "@/components/domain/StatBlock";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import {
  nutritionSections,
  calculateFueling,
} from "@/data/guides/nutrition";
import type {
  NutritionBlock,
  FuelingResult,
} from "@/data/guides/nutrition";
import { pickLang } from "@/lib/i18n-utils";

// ---------------------------------------------------------------------------
// Icon mapping: section icon names -> components
// ---------------------------------------------------------------------------
const SECTION_ICONS: Record<string, React.ComponentType<IconProps>> = {
  UtensilsCrossed: Utensils,
  Wheat: Flame,
  Clock: Clock,
  Zap: Zap,
  Droplets: Droplets,
  HeartPulse: HeartIcon,
  Leaf: Leaf,
};

// ---------------------------------------------------------------------------
// Shared preset distances
// ---------------------------------------------------------------------------
const PRESETS = [
  { label: "5K", km: 5, defaultMin: 25 },
  { label: "10K", km: 10, defaultMin: 50 },
  { label: "Semi", km: 21.1, defaultMin: 105 },
  { label: "Marathon", km: 42.195, defaultMin: 210 },
] as const;

const PRESET_OPTIONS: SegmentedOption<string>[] = PRESETS.map((p) => ({
  value: p.label,
  label: p.label,
}));

// ---------------------------------------------------------------------------
// Content block renderer
//
// The reading treatment is the articles' own — .zn-prose and its parts, from
// learn.css. Nothing here restyles a paragraph; a tip and a warning are the
// same pulled-out callout an article uses, told apart by a mono label.
// ---------------------------------------------------------------------------
function renderBlock(
  block: NutritionBlock,
  index: number,
  calloutLabel: (kind: "tip" | "warning") => string,
) {
  switch (block.type) {
    case "paragraph":
      return (
        <GlossaryLinkedText
          key={index}
          as="p"
          className="zn-prose__p"
          text={pickLang(block, "text")}
        />
      );

    case "list":
      return (
        <ul key={index} className="zn-prose__list">
          {block.items?.map((item, i) => (
            <li key={i}>{pickLang(item, "text")}</li>
          ))}
        </ul>
      );

    case "tip":
    case "warning":
      return (
        <aside key={index} className="zn-prose__callout" data-kind={block.type}>
          <span className="zn-kicker zn-prose__callout-label">
            {calloutLabel(block.type)}
          </span>
          <p className="zn-prose__callout-text">{pickLang(block, "text")}</p>
        </aside>
      );

    case "table":
      return (
        <div key={index} className="zn-scroll-x">
          <table className="zn-prose__table">
            <tbody>
              {block.rows?.map((row, i) => (
                <tr key={i}>
                  <td>{pickLang(row, "label")}</td>
                  <td>{pickLang(row, "value")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Fueling Calculator
// ---------------------------------------------------------------------------
function FuelingCalculator() {
  const { t } = useTranslation("guides");

  const [distanceKm, setDistanceKm] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [bodyWeightKg, setBodyWeightKg] = useState("");
  const [result, setResult] = useState<FuelingResult | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handlePreset = useCallback((label: string) => {
    const preset = PRESETS.find((p) => p.label === label);
    if (!preset) return;
    setDistanceKm(String(preset.km));
    setDurationMin(String(preset.defaultMin));
    setActivePreset(preset.label);
    setResult(null);
  }, []);

  const handleCalculate = useCallback(() => {
    const dist = parseFloat(distanceKm);
    const dur = parseFloat(durationMin);
    if (!dist || dist <= 0 || !dur || dur <= 0) return;

    const weight = bodyWeightKg ? parseFloat(bodyWeightKg) : undefined;
    const r = calculateFueling({
      distanceKm: dist,
      durationMin: dur,
      bodyWeightKg: weight && weight > 0 ? weight : undefined,
    });
    setResult(r);
  }, [distanceKm, durationMin, bodyWeightKg]);

  const canCalculate =
    parseFloat(distanceKm) > 0 && parseFloat(durationMin) > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("nutrition.calculatorTitle")}</CardTitle>
        <CardDescription>
          {t("nutrition.calculatorDescription")}
        </CardDescription>
      </CardHeader>

      <CardContent
        className="zn-stack"
        style={{ "--gap": "var(--sp-13)" } as CSSProperties}
      >
        {/* The four usual distances. A radiogroup: one tab stop, arrow keys
            move the choice, and the chosen segment inverts to ink so the
            screen's single vermillon fill stays on the action below. */}
        <Segmented
          label={t("nutrition.presetsLabel")}
          value={activePreset ?? ""}
          onChange={handlePreset}
          options={PRESET_OPTIONS}
        />

        <div className="zn-guide__fields">
          <div className="zn-guide__field">
            <label htmlFor="calc-distance" className="zn-label">
              {t("nutrition.distanceLabel")}
            </label>
            <span
              className="zn-numfield"
              style={{ "--field-w": "76px" } as CSSProperties}
            >
              <input
                id="calc-distance"
                type="number"
                min={0.1}
                step={0.1}
                placeholder="42.195"
                value={distanceKm}
                onChange={(e) => {
                  setDistanceKm(e.target.value);
                  setActivePreset(null);
                  setResult(null);
                }}
                className="zn-numfield__input"
              />
            </span>
          </div>

          <div className="zn-guide__field">
            <label htmlFor="calc-duration" className="zn-label">
              {t("nutrition.durationLabel")}
            </label>
            <span
              className="zn-numfield"
              style={{ "--field-w": "76px" } as CSSProperties}
            >
              <input
                id="calc-duration"
                type="number"
                min={1}
                step={1}
                placeholder="210"
                value={durationMin}
                onChange={(e) => {
                  setDurationMin(e.target.value);
                  setResult(null);
                }}
                className="zn-numfield__input"
              />
            </span>
          </div>

          <div className="zn-guide__field">
            <label htmlFor="calc-weight" className="zn-label">
              {t("nutrition.weightLabel")}
            </label>
            <span
              className="zn-numfield"
              style={{ "--field-w": "76px" } as CSSProperties}
            >
              <input
                id="calc-weight"
                type="number"
                min={30}
                max={150}
                step={0.5}
                placeholder="70"
                value={bodyWeightKg}
                onChange={(e) => {
                  setBodyWeightKg(e.target.value);
                  setResult(null);
                }}
                className="zn-numfield__input"
              />
            </span>
          </div>
        </div>

        {/* The screen's one vermillon fill. */}
        <Button onClick={handleCalculate} disabled={!canCalculate}>
          {t("nutrition.calculate")}
        </Button>

        {result && (
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-14)" } as CSSProperties}
          >
            <div
              className="zn-grid"
              style={{ "--cols": 4, "--cols-md": 2 } as CSSProperties}
            >
              <StatBlock
                tone="card"
                value={`${result.carbsPerHourG} g`}
                label={t("nutrition.carbsPerHour")}
                footnote={t("nutrition.totalLabel", { value: result.totalCarbsG })}
              />
              <StatBlock
                tone="card"
                value={String(result.gelCount)}
                label={t("nutrition.gelsNeeded")}
                footnote={
                  result.gelFrequencyMin > 0
                    ? t("nutrition.gelFrequency", { min: result.gelFrequencyMin })
                    : t("nutrition.gelNotNeeded")
                }
              />
              <StatBlock
                tone="card"
                value={`${result.fluidMlPerHour} ml`}
                label={t("nutrition.fluidPerHour")}
                footnote={t("nutrition.totalFluid", { value: result.totalFluidMl })}
              />
              <StatBlock
                tone="card"
                value={`${result.sodiumMgPerHour} mg`}
                label={t("nutrition.sodiumPerHour")}
                footnote={
                  result.electrolyteDrink
                    ? t("nutrition.electrolyteDrinkRecommended")
                    : t("nutrition.waterSufficient")
                }
              />
            </div>

            {/* The plan on a clock: the rule is the race, the mono badge is
                the moment, the sentence is the instruction. */}
            <div
              className="zn-stack"
              style={{ "--gap": "var(--sp-9)" } as CSSProperties}
            >
              <h3 className="zn-title" data-level="4">
                {t("nutrition.fuelingTimeline")}
              </h3>
              <ol className="zn-guide__timeline">
                {result.timeline.map((cp, i) => {
                  const isPreRace = cp.timeMin < 0;
                  const isPostRace = cp.timeMin >= parseFloat(durationMin);
                  const phase = isPreRace
                    ? "pre"
                    : isPostRace
                      ? "post"
                      : "during";

                  return (
                    <li key={i} className="zn-guide__tick">
                      <span
                        className="zn-guide__dot"
                        data-phase={phase}
                        aria-hidden="true"
                      />
                      <div
                        className="zn-stack zn-fill"
                        style={{ "--gap": "var(--sp-3)" } as CSSProperties}
                      >
                        <span className="zn-mono zn-faint">
                          {formatTimeMin(cp.timeMin, t("nutrition.timeStart"))}
                        </span>
                        <span className="zn-body zn-body--sm zn-muted">
                          {pickLang(cp, "action")}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {result.tips.length > 0 && (
              <div
                className="zn-stack"
                style={{ "--gap": "var(--sp-9)" } as CSSProperties}
              >
                <h3 className="zn-title" data-level="4">
                  {t("nutrition.tips")}
                </h3>
                <ul className="zn-prose__list zn-measure">
                  {result.tips.map((tip, i) => (
                    <li key={i} className="zn-body zn-body--sm zn-muted">
                      {pickLang(tip, "text")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Format timeline minutes (e.g. -180 -> "T-3h", 25 -> "T+25min", 0 -> "Start")
// ---------------------------------------------------------------------------
function formatTimeMin(min: number, startLabel: string): string {
  if (min === 0) return startLabel;

  const abs = Math.abs(min);
  const sign = min < 0 ? "-" : "+";

  if (abs >= 60 && abs % 60 === 0) {
    return `T${sign}${abs / 60}h`;
  }
  if (abs >= 60) {
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return `T${sign}${h}h${String(m).padStart(2, "0")}`;
  }
  return `T${sign}${abs}min`;
}

// ---------------------------------------------------------------------------
// Main page component
// ---------------------------------------------------------------------------
export function NutritionGuidePage() {
  const { t } = useTranslation("guides");
  const calloutLabel = (kind: "tip" | "warning") =>
    t(`content:article.callout.${kind}`);

  return (
    <>
      <SEOHead
        title={t("nutrition.pageTitle")}
        description={t("nutrition.seoDescription")}
        canonical="/nutrition"
        jsonLd={[
          {
            "@type": "Article",
            name: t("nutrition.seoArticleName"),
            description: t("nutrition.seoArticleDescription"),
            url: "https://zoned.run/guides/nutrition",
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t("home"), item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: "Guides", item: "https://zoned.run/guides" },
              { "@type": "ListItem", position: 3, name: t("nutrition.pageTitle") },
            ],
          },
          {
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: t("nutrition.faq.carbsPerDay"),
                acceptedAnswer: {
                  "@type": "Answer",
                  text: t("nutrition.faq.carbsPerDayAnswer"),
                },
              },
              {
                "@type": "Question",
                name: t("nutrition.faq.carbLoading"),
                acceptedAnswer: {
                  "@type": "Answer",
                  text: t("nutrition.faq.carbLoadingAnswer"),
                },
              },
              {
                "@type": "Question",
                name: t("nutrition.faq.raceFueling"),
                acceptedAnswer: {
                  "@type": "Answer",
                  text: t("nutrition.faq.raceFuelingAnswer"),
                },
              },
              {
                "@type": "Question",
                name: t("nutrition.faq.preRaceMeal"),
                acceptedAnswer: {
                  "@type": "Answer",
                  text: t("nutrition.faq.preRaceMealAnswer"),
                },
              },
              {
                "@type": "Question",
                name: t("nutrition.faq.recovery"),
                acceptedAnswer: {
                  "@type": "Answer",
                  text: t("nutrition.faq.recoveryAnswer"),
                },
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
            {t("nutrition.kicker", { n: nutritionSections.length })}
          </span>
          <h1 className="zn-display" data-level="2">
            {t("nutrition.pageTitle")}
          </h1>
          <p className="zn-body zn-body--lead zn-guide__lede">
            {t("nutrition.subtitle")}
          </p>
        </section>

        {/* 2 — your own numbers first: the plan this page exists to produce */}
        <section className="zn-guide__band">
          <FuelingCalculator />
        </section>

        {/* 3 — the reading: one theme per tab */}
        <section className="zn-guide__band">
          <Tabs defaultValue={nutritionSections[0].id}>
            <TabsList className="zn-guide__tabs">
              {nutritionSections.map((section) => {
                const Icon = SECTION_ICONS[section.icon] ?? Utensils;
                return (
                  <TabsTrigger key={section.id} value={section.id}>
                    <Icon aria-hidden="true" />
                    {pickLang(section, "title")}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {nutritionSections.map((section) => (
              <TabsContent key={section.id} value={section.id}>
                <div className="zn-guide__panel">
                  <h2 className="zn-title zn-guide__bandhead" data-level="2">
                    {pickLang(section, "title")}
                  </h2>
                  <div className="zn-prose zn-measure">
                    {section.content.map((block, i) =>
                      renderBlock(block, i, calloutLabel),
                    )}
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
