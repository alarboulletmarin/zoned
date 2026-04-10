import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Zap,
  Activity,
  ArrowLeft,
  AlertTriangle,
  Info,
  Clock,
  Flame,
  Target,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { warmupSections, warmupRoutines } from "@/data/guides/warmup";
import type { ContentBlock, Exercise, WarmupRoutine } from "@/data/guides/warmup";

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

function ExerciseItem({
  exercise,
  index,
  isEn,
}: {
  exercise: Exercise;
  index: number;
  isEn: boolean;
}) {
  const name = isEn ? exercise.nameEn : exercise.name;
  const description = isEn ? exercise.descriptionEn : exercise.description;

  return (
    <div className="flex gap-4 items-start">
      <div className="flex items-center justify-center size-7 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0 mt-0.5">
        {index + 1}
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{name}</span>
          {exercise.durationSeconds && (
            <Badge variant="secondary" className="text-xs">
              {formatDuration(exercise.durationSeconds)}
            </Badge>
          )}
          {exercise.repetitions && (
            <Badge variant="secondary" className="text-xs">
              {exercise.repetitions} {exercise.sets && exercise.sets > 1 ? `x${exercise.sets}` : "rep"}
            </Badge>
          )}
          {exercise.sets && !exercise.repetitions && exercise.durationSeconds && (
            <Badge variant="outline" className="text-xs">
              x{exercise.sets}
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export function WarmupGuidePage() {
  const { t, i18n } = useTranslation("guides");
  const isEn = i18n.language?.startsWith("en") ?? false;

  const [selectedRoutine, setSelectedRoutine] = useState<string | null>(null);

  const activeRoutine = warmupRoutines.find((r) => r.id === selectedRoutine) ?? null;

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

      case "exercise":
        return (
          <div key={blockIdx} className="space-y-3">
            {text && <h4 className="font-medium text-sm">{text}</h4>}
            <div className="space-y-4 ml-1">
              {block.exercises?.map((ex, i) => (
                <ExerciseItem key={i} exercise={ex} index={i} isEn={isEn} />
              ))}
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

  function renderRoutineCard(routine: WarmupRoutine) {
    const name = isEn ? routine.nameEn : routine.name;
    const isActive = selectedRoutine === routine.id;
    const Icon = ROUTINE_ICONS[routine.targetSessionType] ?? Activity;

    return (
      <button
        key={routine.id}
        onClick={() => setSelectedRoutine(isActive ? null : routine.id)}
        className={cn(
          "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all cursor-pointer",
          isActive
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-border hover:border-primary/40 hover:bg-accent/50"
        )}
      >
        <Icon className={cn("size-6", isActive ? "text-primary" : "text-muted-foreground")} />
        <span className={cn("text-sm font-medium", isActive ? "text-primary" : "")}>
          {name}
        </span>
        <Badge variant="secondary" className="text-xs">
          {routine.totalDurationMin} min
        </Badge>
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
            {t("warmup.title")}
          </h1>
          <p className="text-muted-foreground text-lg">
            {t("warmup.subtitle")}
          </p>
        </div>

        {/* Routine Selector */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">
            {t("warmup.routines")}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {warmupRoutines.map((routine) => renderRoutineCard(routine))}
          </div>

          {/* Selected routine detail */}
          {activeRoutine && (
            <Card className="bg-gradient-to-br from-muted/30 dark:from-muted/50 to-transparent rounded-xl border border-border/50">
              <CardContent className="pt-6 space-y-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">
                    {isEn ? activeRoutine.nameEn : activeRoutine.name}
                  </h3>
                  <Badge>
                    {activeRoutine.totalDurationMin} min
                  </Badge>
                </div>
                <div className="space-y-4">
                  {activeRoutine.exercises.map((ex, i) => (
                    <ExerciseItem key={i} exercise={ex} index={i} isEn={isEn} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Educational Sections */}
        <Tabs defaultValue={warmupSections[0].id}>
          <TabsList className="flex-wrap h-auto gap-1 mb-6">
            {warmupSections.map((section) => {
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

          {warmupSections.map((section) => (
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
      </div>
    </>
  );
}
