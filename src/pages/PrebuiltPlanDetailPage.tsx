import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarRange,
  ChevronDown,
  Clock,
  Flag,
  List,
  Sparkles,
  Star,
} from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Segmented } from "@/components/ui/segmented";
import { SEOHead } from "@/components/seo";
import { ZoneScale } from "@/components/visualization";
import { sessionColor } from "@/lib/sessionColors";
import { getPrebuiltBySlug } from "@/data/prebuilt-plans";
import { getWorkoutById } from "@/data/workouts";
import { convertPrebuiltToPlan } from "@/lib/prebuiltPlanConverter";
import { savePlan } from "@/lib/planStorage";
import { PHASE_META, RACE_DISTANCE_META } from "@/types/plan";
import type { TrainingPlan } from "@/types/plan";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import type { AnyWorkoutTemplate } from "@/types";
import { PlanCalendar } from "@/components/domain/PlanCalendar";
import { PlanStatsSection } from "@/components/domain/PlanStatsSection";
import { triggerStorageWarning } from "@/components/domain/StorageWarning";
import { SESSION_TYPE_LABELS } from "@/lib/labels";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useIsEnglish, usePickLang, usePickLocale } from "@/lib/i18n-utils";

/**
 * One ready-made plan, read before it is taken.
 *
 * The sheet reads top to bottom: the mono facts, the plan's name, one
 * paragraph, the single call — then the macrocycle as one ink ramp, the plan's
 * own numbers, and the week-by-week programme in either the calendar or the
 * list. The phase ramp is not a colour table of its own: it composes
 * .zn-pswatch[data-phase], the app's single phase → zone-ink mapping.
 */
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
  const [preferredView, setPreferredView] = useState<"calendar" | "list">(
    "calendar"
  );

  /* Sous 768px, sept jours plus la gouttière réclament ~706px de grille pour
     un titre lisible et l'écran n'en offre que ~342 : la grille tombe à 36px
     par jour et le titre se réduit à une lettre par ligne. La liste dit les
     mêmes séances en toutes lettres, donc c'est elle. Valeur DÉRIVÉE, jamais
     figée dans le useState : une rotation en paysage rend le calendrier au
     lieu de laisser un radiogroup dont plus rien n'est coché. Même motif que
     usePlanViewMode, et le seuil a un seul propriétaire : useIsMobile. */
  const isMobile = useIsMobile();
  const viewMode = isMobile ? "list" : preferredView;

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

  // Phase distribution for the macrocycle ramp
  const phaseSegments = useMemo(() => {
    if (!prebuilt) return [];
    return prebuilt.phases.map((phaseRange) => ({
      phase: phaseRange.phase,
      weeks: phaseRange.endWeek - phaseRange.startWeek + 1,
    }));
  }, [prebuilt]);

  if (!prebuilt) {
    return (
      <div className="zn-pw">
        <section className="zn-pw__band zn-pw__band--first">
          <Alert
            kind="error"
            title={t("prebuilt.notFound")}
            action={
              <Button variant="outline" asChild>
                <Link to="/plan/new/prebuilt">
                  <ArrowLeft size={16} />
                  {t("prebuilt.backToPlans")}
                </Link>
              </Button>
            }
          />
        </section>
      </div>
    );
  }

  const name = pick(prebuilt, "name");
  const description = pick(prebuilt, "description");
  const raceMeta = prebuilt.raceDistance
    ? RACE_DISTANCE_META[prebuilt.raceDistance]
    : null;

  // The mono line above the title: how long, how often, how hard, for what.
  const kicker = [
    t("prebuilt.weeksCount", { count: prebuilt.totalWeeks }),
    `${prebuilt.sessionsPerWeek} ${t("prebuilt.sessionsPerWeek")}`,
    t(`prebuilt.difficulty.${prebuilt.difficulty}`),
    raceMeta ? pick(raceMeta, "label") : null,
  ]
    .filter(Boolean)
    .join(" · ");

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

      <div className="zn-pw">
        <Button variant="ghost" size="sm" asChild className="zn-pw__back">
          <Link to="/plan/new/prebuilt">
            <ArrowLeft size={16} />
            {t("prebuilt.backToPlans")}
          </Link>
        </Button>

        <section className="zn-pw__band zn-pw__band--first">
          <div className="zn-pw__head">
            <div
              className="zn-stack zn-pw__headtext"
              style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
            >
              <span className="zn-kicker">{kicker}</span>
              <h1 className="zn-display" data-level="2">
                {name}
              </h1>
              <p className="zn-body zn-body--lead zn-pw__lede">{description}</p>
            </div>

            {/* The screen's one vermillon fill. */}
            <Button size="lg" onClick={handleUse}>
              <Sparkles size={17} />
              {t("prebuilt.useThisPlan")}
            </Button>
          </div>
        </section>

        {phaseSegments.length > 0 && (
          <section className="zn-pw__band" aria-labelledby="pw-phases">
            <div
              className="zn-stack"
              style={{ "--gap": "var(--sp-10)" } as React.CSSProperties}
            >
              <h2 id="pw-phases" className="zn-title" data-level="3">
                {t("prebuilt.trainingPhases")}
              </h2>

              <div className="zn-pw__phasebar">
                {phaseSegments.map((segment, idx) => (
                  <span
                    key={`${segment.phase}-${idx}`}
                    className="zn-pswatch zn-pw__phase"
                    data-phase={segment.phase}
                    data-hatch={segment.phase === "recovery"}
                    aria-hidden="true"
                    style={
                      {
                        "--w": `${(segment.weeks / prebuilt.totalWeeks) * 100}%`,
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>

              <ul
                className="zn-cluster zn-mono zn-pw__phaselegend"
                style={{ "--gap": "var(--sp-4) var(--sp-11)" } as React.CSSProperties}
              >
                {phaseSegments.map((segment, idx) => (
                  <li
                    key={`legend-${segment.phase}-${idx}`}
                    className="zn-row"
                    style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}
                  >
                    <span
                      className="zn-pswatch"
                      data-phase={segment.phase}
                      data-hatch={segment.phase === "recovery"}
                      aria-hidden="true"
                    />
                    <span>
                      {pick(PHASE_META[segment.phase], "label")} · {segment.weeks}{" "}
                      {t("prebuilt.weeksShort")}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {previewPlan && (
          <section className="zn-pw__band">
            <PlanStatsSection plan={previewPlan} />
          </section>
        )}

        <section className="zn-pw__band" aria-labelledby="pw-weeks">
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-11)" } as React.CSSProperties}
          >
            <div
              className="zn-cluster zn-cluster--split"
              style={{ "--gap": "var(--sp-10)" } as React.CSSProperties}
            >
              <h2 id="pw-weeks" className="zn-title" data-level="3">
                {t("prebuilt.weekByWeek")}
              </h2>
              {/* Retiré en entier sur téléphone, pas filtré à une option :
                  Segmented rendrait un radiogroup à un seul radio, toujours
                  coché, toujours un tab stop — un contrôle qui ne contrôle
                  rien. */}
              {!isMobile && (
                <Segmented
                  value={viewMode}
                  onChange={setPreferredView}
                  label={t("viewMode.label")}
                  options={[
                    {
                      value: "calendar",
                      label: t("viewMode.calendar"),
                      icon: <CalendarRange size={16} />,
                    },
                    {
                      value: "list",
                      label: t("viewMode.list"),
                      icon: <List size={16} />,
                    },
                  ]}
                />
              )}
            </div>

            <ZoneScale />

            {viewMode === "calendar" && previewPlan && (
              <PlanCalendar
                plan={previewPlan}
                workoutNames={workoutNames}
                currentWeek={0}
                isEn={isEn}
              />
            )}

            {viewMode === "list" && (
              <div
                className="zn-stack"
                style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
              >
                {prebuilt.weeks.map((week) => {
                  const isExpanded = expandedWeeks.has(week.weekNumber);
                  const weekLabel = isEn
                    ? week.weekLabelEn || `W${week.weekNumber}`
                    : week.weekLabel || `S${week.weekNumber}`;

                  return (
                    <div key={week.weekNumber} className="zn-pw__wk">
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => toggleWeek(week.weekNumber)}
                        className="zn-pw__wk-toggle"
                      >
                        <span
                          className="zn-pswatch"
                          data-phase={week.phase}
                          data-hatch={week.isRecoveryWeek}
                          aria-hidden="true"
                        />
                        <span className="zn-pw__wk-name">
                          {weekLabel} — {pick(PHASE_META[week.phase], "label")}
                        </span>
                        {week.isRecoveryWeek && (
                          <Badge variant="secondary">
                            {t("prebuilt.recovery")}
                          </Badge>
                        )}
                        <span className="zn-mono zn-pw__wk-count">
                          {t("prebuilt.sessionsCount", {
                            count: week.sessions.length,
                          })}
                        </span>
                        <ChevronDown className="zn-pw__wk-chev" />
                      </button>

                      {isExpanded && (
                        <div className="zn-pw__wk-body">
                          {week.sessions.length === 0 ? (
                            <p className="zn-body zn-muted zn-pw__empty">
                              {t("prebuilt.noSessions")}
                            </p>
                          ) : (
                            week.sessions.map((session, idx) => {
                              const isRaceDay =
                                session.workoutId === "__race_day__";
                              const isIntermediateRace =
                                session.workoutId === "__intermediate_race__";
                              const isSpecial = isRaceDay || isIntermediateRace;
                              const sessionLabel =
                                SESSION_TYPE_LABELS[session.sessionType];

                              return (
                                <div
                                  key={idx}
                                  className="zn-pw__sess"
                                  data-kind={isSpecial ? "race" : undefined}
                                >
                                  <span className="zn-mono zn-pw__sess-day">
                                    {t(`prebuilt.day.${session.dayOfWeek}`)}
                                  </span>

                                  <div className="zn-pw__sess-main">
                                    {isSpecial ? (
                                      <span
                                        className="zn-row zn-pw__sess-name"
                                        style={
                                          {
                                            "--gap": "var(--sp-4)",
                                          } as React.CSSProperties
                                        }
                                      >
                                        <Flag size={15} aria-hidden="true" />
                                        {isRaceDay
                                          ? t("prebuilt.raceDay")
                                          : t("intermediateGoals.raceDayLabel")}
                                      </span>
                                    ) : (
                                      <span className="zn-pw__sess-name">
                                        {workoutNames[session.workoutId] ||
                                          session.workoutId}
                                      </span>
                                    )}
                                  </div>

                                  <span className="zn-mono zn-pw__sess-marks">
                                    {session.isKeySession && (
                                      <span className="zn-sess__key">
                                        <Star
                                          filled
                                          size={15}
                                          aria-hidden="true"
                                        />
                                        <span className="sr-only">
                                          {t("view.keySession")}
                                        </span>
                                      </span>
                                    )}
                                    {!isSpecial && (
                                      <>
                                        <span
                                          className="zn-sess__dot"
                                          aria-hidden="true"
                                          style={
                                            {
                                              "--zn-dot": sessionColor(
                                                session.sessionType,
                                              ),
                                            } as React.CSSProperties
                                          }
                                        />
                                        {sessionLabel && (
                                          <span>{pickLocale(sessionLabel)}</span>
                                        )}
                                        <Clock size={13} aria-hidden="true" />
                                        {formatDurationMinutes(
                                          session.estimatedDurationMin,
                                        )}
                                      </>
                                    )}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
