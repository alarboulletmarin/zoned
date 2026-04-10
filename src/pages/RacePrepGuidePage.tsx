import { useState, useCallback } from "react";
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
  AlertTriangle,
  Info,
  CheckIcon,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { racePrepSections, recoveryTimelines } from "@/data/guides/race-prep";
import type { ContentBlock, RecoveryTimeline } from "@/data/guides/race-prep";

const SECTION_ICONS: Record<string, React.ComponentType<IconProps>> = {
  ClipboardCheck,
  Calendar,
  Flame,
  TrendingUp,
  Heart,
  RotateCcw,
};

const STORAGE_KEY = "zoned-racechecklist";

const PHASE_COLORS = [
  "bg-red-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-blue-500",
];

export function RacePrepGuidePage() {
  const { t, i18n } = useTranslation("guides");
  const isEn = i18n.language?.startsWith("en") ?? false;

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

  function renderBlock(block: ContentBlock, blockIdx: number) {
    const text = isEn ? (block.textEn ?? block.text) : block.text;

    switch (block.type) {
      case "paragraph":
        return (
          <p key={blockIdx} className="text-muted-foreground leading-relaxed">
            <GlossaryLinkedText text={text ?? ""} />
          </p>
        );

      case "list":
        return (
          <div key={blockIdx} className="space-y-2">
            {text && <h4 className="font-medium text-sm">{text}</h4>}
            <ul className="space-y-1.5 ml-1">
              {block.items?.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-1 shrink-0">&#8226;</span>
                  <span>{isEn ? item.textEn : item.text}</span>
                </li>
              ))}
            </ul>
          </div>
        );

      case "checklist":
        return (
          <div key={blockIdx} className="space-y-2">
            {text && <h4 className="font-medium text-sm">{text}</h4>}
            <div className="space-y-1.5">
              {block.items?.map((item, i) => {
                const key = `${blockIdx}-${i}`;
                const isChecked = !!checked[key];
                return (
                  <label
                    key={i}
                    className="flex items-start gap-3 cursor-pointer group"
                  >
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isChecked}
                      onClick={() => toggleCheck(key)}
                      className={cn(
                        "mt-0.5 shrink-0 size-5 rounded border-2 flex items-center justify-center transition-colors",
                        isChecked
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30 group-hover:border-primary/50"
                      )}
                    >
                      {isChecked && <CheckIcon className="size-3" />}
                    </button>
                    <span
                      className={cn(
                        "text-sm transition-colors",
                        isChecked
                          ? "line-through text-muted-foreground/50"
                          : "text-muted-foreground"
                      )}
                    >
                      {isEn ? item.textEn : item.text}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );

      case "table":
        return (
          <div key={blockIdx} className="space-y-2">
            {text && <h4 className="font-medium text-sm">{text}</h4>}
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <tbody>
                  {block.rows?.map((row, i) => (
                    <tr key={i} className={cn(i % 2 === 0 ? "bg-muted/30" : "")}>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        {isEn ? row.labelEn : row.label}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {isEn ? row.valueEn : row.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "tip":
        return (
          <div
            key={blockIdx}
            className="flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"
          >
            <Info className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <p className="text-sm text-emerald-800 dark:text-emerald-200"><GlossaryLinkedText text={text ?? ""} /></p>
          </div>
        );

      case "warning":
        return (
          <div
            key={blockIdx}
            className="flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
          >
            <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <p className="text-sm text-amber-800 dark:text-amber-200"><GlossaryLinkedText text={text ?? ""} /></p>
          </div>
        );

      default:
        return null;
    }
  }

  function renderRecoveryTimeline(timeline: RecoveryTimeline) {
    const distance = isEn ? timeline.distanceEn : timeline.distance;
    return (
      <Card key={timeline.distance} size="compact" className="bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent rounded-xl border border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{distance}</span>
            <Badge variant="secondary">
              {timeline.totalDays} {t("racePrep.days")}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Horizontal bar */}
          <div className="flex h-3 rounded-full overflow-hidden">
            {timeline.phases.map((phase, i) => {
              const match = phase.dayRange.match(/\d+/g);
              const start = match ? parseInt(match[0]) : 1;
              const end = match && match.length > 1 ? parseInt(match[1]) : start;
              const days = end - start + 1;
              const pct = (days / timeline.totalDays) * 100;
              return (
                <div
                  key={i}
                  className={cn(PHASE_COLORS[i % PHASE_COLORS.length], "transition-all")}
                  style={{ width: `${pct}%` }}
                  title={`${phase.dayRange}: ${isEn ? phase.activityEn : phase.activity}`}
                />
              );
            })}
          </div>
          {/* Phase list */}
          <div className="space-y-2">
            {timeline.phases.map((phase, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className={cn("size-3 rounded-full mt-1 shrink-0", PHASE_COLORS[i % PHASE_COLORS.length])} />
                <div className="min-w-0">
                  <span className="text-xs font-medium">{phase.dayRange}</span>
                  <p className="text-xs text-muted-foreground">
                    {isEn ? phase.activityEn : phase.activity}
                  </p>
                </div>
              </div>
            ))}
          </div>
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
      <div className="py-8">
        {/* Back link */}
        <Link
          to="/guides"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          {t("backToGuides")}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {t("racePrep.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("racePrep.subtitle")}
          </p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue={racePrepSections[0].id}>
          <TabsList className="flex-wrap h-auto gap-1 mb-6">
            {racePrepSections.map((section) => {
              const Icon = SECTION_ICONS[section.icon];
              return (
                <TabsTrigger key={section.id} value={section.id} className="gap-1.5">
                  {Icon && <Icon className="size-3.5" />}
                  <span className="hidden sm:inline">
                    {isEn ? section.titleEn : section.title}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {racePrepSections.map((section) => (
            <TabsContent key={section.id} value={section.id}>
              <div className="space-y-6">
                <h2 className="text-xl font-semibold">
                  {isEn ? section.titleEn : section.title}
                </h2>
                {section.content.map((block, i) => renderBlock(block, i))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Recovery Timelines */}
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-2">
            {t("racePrep.recoveryTimelines")}
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            {t("racePrep.recoveryTimelinesDescription")}
          </p>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {recoveryTimelines.map((tl) => renderRecoveryTimeline(tl))}
          </div>
        </div>
      </div>
    </>
  );
}
