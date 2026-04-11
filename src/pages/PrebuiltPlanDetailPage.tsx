import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Star,
  Flag,
  List,
  CalendarRange,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { getPrebuiltBySlug } from "@/data/prebuilt-plans";
import { getWorkoutById } from "@/data/workouts";
import { convertPrebuiltToPlan } from "@/lib/prebuiltPlanConverter";
import { savePlan, getPlanCount } from "@/lib/planStorage";
import { PHASE_META, RACE_DISTANCE_META } from "@/types/plan";
import type { TrainingPlan } from "@/types/plan";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import type { WorkoutTemplate } from "@/types";
import { toast } from "sonner";
import { PlanCalendar } from "@/components/domain/PlanCalendar";
import { PlanStatsSection } from "@/components/domain/PlanStatsSection";
import { triggerStorageWarning } from "@/components/domain/StorageWarning";
import { SESSION_TYPE_LABELS } from "@/lib/labels";

const DIFFICULTY_LABELS: Record<string, { fr: string; en: string }> = {
  beginner: { fr: "D\u00e9butant", en: "Beginner" },
  intermediate: { fr: "Interm\u00e9diaire", en: "Intermediate" },
  advanced: { fr: "Avanc\u00e9", en: "Advanced" },
  elite: { fr: "\u00c9lite", en: "Elite" },
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

const DAY_LABELS: Record<number, { fr: string; en: string }> = {
  0: { fr: "Lun", en: "Mon" },
  1: { fr: "Mar", en: "Tue" },
  2: { fr: "Mer", en: "Wed" },
  3: { fr: "Jeu", en: "Thu" },
  4: { fr: "Ven", en: "Fri" },
  5: { fr: "Sam", en: "Sat" },
  6: { fr: "Dim", en: "Sun" },
};

export function PrebuiltPlanDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("plan");
  const isEn = i18n.language?.startsWith("en") ?? false;

  const prebuilt = slug ? getPrebuiltBySlug(slug) : undefined;
  const [workoutNames, setWorkoutNames] = useState<Record<string, string>>({});
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  // Build a read-only TrainingPlan for PlanCalendar
  const previewPlan: TrainingPlan | null = useMemo(() => {
    if (!prebuilt) return null;
    return {
      id: "preview",
      config: {
        id: "preview",
        planMode: "prebuilt" as const,
        planName: isEn ? prebuilt.nameEn : prebuilt.name,
        daysPerWeek: prebuilt.sessionsPerWeek,
        createdAt: new Date().toISOString(),
      },
      weeks: prebuilt.weeks,
      totalWeeks: prebuilt.totalWeeks,
      phases: prebuilt.phases,
      name: prebuilt.name,
      nameEn: prebuilt.nameEn,
    };
  }, [prebuilt, isEn]);

  // Load workout names
  useEffect(() => {
    if (!prebuilt) return;
    const workoutIds = new Set<string>();
    for (const week of prebuilt.weeks) {
      for (const session of week.sessions) {
        if (session.workoutId && session.workoutId !== "__race_day__") {
          workoutIds.add(session.workoutId);
        }
      }
    }
    Promise.all(
      Array.from(workoutIds).map(async (wid) => {
        const workout = await getWorkoutById(wid);
        return [wid, workout] as [string, WorkoutTemplate | undefined];
      }),
    ).then((results) => {
      const names: Record<string, string> = {};
      for (const [wid, workout] of results) {
        if (workout) {
          names[wid] = isEn ? workout.nameEn : workout.name;
        }
      }
      setWorkoutNames(names);
    });
  }, [prebuilt, isEn]);

  // Expand first week by default
  useEffect(() => {
    if (prebuilt && prebuilt.weeks.length > 0) {
      setExpandedWeeks(new Set([1]));
    }
  }, [prebuilt]);

  const toggleWeek = (weekNumber: number) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNumber)) {
        next.delete(weekNumber);
      } else {
        next.add(weekNumber);
      }
      return next;
    });
  };

  const handleUse = () => {
    if (!prebuilt) return;
    if (getPlanCount() >= 5) {
      toast.error(t("prebuilt.limitReached"));
      return;
    }
    const plan = convertPrebuiltToPlan(prebuilt, isEn);
    savePlan(plan);
    triggerStorageWarning();
    toast.success(t("prebuilt.planAdded"));
    navigate(`/plan/${plan.id}`);
  };

  // Phase distribution for phase bar
  const phaseSegments = useMemo(() => {
    if (!prebuilt) return [];
    return prebuilt.phases.map((phaseRange) => ({
      phase: phaseRange.phase,
      weeks: phaseRange.endWeek - phaseRange.startWeek + 1,
    }));
  }, [prebuilt]);

  if (!prebuilt) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          {t("prebuilt.notFound")}
        </p>
        <Button variant="link" asChild className="mt-4">
          <Link to="/plan/new/prebuilt">
            <ArrowLeft className="mr-2 size-4" />
            {t("prebuilt.backToPlans")}
          </Link>
        </Button>
      </div>
    );
  }

  const name = isEn ? prebuilt.nameEn : prebuilt.name;
  const description = isEn ? prebuilt.descriptionEn : prebuilt.description;
  const difficultyLabel = DIFFICULTY_LABELS[prebuilt.difficulty];
  const raceMeta = prebuilt.raceDistance
    ? RACE_DISTANCE_META[prebuilt.raceDistance]
    : null;

  const seoDescription = t(isEn ? "prebuilt.seoEn" : "prebuilt.seoFr", {
    name,
    weeks: prebuilt.totalWeeks,
    sessions: prebuilt.sessionsPerWeek,
    desc: description,
  }).slice(0, 160);

  return (
    <>
      <SEOHead
        title={name}
        description={seoDescription}
        canonical={`/plan/prebuilt/${prebuilt.slug}`}
        jsonLd={[
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Accueil", item: "https://zoned.run/" },
              { "@type": "ListItem", position: 2, name: "Plans", item: "https://zoned.run/plan/new/prebuilt" },
              { "@type": "ListItem", position: 3, name },
            ],
          },
          {
            "@type": "ExercisePlan",
            name,
            description,
            exerciseType: "RunningEvent",
            activityDuration: `P${prebuilt.totalWeeks}W`,
            activityFrequency: `${prebuilt.sessionsPerWeek} sessions per week`,
            audience: {
              "@type": "Audience",
              audienceType: prebuilt.difficulty,
            },
            isAccessibleForFree: true,
            provider: {
              "@type": "Organization",
              name: "Zoned",
              url: "https://zoned.run",
            },
          },
        ]}
      />
      <div className="py-8 space-y-6">
        {/* Back */}
        <Button variant="ghost" size="sm" asChild>
          <Link to="/plan/new/prebuilt">
            <ArrowLeft className="mr-2 size-4" />
            {t("prebuilt.backToPlans")}
          </Link>
        </Button>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <h1 className="text-3xl font-bold">{name}</h1>
            <p className="text-muted-foreground max-w-2xl">{description}</p>
            <div className="flex flex-wrap items-center gap-2">
              {difficultyLabel && (
                <Badge variant="secondary">
                  {isEn ? difficultyLabel.en : difficultyLabel.fr}
                </Badge>
              )}
              <Badge variant="outline">
                <Calendar className="size-3" />
                {t("prebuilt.weeksCount", { count: prebuilt.totalWeeks })}
              </Badge>
              <Badge variant="outline">
                <Clock className="size-3" />
                {prebuilt.sessionsPerWeek}{" "}
                {t("prebuilt.sessionsPerWeek")}
              </Badge>
              {raceMeta && (
                <Badge variant="default">
                  {isEn ? raceMeta.labelEn : raceMeta.label}
                </Badge>
              )}
            </div>
          </div>

          {/* CTA top */}
          <Button size="lg" onClick={handleUse} className="shrink-0">
            {t("prebuilt.useThisPlan")}
          </Button>
        </div>

        {/* Phase bar */}
        {phaseSegments.length > 0 && (
          <Card size="compact">
            <CardContent className="px-4">
              <p className="text-sm font-medium mb-2">
                {t("prebuilt.trainingPhases")}
              </p>
              <div className="flex rounded-full overflow-hidden h-3">
                {phaseSegments.map((segment, idx) => {
                  const meta = PHASE_META[segment.phase];
                  const widthPercent =
                    (segment.weeks / prebuilt.totalWeeks) * 100;
                  return (
                    <div
                      key={`${segment.phase}-${idx}`}
                      className={cn(meta.color)}
                      style={{ width: `${widthPercent}%` }}
                      title={`${isEn ? meta.labelEn : meta.label} (${t("prebuilt.weeksCount", { count: segment.weeks })})`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                {phaseSegments.map((segment, idx) => {
                  const meta = PHASE_META[segment.phase];
                  return (
                    <div
                      key={`legend-${segment.phase}-${idx}`}
                      className="flex items-center gap-1.5 text-xs text-muted-foreground"
                    >
                      <div
                        className={cn("size-2.5 rounded-full", meta.color)}
                      />
                      <span>
                        {isEn ? meta.labelEn : meta.label} ({segment.weeks}{" "}
                        {t("prebuilt.weeksShort")})
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        {previewPlan && (
          <PlanStatsSection plan={previewPlan} isEn={isEn} />
        )}

        {/* View toggle + content */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {t("prebuilt.weekByWeek")}
            </h2>
            <div
              className="inline-flex items-center gap-0.5 rounded-lg bg-muted p-1"
              role="radiogroup"
              aria-label={t("viewMode.label")}
            >
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === "calendar"}
                onClick={() => setViewMode("calendar")}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  viewMode === "calendar"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <CalendarRange size={16} />
                <span className="hidden sm:inline">{t("viewMode.calendar")}</span>
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === "list"}
                onClick={() => setViewMode("list")}
                className={cn(
                  "inline-flex items-center justify-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <List size={16} />
                <span className="hidden sm:inline">{t("viewMode.list")}</span>
              </button>
            </div>
          </div>

          {/* Calendar view */}
          {viewMode === "calendar" && previewPlan && (
            <PlanCalendar
              plan={previewPlan}
              workoutNames={workoutNames}
              currentWeek={0}
              isEn={isEn}
            />
          )}

          {/* List view */}
          {viewMode === "list" && (
          <>
          {prebuilt.weeks.map((week) => {
            const isExpanded = expandedWeeks.has(week.weekNumber);
            const phaseMeta = PHASE_META[week.phase];
            const weekLabel = isEn
              ? week.weekLabelEn || `W${week.weekNumber}`
              : week.weekLabel || `S${week.weekNumber}`;

            return (
              <Card
                key={week.weekNumber}
                size="flush"
              >
                {/* Week Header */}
                <button
                  onClick={() => toggleWeek(week.weekNumber)}
                  className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "size-2.5 rounded-full shrink-0",
                        phaseMeta.color,
                      )}
                    />
                    <span className="font-medium truncate">
                      {weekLabel} &mdash;{" "}
                      {isEn ? phaseMeta.labelEn : phaseMeta.label}
                    </span>
                    {week.isRecoveryWeek && (
                      <Badge variant="secondary" className="shrink-0">
                        {t("prebuilt.recovery")}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-muted-foreground">
                      {t("prebuilt.sessionsCount", { count: week.sessions.length })}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Sessions */}
                {isExpanded && (
                  <div className="border-t px-4 py-4 space-y-2">
                    {week.sessions.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-3">
                        {t("prebuilt.noSessions")}
                      </p>
                    ) : (
                      week.sessions.map((session, idx) => {
                        const isRaceDay =
                          session.workoutId === "__race_day__";
                        const sessionLabel =
                          SESSION_TYPE_LABELS[session.sessionType];
                        const dayLabel = DAY_LABELS[session.dayOfWeek];

                        return (
                          <div
                            key={idx}
                            className={cn(
                              "flex items-center gap-3 rounded-lg p-3",
                              isRaceDay
                                ? "bg-primary/10 border border-primary/20"
                                : "bg-secondary/50",
                            )}
                          >
                            {/* Day badge */}
                            {dayLabel && (
                              <span className="text-xs font-medium text-muted-foreground w-8 shrink-0">
                                {isEn ? dayLabel.en : dayLabel.fr}
                              </span>
                            )}

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              {isRaceDay ? (
                                <div className="flex items-center gap-2">
                                  <Flag className="size-4 text-primary" />
                                  <span className="font-semibold text-primary">
                                    {t("prebuilt.raceDay")}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm font-medium line-clamp-1">
                                  {workoutNames[session.workoutId] ||
                                    session.workoutId}
                                </span>
                              )}
                            </div>

                            {/* Badges */}
                            <div className="flex items-center gap-2 shrink-0">
                              {session.isKeySession && (
                                <Star className="size-4 text-yellow-500 fill-yellow-500" />
                              )}
                              {!isRaceDay && sessionLabel && (
                                <Badge variant="outline" className="text-xs">
                                  <div
                                    className={cn(
                                      "size-2 rounded-full",
                                      SESSION_TYPE_COLORS[
                                        session.sessionType
                                      ] || "bg-gray-300",
                                    )}
                                  />
                                  {isEn ? sessionLabel.en : sessionLabel.fr}
                                </Badge>
                              )}
                              {!isRaceDay && (
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="size-3" />
                                  {formatDurationMinutes(session.estimatedDurationMin)}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </Card>
            );
          })}
          </>
          )}
        </div>

        {/* CTA bottom */}
        <div className="flex justify-center pt-4">
          <Button size="lg" onClick={handleUse}>
            {t("prebuilt.useThisPlan")}
          </Button>
        </div>
      </div>
    </>
  );
}
