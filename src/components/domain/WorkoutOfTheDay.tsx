import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight, Lightbulb, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ZoneBadge } from "./ZoneBadge";
import { SessionTimeline, ZoneDistribution } from "@/components/visualization";
import { getWorkoutOfTheDay } from "@/data/workouts";
import { getDominantZone } from "@/types";

export function WorkoutOfTheDay() {
  const { t, i18n } = useTranslation(["common", "session", "library"]);
  const isEn = i18n.language === "en";

  const workout = getWorkoutOfTheDay();
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
          <p className="text-muted-foreground">{description}</p>

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
                    {tips.slice(0, 3).map((tip, index) => (
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
                    {mistakes.slice(0, 2).map((mistake, index) => (
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
