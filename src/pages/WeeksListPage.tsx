import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Trash2,
  CalendarRange,
  Activity,
  Clock,
  Gauge,
  ArrowRight,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { SEOHead } from "@/components/seo";
import {
  EditorialTitle,
  FadeUp,
  StaggerGrid,
  StaggerItem,
} from "@/components/editorial";
import { WeekRhythmChart } from "@/components/weekly";
import { PlanExportMenu } from "@/components/domain/PlanExportMenu";
import { usePlans } from "@/hooks/usePlans";
import { useWorkouts } from "@/hooks";
import { useStrengthWorkouts } from "@/hooks/useStrengthWorkouts";
import { useCrossDisciplineWorkouts } from "@/hooks/useCrossDisciplineWorkouts";
import { planWeekToSlots } from "@/lib/weekToPlan";
import { computeWeekStats } from "@/lib/weekStats";
import { usePickLang } from "@/lib/i18n-utils";
import type { AnyWorkoutTemplate } from "@/types";
import type { TrainingPlan } from "@/types/plan";

/** One compact stat (icon + value) shown in a week card's mini-stats row. */
function WeekStat({
  icon: Icon,
  value,
}: {
  icon: typeof Activity;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
      <Icon className="size-3.5 text-zone-2" />
      {value}
    </span>
  );
}

function WeekCard({
  week,
  byId,
  workoutNames,
  onDelete,
}: {
  week: TrainingPlan;
  byId: Map<string, AnyWorkoutTemplate>;
  workoutNames: Record<string, string>;
  onDelete: (id: string) => void;
}) {
  const { t } = useTranslation("library");
  const pick = usePickLang();
  const navigate = useNavigate();
  const slots = useMemo(
    () => planWeekToSlots(week.weeks[0], byId),
    [week, byId],
  );
  const stats = useMemo(() => computeWeekStats(slots), [slots]);
  const to = `/weeks/${week.id}`;

  return (
    <Card
      interactive
      className="h-full bg-gradient-to-br from-zone-2/10 dark:from-zone-2/20 to-transparent border-border/50"
    >
      <CardHeader className="cursor-pointer" onClick={() => navigate(to)}>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-1 flex-1">
            {pick(week, "name")}
          </CardTitle>
          <Badge variant="secondary" className="shrink-0">
            {t("weekly.title")}
          </Badge>
        </div>
        <CardDescription>
          <span className="flex items-center gap-1">
            <CalendarRange className="size-3.5" />
            {t("weekly.list.sessionsCount", { count: stats.sessions })}
            {" · "}
            {new Date(week.config.createdAt).toLocaleDateString()}
          </span>
        </CardDescription>
      </CardHeader>

      <CardContent
        className="space-y-3 cursor-pointer"
        onClick={() => navigate(to)}
      >
        {/* Mini-stats: sessions · volume (h) · TSS */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <WeekStat
            icon={Activity}
            value={t("weekly.list.sessionsCount", { count: stats.sessions })}
          />
          <WeekStat icon={Clock} value={`${stats.totalHours.toFixed(1)} h`} />
          <WeekStat icon={Gauge} value={`${stats.totalTss} TSS`} />
        </div>

        {/* Graphic: the 7-day rhythm (shape of the week at a glance) */}
        <WeekRhythmChart slots={slots} />
      </CardContent>

      {/* Actions — mirrors PlanCard: View · Export · Delete */}
      <div className="px-6 pb-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to={to}>
            <ArrowRight className="size-3.5" />
            {t("weekly.list.view")}
          </Link>
        </Button>
        <PlanExportMenu plan={week} workoutNames={workoutNames} size="sm" />
        <Button
          variant="destructive"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(week.id);
          }}
          aria-label={t("weekly.list.delete")}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </Card>
  );
}

export function WeeksListPage() {
  const { t } = useTranslation("library");
  const pick = usePickLang();
  const { plans, remove } = usePlans();

  // Resolve sessions → slots for the mini-stats + rhythm. Mirrors WeekViewPage's
  // catalog build (running + cycling + swimming + strength) into one id→workout map.
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

  const workoutNames = useMemo(() => {
    const names: Record<string, string> = {};
    byId.forEach((w, id) => {
      names[id] = pick(w, "name");
    });
    return names;
  }, [byId, pick]);

  const weeks = useMemo(
    () =>
      plans
        .filter((p) => p.config.isSingleWeek)
        .sort(
          (a, b) =>
            new Date(b.config.createdAt).getTime() -
            new Date(a.config.createdAt).getTime(),
        ),
    [plans],
  );

  return (
    <>
      <SEOHead noindex title={t("weekly.list.title")} canonical="/weeks" />
      <div className="py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <EditorialTitle as="h1" size="md">
              {t("weekly.list.title")}
            </EditorialTitle>
            <FadeUp as="p" delay={0.1} className="text-muted-foreground mt-1">
              {t("weekly.list.subtitle")}
            </FadeUp>
          </div>
          <Button asChild>
            <Link to="/weeks/new">
              <Plus className="size-4" />
              {t("weekly.list.create")}
            </Link>
          </Button>
        </div>

        {weeks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center space-y-4">
              <CalendarRange className="size-10 mx-auto text-muted-foreground/60" />
              <p className="text-muted-foreground">{t("weekly.list.empty")}</p>
              <Button asChild>
                <Link to="/weeks/new">
                  <Plus className="size-4" />
                  {t("weekly.list.create")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <StaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {weeks.map((week) => (
              <StaggerItem key={week.id}>
                <WeekCard
                  week={week}
                  byId={byId}
                  workoutNames={workoutNames}
                  onDelete={remove}
                />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </div>
    </>
  );
}
