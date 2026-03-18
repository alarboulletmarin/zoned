import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Lightbulb, AlertTriangle, Loader2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ZoneBadge } from "./ZoneBadge";
import { SessionTimeline, ZoneDistribution } from "@/components/visualization";
import { useWorkoutOfTheDay } from "@/hooks";
import { getDominantZone } from "@/types";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";

export function WorkoutOfTheDay() {
  const { t, i18n } = useTranslation(["common", "session", "library"]);
  const isEn = i18n.language?.startsWith("en") ?? false;

  const { workout, isLoading } = useWorkoutOfTheDay();

  if (isLoading || !workout) {
    return (
      <section className="space-y-6">
        <Card className="pl-2">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </section>
    );
  }

  const dominantZone = getDominantZone(workout);

  const name = isEn ? workout.nameEn : workout.name;
  const description = isEn ? workout.descriptionEn : workout.description;
  const tips = isEn ? workout.coachingTipsEn : workout.coachingTips;
  const mistakes = isEn ? workout.commonMistakesEn : workout.commonMistakes;

  return (
    <section className="space-y-6">
      <Card className={`zone-${dominantZone} zone-stripe pl-2`}>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">
                {t("common:workoutOfTheDay.title")}
              </p>
              <CardTitle className="text-2xl">
                {name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <ZoneBadge zone={`Z${dominantZone}`} size="sm" />
                <span className="text-sm text-muted-foreground">
                  {t(`library:categories.${workout.category}`)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          <p className="text-muted-foreground"><GlossaryLinkedText text={description} /></p>

          {/* Timeline */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">
              {t("session:visualization.timeline")}
            </h4>
            <SessionTimeline workout={workout} />
          </div>

          {/* Grid: Tips & Zones */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left column: Tips */}
            <div className="space-y-4">
              {tips.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Lightbulb className="size-4 text-success" />
                    {t("common:workoutOfTheDay.coachingTips")}
                  </h4>
                  <ul className="space-y-1.5">
                    {tips.slice(0, 3).map((tip: string, index: number) => (
                      <li
                        key={index}
                        className="text-sm text-muted-foreground pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-success"
                      >
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {mistakes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <AlertTriangle className="size-4 text-destructive" />
                    {t("common:workoutOfTheDay.commonMistakes")}
                  </h4>
                  <ul className="space-y-1.5">
                    {mistakes.slice(0, 2).map((mistake: string, index: number) => (
                      <li
                        key={index}
                        className="text-sm text-muted-foreground pl-5 relative before:content-['•'] before:absolute before:left-0 before:text-destructive"
                      >
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Right column: Zone Distribution */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold">
                {t("session:visualization.zoneDistribution")}
              </h4>
              <ZoneDistribution workout={workout} />
            </div>
          </div>

          {/* CTA */}
          <div className="pt-2">
            <Button asChild variant="outline">
              <Link to={`/workout/${workout.id}`}>
                {t("common:workoutOfTheDay.seeDetails")}
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
