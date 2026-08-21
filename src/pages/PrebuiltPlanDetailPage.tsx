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
import { getPrebuiltBySlug, getAllPrebuiltPlans } from "@/data/prebuilt-plans";
import { getWorkoutById } from "@/data/workouts";
import { convertPrebuiltToPlan } from "@/lib/prebuiltPlanConverter";
import { savePlan } from "@/lib/planStorage";
import { computeWeekKm } from "@/lib/planStats";
import { zoneClass } from "@/lib/zoneColors";
import { PHASE_META, RACE_DISTANCE_META } from "@/types/plan";
import type { TrainingPlan } from "@/types/plan";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { getDominantZone, isRunningWorkout } from "@/types";
import type { AnyWorkoutTemplate, ZoneNumber } from "@/types";
import { toast } from "sonner";
import { PlanCalendar } from "@/components/domain/PlanCalendar";
import { PlanStatsSection } from "@/components/domain/PlanStatsSection";
import { PhaseZoneBar } from "@/components/domain/PrebuiltPlanCard";
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
  const [workoutZones, setWorkoutZones] = useState<Record<string, ZoneNumber>>({});
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
      const zones: Record<string, ZoneNumber> = {};
      for (const [wid, workout] of results) {
        if (workout) {
          names[wid] = pick(workout, "name");
          if (isRunningWorkout(workout)) zones[wid] = getDominantZone(workout);
        }
      }
      setWorkoutNames(names);
      setWorkoutZones(zones);
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

  /** What the plan asks on week 1 — the honest entry ticket, not the peak. */
  const startWeek = prebuilt?.weeks[0];
  const startWeeklyKm = startWeek ? Math.round(computeWeekKm(startWeek)) : 0;
  const startWeeklyMin = startWeek
    ? startWeek.sessions.reduce((sum, s) => sum + s.estimatedDurationMin, 0)
    : 0;

  /** The heaviest non-recovery week — what a normal week actually looks like
   *  once the plan is running, which is what people want to see before they
   *  commit. */
  const typicalWeek = useMemo(() => {
    if (!prebuilt) return null;
    let best: (typeof prebuilt.weeks)[number] | null = null;
    let bestLoad = -1;
    for (const week of prebuilt.weeks) {
      if (week.isRecoveryWeek) continue;
      const load = week.sessions.reduce(
        (sum, s) => (s.workoutId === "__race_day__" ? sum : sum + s.estimatedDurationMin),
        0,
      );
      if (load > bestLoad) {
        bestLoad = load;
        best = week;
      }
    }
    return best ?? prebuilt.weeks[0] ?? null;
  }, [prebuilt]);

  /** Distinct workouts the plan reuses, most-used first. */
  const sessionUsage = useMemo(() => {
    if (!prebuilt) return [];
    const counts = new Map<string, number>();
    for (const week of prebuilt.weeks) {
      for (const session of week.sessions) {
        if (
          !session.workoutId ||
          session.workoutId.startsWith("__")
        ) continue;
        counts.set(session.workoutId, (counts.get(session.workoutId) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([workoutId, count]) => ({ workoutId, count }))
      .sort((a, b) => b.count - a.count);
  }, [prebuilt]);

  /** "Sinon" — the lighter plans to send someone to when the three conditions
   *  above don't hold. Closest lighter peak volume first. */
  const alternatives = useMemo(() => {
    if (!prebuilt) return [];
    const peak = prebuilt.peakWeeklyKm ?? Infinity;
    const others = getAllPrebuiltPlans().filter((p) => p.slug !== prebuilt.slug);
    const lighter = others
      .filter((p) => (p.peakWeeklyKm ?? 0) < peak)
      .sort((a, b) => (b.peakWeeklyKm ?? 0) - (a.peakWeeklyKm ?? 0));
    const pool = lighter.length > 0
      ? lighter
      : [...others].sort((a, b) => (a.peakWeeklyKm ?? 0) - (b.peakWeeklyKm ?? 0));
    return pool.slice(0, 2);
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
                <PhaseZoneBar
                  phases={prebuilt.phases}
                  totalWeeks={prebuilt.totalWeeks}
                  className="mt-4 h-2.5"
                  titleFor={(phase, weeks) =>
                    `${pick(PHASE_META[phase], "label")} (${t("prebuilt.weeksCount", { count: weeks })})`
                  }
                />
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

        {/* What the plan asks / who it's for / what it reuses */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Typical week — the heaviest normal week, laid out day by day */}
          {typicalWeek && (
            <div>
              <h2 className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
                {t("prebuilt.typicalWeek", { week: typicalWeek.weekNumber })}
              </h2>
              <div className="border border-filet mt-3">
                <div className="grid grid-cols-7 bg-ink text-paper font-mono text-[10px] tracking-[0.1em] uppercase">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                    <div key={day} className="px-1.5 py-2 text-center">
                      {t(`prebuilt.day.${day}`)}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 min-h-28">
                  {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                    const daySessions = typicalWeek.sessions.filter(
                      (s) => s.dayOfWeek === day,
                    );
                    return (
                      <div
                        key={day}
                        className="border-r border-filet last:border-r-0 p-1.5 space-y-2"
                      >
                        {daySessions.length === 0 ? (
                          <p className="font-mono text-[10px] text-muted-foreground">
                            {t("prebuilt.rest")}
                          </p>
                        ) : (
                          daySessions.map((session, idx) => {
                            const zone = workoutZones[session.workoutId];
                            const isSpecial = session.workoutId.startsWith("__");
                            return (
                              <div key={idx}>
                                <div
                                  className={cn(
                                    "px-1.5 py-1 font-mono text-[10px] font-bold",
                                    isSpecial
                                      ? "bg-ink text-paper"
                                      : zone
                                        ? cn(zoneClass(zone, "bg"), zoneClass(zone, "textOn"))
                                        : "border border-foreground text-foreground",
                                  )}
                                >
                                  {isSpecial
                                    ? t("prebuilt.raceDay")
                                    : `${zone ? `Z${zone} · ` : ""}${formatDurationMinutes(session.estimatedDurationMin)}`}
                                </div>
                                {!isSpecial && (
                                  <p className="mt-1.5 text-[11px] leading-[1.3] text-foreground/70 line-clamp-2">
                                    {workoutNames[session.workoutId] || session.workoutId}
                                  </p>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="border-t border-filet px-3 py-2.5 flex flex-wrap justify-between gap-x-4 gap-y-1 font-mono text-[11px] text-muted-foreground">
                  <span>
                    {t("prebuilt.typicalWeekFooter", {
                      week: typicalWeek.weekNumber,
                      km: Math.round(computeWeekKm(typicalWeek)),
                    })}
                  </span>
                  <span>
                    {t("prebuilt.sessionsCount", { count: typicalWeek.sessions.length })}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sidebar: honesty about who this plan is for */}
          <div className="flex flex-col gap-6 lg:border-l lg:border-filet lg:pl-7">
            <div>
              <h2 className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                {t("prebuilt.forYouIf.title")}
              </h2>
              <ul className="mt-3 pl-4 list-disc text-sm leading-[1.7] text-foreground/80 space-y-1">
                <li>
                  {startWeeklyKm > 0
                    ? t("prebuilt.forYouIf.volumeKm", { km: startWeeklyKm })
                    : t("prebuilt.forYouIf.volumeMin", { min: startWeeklyMin })}
                </li>
                <li>{t("prebuilt.forYouIf.sessions", { count: prebuilt.sessionsPerWeek })}</li>
                <li>{t("prebuilt.forYouIf.weeks", { count: prebuilt.totalWeeks })}</li>
              </ul>
            </div>

            {alternatives.length > 0 && (
              <div className="border-2 border-zone-3 p-4">
                <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-zone-3">
                  {t("prebuilt.otherwise.title")}
                </p>
                <p className="mt-2 text-sm leading-[1.6] text-foreground/80">
                  {t("prebuilt.otherwise.body")}
                </p>
                <div className="flex flex-wrap gap-2.5 mt-3">
                  {alternatives.map((alt) => (
                    <Link
                      key={alt.slug}
                      to={`/plan/prebuilt/${alt.slug}`}
                      className="border border-filet px-3 py-2.5 font-mono text-[11px] tracking-[0.08em] uppercase text-foreground/80 hover:bg-secondary transition-colors"
                    >
                      {pick(alt, "name")}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {sessionUsage.length > 0 && (
              <div className="border-t border-filet pt-5">
                <h2 className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
                  {t("prebuilt.usedSessions", { count: sessionUsage.length })}
                </h2>
                <div className="mt-3">
                  {sessionUsage.slice(0, 5).map(({ workoutId, count }) => {
                    const zone = workoutZones[workoutId];
                    return (
                      <Link
                        key={workoutId}
                        to={`/workout/${workoutId}`}
                        className="flex items-center gap-2.5 py-2.5 border-t border-filet hover:bg-secondary transition-colors"
                      >
                        <span
                          className={cn(
                            "px-1.5 py-0.5 font-mono text-[10px] font-bold shrink-0",
                            zone
                              ? cn(zoneClass(zone, "bg"), zoneClass(zone, "textOn"))
                              : "border border-foreground text-foreground",
                          )}
                        >
                          {zone ? `Z${zone}` : "—"}
                        </span>
                        <span className="flex-1 min-w-0 text-sm font-medium line-clamp-1">
                          {workoutNames[workoutId] || workoutId}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                          × {count}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            <p className="mt-auto border border-filet p-4 font-mono text-[11px] leading-[1.7] text-muted-foreground">
              {t("prebuilt.noAccountNotice")}
            </p>
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
                        "size-2.5 shrink-0",
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
                              "flex items-center gap-3 p-3",
                              isRaceDay
                                ? "bg-primary/10 border border-primary/20"
                                : isIntermediateRace
                                  ? "bg-poster-red/10 border border-poster-red/50"
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
                                  <Flag className="size-4 text-poster-red" />
                                  <span className="font-semibold text-poster-red">
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
                                <Star filled className="size-4 text-foreground" />
                              )}
                              {!isSpecialSession && sessionLabel && (
                                <Badge variant="outline" className="text-xs">
                                  <div
                                    className={cn(
                                      "size-2",
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
