import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PlanTimeline } from "@/components/domain/PlanTimeline";
import { PlanActionsMenu } from "@/components/domain/PlanActionsMenu";
import {
  PlanNameField,
  Segs,
  formatVolume,
  useChipLabel,
  type PlanCardActions,
} from "@/components/domain/PlanCard";
import { formatDate } from "@/lib/i18n-utils";
import type { PlanCardModel } from "@/lib/planCardModel";
import type { TrainingPlan } from "@/types/plan";

/**
 * Les plans terminés, en UNE section. Un plan fini est de l'historique : il
 * n'a ni compte à rebours ni prochaine séance, et il ne mérite plus la place
 * d'une carte. Une ligne dit ce qu'il a été (sa période, sa nature, ses
 * séances faites sur prévues, sa frise en miniature) et garde le même
 * menu ··· que les plans en cours.
 *
 * Sous 1024 px, une liste ; à partir de 1024 px, un vrai tableau, parce que
 * six colonnes se lisent en colonne quand il y a la place.
 */

export interface PlanHistoryEntry {
  plan: TrainingPlan;
  name: string;
  model: PlanCardModel;
}

interface PlanHistoryProps extends PlanCardActions {
  entries: PlanHistoryEntry[];
  table: boolean;
}

export function PlanHistory({ entries, table, ...actions }: PlanHistoryProps) {
  const { t } = useTranslation("plan");
  if (entries.length === 0) return null;

  return (
    <section className="zn-planhist" aria-labelledby="zn-planhist-title">
      <h2 id="zn-planhist-title" className="zn-kicker">
        {t("plansPage.doneSection", { count: entries.length })}
      </h2>
      {table ? (
        <div className="zn-planhist__box">
          <table className="zn-planhist__table">
            <thead>
              <tr>
                <th scope="col">{t("plansPage.history.plan")}</th>
                <th scope="col">{t("plansPage.history.period")}</th>
                <th scope="col" data-num="true">{t("plansPage.history.sessions")}</th>
                <th scope="col" data-num="true">{t("plansPage.history.volume")}</th>
                <th scope="col">{t("plansPage.history.weeks")}</th>
                <th scope="col"><span className="sr-only">{t("plansPage.history.actions")}</span></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <HistoryRow key={entry.plan.id} entry={entry} table {...actions} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="zn-planhist__box zn-planhist__list">
          {entries.map((entry) => (
            <HistoryRow key={entry.plan.id} entry={entry} table={false} {...actions} />
          ))}
        </ul>
      )}
    </section>
  );
}

function span(model: PlanCardModel, withYear: boolean): string {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const end = formatDate(model.span.end, withYear ? { ...opts, year: "numeric" } : opts);
  return `${formatDate(model.span.start, opts)} → ${end}`;
}

function HistoryRow({
  entry,
  table,
  onDuplicate,
  onRename,
  onDelete,
}: { entry: PlanHistoryEntry; table: boolean } & PlanCardActions) {
  const { t } = useTranslation("plan");
  const chipLabel = useChipLabel();
  const [editing, setEditing] = useState(false);
  const { plan, name, model } = entry;
  // La nature du plan, en un mot : sa distance, sinon sa pratique, sinon son mode.
  const kind = model.chips.find((c) => c.kind !== "target");
  const kindLabel = kind ? chipLabel(kind) : null;

  const nameNode = editing ? (
    <PlanNameField
      initial={name}
      className="zn-planhist__rename"
      onDone={(next) => {
        setEditing(false);
        if (next !== null) onRename(plan, next);
      }}
    />
  ) : null;

  const menu = (
    <PlanActionsMenu
      plan={plan}
      label={t("plansPage.menu.label", { name })}
      onDuplicate={() => onDuplicate(plan)}
      onRename={() => setEditing(true)}
      onDelete={() => onDelete(plan)}
    />
  );

  const sessions = (
    <>
      {model.sessionsTotal.done}
      <span className="zn-planhist__of">
        {table ? " / " : "/"}
        {model.sessionsTotal.planned}
      </span>
    </>
  );

  if (table) {
    return (
      <tr>
        <th scope="row">
          {nameNode ?? (
            <Link className="zn-planhist__open" to={`/plan/${plan.id}`}>
              <span className="zn-planhist__name">{name}</span>
              {kindLabel && <span className="zn-planchip">{kindLabel}</span>}
            </Link>
          )}
        </th>
        <td className="zn-planhist__period">{span(model, true)}</td>
        <td data-num="true" className="zn-planhist__figure">{sessions}</td>
        <td data-num="true" className="zn-planhist__figure zn-planhist__volume">
          {formatVolume(model.minutesTotal.done)}
        </td>
        <td>
          <PlanTimeline model={model} variant="mini" />
        </td>
        <td>{menu}</td>
      </tr>
    );
  }

  return (
    <li className="zn-planhist__row">
      {nameNode ?? (
        <Link className="zn-planhist__open" to={`/plan/${plan.id}`}>
          <span className="zn-planhist__name">{name}</span>
          <Segs className="zn-planhist__meta" parts={[span(model, false), kindLabel]} />
        </Link>
      )}
      <div className="zn-planhist__mid">
        <PlanTimeline model={model} variant="mini" />
        <span className="zn-planhist__count">
          <span className="zn-planhist__figure">{sessions}</span>
          <span className="zn-planhist__label">{t("plansPage.history.sessions")}</span>
        </span>
      </div>
      {menu}
    </li>
  );
}
