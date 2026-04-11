import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Lightbulb,
  AlertTriangle,
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
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
// Input styling (matches ZoneCalculator pattern)
// ---------------------------------------------------------------------------
const inputClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

// ---------------------------------------------------------------------------
// Shared preset distances
// ---------------------------------------------------------------------------
const PRESETS = [
  { label: "5K", km: 5, defaultMin: 25 },
  { label: "10K", km: 10, defaultMin: 50 },
  { label: "Semi", km: 21.1, defaultMin: 105 },
  { label: "Marathon", km: 42.195, defaultMin: 210 },
] as const;

// ---------------------------------------------------------------------------
// Content block renderer
// ---------------------------------------------------------------------------
function renderBlock(block: NutritionBlock, index: number) {
  switch (block.type) {
    case "paragraph":
      return (
        <p key={index} className="text-muted-foreground leading-relaxed">
          <GlossaryLinkedText text={pickLang(block, "text")} />
        </p>
      );

    case "list":
      return (
        <ul key={index} className="space-y-2 ml-1">
          {block.items?.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
              <span className="text-primary mt-1 shrink-0">&#8226;</span>
              <span>{pickLang(item, "text")}</span>
            </li>
          ))}
        </ul>
      );

    case "tip":
      return (
        <div
          key={index}
          className="flex gap-3 rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20"
        >
          <Lightbulb className="size-5 shrink-0 text-green-600 dark:text-green-400 mt-0.5" />
          <p className="text-sm text-green-800 dark:text-green-200">
            {pickLang(block, "text")}
          </p>
        </div>
      );

    case "warning":
      return (
        <div
          key={index}
          className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/20"
        >
          <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            {pickLang(block, "text")}
          </p>
        </div>
      );

    case "table":
      return (
        <div key={index} className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {block.rows?.map((row, i) => (
                <tr
                  key={i}
                  className={cn(
                    "border-b border-border last:border-0",
                    i % 2 === 0
                      ? "bg-muted/30"
                      : "bg-transparent"
                  )}
                >
                  <td className="px-3 py-2.5 font-medium text-foreground whitespace-nowrap">
                    {pickLang(row, "label")}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {pickLang(row, "value")}
                  </td>
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
// Fueling Calculator Component
// ---------------------------------------------------------------------------
function FuelingCalculator() {
  const { t } = useTranslation("guides");

  const [distanceKm, setDistanceKm] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [bodyWeightKg, setBodyWeightKg] = useState("");
  const [result, setResult] = useState<FuelingResult | null>(null);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const handlePreset = useCallback((preset: typeof PRESETS[number]) => {
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
        <CardTitle className="flex items-center gap-2 text-lg">
          <Utensils className="size-5 text-primary" />
          {t("nutrition.calculatorTitle")}
        </CardTitle>
        <CardDescription>
          {t("nutrition.calculatorDescription")}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <Button
              key={p.label}
              variant={activePreset === p.label ? "default" : "outline"}
              size="sm"
              onClick={() => handlePreset(p)}
            >
              {p.label}
            </Button>
          ))}
        </div>

        {/* Input fields */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="calc-distance" className="text-sm font-medium">
              {t("nutrition.distanceLabel")}
            </label>
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
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="calc-duration" className="text-sm font-medium">
              {t("nutrition.durationLabel")}
            </label>
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
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="calc-weight" className="text-sm font-medium">
              {t("nutrition.weightLabel")}
            </label>
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
              className={inputClass}
            />
          </div>
        </div>

        {/* Calculate button */}
        <Button
          onClick={handleCalculate}
          disabled={!canCalculate}
          className="w-full sm:w-auto"
        >
          {t("nutrition.calculate")}
        </Button>

        {/* Results */}
        {result && (
          <div className="space-y-6 pt-2">
            {/* Summary cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                label={t("nutrition.carbsPerHour")}
                value={`${result.carbsPerHourG}g`}
                sub={t("nutrition.totalLabel", { value: result.totalCarbsG })}
              />
              <SummaryCard
                label={t("nutrition.gelsNeeded")}
                value={String(result.gelCount)}
                sub={
                  result.gelFrequencyMin > 0
                    ? t("nutrition.gelFrequency", { min: result.gelFrequencyMin })
                    : t("nutrition.gelNotNeeded")
                }
              />
              <SummaryCard
                label={t("nutrition.fluidPerHour")}
                value={`${result.fluidMlPerHour}ml`}
                sub={t("nutrition.totalFluid", { value: result.totalFluidMl })}
              />
              <SummaryCard
                label={t("nutrition.sodiumPerHour")}
                value={`${result.sodiumMgPerHour}mg`}
                sub={
                  result.electrolyteDrink
                    ? t("nutrition.electrolyteDrinkRecommended")
                    : t("nutrition.waterSufficient")
                }
              />
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">
                {t("nutrition.fuelingTimeline")}
              </h3>
              <div className="relative space-y-0">
                {result.timeline.map((cp, i) => {
                  const isPreRace = cp.timeMin < 0;
                  const isPostRace =
                    cp.timeMin >= parseFloat(durationMin);
                  const phase = isPreRace
                    ? "pre"
                    : isPostRace
                      ? "post"
                      : "during";

                  return (
                    <div
                      key={i}
                      className="flex gap-3 group"
                    >
                      {/* Timeline line + dot */}
                      <div className="flex flex-col items-center">
                        <div
                          className={cn(
                            "size-2.5 rounded-full shrink-0 mt-1.5",
                            phase === "pre"
                              ? "bg-blue-500"
                              : phase === "post"
                                ? "bg-green-500"
                                : "bg-primary"
                          )}
                        />
                        {i < result.timeline.length - 1 && (
                          <div className="w-px flex-1 bg-border min-h-[16px]" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="pb-4 min-w-0">
                        <Badge
                          variant="outline"
                          className="mb-1 text-xs font-mono"
                        >
                          {formatTimeMin(cp.timeMin, t("nutrition.timeStart"))}
                        </Badge>
                        <p className="text-sm text-muted-foreground">
                          {pickLang(cp, "action")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tips */}
            {result.tips.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm">
                  {t("nutrition.tips")}
                </h3>
                <ul className="space-y-2">
                  {result.tips.map((tip, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm text-muted-foreground"
                    >
                      <Lightbulb className="size-4 shrink-0 text-green-500 mt-0.5" />
                      <span>{pickLang(tip, "text")}</span>
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
// Small summary card for calculator results
// ---------------------------------------------------------------------------
function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent border border-border/50 p-3 space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
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

      <div className="py-8 space-y-8">
        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {t("nutrition.pageTitle")}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            {t("nutrition.subtitle")}
          </p>
        </div>

        {/* Fueling calculator */}
        <FuelingCalculator />

        {/* Content sections as tabs */}
        <Tabs defaultValue={nutritionSections[0].id}>
          <TabsList className="flex-wrap h-auto gap-1">
            {nutritionSections.map((section) => {
              const Icon = SECTION_ICONS[section.icon] ?? Utensils;
              return (
                <TabsTrigger key={section.id} value={section.id}>
                  <Icon className="size-4" />
                  <span className="hidden sm:inline">
                    {pickLang(section, "title")}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {nutritionSections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              <Card className="bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent rounded-xl border border-border/50">
                <CardHeader>
                  <CardTitle>
                    {pickLang(section, "title")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {section.content.map((block, i) =>
                    renderBlock(block, i)
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </>
  );
}
