import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Activity,
  ArrowLeft,
  Clock,
  HeartPulse,
  Leaf,
  Lightbulb,
  Mountain,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "@/components/icons";
import type { IconProps } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp } from "@/components/editorial";
import { WeekSummaryBar } from "@/components/weekly";
import { cn } from "@/lib/utils";
import { getPrebuiltWeekBySlug } from "@/data/prebuilt-weeks";
import { prebuiltWeekToPlan, planWeekToSlots } from "@/lib/weekToPlan";
import { computeWeekStats } from "@/lib/weekStats";
import { savePlan } from "@/lib/planStorage";
import { triggerStorageWarning } from "@/components/domain/StorageWarning";
import { SESSION_TYPE_LABELS } from "@/lib/labels";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { usePickLang, usePickLocale } from "@/lib/i18n-utils";
import { useWorkouts } from "@/hooks";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import { useCrossDisciplineWorkouts } from "@/hooks/useCrossDisciplineWorkouts";
import type { AnyWorkoutTemplate } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<IconProps>> = {
  Mountain,
  TrendingUp,
  Zap,
  Leaf,
  Activity,
  HeartPulse,
};

const DIFFICULTY_GRADIENT: Record<string, string> = {
  beginner: "from-green-500/10 dark:from-green-500/20",
  intermediate: "from-yellow-500/10 dark:from-yellow-500/20",
  advanced: "from-orange-500/10 dark:from-orange-500/20",
  elite: "from-red-500/10 dark:from-red-500/20",
};

const SESSION_TYPE_COLORS: Record<string, string> = {
  endurance: "bg-blue-400",
  long_run: "bg-blue-600",
  tempo: "bg-yellow-400",
  threshold: "bg-orange-400",
  vo2max: "bg-red-500",
  speed: "bg-red-400",
  fartlek: "bg-purple-400",
  hills: "bg-green-500",
  race_specific: "bg-amber-500",
  recovery: "bg-slate-300 dark:bg-slate-700",
};

