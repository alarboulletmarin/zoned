import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  CalendarRange,
  Activity,
  Clock,
  Copy,
  Gauge,
  ArrowRight,
  MoreVertical,
  Share,
  Upload,
} from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { duplicatePlan, savePlan } from "@/lib/planStorage";
import { parseImportedPlanJson } from "@/lib/planSchema";
import { sharedWeekUrl } from "@/lib/weekShare";
import { usePickLang } from "@/lib/i18n-utils";
import { cn } from "@/lib/utils";
import type { AnyWorkoutTemplate } from "@/types";
import type { TrainingPlan, WeekCategory } from "@/types/plan";
import { WEEK_CATEGORIES } from "@/types/plan";

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
  onDuplicate,
  onShare,
}: {
  week: TrainingPlan;
  byId: Map<string, AnyWorkoutTemplate>;
  workoutNames: Record<string, string>;
  onDelete: (id: string) => void;
  onDuplicate: (week: TrainingPlan) => void;
  onShare: (week: TrainingPlan) => void;
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
            {week.config.weekCategory
              ? t(`weekly.prebuilt.category.${week.config.weekCategory}`)
              : t("weekly.title")}
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

      {/* Actions — View · Export · overflow menu (share / duplicate / delete) */}
      <div className="px-6 pb-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" asChild>
          <Link to={to}>
            <ArrowRight className="size-3.5" />
            {t("weekly.list.view")}
          </Link>
        </Button>
        <PlanExportMenu plan={week} workoutNames={workoutNames} size="sm" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              aria-label={t("weekly.list.actions")}
            >
              <MoreVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onShare(week)}>
              <Share className="size-4" />
              {t("weekly.share.action")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(week)}>
              <Copy className="size-4" />
              {t("weekly.saved.duplicate")}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => onDelete(week.id)}
            >
              <Trash2 className="size-4" />
              {t("weekly.list.delete")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}

/** Toggle chip for the category filter — mirrors WorkoutFilters' FilterChip. */
function CategoryChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

export function WeeksListPage() {
  const { t } = useTranslation(["library", "common"]);
  const pick = usePickLang();
  const { plans, remove, reload } = usePlans();
  const [categoryFilter, setCategoryFilter] = useState<WeekCategory | "all">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Category filter — chips only appear once at least one week is categorized.
  const presentCategories = useMemo(
    () =>
      WEEK_CATEGORIES.filter((c) =>
        weeks.some((w) => w.config.weekCategory === c),
      ),
    [weeks],
  );
  const visibleWeeks =
    categoryFilter === "all"
      ? weeks
      : weeks.filter((w) => w.config.weekCategory === categoryFilter);

  const handleDuplicate = (week: TrainingPlan) => {
    const newId = duplicatePlan(
      week.id,
      `${pick(week, "name")} ${t("weekly.saved.copySuffix")}`,
    );
    if (!newId) {
      toast.error(t("weekly.toast.duplicateError"));
      return;
    }
    reload();
    toast.success(t("weekly.toast.duplicated"));
  };

  const handleShare = async (week: TrainingPlan) => {
    const name = pick(week, "name");
    const url = sharedWeekUrl(week, name);
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url });
      } catch {
        // Share sheet dismissed — nothing to do.
      }
      return;
    }
    await navigator.clipboard.writeText(url);
    toast.success(t("common:share.toast.linkCopied"));
  };

  const handleImportFile = async (file: File) => {
    const plan = parseImportedPlanJson(await file.text());
    if (!plan) {
      toast.error(t("weekly.toast.importError"));
      return;
    }
    if (!plan.config.isSingleWeek) {
      toast.error(t("weekly.toast.importNotWeek"));
      return;
    }
    if (!savePlan(plan)) {
      toast.error(t("weekly.toast.importError"));
      return;
    }
    reload();
    toast.success(t("weekly.toast.imported"));
  };

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
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImportFile(file);
                e.target.value = "";
              }}
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="size-4" />
              {t("weekly.list.import")}
            </Button>
            <Button asChild>
              <Link to="/weeks/new">
                <Plus className="size-4" />
                {t("weekly.list.create")}
              </Link>
            </Button>
          </div>
        </div>

        {presentCategories.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <CategoryChip
              label={t("weekly.list.filterAll")}
              selected={categoryFilter === "all"}
              onClick={() => setCategoryFilter("all")}
            />
            {presentCategories.map((c) => (
              <CategoryChip
                key={c}
                label={t(`weekly.prebuilt.category.${c}`)}
                selected={categoryFilter === c}
                onClick={() => setCategoryFilter(c)}
              />
            ))}
          </div>
        )}

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
          <StaggerGrid
            // Remount when the list changes: a StaggerItem mounted after the
            // grid has played its entrance would otherwise stay at opacity 0
            // (viewport once) — duplicated/imported weeks were invisible.
            key={visibleWeeks.map((w) => w.id).join("|")}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
          >
            {visibleWeeks.map((week) => (
              <StaggerItem key={week.id}>
                <WeekCard
                  week={week}
                  byId={byId}
                  workoutNames={workoutNames}
                  onDelete={remove}
                  onDuplicate={handleDuplicate}
                  onShare={handleShare}
                />
              </StaggerItem>
            ))}
          </StaggerGrid>
        )}
      </div>
    </>
  );
}
