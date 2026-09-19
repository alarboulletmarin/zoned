import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ArrowRight } from "@/components/icons";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { getPlanMonday, isoDateOnly } from "@/lib/planDates";
import { mergeWeekIntoPlan, type MergeWeekMode } from "@/lib/planStorage";
import {
  byNewest,
  layerFor,
  mondayOf,
  placeWeek,
  removeLayer,
  resolveTodaySources,
  setLayerEnabled,
  sourcePosition,
  type TodayComposition,
  type TodaySource,
} from "@/lib/todayComposition";
import { useIsEnglish } from "@/lib/i18n-utils";
import type { TrainingPlan } from "@/types/plan";

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Ce que le cockpit suit, et ce qu'on lui pose.
 *
 * Une feuille, pas une page : on l'ouvre depuis le cockpit, on allume un plan
 * ou on pose une semaine, on la referme, et l'écran du matin a changé sous
 * elle. Deux listes, parce que ce sont deux objets qui n'entrent pas de la
 * même façon :
 *
 * - un PLAN est daté par lui-même. On le suit ou on l'éteint, et c'est tout ;
 * - une SEMAINE seule n'a pas de date. L'allumer, c'est la POSER sur une
 *   semaine du calendrier, et c'est celle qu'on REGARDE dans le cockpit, pas
 *   forcément celle qu'on vit : depuis la grille du mois, on pose une semaine
 *   de décharge trois semaines plus loin sans quitter l'écran.
 *
 * Les interrupteurs disent l'état RÉEL, celui que `resolveTodaySources` rend,
 * et pas ce que la composition a écrit : une semaine qui se montre par la règle
 * de repli est allumée, même sans couche. L'éteindre écrit alors une couche.
 */
