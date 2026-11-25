import { useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
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
import type { NutritionBlock } from "@/data/guides/nutrition";
import { pickLang } from "@/lib/i18n-utils";
import { StepChrono, StepField } from "@/components/calc";
import { useMyNumbers } from "@/hooks/useMyNumbers";
import { useSettings } from "@/hooks/useSettings";
import { raceLabel } from "@/lib/myNumbers";
import { convertDistance } from "@/lib/units";

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
// The four usual distances, for a race that is not in a plan
// ---------------------------------------------------------------------------
const PRESETS = [
  { label: "5K", km: 5 },
  { label: "10K", km: 10 },
  { label: "Semi", km: 21.1 },
  { label: "Marathon", km: 42.195 },
] as const;

const PRESET_OPTIONS: SegmentedOption<string>[] = PRESETS.map((p) => ({
  value: p.label,
  label: p.label,
}));

const MI_PER_KM = convertDistance(1, "imperial");
const LB_PER_KG = 2.20462;
const ML_PER_FL_OZ = 29.5735;

// ---------------------------------------------------------------------------
// Content block renderer
//
// The reading treatment is the articles' own, .zn-prose and its parts, from
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
  const { t, i18n } = useTranslation(["guides", "simulator"]);
  const isEn = i18n.language?.startsWith("en") ?? false;
  const imperial = useSettings().settings.unitSystem === "imperial";
  const { numbers, ready } = useMyNumbers();
  const [params] = useSearchParams();

  /* La course : celle du lien (?race=), sinon la prochaine du plan, sinon
     Autre. Changer de course repart de ce que le plan en sait. */
  const [choice, setChoice] = useState<string | null>(() => params.get("race"));
  // A key that is no longer in the plan (a past race, an old link) follows the plan.
  const known = choice === "other" || numbers.races.some((r) => r.key === choice);
  const effective = known ? choice! : ready ? (numbers.races[0]?.key ?? "other") : "other";
  const race = numbers.races.find((r) => r.key === effective);
  // null: not touched, the field follows the race.
  const [kmEdit, setKmEdit] = useState<number | undefined | null>(null);
  const [secondsEdit, setSecondsEdit] = useState<number | undefined | null>(null);
  const [weightKg, setWeightKg] = useState<number | undefined>();
  const pick = (key: string) => {
    setChoice(key);
    setKmEdit(null);
    setSecondsEdit(null);
  };

  const km = kmEdit !== null ? kmEdit : race?.distanceKm;
  const seconds = secondsEdit !== null ? secondsEdit : race?.targetSeconds;
  const result =
    km && seconds
      ? calculateFueling({ distanceKm: km, durationMin: Math.round(seconds / 60), bodyWeightKg: weightKg })
      : null;
  const preset = PRESETS.find((p) => p.km === km)?.label ?? "";
  const fluid = (ml: number) =>
    imperial ? `${Math.round(ml / ML_PER_FL_OZ)} fl oz` : `${ml} ml`;

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
        {/* Les courses du plan, puis Autre, comme dans le simulateur. */}
        {numbers.races.length > 0 && (
          <div className="zn-cluster" role="radiogroup" aria-label={t("simulator:pick.label")}>
            {[...numbers.races.map((r) => ({
              key: r.key,
              label: `${raceLabel(r, isEn)} · ${t("simulator:pick.daysLeft", { count: r.daysLeft })}`,
            })), { key: "other", label: t("simulator:pick.other") }].map((c) => (
              <button
                key={c.key}
                type="button"
                role="radio"
                aria-checked={effective === c.key}
                className="zn-chip"
                onClick={() => pick(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}

        {/* The four usual distances, when the race is not one of the plan. */}
        {!race && (
          <Segmented
            className="zn-guide__presets"
            label={t("nutrition.presetsLabel")}
            value={preset}
            onChange={(label) => setKmEdit(PRESETS.find((p) => p.label === label)?.km)}
            options={PRESET_OPTIONS}
          />
        )}

        <div className="zn-calc-fields">
          <StepField
            label={t("nutrition.distanceLabel")}
            unit={imperial ? "mi" : "km"}
            value={km === undefined ? undefined : imperial ? km * MI_PER_KM : km}
            onChange={(v) => setKmEdit(v === undefined ? undefined : imperial ? v / MI_PER_KM : v)}
            step={0.5}
            min={0.1}
            max={500}
            decimals={1}
            fallback={10}
          />
          <StepChrono
            label={t("nutrition.durationLabel")}
            format="hms"
            value={seconds}
            onChange={setSecondsEdit}
            step={60}
            min={60}
            distanceKm={km}
            fallback={3600}
          />
          <StepField
            label={t("nutrition.weightLabel")}
            unit={imperial ? "lb" : "kg"}
            value={weightKg === undefined ? undefined : Math.round(imperial ? weightKg * LB_PER_KG : weightKg)}
            onChange={(v) => setWeightKg(v === undefined ? undefined : imperial ? v / LB_PER_KG : v)}
            step={1}
            min={imperial ? 66 : 30}
            max={imperial ? 330 : 150}
            fallback={imperial ? 154 : 70}
          />
        </div>
        {race && kmEdit === null && secondsEdit === null && (
          <p className="zn-calc-hint">
            {t(race.targetSeconds ? "nutrition.fromPlan" : "nutrition.fromPlanNoTarget")}
          </p>
        )}

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
                value={fluid(result.fluidMlPerHour)}
                label={t("nutrition.fluidPerHour")}
                footnote={t("nutrition.totalFluid", { value: fluid(result.totalFluidMl) })}
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
                  const isPostRace = cp.timeMin >= Math.round(seconds! / 60);
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
        canonical="/guides/nutrition"
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
        {/* 1, the way back, then what this page is */}
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

        {/* 2, your own numbers first: the plan this page exists to produce */}
        <section className="zn-guide__band">
          <FuelingCalculator />
        </section>

        {/* 3, the reading: one theme per tab */}
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