export function PrebuiltWeekDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation("library");
  const pick = usePickLang();
  const pickLocale = usePickLocale();

  const week = slug ? getPrebuiltWeekBySlug(slug) : undefined;

  // Workout catalog (running + cross-discipline + strength) → id lookup.
  const { workouts: running } = useWorkouts();
  const { workouts: strength } = useStrengthWorkouts();
  const { workouts: cycling } = useCrossDisciplineWorkouts("cycling");
  const { workouts: swimming } = useCrossDisciplineWorkouts("swimming");
  const byId = useMemo(() => {
    const m = new Map<string, AnyWorkoutTemplate>();
    for (const w of [...running, ...cycling, ...swimming, ...strength]) {
      m.set(w.id, w);
    }
    return m;
  }, [running, cycling, swimming, strength]);

  // Build a temp single-week plan, then resolve its slots for the preview —
  // reusing the same path the live editor uses (planWeekToSlots + stats).
  const slots = useMemo(() => {
    if (!week) return [];
    const plan = prebuiltWeekToPlan(week);
    return planWeekToSlots(plan.weeks[0], byId);
  }, [week, byId]);
  const stats = useMemo(() => computeWeekStats(slots), [slots]);

  if (!week) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">{t("weekly.prebuilt.notFound")}</p>
        <Button variant="link" asChild className="mt-4">
          <Link to="/weeks/new/prebuilt">
            <ArrowLeft className="mr-2 size-4" />
            {t("weekly.prebuilt.backToList")}
          </Link>
        </Button>
      </div>
    );
  }

  const name = pick(week, "name");
  const description = pick(week, "description");
  const whyItWorks = pick(week, "whyItWorks");
  const provenance = week.provenance ? pick(week, "provenance") : null;
  const Icon = ICON_MAP[week.icon] ?? Mountain;

  const handleUse = () => {
    const plan = prebuiltWeekToPlan(week);
    if (!savePlan(plan)) {
      toast.error(t("weekly.toast.saveFailed", { defaultValue: "Échec de l'enregistrement" }));
      return;
    }
    triggerStorageWarning();
    toast.success(t("weekly.prebuilt.weekAdded"));
    navigate(`/weeks/${plan.id}`);
  };

  // Sessions ordered Mon→Sun for the list.
  const orderedSessions = [...week.sessions].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <>
      <SEOHead
        title={name}
        description={description.slice(0, 160)}
        canonical={`/weeks/prebuilt/${week.slug}`}
        jsonLd={{
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
            { "@type": "ListItem", position: 2, name: "Semaines", item: "https://zoned.run/weeks/new/prebuilt" },
            { "@type": "ListItem", position: 3, name },
          ],
        }}
      />
      <div className="py-8 space-y-6 pb-28 lg:pb-8">
        {/* Back */}
        <Button variant="ghost" size="sm" asChild>
          <Link to="/weeks/new/prebuilt">
            <ArrowLeft className="mr-2 size-4" />
            {t("weekly.prebuilt.backToList")}
          </Link>
        </Button>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "size-11 rounded-full bg-gradient-to-br to-transparent flex items-center justify-center shrink-0",
                  DIFFICULTY_GRADIENT[week.difficulty] ?? "from-gray-400/10",
                )}
              >
                <Icon className="size-5 text-foreground/80" />
              </div>
              <EditorialTitle as="h1">{name}</EditorialTitle>
            </div>
            <FadeUp as="p" delay={0.1} className="text-muted-foreground max-w-2xl">
              {description}
            </FadeUp>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {t(`weekly.prebuilt.category.${week.category}`)}
              </Badge>
              <Badge variant="outline">
                {t("weekly.prebuilt.sessions", { count: week.sessions.length })}
              </Badge>
              {provenance && (
                <Badge variant="outline" className="font-normal">
                  {provenance}
                </Badge>
              )}
            </div>
          </div>

          {/* CTA top (desktop) */}
          <Button size="lg" onClick={handleUse} className="shrink-0 hidden lg:inline-flex">
            <Sparkles className="size-4" />
            {t("weekly.prebuilt.useThisWeek")}
          </Button>
        </div>

        {/* Preview: stats + 80/20 gauge + rhythm (reuses WeekSummaryBar). */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{t("weekly.prebuilt.preview")}</h2>
          <WeekSummaryBar
            stats={stats}
            slots={slots}
            targetVolumeH={week.settings.targetVolumeH}
          />
        </div>

        {/* Why this week */}
        <Card className={cn("border-border/60 bg-gradient-to-br to-transparent", DIFFICULTY_GRADIENT[week.difficulty] ?? "from-gray-400/10")}>
          <CardContent className="p-4 sm:p-5 space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="size-4 text-foreground/70" />
              <h2 className="text-base font-semibold">{t("weekly.prebuilt.whyTitle")}</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{whyItWorks}</p>
            {provenance && (
              <p className="text-xs text-muted-foreground/80 italic pt-1">— {provenance}</p>
            )}
          </CardContent>
        </Card>

        {/* Session list with per-session "why" */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{t("weekly.prebuilt.whySessionTitle")}</h2>
          <div className="space-y-2">
            {orderedSessions.map((session, idx) => {
              const workout = byId.get(session.workoutId);
              const workoutName = workout ? pick(workout, "name") : session.workoutId;
              const sessionLabel = SESSION_TYPE_LABELS[session.sessionType];
              const why = pick(session, "why");
              const dayLabel = t(`weekly.days.${session.dayOfWeek}`);

              return (
                <Card key={idx} size="flush" className="border-border/50">
                  <CardContent className="p-3 sm:p-4 space-y-2">
                    {/* Top row: day, name, badges */}
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-medium text-muted-foreground w-10 shrink-0 pt-0.5">
                        {dayLabel}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium">{workoutName}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {session.isKeySession && (
                          <Star className="size-4 text-yellow-500 fill-yellow-500" />
                        )}
                        {sessionLabel && (
                          <Badge variant="outline" className="text-xs">
                            <div
                              className={cn(
                                "size-2 rounded-full",
                                SESSION_TYPE_COLORS[session.sessionType] || "bg-gray-300",
                              )}
                            />
                            {pickLocale(sessionLabel)}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatDurationMinutes(session.estimatedDurationMin)}
                        </span>
                      </div>
                    </div>
                    {/* Per-session pedagogy */}
                    <p className="text-xs text-muted-foreground leading-relaxed pl-[3.25rem]">
                      {why}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA bottom (desktop) */}
        <div className="hidden lg:flex justify-center pt-2">
          <Button size="lg" onClick={handleUse}>
            <Sparkles className="size-4" />
            {t("weekly.prebuilt.useThisWeek")}
          </Button>
        </div>
      </div>

      {/* Mobile sticky CTA (thumb zone). */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <Button className="w-full" size="lg" onClick={handleUse}>
          <Sparkles className="size-4" />
          {t("weekly.prebuilt.useThisWeek")}
        </Button>
      </div>
    </>
  );
}
