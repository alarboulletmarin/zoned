import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
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
  Loader2,
  Link2,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ZoneBadge,
  WorkoutCardCompact,
  FavoriteButton,
  ZonePersonalizationCTA,
  TipCard,
} from "@/components/domain";
import { WorkoutStructure, CoachingTips } from "@/components/domain/WorkoutStructure";
import { ExportMenu } from "@/components/domain/ExportMenu";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/issueBuilder";
import { NutritionRecoverySection } from "@/components/domain/NutritionRecoverySection";
import { GlossaryLinkedText } from "@/components/domain/GlossaryLinkedText";
import { SEOHead } from "@/components/seo";
import { SessionTimeline, ZoneDistribution, transformSessionBlocks } from "@/components/visualization";
import { useWorkout, useRelatedWorkouts, useTips } from "@/hooks";
import type { WorkoutCategory, ZoneRange } from "@/types";
import {
  getDominantZone,
  DIFFICULTY_META,
} from "@/types";
import { loadUserZonePrefs, calculateAllZones } from "@/lib/zones";

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
  const location = useLocation();
  const { t, i18n } = useTranslation(["session", "library", "common"]);
  const isEn = i18n.language?.startsWith("en") ?? false;

  const locationState = location.state as { from?: string; planId?: string; planName?: string } | null;
  const backTo = locationState?.from === "plan" && locationState.planId
    ? { path: `/plan/${locationState.planId}`, label: isEn ? `Back to ${locationState.planName || "plan"}` : `Retour au plan` }
    : { path: "/library", label: t("common:actions.backToLibrary") };

  const { workout, isLoading } = useWorkout(id);
  const { workouts: relatedWorkouts } = useRelatedWorkouts(workout);

  // Get contextual tip based on dominant zone
  const dominantZoneForTip = workout ? getDominantZone(workout) : undefined;
  const { tip } = useTips({
    filters: dominantZoneForTip ? { zones: [dominantZoneForTip] } : undefined,
    autoLoad: !!workout,
  });

  // Load user zones from localStorage
  const [userZones, setUserZones] = useState<ZoneRange[]>([]);
  const [hasUserZones, setHasUserZones] = useState(false);

  useEffect(() => {
    const prefs = loadUserZonePrefs();
    if (prefs && (prefs.fcMax || prefs.vma)) {
      const zones = calculateAllZones(prefs);
      setUserZones(zones);
      setHasUserZones(true);
    } else {
      setUserZones([]);
      setHasUserZones(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="py-12 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{t("common:errors.workoutNotFound")}</p>
        <Button variant="link" asChild className="mt-4">
          <Link to={backTo.path}>
            <ArrowLeft className="mr-2 size-4" />
            {backTo.label}
          </Link>
        </Button>
      </div>
    );
  }

  const dominantZone = getDominantZone(workout);
  const sessionData = transformSessionBlocks(
    {
      warmup: workout.warmupTemplate,
      mainSet: workout.mainSetTemplate,
      cooldown: workout.cooldownTemplate,
    },
    isEn
  );
  const duration = Math.round(sessionData.totalDurationMin);
  const CategoryIcon = CATEGORY_ICONS[workout.category];
  void DIFFICULTY_META[workout.difficulty];

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

  const seoTitle = isEn ? workout.nameEn : workout.name;
  const seoDescription = (isEn ? workout.descriptionEn : workout.description).slice(0, 155);

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        canonical={`/workout/${workout.id}`}
        ogType="article"
        jsonLd={[
          {
            "@type": "ExercisePlan",
            name: seoTitle,
            description: seoDescription,
            exerciseType: "Running",
            activityDuration: `PT${duration}M`,
            intensity: workout.difficulty,
            additionalProperty: [
              { "@type": "PropertyValue", name: "Category", value: workout.category },
              { "@type": "PropertyValue", name: "Target System", value: workout.targetSystem },
              { "@type": "PropertyValue", name: "Difficulty", value: workout.difficulty },
            ],
            isPartOf: {
              "@type": "CollectionPage",
              name: "Zoned Running Workouts Library",
              url: "https://zoned.run/library",
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: "Bibliothèque", item: "https://zoned.run/library" },
              { "@type": "ListItem", position: 3, name: seoTitle },
            ],
          },
        ]}
      />
      <div className="py-8 space-y-8">
        {/* Back Button */}
      <Button variant="ghost" size="sm" asChild>
        <Link to={backTo.path}>
          <ArrowLeft className="mr-2 size-4" />
          {backTo.label}
        </Link>
      </Button>

      {/* Header */}
      <header className={`zone-${dominantZone} zone-stripe pl-3 space-y-4`}>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CategoryIcon className="size-4" />
              <span>{t(`library:categories.${workout.category}`)}</span>
            </div>
            <h1 className="text-3xl font-bold">
              {isEn ? workout.nameEn : workout.name}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              <GlossaryLinkedText text={isEn ? workout.descriptionEn : workout.description} />
            </p>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={async () => {
                const ok = await copyToClipboard(window.location.href);
                if (ok) toast.success(t("common:actions.linkCopied"));
                else toast.error(t("common:errors.generic"));
              }}
              title={t("common:actions.copyLink")}
            >
              <Link2 className="size-4" />
            </Button>
            <ExportMenu workout={workout} />
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

      {/* Zone Personalization CTA - show only if user has no zones configured */}
      {!hasUserZones && <ZonePersonalizationCTA />}

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
              <WorkoutStructure workout={workout} userZones={hasUserZones ? userZones : undefined} />
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

          {/* Nutrition & Recovery */}
          <NutritionRecoverySection workout={workout} />
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
                <span>{duration} min</span>
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

          {/* Contextual Tip */}
          {tip && (
            <TipCard tip={tip} variant="card" />
          )}

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
    </>
  );
}