export function TodayComposePanel({
  open,
  onOpenChange,
  plans,
  composition,
  onChange,
  onPlansChanged,
  lookedAt,
  today,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: readonly TrainingPlan[];
  composition: TodayComposition;
  onChange: (next: TodayComposition) => void;
  /** Un plan a été réécrit (fusion) : l'appelant relit ses plans. */
  onPlansChanged?: () => void;
  /** Le jour regardé dans le cockpit : une semaine se pose sur SA semaine. */
  lookedAt: Date;
  today: Date;
}) {
  const { t } = useTranslation(["today", "library"]);
  const isEn = useIsEnglish();

  /* La semaine dont la fusion est en train de se décider, ajouter ou
     remplacer : la question ne se pose qu'une fois le geste demandé. */
  const [merging, setMerging] = useState<string | null>(null);

  const active = useMemo(
    () => new Set(resolveTodaySources(plans, composition, today).map((s) => s.plan.id)),
    [plans, composition, today],
  );

  const lookedMonday = useMemo(() => mondayOf(lookedAt), [lookedAt]);
  const lookedIso = isoDateOnly(lookedMonday);

  /* Les plans qui ont encore quelque chose à montrer : en cours ou à venir.
     Un plan terminé n'a plus rien à poser dans le cockpit, il n'est pas dans
     la liste, sa page reste sous Mes plans. */
  const planRows = useMemo(() => {
    const rows: { plan: TrainingPlan; status: string }[] = [];
    const midnight = new Date(today);
    midnight.setHours(0, 0, 0, 0);
    for (const plan of [...plans].filter((p) => p.config.isSingleWeek !== true).sort(byNewest)) {
      const source: TodaySource = { plan, isWeek: false, monday: getPlanMonday(plan), explicit: false };
      const position = sourcePosition(source, midnight);
      if (position) {
        rows.push({
          plan,
          status: t("today:compose.underWay", { n: position.weekNumber, total: plan.totalWeeks }),
        });
        continue;
      }
      const days = Math.ceil((source.monday.getTime() - midnight.getTime()) / DAY_MS);
      if (days > 0) rows.push({ plan, status: t("today:compose.startsIn", { count: days }) });
    }
    return rows;
  }, [plans, today, t]);

  const weekRows = useMemo(
    () => [...plans].filter((p) => p.config.isSingleWeek === true).sort(byNewest),
    [plans],
  );

  /* Le plan sur lequel une semaine POSÉE tombe, et sa semaine à lui : c'est
     là qu'elle peut se fusionner. Une semaine posée hors de tout plan n'a
     rien où se fondre, et le geste ne s'affiche pas. */
  const mergeTarget = (anchor: string): { plan: TrainingPlan; weekNumber: number } | null => {
    const [y, m, d] = anchor.split("-").map(Number);
    const monday = new Date(y, m - 1, d);
    for (const plan of planRows.map((r) => r.plan)) {
      const source: TodaySource = { plan, isWeek: false, monday: getPlanMonday(plan), explicit: false };
      const position = sourcePosition(source, monday);
      if (position) return { plan, weekNumber: position.weekNumber };
    }
    return null;
  };

  const handleMerge = (week: TrainingPlan, mode: MergeWeekMode) => {
    const layer = layerFor(composition, week.id);
    const target = layer?.anchor ? mergeTarget(layer.anchor) : null;
    if (!target) return;
    const name = isEn ? week.nameEn : week.name;
    const ok = mergeWeekIntoPlan(target.plan.id, target.weekNumber, week.id, mode, {
      label: t("today:compose.mergeLabel", { week: name, n: target.weekNumber, lng: "fr" }),
      labelEn: t("today:compose.mergeLabel", { week: name, n: target.weekNumber, lng: "en" }),
    });
    setMerging(null);
    if (!ok) {
      toast.error(t("today:compose.mergeFailed"));
      return;
    }
    // Fusionnée, la semaine n'a plus à se lire à côté : elle est DANS le plan.
    onChange(removeLayer(composition, week.id));
    onPlansChanged?.();
    toast.success(t("today:compose.mergeDone"));
  };

  const formatMonday = (iso: string) => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(isEn ? "en-GB" : "fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="zn-compose">
        <SheetHeader>
          <SheetTitle>{t("today:compose.title")}</SheetTitle>
          <SheetDescription>{t("today:compose.body")}</SheetDescription>
        </SheetHeader>

        <div className="zn-compose__groups">
          <section className="zn-compose__group">
            <h3 className="zn-kicker zn-kicker--xs">{t("today:compose.plans")}</h3>
            {planRows.length === 0 ? (
              <p className="zn-body zn-muted">{t("today:compose.noPlans")}</p>
            ) : (
              <ul className="zn-compose__list">
                {planRows.map(({ plan, status }) => {
                  const name = isEn ? plan.nameEn : plan.name;
                  const id = `compose-${plan.id}`;
                  return (
                    <li key={plan.id} className="zn-compose__row">
                      <label htmlFor={id} className="zn-compose__label">
                        <span className="zn-compose__name">{name}</span>
                        <span className="zn-compose__status zn-mono">{status}</span>
                      </label>
                      <Switch
                        id={id}
                        checked={active.has(plan.id)}
                        onCheckedChange={(checked) =>
                          onChange(setLayerEnabled(composition, plan.id, checked))
                        }
                        aria-label={t("today:compose.switchPlan", { name })}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="zn-compose__group">
            <h3 className="zn-kicker zn-kicker--xs">{t("today:compose.weeks")}</h3>
            {weekRows.length === 0 ? (
              <p className="zn-body zn-muted">{t("today:compose.noWeeks")}</p>
            ) : (
              <ul className="zn-compose__list">
                {weekRows.map((plan) => {
                  const name = isEn ? plan.nameEn : plan.name;
                  const id = `compose-${plan.id}`;
                  const on = active.has(plan.id);
                  const layer = layerFor(composition, plan.id);
                  // Posée sur son lundi de pose, sinon sur sa semaine de création,
                  // ce que la règle de repli dit d'elle.
                  const anchor = layer?.anchor ?? isoDateOnly(getPlanMonday(plan));
                  const category = plan.config.weekCategory
                    ? t(`library:weekly.prebuilt.category.${plan.config.weekCategory}`)
                    : null;
                  return (
                    <li key={plan.id} className="zn-compose__row">
                      <label htmlFor={id} className="zn-compose__label">
                        <span className="zn-compose__name">
                          {name}
                          {category && (
                            <span className="zn-compose__category zn-mono">{category}</span>
                          )}
                        </span>
                        <span className="zn-compose__status zn-mono">
                          {on ? t("today:compose.placedOn", { date: formatMonday(anchor) }) : " "}
                        </span>
                        {on && anchor !== lookedIso && (
                          <button
                            type="button"
                            className="zn-compose__move"
                            onClick={() => onChange(placeWeek(composition, plan.id, lookedMonday))}
                          >
                            {t("today:compose.moveHere", { date: formatMonday(lookedIso) })}
                          </button>
                        )}
                      </label>
                      {/* Fusionner : la semaine posée sur une semaine d'un
                          plan peut y entrer pour de bon. Ajouter par défaut ;
                          remplacer efface les séances du plan cette
                          semaine-là, donc il se demande en toutes lettres. */}
                      <Switch
                        id={id}
                        checked={on}
                        onCheckedChange={(checked) =>
                          onChange(
                            checked
                              ? placeWeek(composition, plan.id, lookedMonday)
                              : setLayerEnabled(composition, plan.id, false),
                          )
                        }
                        aria-label={t("today:compose.switchWeek", { name })}
                      />
                      {on && layer?.anchor && (() => {
                        const target = mergeTarget(layer.anchor);
                        if (!target) return null;
                        return (
                          <span className="zn-compose__merge">
                            {merging === plan.id ? (
                              <>
                                <button type="button" className="zn-compose__move" onClick={() => handleMerge(plan, "add")}>
                                  {t("today:compose.mergeAdd")}
                                </button>
                                <button type="button" className="zn-compose__move" onClick={() => handleMerge(plan, "replace")}>
                                  {t("today:compose.mergeReplace")}
                                </button>
                                <button type="button" className="zn-compose__move" onClick={() => setMerging(null)}>
                                  {t("today:compose.mergeCancel")}
                                </button>
                              </>
                            ) : (
                              <button type="button" className="zn-compose__move" onClick={() => setMerging(plan.id)}>
                                {t("today:compose.merge", {
                                  plan: isEn ? target.plan.nameEn : target.plan.name,
                                  n: target.weekNumber,
                                })}
                              </button>
                            )}
                          </span>
                        );
                      })()}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Deux sorties, vers les ateliers : une semaine composée depuis ici
            se pose d'elle-même sur la semaine regardée, c'est ce que `placeOn`
            transporte. */}
        <p className="zn-compose__exits" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
          <Link
            to="/weeks/new"
            state={{ placeOn: lookedIso }}
            className="zn-compose__exit"
            onClick={() => onOpenChange(false)}
          >
            {t("today:compose.newWeek")}
            <ArrowRight />
          </Link>
          <Link to="/plan/new" className="zn-compose__exit" onClick={() => onOpenChange(false)}>
            {t("today:compose.newPlan")}
            <ArrowRight />
          </Link>
        </p>
      </SheetContent>
    </Sheet>
  );
}
