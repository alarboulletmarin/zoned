import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { cn } from "@/lib/utils";
import { getPrebuiltBySlug, getAllPrebuiltPlans } from "@/data/prebuilt-plans";
import { getWorkoutById } from "@/data/workouts";
import { convertPrebuiltToPlan } from "@/lib/prebuiltPlanConverter";
import { savePlan } from "@/lib/planStorage";
import { computeWeekKm, computeEnhancedPlanAnalysis } from "@/lib/planStats";
import type { ZoneDistribution } from "@/lib/planStats";
import { zoneClass } from "@/lib/zoneColors";
import { PHASE_META, RACE_DISTANCE_META } from "@/types/plan";
import type { TrainingPlan } from "@/types/plan";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { getDominantZone, isRunningWorkout } from "@/types";
import type { AnyWorkoutTemplate, ZoneNumber } from "@/types";
import { toast } from "sonner";
import { triggerStorageWarning } from "@/components/domain/StorageWarning";
import { useIsEnglish, usePickLang } from "@/lib/i18n-utils";

/** Segmented zone-mix bar — width per zone proportional to its share of
 *  planned minutes. Shared by the header stat panel and the per-phase rows
 *  so both read the plan's real zone composition, not an illustrative
 *  approximation. */
function ZoneMixBar({
  distribution,
  className,
}: {
  distribution: ZoneDistribution[];
  className?: string;
}) {
  const segments = distribution.filter((z) => z.percent > 0);
  if (segments.length === 0) return null;
  return (
    <div className={cn("flex gap-px", className)} aria-hidden="true">
      {segments.map((z) => {
        const zoneNum = Number(z.zone.slice(1)) as ZoneNumber;
        return (
          <div
            key={z.zone}
            className={zoneClass(zoneNum, "bg")}
            style={{ flexGrow: z.percent, flexBasis: 0 }}
            title={`${z.zone} · ${Math.round(z.percent)}%`}
          />
        );
      })}
    </div>
  );
}

/** minutes-per-km → "5:51", metric only (this page never surfaces the
 *  imperial toggle for its other km figures either). */
