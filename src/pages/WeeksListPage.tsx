import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  CalendarRange,
  Copy,
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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SEOHead } from "@/components/seo";
import { ZoneScale } from "@/components/visualization";
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
import { usePickLang, useIsEnglish } from "@/lib/i18n-utils";
import type { AnyWorkoutTemplate } from "@/types";
import type { TrainingPlan, WeekCategory } from "@/types/plan";
import { WEEK_CATEGORIES } from "@/types/plan";

/** One saved week: its name, its numbers, its shape, and what you can do to it. */
function WeekCard({
  week,
  byId,
  workoutNames,
  locale,
  onDelete,
  onDuplicate,
  onShare,
}: {
  week: TrainingPlan;
  byId: Map<string, AnyWorkoutTemplate>;
  workoutNames: Record<string, string>;
  locale: string;
  onDelete: (id: string) => void;
  onDuplicate: (week: TrainingPlan) => void;
  onShare: (week: TrainingPlan) => void;
}) {
  const { t } = useTranslation("library");
  const pick = usePickLang();
  const slots = useMemo(
    () => planWeekToSlots(week.weeks[0], byId),
    [week, byId],
  );
  const stats = useMemo(() => computeWeekStats(slots), [slots]);
  const name = pick(week, "name");

  // Numbers, not adjectives: what is in the week, then when it was written.
  const facts = [
    t("weekly.list.sessionsCount", { count: stats.sessions }),
    `${stats.totalHours.toFixed(1)} h`,
    `${stats.totalTss} TSS`,
    new Date(week.config.createdAt).toLocaleDateString(locale),
  ].join(" · ");

  return (
    <Card>
      <CardHeader>
        <Link to={`/weeks/${week.id}`} className="zn-pw__week-title">
          {name}
        </Link>
        <span
          className="zn-row"
          style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}
        >
          <Badge variant="secondary">
            {week.config.weekCategory
              ? t(`weekly.prebuilt.category.${week.config.weekCategory}`)
              : t("weekly.category.none")}
          </Badge>
        </span>
      </CardHeader>

      <CardContent
        className="zn-stack"
        style={{ "--gap": "var(--sp-10)" } as React.CSSProperties}
      >
        <span className="zn-mono zn-pw__facts">{facts}</span>

        <WeekRhythmChart slots={slots} />

        <div className="zn-pw__week-actions">
          <PlanExportMenu
            plan={week}
            workoutNames={workoutNames}
            size="sm"
            variant="outline"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                aria-label={t("weekly.list.actions")}
              >
                <MoreVertical size={15} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onShare(week)}>
                <Share size={16} />
                {t("weekly.share.action")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDuplicate(week)}>
                <Copy size={16} />
                {t("weekly.saved.duplicate")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => onDelete(week.id)}
              >
                <Trash2 size={16} />
                {t("weekly.list.delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeeksListPage() {
  const { t } = useTranslation(["library", "common"]);
  const pick = usePickLang();
  const isEn = useIsEnglish();
  const { plans, remove, reload } = usePlans();
  const [categoryFilter, setCategoryFilter] = useState<WeekCategory | "all">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resolve sessions → slots for the facts + rhythm. Mirrors WeekViewPage's
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

  const filtering = categoryFilter !== "all";

  return (
    <>
      <SEOHead noindex title={t("weekly.list.title")} canonical="/weeks" />

      <div className="zn-pw">
        <section className="zn-pw__band">
          <div className="zn-pw__head">
            <div
              className="zn-stack zn-pw__headtext"
              style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
            >
              <span className="zn-kicker">
                {t("weekly.list.saved", { count: weeks.length })}
              </span>
              <h1 className="zn-display" data-level="2">
                {t("weekly.list.title")}
              </h1>
              <p className="zn-body zn-body--lead zn-pw__lede">
                {t("weekly.list.subtitle")}
              </p>
            </div>

            <div
              className="zn-cluster"
              style={{ "--gap": "var(--sp-6)" } as React.CSSProperties}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImportFile(file);
                  e.target.value = "";
                }}
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={17} />
                {t("weekly.list.import")}
              </Button>
              <Button asChild>
                <Link to="/weeks/new">
                  <Plus size={17} />
                  {t("weekly.list.create")}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {weeks.length > 0 && (
          <div
            className="zn-pw__band zn-cluster zn-cluster--split"
            style={
              {
                "--pad-block": "var(--sp-11)",
                "--gap": "var(--sp-10)",
              } as React.CSSProperties
            }
          >
            {presentCategories.length > 0 && (
              <div
                className="zn-cluster"
                role="radiogroup"
                aria-label={t("weekly.category.label")}
                style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}
              >
                <button
                  type="button"
                  role="radio"
                  aria-checked={categoryFilter === "all"}
                  className="zn-chip"
                  onClick={() => setCategoryFilter("all")}
                >
                  {t("weekly.list.filterAll")}
                </button>
                {presentCategories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="radio"
                    aria-checked={categoryFilter === c}
                    className="zn-chip"
                    onClick={() => setCategoryFilter(c)}
                  >
                    {t(`weekly.prebuilt.category.${c}`)}
                  </button>
                ))}
              </div>
            )}
            <ZoneScale className="zn-push" />
          </div>
        )}

        <section className="zn-pw__band">
          {visibleWeeks.length > 0 ? (
            <div className="zn-grid">
              {visibleWeeks.map((week) => (
                <WeekCard
                  key={week.id}
                  week={week}
                  byId={byId}
                  workoutNames={workoutNames}
                  locale={isEn ? "en" : "fr"}
                  onDelete={remove}
                  onDuplicate={handleDuplicate}
                  onShare={handleShare}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              variant={filtering ? "no-results" : "not-started"}
              icon={CalendarRange}
              title={t("weekly.list.emptyTitle")}
              description={
                filtering
                  ? t("weekly.list.filteredOut", { total: weeks.length })
                  : t("weekly.list.empty")
              }
              action={
                filtering ? (
                  <Button
                    variant="outline"
                    onClick={() => setCategoryFilter("all")}
                  >
                    {t("weekly.list.filterAll")}
                  </Button>
                ) : (
                  // The header already spends the screen's one vermillon fill
                  // on this exact call, so here it is the outlined accent.
                  <Button variant="outline-primary" asChild>
                    <Link to="/weeks/new">
                      <Plus size={17} />
                      {t("weekly.list.create")}
                    </Link>
                  </Button>
                )
              }
            />
          )}
        </section>
      </div>
    </>
  );
}
