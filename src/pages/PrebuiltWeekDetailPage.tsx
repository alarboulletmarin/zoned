import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft, Clock, Sparkles, Star } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { ZoneScale } from "@/components/visualization";
import { WeekSummaryBar } from "@/components/weekly";
import { sessionColor } from "@/lib/sessionColors";
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

const DIFFICULTY_KEYS: Record<string, string> = {
  beginner: "collections.difficulty.beginner",
  intermediate: "collections.difficulty.intermediate",
  advanced: "collections.difficulty.advanced",
  elite: "collections.difficulty.advanced",
};

/**
 * One ready-made week, read before it is taken.
 *
 * The sheet reads: what this week is (mono facts), its name, one paragraph,
 * the one call — then the preview, why the week works, and why each session is
 * where it is. Its provenance is printed in mono under the block that claims
 * it, never invoked as "des études montrent".
 */
export function PrebuiltWeekDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation(["library", "common"]);
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
      <div className="zn-pw">
        <section className="zn-pw__band">
          <Alert
            kind="error"
            title={t("weekly.prebuilt.notFound")}
            action={
              <Button variant="outline" asChild>
                <Link to="/weeks/new/prebuilt">
                  <ArrowLeft size={16} />
                  {t("weekly.prebuilt.backToList")}
                </Link>
              </Button>
            }
          >
            {t("weekly.prebuilt.notFoundHelp")}
          </Alert>
        </section>
      </div>
    );
  }

  const name = pick(week, "name");
  const description = pick(week, "description");
  const whyItWorks = pick(week, "whyItWorks");
  const provenance = week.provenance ? pick(week, "provenance") : null;
  const difficultyKey = DIFFICULTY_KEYS[week.difficulty];

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

  // The mono line above the title: what kind of week, how hard, how much.
  const kicker = [
    t(`weekly.prebuilt.category.${week.category}`),
    difficultyKey ? t(`common:${difficultyKey}`) : null,
    t("weekly.prebuilt.sessions", { count: week.sessions.length }),
  ]
    .filter(Boolean)
    .join(" · ");

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

      <div className="zn-pw" data-dock="true">
        <Button variant="ghost" size="sm" asChild className="zn-pw__back">
          <Link to="/weeks/new/prebuilt">
            <ArrowLeft size={16} />
            {t("weekly.prebuilt.backToList")}
          </Link>
        </Button>

        <section className="zn-pw__band">
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

            {/* The one call. Below 900px the dock carries it instead, so only
                ever one of the two is on screen. */}
            <Button size="lg" onClick={handleUse} className="zn-pw__call">
              <Sparkles size={17} />
              {t("weekly.prebuilt.useThisWeek")}
            </Button>
          </div>
        </section>

        <section className="zn-pw__band" aria-labelledby="pw-preview">
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-11)" } as React.CSSProperties}
          >
            <div
              className="zn-cluster zn-cluster--split"
              style={{ "--gap": "var(--sp-10)" } as React.CSSProperties}
            >
              <h2 id="pw-preview" className="zn-title" data-level="3">
                {t("weekly.prebuilt.preview")}
              </h2>
              <ZoneScale className="zn-push" />
            </div>
            <WeekSummaryBar
              stats={stats}
              slots={slots}
              targetVolumeH={week.settings.targetVolumeH}
            />
          </div>
        </section>

        <section className="zn-pw__band" aria-labelledby="pw-why">
          <div
            className="zn-stack zn-measure"
            style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
          >
            <h2 id="pw-why" className="zn-title" data-level="3">
              {t("weekly.prebuilt.whyTitle")}
            </h2>
            <p className="zn-body">{whyItWorks}</p>
            {provenance && <span className="zn-source">{provenance}</span>}
          </div>
        </section>

        <section className="zn-pw__band" aria-labelledby="pw-sessions">
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-11)" } as React.CSSProperties}
          >
            <h2 id="pw-sessions" className="zn-title" data-level="3">
              {t("weekly.prebuilt.whySessionTitle")}
            </h2>

            <div className="zn-pw__list">
              {orderedSessions.map((session, idx) => {
                const workout = byId.get(session.workoutId);
                const workoutName = workout
                  ? pick(workout, "name")
                  : session.workoutId;
                const sessionLabel = SESSION_TYPE_LABELS[session.sessionType];
                const why = pick(session, "why");

                return (
                  <div key={idx} className="zn-pw__sess">
                    <span className="zn-mono zn-pw__sess-day">
                      {t(`weekly.daysShort.${session.dayOfWeek}`)}
                    </span>

                    <div className="zn-pw__sess-main">
                      <span className="zn-pw__sess-name">{workoutName}</span>
                      {why && <p className="zn-pw__sess-why">{why}</p>}
                    </div>

                    <span className="zn-mono zn-pw__sess-marks">
                      {session.isKeySession && (
                        <span className="zn-sess__key">
                          <Star filled size={15} aria-hidden="true" />
                          <span className="sr-only">
                            {t("weekly.keySession")}
                          </span>
                        </span>
                      )}
                      <span
                        className="zn-sess__dot"
                        aria-hidden="true"
                        style={
                          {
                            "--zn-dot": sessionColor(session.sessionType),
                          } as React.CSSProperties
                        }
                      />
                      {sessionLabel && <span>{pickLocale(sessionLabel)}</span>}
                      <Clock size={13} aria-hidden="true" />
                      {formatDurationMinutes(session.estimatedDurationMin)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <div className="zn-pw__dock">
        <Button size="lg" onClick={handleUse}>
          <Sparkles size={17} />
          {t("weekly.prebuilt.useThisWeek")}
        </Button>
      </div>
    </>
  );
}