function formatPaceValue(minPerKm: number): string {
  const minutes = Math.floor(minPerKm);
  const seconds = Math.round((minPerKm - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function PrebuiltPlanDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation("plan");
  const isEn = useIsEnglish();
  const pick = usePickLang();

  const prebuilt = slug ? getPrebuiltBySlug(slug) : undefined;
  const [workoutNames, setWorkoutNames] = useState<Record<string, string>>({});
  const [workoutZones, setWorkoutZones] = useState<Record<string, ZoneNumber>>({});

  // Build a read-only TrainingPlan for zone analysis
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

  /** Zone-time composition for the header stat panel and, filtered to each
   *  phase's own weeks, for the per-phase mini bars below — same function,
   *  just scoped to a narrower week range, so the two never disagree. */
  const [planZoneMix, setPlanZoneMix] = useState<ZoneDistribution[] | null>(null);
  const [phaseZoneMix, setPhaseZoneMix] = useState<ZoneDistribution[][] | null>(null);
  useEffect(() => {
    if (!previewPlan || !prebuilt) return;
    let cancelled = false;
    (async () => {
      const overall = await computeEnhancedPlanAnalysis(previewPlan);
      const perPhase = await Promise.all(
        prebuilt.phases.map((p) =>
          computeEnhancedPlanAnalysis({
            ...previewPlan,
            weeks: previewPlan.weeks.filter(
              (w) => w.weekNumber >= p.startWeek && w.weekNumber <= p.endWeek,
            ),
          }),
        ),
      );
      if (cancelled) return;
      setPlanZoneMix(overall.zoneDistribution);
      setPhaseZoneMix(perPhase.map((a) => a.zoneDistribution));
    })();
    return () => {
      cancelled = true;
    };
  }, [previewPlan, prebuilt]);

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

  /** One row per phase: its week span, its own km range (the real min/max
   *  across its weeks, taper decline included), and whether race day falls
   *  inside it. */
  const phaseDetails = useMemo(() => {
    if (!prebuilt) return [];
    return prebuilt.phases.map((p, idx) => {
      const weeksInPhase = prebuilt.weeks.filter(
        (w) => w.weekNumber >= p.startWeek && w.weekNumber <= p.endWeek,
      );
      const kms = weeksInPhase.map((w) => Math.round(computeWeekKm(w)));
      const hasRace = weeksInPhase.some((w) =>
        w.sessions.some((s) => s.workoutId === "__race_day__"),
      );
      return {
        ...p,
        index: idx,
        minKm: kms.length > 0 ? Math.min(...kms) : 0,
        maxKm: kms.length > 0 ? Math.max(...kms) : 0,
        hasRace,
      };
    });
  }, [prebuilt]);

  /** What the plan asks on week 1 — the honest entry ticket, not the peak. */
  const startWeek = prebuilt?.weeks[0];
  const startWeeklyKm = startWeek ? Math.round(computeWeekKm(startWeek)) : 0;
  const startWeeklyMin = startWeek
    ? startWeek.sessions.reduce((sum, s) => sum + s.estimatedDurationMin, 0)
    : 0;

  /** Entry ask → peak ask, not the taper's decline — matches
   *  `prebuilt.peakWeeklyKm` already used on the card/dashboard. */
  const peakWeeklyKm = useMemo(() => {
    if (prebuilt?.peakWeeklyKm) return prebuilt.peakWeeklyKm;
    if (!prebuilt) return 0;
    return Math.max(...prebuilt.weeks.map((w) => Math.round(computeWeekKm(w))));
  }, [prebuilt]);

  /** Goal race pace, read from the "M" (goal-pace) annotations the plan
   *  generator already attaches to sessions — constant across the plan. */
  const targetPace = useMemo(() => {
    // Only meaningful when the plan actually targets a race — some plans
    // (base building, return from injury) carry "M"-zone pace notes as a
    // generic reference pace even with no race goal.
    if (!prebuilt || !prebuilt.raceDistance) return null;
    for (const week of prebuilt.weeks) {
      for (const session of week.sessions) {
        const note = session.paceNotes?.find((n) => n.zone === "M");
        if (note) return formatPaceValue((note.paceMinKm + note.paceMaxKm) / 2);
      }
    }
    return null;
  }, [prebuilt]);

  const easyHardSplit = useMemo(() => {
    if (!planZoneMix) return null;
    const easy = planZoneMix
      .filter((z) => z.zone === "Z1" || z.zone === "Z2")
      .reduce((sum, z) => sum + z.percent, 0);
    return { easy: Math.round(easy), hard: Math.round(100 - easy) };
  }, [planZoneMix]);

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
              {t("prebuilt.whatItAsks")}
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
              <div>
                <p className="text-2xl">
                  {startWeeklyKm === peakWeeklyKm
                    ? peakWeeklyKm
                    : `${startWeeklyKm} → ${peakWeeklyKm}`}
                </p>
                <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mt-1">
                  {t("prebuilt.kmPerWeekShort")}
                </p>
              </div>
              {targetPace && (
                <div>
                  <p className="text-2xl">{targetPace}</p>
                  <p className="text-[10px] tracking-[0.1em] uppercase text-muted-foreground mt-1">
                    {t("prebuilt.targetPaceShort")}
                  </p>
                </div>
              )}
            </div>
            {planZoneMix && planZoneMix.some((z) => z.percent > 0) && (
              <>
                <ZoneMixBar distribution={planZoneMix} className="mt-4 h-2.5" />
                <p className="mt-2.5 font-mono text-[11px] leading-[1.7] text-muted-foreground">
                  {planZoneMix
                    .filter((z) => Math.round(z.percent) > 0)
                    .map((z) => `${Math.round(z.percent)} % ${z.zone}`)
                    .join(" · ")}
                  {easyHardSplit && (
                    <>
                      <br />
                      {t("prebuilt.zoneSummary", easyHardSplit)}
                    </>
                  )}
                </p>
              </>
            )}
          </div>
        </div>

        {/* What the plan asks / who it's for / what it reuses */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          <div className="space-y-10">
          {/* The four phases — one row per phase: its span, its own km range
              (real min/max, taper decline included) and its zone mix. */}
          {phaseDetails.length > 0 && (
            <div>
              <h2 className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
                {t("prebuilt.phases.title", { count: phaseDetails.length })}
              </h2>
              <div className="mt-3 border-t border-b border-filet divide-y divide-filet">
                {phaseDetails.map((detail) => {
                  const meta = PHASE_META[detail.phase];
                  const zoneMix = phaseZoneMix?.[detail.index];
                  const kmLabel =
                    detail.minKm === detail.maxKm
                      ? `${detail.maxKm} km`
                      : `${detail.minKm} → ${detail.maxKm} km`;
                  return (
                    <div
                      key={`${detail.phase}-${detail.index}`}
                      className="grid grid-cols-1 sm:grid-cols-[100px_1fr_200px] gap-3 sm:gap-6 py-4 items-start"
                    >
                      <span className="font-mono text-[13px] text-foreground/60">
                        {detail.startWeek === detail.endWeek
                          ? t("prebuilt.phases.weekSingle", { week: detail.startWeek })
                          : t("prebuilt.phases.weekRange", {
                              from: detail.startWeek,
                              to: detail.endWeek,
                            })}
                      </span>
                      <div>
                        <p className="font-sans font-bold uppercase tracking-[-0.02em] text-lg sm:text-xl">
                          {pick(meta, "label")}
                        </p>
                        <p className="mt-1.5 text-sm leading-[1.55] text-foreground/60">
                          {pick(meta, "description")}
                        </p>
                      </div>
                      <div>
                        {zoneMix && <ZoneMixBar distribution={zoneMix} className="h-2" />}
                        <p className="mt-2 font-mono text-[11px] text-muted-foreground">
                          {kmLabel}
                          {detail.hasRace ? t("prebuilt.phases.raceSuffix") : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
          </div>

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
