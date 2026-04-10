import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Lightbulb, Loader2 } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import { ZoneBadge } from "./ZoneBadge";
import { SessionTimeline, transformSessionBlocks } from "@/components/visualization";
import { useWorkoutOfTheDay } from "@/hooks";
import { getDominantZone } from "@/types";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";

export function WorkoutOfTheDay() {
  const { t, i18n } = useTranslation(["common", "session", "library"]);
  const isEn = i18n.language?.startsWith("en") ?? false;

  const { workout, isLoading } = useWorkoutOfTheDay();

  if (isLoading || !workout) {
    return (
      <Card className="rounded-xl">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const dominantZone = getDominantZone(workout);
  const name = isEn ? workout.nameEn : workout.name;
  const description = isEn ? workout.descriptionEn : workout.description;
  const tips = isEn ? workout.coachingTipsEn : workout.coachingTips;
  const sessionData = transformSessionBlocks(
    { warmup: workout.warmupTemplate, mainSet: workout.mainSetTemplate, cooldown: workout.cooldownTemplate },
    isEn
  );
  const duration = Math.round(sessionData.totalDurationMin);

  return (
    <Card className={`zone-${dominantZone} bg-gradient-to-br from-zone-${dominantZone}/10 dark:from-zone-${dominantZone}/20 to-transparent rounded-xl overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200 group relative`}>
      {/* Bento header: content left + duration & tips right */}
      <div className="grid grid-cols-1 md:grid-cols-12">
        {/* Left: identity */}
        <div className="md:col-span-8 p-5 md:p-10 space-y-3 md:space-y-4">
          <h2 className="text-sm md:text-base font-bold text-primary uppercase tracking-widest">
            {t("common:workoutOfTheDay.title")}
          </h2>

          <p className="text-xl md:text-3xl font-bold leading-tight">
            {name}
          </p>

          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <ZoneBadge zone={`Z${dominantZone}`} size="sm" showLabel />
            <span className="text-border">·</span>
            <span>{t(`library:categories.${workout.category}`)}</span>
            <span className="text-border">·</span>
            <span>{t(`library:difficulty.${workout.difficulty}`)}</span>
            {/* Duration inline on mobile only */}
            <span className="text-border md:hidden">·</span>
            <span className="font-bold text-foreground md:hidden">{duration} {t("common:units.minutes")}</span>
          </div>

          <p className="text-sm md:text-base text-muted-foreground leading-relaxed line-clamp-2 max-w-2xl relative z-10">
            <GlossaryLinkedText text={description} />
          </p>
        </div>

        {/* Right: duration compact + tips (desktop/tablet only) */}
        <div className="md:col-span-4 bg-muted/30 p-6 md:p-8 hidden md:flex flex-col justify-between">
          {/* Duration */}
          <div className="text-center mb-4">
            <span className="text-4xl lg:text-5xl font-bold tracking-tight text-primary block">
              {duration}
            </span>
            <span className="text-xs text-muted-foreground">
              {t("common:units.minutes")}
            </span>
          </div>

          {/* Tips */}
          {tips.length > 0 && (
            <div className="space-y-2">
              {tips.slice(0, 3).map((tip: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <Lightbulb className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground line-clamp-2">{tip}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Timeline - full width */}
      <div className="px-5 md:px-10">
        <SessionTimeline workout={workout} />
      </div>

      {/* Bottom: tips (mobile) + subtle CTA indicator */}
      <div className="px-5 md:px-10 pb-5 md:pb-8 pt-3 md:pt-4 space-y-3">
        {/* Tips on mobile only */}
        {tips.length > 0 && (
          <div className="space-y-2 md:hidden">
            {tips.slice(0, 2).map((tip: string, index: number) => (
              <div key={index} className="flex items-start gap-2">
                <Lightbulb className="size-3.5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end">
          <Link
            to={`/workout/${workout.id}`}
            className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all after:absolute after:inset-0"
          >
            {t("common:workoutOfTheDay.seeDetails")}
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
