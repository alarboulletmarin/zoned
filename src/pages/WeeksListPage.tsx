import { useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/toast";
import { Plus, Trash2, CalendarRange, Upload } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { SEOHead } from "@/components/seo";
import { ZoneScale } from "@/components/visualization";
import { WeekRhythmChart } from "@/components/weekly";
import { PlanActionsMenu } from "@/components/domain/PlanActionsMenu";
import { PlanNameField, Segs } from "@/components/domain/PlanCard";
import { usePlans } from "@/hooks/usePlans";
import { layerFor, loadTodayComposition, type TodayComposition } from "@/lib/todayComposition";
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

/**
 * One saved week: its category, its name, its numbers, its shape, and a
 * button ··· for what you can do to it.
 *
 * Same object as a plan card on /plans (`.zn-plancard`, plans.css): paper,
 * ink rule, the upper block one link, the button ··· laid over it outside
 * the link. The row of buttons under it is gone: View doubled the link,
 * Export and the menu weighed as much as the content, and the bin waited in
 * the menu anyway. In the grid, the card is a subgrid of four rows (chips,
 * name, facts, rhythm), so the cards of one row line up row by row even when
 * a name runs to three lines.
 */
function WeekCard({
  week,
  byId,
  workoutNames,
  locale,
  composition,
  onDelete,
  onDuplicate,
  onShare,
  onRename,
}: {
  week: TrainingPlan;
  byId: Map<string, AnyWorkoutTemplate>;
  workoutNames: Record<string, string>;
  locale: string;
  composition: TodayComposition;
  onDelete: (id: string) => void;
  onDuplicate: (week: TrainingPlan) => void;
  onShare: (week: TrainingPlan) => void;
  onRename: (week: TrainingPlan, name: string) => void;
}) {
  const { t } = useTranslation("library");
  const { t: tp } = useTranslation("plan");
  const pick = usePickLang();
  const nameId = useId();
  const [editing, setEditing] = useState(false);
  const slots = useMemo(
    () => planWeekToSlots(week.weeks[0], byId),
    [week, byId],
  );
  const stats = useMemo(() => computeWeekStats(slots), [slots]);
  const name = pick(week, "name");

  // Numbers, not adjectives: what is in the week, then when it was written.
  // Segments, so a narrow card breaks between two facts, never inside one.
  const facts = [
    t("weekly.list.sessionsCount", { count: stats.sessions }),
    `${stats.totalHours.toFixed(1)} h`,
    `${stats.totalTss} TSS`,
    new Date(week.config.createdAt).toLocaleDateString(locale),
  ];

  /* Posée dans le cockpit : une ligne de plus, en mono, et seulement quand
     c'est le cas. C'est la seule chose que la liste ne savait pas dire d'une
     semaine : où elle est en train de servir. */
  const layer = layerFor(composition, week.id);
  const placedOn =
    layer?.enabled && layer.anchor
      ? t("weekly.cockpit.listPlaced", {
          date: (() => {
            const [y, m, d] = layer.anchor.split("-").map(Number);
            return new Date(y, m - 1, d).toLocaleDateString(locale, { day: "numeric", month: "short" });
          })(),
        })
      : null;

  const body = (
    <>
      <ul className="zn-plancard__chips">
        <li className="zn-planchip">
          {week.config.weekCategory
            ? t(`weekly.prebuilt.category.${week.config.weekCategory}`)
            : t("weekly.category.none")}
        </li>
      </ul>
      {editing ? (
        <PlanNameField
          initial={name}
          className="zn-plancard__rename"
          onDone={(next) => {
            setEditing(false);
            if (next !== null) onRename(week, next);
          }}
        />
      ) : (
        <h3 id={nameId} className="zn-plancard__name">
          {name}
        </h3>
      )}
      <div className="zn-weekcard__facts">
        <Segs className="zn-weekcard__fact" parts={facts} />
        {placedOn && <Segs className="zn-weekcard__fact" parts={[placedOn]} />}
      </div>
      <WeekRhythmChart slots={slots} />
    </>
  );

  return (
    <article className="zn-plancard zn-weekcard" data-layout="card">
      {/* Pendant le renommage, le haut n'est plus un lien : un champ dans
          une ancre enverrait chaque clic vers la semaine. */}
      {editing ? (
        <div className="zn-plancard__open">{body}</div>
      ) : (
        <Link className="zn-plancard__open" to={`/weeks/${week.id}`} aria-labelledby={nameId}>
          {body}
        </Link>
      )}
      <PlanActionsMenu
        plan={week}
        label={tp("plansPage.menu.weekLabel", { name })}
        workoutNames={workoutNames}
        className="zn-plancard__menu"
        onShare={() => onShare(week)}
        onDuplicate={() => onDuplicate(week)}
        onRename={() => setEditing(true)}
        onDelete={() => onDelete(week.id)}
      />
    </article>
  );
}

export function WeeksListPage() {
  const { t } = useTranslation(["library", "common"]);
  const pick = usePickLang();
  const isEn = useIsEnglish();
  const { plans, remove, reload } = usePlans();
  // La composition du cockpit, pour dire où chaque semaine sert. Lue une
  // fois : cette page ne la modifie pas.
  const composition = useMemo(() => loadTodayComposition(), []);
  const [categoryFilter, setCategoryFilter] = useState<WeekCategory | "all">("all");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
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

  // Category filter, chips only appear once at least one week is categorized.
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
      toast.failure(t("weekly.toast.duplicateError"));
      return;
    }
    reload();
  };

  const handleShare = async (week: TrainingPlan) => {
    const name = pick(week, "name");
    const url = sharedWeekUrl(week, name);
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url });
      } catch {
        // Share sheet dismissed, nothing to do.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast.success(t("common:share.toast.linkCopied"));
    } catch (err) {
      toast.failure(t("common:share.toast.linkCopyFailed"), err);
    }
  };

  // Comme la page de la semaine : le nom vit dans planName, name et nameEn.
  const handleRename = (week: TrainingPlan, name: string) => {
    const saved = savePlan({
      ...week,
      name,
      nameEn: name,
      config: { ...week.config, planName: name },
    });
    if (!saved.ok) {
      toast.failure(t("weekly.toast.saveFailed"), saved);
      return;
    }
    reload();
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
    const saved = savePlan(plan);
    if (!saved.ok) {
      toast.failure(t("weekly.toast.saveFailed"), saved);
      return;
    }
    reload();
  };

  const filtering = categoryFilter !== "all";
  const deleteTargetWeek = weeks.find((w) => w.id === deleteTarget);

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
              {/* Sur une planche vide, la création est dans l'état vide,
                  avec l'explication et la seconde voie ; la répéter ici
                  faisait deux boutons identiques sur un même écran. Elle
                  revient en tête dès qu'il y a une semaine à côté. */}
              {weeks.length > 0 && (
                <Button asChild>
                  <Link to="/weeks/new">
                    <Plus size={17} />
                    {t("weekly.list.create")}
                  </Link>
                </Button>
              )}
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
            <div className="zn-grid zn-weekgrid">
              {visibleWeeks.map((week) => (
                <WeekCard
                  key={week.id}
                  week={week}
                  byId={byId}
                  workoutNames={workoutNames}
                  locale={isEn ? "en" : "fr"}
                  composition={composition}
                  onDelete={setDeleteTarget}
                  onDuplicate={handleDuplicate}
                  onShare={handleShare}
                  onRename={handleRename}
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
                  // Le seul aplat vermillon de l'écran, ici et pas en tête :
                  // la première semaine se crée là où on explique ce qu'elle
                  // est. La seconde voie, en prendre une toute prête, est
                  // dans la note, en prose : un état vide n'a qu'une action.
                  <Button asChild>
                    <Link to="/weeks/new">
                      <Plus size={17} />
                      {t("weekly.list.emptyAction")}
                    </Link>
                  </Button>
                )
              }
              hint={
                filtering ? undefined : (
                  <>
                    {t("weekly.list.emptyHint")}{" "}
                    <Link to="/weeks/new/prebuilt">{t("weekly.list.emptyHintLink")}</Link>
                  </>
                )
              }
            />
          )}
        </section>
      </div>

      {/* Deleting a week cannot be undone, so, like a plan, it stays behind a dialog. */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("weekly.list.deleteTitle")}</DialogTitle>
            <DialogDescription>
              {deleteTargetWeek
                ? t("weekly.list.deleteConfirm", {
                    name: pick(deleteTargetWeek, "name"),
                  })
                : ""}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("common:actions.cancel")}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteTarget) {
                  remove(deleteTarget);
                  setDeleteTarget(null);
                }
              }}
            >
              <Trash2 />
              {t("weekly.list.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
