import { useState, useEffect, useMemo } from "react";
import { sessionColorClass } from "@/lib/sessionColors";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
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
import { Card } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { getPrebuiltBySlug } from "@/data/prebuilt-plans";
import { getWorkoutById } from "@/data/workouts";
import { convertPrebuiltToPlan } from "@/lib/prebuiltPlanConverter";
import { savePlan } from "@/lib/planStorage";
import { PHASE_META, RACE_DISTANCE_META } from "@/types/plan";
import type { TrainingPlan } from "@/types/plan";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import type { AnyWorkoutTemplate } from "@/types";
import { toast } from "sonner";
import { PlanCalendar } from "@/components/domain/PlanCalendar";
import { PlanStatsSection } from "@/components/domain/PlanStatsSection";
import { PHASE_ZONE_BAR } from "@/components/domain/PrebuiltPlanCard";
import { triggerStorageWarning } from "@/components/domain/StorageWarning";
import { SESSION_TYPE_LABELS } from "@/lib/labels";
import { useIsEnglish, usePickLang, usePickLocale } from "@/lib/i18n-utils";

export function PrebuiltPlanDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation("plan");
  const isEn = useIsEnglish();
  const pick = usePickLang();
  const pickLocale = usePickLocale();

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
        planName: pick(prebuilt, "name"),
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
        if (session.workoutId && session.workoutId !== "__race_day__" && session.workoutId !== "__intermediate_race__") {
          workoutIds.add(session.workoutId);
        }
      }
    }
    Promise.all(
      Array.from(workoutIds).map(async (wid) => {
        const workout = await getWorkoutById(wid);
        return [wid, workout] as [string, AnyWorkoutTemplate | undefined];
      }),
    ).then((results) => {
      const names: Record<string, string> = {};
      for (const [wid, workout] of results) {
        if (workout) {
          names[wid] = pick(workout, "name");
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
    const plan = convertPrebuiltToPlan(prebuilt);
    if (!savePlan(plan)) {
      toast.error(t("errors.planSaveFailed"));
      return;
    }
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

  const name = pick(prebuilt, "name");
  const description = pick(prebuilt, "description");
  const difficultyLabel = t(`prebuilt.difficulty.${prebuilt.difficulty}`);
  const raceMeta = prebuilt.raceDistance
    ? RACE_DISTANCE_META[prebuilt.raceDistance]
    : null;

  const seoDescription = t("prebuilt.seoDescription", {
    name,
    weeks: prebuilt.totalWeeks,
    sessions: prebuilt.sessionsPerWeek,
    desc: description,
  }).slice(0, 160);

  return (
    <>
      <SEOHead
        title={t("prebuilt.seoTitle", { name })}
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
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 border-b border-filet pb-8 items-end">
          <div>
            <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-muted-foreground">
              {difficultyLabel}
              {raceMeta ? ` · ${pick(raceMeta, "label")}` : ""}
            </p>
            <h1 className="font-sans font-bold uppercase leading-[0.86] tracking-[-0.05em] text-5xl sm:text-6xl lg:text-7xl mt-3">
              {name}
            </h1>
            <p className="mt-4 text-base leading-[1.55] text-foreground/75 max-w-2xl">
              {description}
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-5">
              <Button size="lg" onClick={handleUse}>
                {t("prebuilt.useThisPlan")}
              </Button>
            </div>
          </div>

          {/* "What this plan asks" stat panel */}
          <div className="border border-border p-5">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
              {t("prebuilt.trainingPhases")}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-3 font-mono">
              <div>
                <p className="text-2xl">{prebuilt.totalWeeks}</p>
                <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mt-1">
                  {t("prebuilt.weeksShort")}
                </p>
              </div>
              <div>
                <p className="text-2xl">{prebuilt.sessionsPerWeek}</p>
                <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mt-1">
                  {t("prebuilt.sessionsPerWeek")}
                </p>
              </div>
            </div>
            {phaseSegments.length > 0 && (
              <>
                <div className="flex gap-px mt-4 h-2.5" aria-hidden="true">
                  {phaseSegments.map((segment, idx) => {
                    const widthPercent = (segment.weeks / prebuilt.totalWeeks) * 100;
                    return (
                      <div
                        key={`${segment.phase}-${idx}`}
                        className={PHASE_ZONE_BAR[segment.phase] ?? "bg-foreground/20"}
                        style={{ width: `${widthPercent}%` }}
                        title={`${pick(PHASE_META[segment.phase], "label")} (${t("prebuilt.weeksCount", { count: segment.weeks })})`}
                      />
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5 font-mono text-[10px] tracking-[0.06em] uppercase text-muted-foreground">
                  {phaseSegments.map((segment, idx) => (
                    <span key={`legend-${segment.phase}-${idx}`}>
                      {pick(PHASE_META[segment.phase], "label")}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        {previewPlan && (
          <PlanStatsSection plan={previewPlan} />
        )}

        {/* View toggle + content */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-filet pb-1">
            <h2 className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground">
              {t("prebuilt.weekByWeek")}
            </h2>
            <div
              className="flex items-center gap-5 font-mono text-[11px] tracking-[0.1em] uppercase"
              role="radiogroup"
              aria-label={t("viewMode.label")}
            >
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === "calendar"}
                onClick={() => setViewMode("calendar")}
                className={cn(
                  "inline-flex items-center gap-1.5 pb-1.5 border-b-2 transition-colors",
                  viewMode === "calendar"
                    ? "border-accent-acid text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <CalendarRange size={14} />
                {t("viewMode.calendar")}
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={viewMode === "list"}
                onClick={() => setViewMode("list")}
                className={cn(
                  "inline-flex items-center gap-1.5 pb-1.5 border-b-2 transition-colors",
                  viewMode === "list"
                    ? "border-accent-acid text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                <List size={14} />
                {t("viewMode.list")}
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
                      {pick(phaseMeta, "label")}
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
                        const isIntermediateRace =
                          session.workoutId === "__intermediate_race__";
                        const isSpecialSession = isRaceDay || isIntermediateRace;
                        const sessionLabel =
                          SESSION_TYPE_LABELS[session.sessionType];
                        const dayLabel = t(`prebuilt.day.${session.dayOfWeek}`);

                        return (
                          <div
                            key={idx}
                            className={cn(
                              "flex items-center gap-3 rounded-lg p-3",
                              isRaceDay
                                ? "bg-primary/10 border border-primary/20"
                                : isIntermediateRace
                                  ? "bg-orange-50 border border-orange-300 dark:bg-orange-900/30 dark:border-orange-700"
                                  : "bg-secondary/50",
                            )}
                          >
                            {/* Day badge */}
                            {dayLabel && (
                              <span className="text-xs font-medium text-muted-foreground w-8 shrink-0">
                                {dayLabel}
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
                              ) : isIntermediateRace ? (
                                <div className="flex items-center gap-2">
                                  <Flag className="size-4 text-orange-500" />
                                  <span className="font-semibold text-orange-700 dark:text-orange-300">
                                    {t("intermediateGoals.raceDayLabel")}
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
                                <Star filled className="size-4 text-yellow-500" />
                              )}
                              {!isSpecialSession && sessionLabel && (
                                <Badge variant="outline" className="text-xs">
                                  <div
                                    className={cn(
                                      "size-2 rounded-full",
                                      sessionColorClass(session.sessionType),
                                    )}
                                  />
                                  {pickLocale(sessionLabel)}
                                </Badge>
                              )}
                              {!isSpecialSession && (
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
