import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Clock,
  Dumbbell,
  MapPin,
  Target,
  Circle,
  Mountain,
  Route,
  Leaf,
  Footprints,
  Zap,
  Flame,
  Rocket,
  Timer,
  Shuffle,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ZoneBadge,
  WorkoutStructure,
  CoachingTips,
  WorkoutCardCompact,
  FavoriteButton,
} from "@/components/domain";
import { SessionTimeline, ZoneDistribution } from "@/components/visualization";
import { getWorkoutById, getRelatedWorkouts } from "@/data/workouts";
import type { WorkoutCategory } from "@/types";
import {
  getDominantZone,
  getEstimatedDuration,
  DIFFICULTY_META,
} from "@/types";

/** Category icons using Lucide */
const CATEGORY_ICONS: Record<WorkoutCategory, React.ComponentType<{ className?: string }>> = {
  recovery: Leaf,
  endurance: Footprints,
  tempo: Zap,
  threshold: Flame,
  vma_intervals: Rocket,
  long_run: Route,
  hills: Mountain,
  fartlek: Timer,
  race_pace: Target,
  mixed: Shuffle,
  assessment: ClipboardCheck,
};

export function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation(["session", "library", "common"]);
  const isEn = i18n.language === "en";

  const workout = id ? getWorkoutById(id) : undefined;

  if (!workout) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Workout not found</p>
        <Button variant="link" asChild className="mt-4">
          <Link to="/library">
            <ArrowLeft className="mr-2 size-4" />
            {t("common:actions.backToLibrary")}
          </Link>
        </Button>
      </div>
    );
  }

  const dominantZone = getDominantZone(workout);
  const duration = getEstimatedDuration(workout);
  const CategoryIcon = CATEGORY_ICONS[workout.category];
  void DIFFICULTY_META[workout.difficulty];
  const relatedWorkouts = getRelatedWorkouts(workout);

  // Environment requirements
  const envRequirements: { icon: React.ComponentType<{ className?: string }>; text: string }[] = [];
  if (workout.environment.requiresTrack) {
    envRequirements.push({ icon: Circle, text: t("environment.requiresTrack") });
  }
  if (workout.environment.requiresHills) {
    envRequirements.push({ icon: Mountain, text: t("environment.requiresHills") });
  }
  if (workout.environment.prefersFlat) {
    envRequirements.push({ icon: Route, text: t("environment.prefersFlat") });
  }

  return (
    <div className="py-8 space-y-8">
      {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link to="/library">
          <ArrowLeft className="mr-2 size-4" />
          {t("common:actions.backToLibrary")}
        </Link>
      </Button>

      {/* Header */}
      <header className={`zone-${dominantZone} zone-stripe pl-3 space-y-4`}>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CategoryIcon className="size-4" />
              <span>{t(`library:categories.${workout.category}`)}</span>
            </div>
            <h1 className="text-3xl font-bold">
              {isEn ? workout.nameEn : workout.name}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              {isEn ? workout.descriptionEn : workout.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <FavoriteButton workoutId={workout.id} />
            <ZoneBadge zone={dominantZone} size="lg" showLabel />
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex flex-wrap gap-4">
          <Badge variant="secondary" className="gap-1.5">
            <Clock className="size-3.5" />
            {duration} {t("common:units.minutes")}
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
            <Dumbbell className="size-3.5" />
            {t(`library:difficulty.${workout.difficulty}`)}
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
            <Target className="size-3.5" />
            {t(`targetSystems.${workout.targetSystem}`)}
          </Badge>
          {envRequirements.length > 0 && (
            <Badge variant="outline" className="gap-1.5">
              <MapPin className="size-3.5" />
              {envRequirements.map((r, i) => {
                const Icon = r.icon;
                return <Icon key={i} className="size-3.5" />;
              })}
            </Badge>
          )}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Timeline Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("titles.sessionTimeline")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SessionTimeline workout={workout} />
            </CardContent>
          </Card>

          {/* Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("titles.workoutStructure")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WorkoutStructure workout={workout} />
            </CardContent>
          </Card>

          {/* Coaching Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("titles.coachingTips")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CoachingTips workout={workout} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Zone Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {t("titles.zoneDistribution")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ZoneDistribution workout={workout} />
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {t("titles.details")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("details.duration")}</span>
                <span>
                  {workout.typicalDuration.min}-{workout.typicalDuration.max} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("details.difficulty")}</span>
                <span>{t(`library:difficulty.${workout.difficulty}`)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t("details.targetSystem")}</span>
                <span>{t(`targetSystems.${workout.targetSystem}`)}</span>
              </div>
              {envRequirements.length > 0 && (
                <div className="pt-2 border-t">
                  <span className="text-muted-foreground block mb-2">
                    {t("details.environment")}
                  </span>
                  <ul className="space-y-1">
                    {envRequirements.map((req, index) => {
                      const Icon = req.icon;
                      return (
                        <li key={index} className="flex items-center gap-2">
                          <Icon className="size-4" />
                          <span className="text-xs">{req.text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Related Workouts */}
          {relatedWorkouts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {t("titles.relatedWorkouts")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {relatedWorkouts.map((related) => (
                  <WorkoutCardCompact key={related.id} workout={related} />
                ))}
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
