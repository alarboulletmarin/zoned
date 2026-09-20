import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/toast";
import { ArrowLeft, Plus } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { PlanWeeklyView, type WorkoutCardMeta } from "@/components/domain/PlanWeeklyView";
import { WeekSummaryStrip } from "@/components/weekly";
import { ACTIVITY_KINDS, isActivitySession } from "@/lib/activitySession";
import {
  decodeSharedWeek,
  isSharedSessionKnown,
  sharedWeekSessions,
  sharedWeekToPlan,
} from "@/lib/weekShare";
import { planWeekToSlots } from "@/lib/weekToPlan";
import { computeWeekStats } from "@/lib/weekStats";
import { savePlan } from "@/lib/planStorage";
import { triggerStorageWarning } from "@/components/domain/StorageWarning";
import { getAnyWorkoutTss } from "@/lib/workoutFilters";
import { usePickLang, useIsEnglish } from "@/lib/i18n-utils";
import { useWorkouts } from "@/hooks";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import { useCrossDisciplineWorkouts } from "@/hooks/useCrossDisciplineWorkouts";
import { getDominantZone, isStrengthWorkout, type AnyWorkoutTemplate } from "@/types";

/**
 * A week that arrived as a link. Everything on this screen is decoded from the
 * URL, nothing is read from storage until the week is actually added.
 *
 * The preview is the editor's own board, read-only: seven days, the same
 * cards, the same folded summary. It used to be a ten-row list with the
 * name at one edge and the marks at the other, which on a wide screen put
 * 700px of nothing between a session and its duration, and never showed
 * the shape of the week, which is what a shared week is for.
 */
export function SharedWeekPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation(["library", "plan"]);
  const pick = usePickLang();
  const isEn = useIsEnglish();

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
  const catalog = useMemo(
    () => [...running, ...cycling, ...swimming, ...strength],
    [running, cycling, swimming, strength],
  );
  const byId = useMemo(() => {
    const m = new Map<string, AnyWorkoutTemplate>();
    for (const w of catalog) m.set(w.id, w);
    return m;
  }, [catalog]);

  // The same card line the editor prints: Z2 · 1h05 · 62 TSS.
  const workoutMeta = useMemo(() => {
    const meta: Record<string, WorkoutCardMeta> = {};
    for (const w of catalog) {
      meta[w.id] = {
        zone: isStrengthWorkout(w) ? undefined : getDominantZone(w),
        tss: getAnyWorkoutTss(w),
      };
    }
    return meta;
  }, [catalog]);

  const workoutNames = useMemo(() => {
    const names: Record<string, string> = {};
    for (const w of catalog) names[w.id] = pick(w, "name");
    for (const { workoutId, kind } of ACTIVITY_KINDS) {
      names[workoutId] = t(`plan:activity.${kind}`, { defaultValue: kind });
    }
    return names;
  }, [catalog, pick, t]);

  const sessions = useMemo(
    () => (payload ? sharedWeekSessions(payload) : []),
    [payload],
  );
  const knownSessions = useMemo(
    () => sessions.filter((s) => isSharedSessionKnown(s.workoutId, new Set(byId.keys()))),
    [sessions, byId],
  );
  const unknownCount = sessions.length - knownSessions.length;

  // The preview is the plan the "add" call would save, so the board and the
  // summary show exactly what lands: unknown sessions are already out.
  const preview = useMemo(
    () => (payload ? sharedWeekToPlan(payload, new Set(byId.keys())) : null),
    [payload, byId],
  );
  const slots = useMemo(
    () => planWeekToSlots(preview?.weeks[0], byId),
    [preview, byId],
  );
  const stats = useMemo(() => computeWeekStats(slots), [slots]);

  if (!payload) {
    return (
      <>
        <SEOHead noindex title={t("weekly.shared.title")} canonical="/weeks/shared" />
        <div className="zn-pw">
          <section className="zn-pw__band">
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
    // A fresh copy, with its own id: the preview stays what the URL says.
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
        <section className="zn-pw__band">
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

        {preview && (
          <section className="zn-pw__band" aria-labelledby="pw-preview">
            <div
              className="zn-stack"
              style={{ "--gap": "var(--sp-8)" } as React.CSSProperties}
            >
              <h2 id="pw-preview" className="zn-title" data-level="3">
                {t("weekly.prebuilt.preview")}
              </h2>
              <WeekSummaryStrip stats={stats} slots={slots} />
              {/* The editor's board, with no gesture handed to it: nothing
                  drags, nothing adds. A card opens the workout it names; an
                  activity has no page of its own. The board carries the
                  ramp's folded legend, printed once. */}
              <div className="zn-pw__board">
                <PlanWeeklyView
                  plan={preview}
                  workoutNames={workoutNames}
                  workoutMeta={workoutMeta}
                  currentWeek={1}
                  initialWeek={1}
                  isEn={isEn}
                  onSessionClick={(_week, _index, workoutId) => {
                    if (!isActivitySession(workoutId)) navigate(`/workout/${workoutId}`);
                  }}
                  singleWeek
                  tapOpensSession
                />
              </div>
            </div>
          </section>
        )}
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
