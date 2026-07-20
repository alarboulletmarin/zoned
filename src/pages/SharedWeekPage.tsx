import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Share,
  Star,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp } from "@/components/editorial";
import { WeekSummaryBar } from "@/components/weekly";
import { cn } from "@/lib/utils";
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
        <div className="py-12 text-center">
          <p className="text-muted-foreground">{t("weekly.shared.invalid")}</p>
          <Button variant="link" asChild className="mt-4">
            <Link to="/weeks">
              <ArrowLeft className="mr-2 size-4" />
              {t("weekly.list.title")}
            </Link>
          </Button>
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

  return (
    <>
      <SEOHead noindex title={payload.n} canonical="/weeks/shared" />
      <div className="py-8 space-y-6 pb-28 lg:pb-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-full bg-gradient-to-br from-zone-2/10 dark:from-zone-2/20 to-transparent flex items-center justify-center shrink-0">
                <Share className="size-5 text-foreground/80" />
              </div>
              <EditorialTitle as="h1">{payload.n}</EditorialTitle>
            </div>
            <FadeUp as="p" delay={0.1} className="text-muted-foreground max-w-2xl">
              {t("weekly.shared.subtitle")}
            </FadeUp>
            <div className="flex flex-wrap items-center gap-2">
              {payload.c && (
                <Badge variant="secondary">
                  {t(`weekly.prebuilt.category.${payload.c}`)}
                </Badge>
              )}
              <Badge variant="outline">
                {t("weekly.prebuilt.sessions", { count: sessions.length })}
              </Badge>
            </div>
          </div>

          {/* CTA top (desktop) */}
          <Button size="lg" onClick={handleAdd} className="shrink-0 hidden lg:inline-flex">
            {t("weekly.shared.add")}
          </Button>
        </div>

        {/* Preview: stats + 80/20 gauge + rhythm (reuses WeekSummaryBar). */}
        <WeekSummaryBar stats={stats} slots={slots} />

        {unknownCount > 0 && (
          <p className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <AlertTriangle className="size-3.5 shrink-0" />
            {t("weekly.shared.unknownCount", { count: unknownCount })}
          </p>
        )}

        {/* Session list */}
        <div className="space-y-2">
          {knownSessions.map((session, idx) => {
            const workout = byId.get(session.workoutId);
            const workoutName = workout ? pick(workout, "name") : session.workoutId;
            const sessionLabel = SESSION_TYPE_LABELS[session.sessionType];
            const dayLabel = t(`weekly.days.${session.dayOfWeek}`);

            return (
              <Card key={idx} size="flush" className="border-border/50">
                <CardContent className="p-3 sm:p-4">
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
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Mobile sticky CTA (thumb zone). */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-background/95 backdrop-blur px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <Button className="w-full" size="lg" onClick={handleAdd}>
          {t("weekly.shared.add")}
        </Button>
      </div>
    </>
  );
}
