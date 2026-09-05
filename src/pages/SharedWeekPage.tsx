import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowLeft, Clock, Plus, Star } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { ZoneScale } from "@/components/visualization";
import { WeekSummaryBar } from "@/components/weekly";
import { sessionColor } from "@/lib/sessionColors";
import { decodeSharedWeek, sharedWeekSessions, sharedWeekToPlan } from "@/lib/weekShare";
import { planWeekToSlots } from "@/lib/weekToPlan";
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
import type { PlanWeek } from "@/types/plan";

/**
 * A week that arrived as a link. Everything on this screen is decoded from the
 * URL — nothing is read from storage until the week is actually added.
 */
export function SharedWeekPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation("library");
  const pick = usePickLang();
  const pickLocale = usePickLocale();

  const encoded = searchParams.get("d");
  const payload = useMemo(
    () => (encoded ? decodeSharedWeek(encoded) : null),
    [encoded],
  );

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

  const sessions = useMemo(
    () => (payload ? sharedWeekSessions(payload) : []),
    [payload],
  );
  const knownSessions = useMemo(
    () => sessions.filter((s) => byId.has(s.workoutId)),
    [sessions, byId],
  );
  const unknownCount = sessions.length - knownSessions.length;

  // Preview through the same path the editor uses (slots → stats → summary).
  const slots = useMemo(() => {
    const previewWeek: PlanWeek = {
      weekNumber: 1,
      phase: "base",
      isRecoveryWeek: false,
      volumePercent: 100,
      sessions: knownSessions,
    };
    return planWeekToSlots(previewWeek, byId);
  }, [knownSessions, byId]);
  const stats = useMemo(() => computeWeekStats(slots), [slots]);

  if (!payload) {
    return (
      <>
        <SEOHead noindex title={t("weekly.shared.title")} canonical="/weeks/shared" />
        <div className="zn-pw">
          <section className="zn-pw__band zn-pw__band--first">
            <Alert
              kind="error"
              title={t("weekly.shared.invalid")}
              action={
                <Button variant="outline" asChild>
                  <Link to="/weeks">
                    <ArrowLeft size={16} />
                    {t("weekly.list.title")}
                  </Link>
                </Button>
              }
            >
              {t("weekly.shared.invalidHelp")}
            </Alert>
          </section>
        </div>
      </>
    );
  }

  const handleAdd = () => {
    const plan = sharedWeekToPlan(payload, new Set(byId.keys()));
    if (!savePlan(plan)) {
      toast.error(t("weekly.toast.saveFailed", { defaultValue: "Échec de l'enregistrement" }));
      return;
    }
    triggerStorageWarning();
    toast.success(t("weekly.prebuilt.weekAdded"));
    navigate(`/weeks/${plan.id}`);
  };

  const kicker = [
    payload.c ? t(`weekly.prebuilt.category.${payload.c}`) : null,
    t("weekly.prebuilt.sessions", { count: sessions.length }),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <SEOHead noindex title={payload.n} canonical="/weeks/shared" />

      <div className="zn-pw" data-dock="true">
        <section className="zn-pw__band zn-pw__band--first">
          <div className="zn-pw__head">
            <div
              className="zn-stack zn-pw__headtext"
              style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
            >
              <span className="zn-kicker">{kicker}</span>
              <h1 className="zn-display" data-level="2">
                {payload.n}
              </h1>
              <p className="zn-body zn-body--lead zn-pw__lede">
                {t("weekly.shared.subtitle")}
              </p>
            </div>

            <Button size="lg" onClick={handleAdd} className="zn-pw__call">
              <Plus size={17} />
              {t("weekly.shared.add")}
            </Button>
          </div>
        </section>

        {unknownCount > 0 && (
          <section className="zn-pw__band">
            <Alert kind="warning" title={t("weekly.shared.unknownCount", { count: unknownCount })}>
              {t("weekly.shared.unknownHelp", { count: knownSessions.length })}
            </Alert>
          </section>
        )}

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
            <WeekSummaryBar stats={stats} slots={slots} />

            <div className="zn-pw__list">
              {knownSessions.map((session, idx) => {
                const workout = byId.get(session.workoutId);
                const workoutName = workout
                  ? pick(workout, "name")
                  : session.workoutId;
                const sessionLabel = SESSION_TYPE_LABELS[session.sessionType];

                return (
                  <div key={idx} className="zn-pw__sess">
                    <span className="zn-mono zn-pw__sess-day">
                      {t(`weekly.daysShort.${session.dayOfWeek}`)}
                    </span>

                    <div className="zn-pw__sess-main">
                      <span className="zn-pw__sess-name">{workoutName}</span>
                    </div>

                    <span className="zn-mono zn-pw__sess-marks">
                      {session.isKeySession && (
                        <span className="zn-sess__key">
                          <Star filled size={15} aria-hidden="true" />
                          <span className="sr-only">{t("weekly.keySession")}</span>
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
        <Button size="lg" onClick={handleAdd}>
          <Plus size={17} />
          {t("weekly.shared.add")}
        </Button>
      </div>
    </>
  );
}
