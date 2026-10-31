import { useMemo, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getAllPrebuiltWeeks, type PrebuiltWeek } from "@/data/prebuilt-weeks";
import { getAllPlans, mergeSessionsIntoPlanWeek, type MergeWeekMode } from "@/lib/planStorage";
import { getPlanMonday, isoDateOnly } from "@/lib/planDates";
import { prebuiltWeekToPlan } from "@/lib/weekToPlan";
import {
  byNewest,
  layerFor,
  loadTodayComposition,
  removeLayer,
  saveTodayComposition,
} from "@/lib/todayComposition";
import { usePickLang } from "@/lib/i18n-utils";
import type { TrainingPlan } from "@/types/plan";

/**
 * Ajouter une semaine à UNE semaine du plan, depuis la page du plan.
 *
 * Le geste existait, mais seulement dans la feuille du cockpit, et
 * seulement pour une semaine déjà suivie sur cette semaine-là. Or quand on
 * veut "jouer" avec un plan et une semaine, on est sur le plan. Ici, sur la
 * semaine 6 du marathon, on choisit une de ses semaines ou une du
 * catalogue, on dit si elle s'ajoute aux séances du plan ou les remplace,
 * et c'est écrit sous annulation.
 *
 * Une semaine du catalogue s'ajoute sans passer par Mes semaines : elle
 * n'est pas enregistrée, seules ses séances entrent dans le plan. Une des
 * miennes qui était suivie sur cette même semaine cesse de l'être, sinon
 * ses séances se liraient deux fois dans le cockpit.
 */
type Source =
  | { kind: "mine"; week: TrainingPlan }
  | { kind: "catalogue"; week: PrebuiltWeek };

interface AddWeekToPlanSheetProps {
  plan: TrainingPlan;
  /** La semaine du plan visée, ou null quand la feuille est fermée. */
  weekNumber: number | null;
  onOpenChange: (open: boolean) => void;
  onMerged: () => void;
}

export function AddWeekToPlanSheet({ plan, weekNumber, onOpenChange, onMerged }: AddWeekToPlanSheetProps) {
  const { t } = useTranslation(["plan", "library"]);
  const pick = usePickLang();
  const open = weekNumber !== null;
  const [choice, setChoice] = useState<Source | null>(null);

  // Une semaine vide n'a rien à ajouter : elle n'est pas proposée, et la
  // feuille dit pourquoi si toutes le sont.
  const { mine, allEmpty } = useMemo(() => {
    if (!open) return { mine: [] as TrainingPlan[], allEmpty: false };
    const weeks = getAllPlans().filter((p) => p.config.isSingleWeek === true).sort(byNewest);
    const withSessions = weeks.filter((w) => (w.weeks[0]?.sessions.length ?? 0) > 0);
    return { mine: withSessions, allEmpty: weeks.length > 0 && withSessions.length === 0 };
  }, [open]);
  const catalogue = useMemo(() => getAllPrebuiltWeeks(), []);

  const close = () => {
    setChoice(null);
    onOpenChange(false);
  };

  const merge = (source: Source, mode: MergeWeekMode) => {
    if (weekNumber === null) return;
    const name = pick(source.week, "name");
    const sessions =
      source.kind === "mine"
        ? (source.week.weeks[0]?.sessions ?? [])
        : (prebuiltWeekToPlan(source.week).weeks[0]?.sessions ?? []);
    const ok = mergeSessionsIntoPlanWeek(plan.id, weekNumber, sessions, mode, {
      label: t("plan:view.addWeek.label", { week: name, n: weekNumber, lng: "fr" }),
      labelEn: t("plan:view.addWeek.label", { week: name, n: weekNumber, lng: "en" }),
    });
    if (!ok) {
      toast.error(t("plan:view.addWeek.failed"));
      return;
    }
    // Ajoutée au plan, une semaine suivie sur cette même semaine cesse de
    // se lire à côté : ses séances sont DANS le plan maintenant.
    if (source.kind === "mine") {
      const composition = loadTodayComposition();
      const layer = layerFor(composition, source.week.id);
      const planMonday = getPlanMonday(plan);
      const targetMonday = new Date(planMonday);
      targetMonday.setDate(targetMonday.getDate() + (weekNumber - 1) * 7);
      if (layer?.enabled && layer.anchor === isoDateOnly(targetMonday)) {
        saveTodayComposition(removeLayer(composition, source.week.id));
      }
    }
    toast.success(t("plan:view.addWeek.done"));
    close();
    onMerged();
  };

  const rowLabel = (source: Source) => {
    const count =
      source.kind === "mine"
        ? (source.week.weeks[0]?.sessions.length ?? 0)
        : source.week.sessions.length;
    return t("plan:view.addWeek.sessions", { count });
  };

  const isChosen = (source: Source) =>
    choice !== null &&
    choice.kind === source.kind &&
    (choice.kind === "mine" && source.kind === "mine"
      ? choice.week.id === source.week.id
      : choice.kind === "catalogue" && source.kind === "catalogue"
        ? choice.week.slug === source.week.slug
        : false);

  const renderRow = (source: Source, key: string) => {
    const name = pick(source.week, "name");
    const chosen = isChosen(source);
    return (
      <li key={key} className="zn-compose__row">
        <span className="zn-compose__label">
          <span className="zn-compose__name">{name}</span>
          <span className="zn-compose__status">{rowLabel(source)}</span>
        </span>
        <span className="zn-compose__merge">
          {chosen ? (
            <>
              <button type="button" className="zn-compose__move" onClick={() => merge(source, "add")}>
                {t("plan:view.addWeek.add")}
              </button>
              <button type="button" className="zn-compose__move" onClick={() => merge(source, "replace")}>
                {t("plan:view.addWeek.replace")}
              </button>
              <button type="button" className="zn-compose__move" onClick={() => setChoice(null)}>
                {t("plan:view.addWeek.cancel")}
              </button>
            </>
          ) : (
            <button type="button" className="zn-compose__move" onClick={() => setChoice(source)}>
              {t("plan:view.addWeek.choose")}
            </button>
          )}
        </span>
      </li>
    );
  };

  return (
    <Sheet open={open} onOpenChange={(next) => (next ? onOpenChange(true) : close())}>
      <SheetContent side="bottom" className="zn-compose">
        <SheetHeader>
          <SheetTitle>{t("plan:view.addWeek.title", { n: weekNumber ?? 0 })}</SheetTitle>
          <SheetDescription>{t("plan:view.addWeek.body")}</SheetDescription>
        </SheetHeader>

        <div className="zn-compose__groups">
          <section className="zn-compose__group">
            <h3 className="zn-kicker zn-kicker--xs">{t("plan:view.addWeek.mine")}</h3>
            {mine.length === 0 ? (
              <p className="zn-body zn-muted">
                {t(allEmpty ? "plan:view.addWeek.allEmpty" : "plan:view.addWeek.noMine")}
              </p>
            ) : (
              <ul className="zn-compose__list">
                {mine.map((week) => renderRow({ kind: "mine", week }, week.id))}
              </ul>
            )}
          </section>

          <section className="zn-compose__group">
            <h3 className="zn-kicker zn-kicker--xs">{t("plan:view.addWeek.catalogue")}</h3>
            <ul className="zn-compose__list">
              {catalogue.map((week) => renderRow({ kind: "catalogue", week }, week.slug))}
            </ul>
          </section>
        </div>

        <p className="zn-caption zn-faint" style={{ marginBlockStart: "var(--sp-6)" } as CSSProperties}>
          {t("plan:view.addWeek.undoHint")}
        </p>
      </SheetContent>
    </Sheet>
  );
}
