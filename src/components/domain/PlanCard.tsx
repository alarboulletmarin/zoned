import { useId, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "@/components/icons";
import { PlanTimeline } from "@/components/domain/PlanTimeline";
import { PlanActionsMenu } from "@/components/domain/PlanActionsMenu";
import { formatDurationMinutes } from "@/components/visualization";
import { PHASE_META, RACE_DISTANCE_META } from "@/types/plan";
import type { TrainingPlan } from "@/types/plan";
import { PRACTICE_META } from "@/types/practice";
import { formatDate, usePickLang } from "@/lib/i18n-utils";
import type { PlanCardModel, PlanChip, Tally } from "@/lib/planCardModel";

/**
 * La carte d'un plan en cours, sur /plans.
 *
 * De haut en bas : les pastilles et le bouton ···, le nom, le compte à rebours
 * et la semaine, la frise, les deux chiffres à date, puis la prochaine
 * séance. Le haut de la carte est UN lien vers le plan, une vraie ancre, et
 * le bouton ··· est posé par-dessus, hors du lien, pour que deux cibles ne
 * s'emboîtent pas.
 *
 * `wide` (à partir de 1024 px) met la frise à droite, en grand, et laisse la
 * prochaine séance en pleine largeur dessous. Le choix vient de la page
 * (`useMediaQuery`), pas de deux arbres masqués en CSS.
 */

export interface PlanCardActions {
  onDuplicate: (plan: TrainingPlan) => void;
  onRename: (plan: TrainingPlan, name: string) => void;
  onDelete: (plan: TrainingPlan) => void;
}

interface PlanCardProps extends PlanCardActions {
  plan: TrainingPlan;
  name: string;
  model: PlanCardModel;
  /** Le nom de la prochaine séance, résolu par la page dans le catalogue. */
  nextName: string | null;
  wide: boolean;
}

export function PlanCard({
  plan,
  name,
  model,
  nextName,
  wide,
  onDuplicate,
  onRename,
  onDelete,
}: PlanCardProps) {
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  const nameId = useId();
  const [editing, setEditing] = useState(false);

  const phaseLabel = model.phaseNow ? pick(PHASE_META[model.phaseNow], "label") : null;
  const started = model.weekNow >= 1;
  const weekLine = started
    ? [t("plansPage.week", { current: model.weekNow, total: model.weekTotal }), phaseLabel]
        .filter(Boolean)
        .join(" · ")
    : t("plansPage.startsOn", { date: dayLabel(model.span.start) });

  const menu = (
    <PlanActionsMenu
      plan={plan}
      name={name}
      className="zn-plancard__menu"
      onDuplicate={() => onDuplicate(plan)}
      onRename={() => setEditing(true)}
      onDelete={() => onDelete(plan)}
    />
  );

  const title = editing ? (
    <PlanNameField
      initial={name}
      className="zn-plancard__rename"
      onDone={(next) => {
        setEditing(false);
        if (next !== null) onRename(plan, next);
      }}
    />
  ) : (
    <h3 id={nameId} className="zn-plancard__name">
      {name}
    </h3>
  );

  const countdown = <Countdown model={model} />;
  const stats = (
    <dl className="zn-plancard__stats">
      <Stat label={t("plansPage.stats.sessions")} value={model.sessionsToDate} />
      <Stat label={t("plansPage.stats.volume")} value={model.minutesToDate} minutes />
    </dl>
  );
  const chips = <Chips chips={model.chips} />;

  // Pendant le renommage, le haut n'est plus un lien : un champ dans une
  // ancre enverrait chaque clic vers le plan.
  // Une fonction, pas un composant : défini dans le rendu, un composant
  // changerait d'identité à chaque rendu et remonterait le champ en cours.
  const open = (children: React.ReactNode) =>
    editing ? (
      <div className="zn-plancard__open">{children}</div>
    ) : (
      <Link className="zn-plancard__open" to={`/plan/${plan.id}`} aria-labelledby={nameId}>
        {children}
      </Link>
    );

  return (
    <article className="zn-plancard" data-layout={wide ? "wide" : "card"}>
      {wide ? (
        open(<>
          <div className="zn-plancard__lead">
            {chips}
            {title}
            {countdown}
            {stats}
          </div>
          <div className="zn-plancard__graph">
            <p className="zn-plancard__weekline">{weekLine}</p>
            <PlanTimeline model={model} variant="wide" />
          </div>
        </>)
      ) : (
        open(<>
          {chips}
          {title}
          <div className="zn-plancard__count">
            {countdown}
            <div className="zn-plancard__week">
              {started && (
                <span className="zn-plancard__weeknum">
                  {model.weekNow}
                  <span className="zn-plancard__of">/{model.weekTotal}</span>
                </span>
              )}
              <span className="zn-plancard__label">
                {started
                  ? [t("plansPage.weekLabel"), phaseLabel].filter(Boolean).join(" · ")
                  : weekLine}
              </span>
            </div>
          </div>
          <PlanTimeline model={model} variant="card" />
          {stats}
        </>)
      )}

      {menu}

      {model.next && (
        <Link
          className="zn-plancard__next"
          to={`/plan/${plan.id}?week=${model.next.weekNumber}`}
        >
          <span className="zn-plancard__next-text">
            <span className="zn-plancard__label">{t("plansPage.next")}</span>
            <span className="zn-plancard__next-what">
              {dayLabel(model.next.date)} · {nextName ?? t("plansPage.nextFallback")}
              {model.next.durationMin > 0 && (
                <span className="zn-plancard__of"> · {formatDurationMinutes(model.next.durationMin)}</span>
              )}
            </span>
          </span>
          <ArrowRight size={20} />
        </Link>
      )}
    </article>
  );
}

// ── pieces ───────────────────────────────────────────────────────────────

/** `6h10`, et `0` plutôt que `0s` quand rien n'a été fait. */
export function formatVolume(minutes: number): string {
  return minutes > 0 ? formatDurationMinutes(minutes) : "0";
}

/** `Ven. 21`, la forme courte d'un jour proche. */
export function dayLabel(iso: string): string {
  const raw = formatDate(iso, { weekday: "short", day: "numeric" });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function Countdown({ model }: { model: PlanCardModel }) {
  const { t } = useTranslation("plan");
  const c = model.countdown;
  if (!c) return null;
  const date = formatDate(c.date, { weekday: "short", day: "numeric", month: "short" });
  const big = c.days === 0 ? t(`plansPage.countdown.today_${c.kind}`) : t("plansPage.countdown.days", { count: c.days });
  return (
    <div className="zn-plancard__countdown">
      <span className="zn-plancard__cd" data-today={c.days === 0 || undefined}>
        {big}
      </span>
      <span className="zn-plancard__label">
        {t(`plansPage.countdown.${c.kind}`, { date })}
      </span>
    </div>
  );
}

function Stat({ label, value, minutes = false }: { label: string; value: Tally; minutes?: boolean }) {
  return (
    <div className="zn-plancard__stat">
      <dt className="zn-plancard__label">{label}</dt>
      <dd>
        {minutes ? formatVolume(value.done) : value.done}{" "}
        <span className="zn-plancard__of">/ {minutes ? formatVolume(value.planned) : value.planned}</span>
      </dd>
    </div>
  );
}

export function useChipLabel() {
  const { t } = useTranslation("plan");
  const pick = usePickLang();
  return (chip: PlanChip): string => {
    switch (chip.kind) {
      case "distance":
        return pick(RACE_DISTANCE_META[chip.distance], "label");
      case "practice":
        return pick(PRACTICE_META[chip.practice], "label");
      case "target":
        return t("plansPage.chips.target", { value: chip.value });
      case "mode":
        return chip.mode === "free" ? t("view.freePlan") : t("view.prebuilt");
    }
  };
}

function Chips({ chips }: { chips: PlanChip[] }) {
  const label = useChipLabel();
  if (chips.length === 0) return null;
  return (
    <ul className="zn-plancard__chips">
      {chips.map((chip) => (
        <li key={chip.kind} className="zn-planchip">
          {label(chip)}
        </li>
      ))}
    </ul>
  );
}

/**
 * Le nom, éditable en place : Entrée ou la sortie du champ enregistrent,
 * Échap annule. Un nom vide ou inchangé ne s'enregistre pas.
 */
export function PlanNameField({
  initial,
  className,
  onDone,
}: {
  initial: string;
  className?: string;
  onDone: (name: string | null) => void;
}) {
  const { t } = useTranslation("plan");
  const [value, setValue] = useState(initial);
  const [closed, setClosed] = useState(false);
  const finish = (next: string | null) => {
    if (closed) return;
    setClosed(true);
    onDone(next);
  };
  return (
    <input
      autoFocus
      className={className}
      aria-label={t("plansPage.renameLabel")}
      value={value}
      onFocus={(e) => e.currentTarget.select()}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => {
        const trimmed = value.trim();
        finish(trimmed && trimmed !== initial ? trimmed : null);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
        if (e.key === "Escape") {
          e.preventDefault();
          finish(null);
        }
      }}
    />
  );
}
