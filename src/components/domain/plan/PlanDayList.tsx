import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Activity,
  ArrowRight,
  Bike,
  Check,
  Dumbbell,
  Flag,
  Moon,
  MoreVertical,
  Mountain,
  Plus,
  Pool,
  Run,
  Stretching,
  X,
} from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import type { AnyWorkoutTemplate, WorkoutTemplate } from "@/types";
import { isStrengthWorkout } from "@/types";
import { purposeLabelKey, type ComplementaryActivity } from "@/types/activity";
import type { IntermediateGoal, PlanSession } from "@/types/plan";
import { activityKindOf } from "@/lib/activitySession";
import { sessionDiscipline } from "@/lib/planStats";
import type { PlanWeekModel, PlanWeekSession } from "@/lib/planWeekModel";
import type { DragSource, DragState } from "./usePlanDrag";
import { usePlanFormats } from "./planFormat";

export interface PlanDayListEditActions {
  onChange: (index: number) => void;
  onRedraw?: (index: number) => void;
  onMove: (index: number) => void;
  onDuplicate: (index: number) => void;
  onRemove: (index: number) => void;
  onAdd: (day: number) => void;
  canRedraw: (session: PlanSession) => boolean;
  drag: DragState | null;
  startDrag: (event: ReactPointerEvent<HTMLElement>, source: DragSource) => void;
}

interface PlanDayListProps {
  model: PlanWeekModel;
  mode: "read" | "edit";
  nameOf: (session: PlanSession) => string;
  workoutOf: (id: string) => AnyWorkoutTemplate | undefined;
  /** Le nom de la course visée, sur la carte du jour de course. */
  raceName?: string | null;
  intermediateRace?: IntermediateGoal;
  /** Les jours (0-6) marqués indisponibles dans cette semaine. */
  blockedDays?: ReadonlySet<number>;
  /** Lecture : la tuile de statut. */
  onStatus?: (index: number, anchor: HTMLElement) => void;
  /** Lecture : le reste de la carte. */
  onOpen?: (index: number) => void;
  onOpenActivity?: (activity: ComplementaryActivity) => void;
  edit?: PlanDayListEditActions;
  /** Ce qui suit la liste, dans la même colonne (ajouter une activité). */
  footer?: ReactNode;
}

const NBSP = " ";

function formatKm(km: number, locale: string): string {
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(km)}${NBSP}km`;
}

/** L'icône de la discipline : course, montagne pour les côtes et le trail, haltère pour le renfo. */
export function SessionIcon({
  session,
  workout,
  size = 18,
}: {
  session?: PlanSession;
  workout?: AnyWorkoutTemplate;
  size?: number;
}) {
  if (session) {
    const kind = activityKindOf(session.workoutId);
    if (kind) {
      if (kind.kind === "strength") return <Dumbbell size={size} />;
      if (kind.kind === "cycling" || kind.kind === "commute") return <Bike size={size} />;
      if (kind.kind === "swimming") return <Pool size={size} />;
      if (kind.kind === "yoga") return <Stretching size={size} />;
      if (kind.kind === "rest") return <Moon size={size} />;
      return <Activity size={size} />;
    }
    if (session.sessionType === "strength") return <Dumbbell size={size} />;
    const discipline = sessionDiscipline(session);
    if (discipline === "cycling") return <Bike size={size} />;
    if (discipline === "swimming") return <Pool size={size} />;
  }
  if (workout) {
    if (isStrengthWorkout(workout)) return <Dumbbell size={size} />;
    const w = workout as WorkoutTemplate;
    if (w.discipline === "cycling") return <Bike size={size} />;
    if (w.discipline === "swimming") return <Pool size={size} />;
    if (w.category === "hills" || w.category === "trail") return <Mountain size={size} />;
  }
  return <Run size={size} />;
}

function StatusGlyph({ status }: { status: PlanWeekSession["status"] }) {
  if (status === "done") return <Check size={16} />;
  if (status === "skipped") return <X size={16} />;
  return <ArrowRight size={16} />;
}

/**
 * Les jours d'une semaine de plan, du lundi au dimanche, l'un sous l'autre :
 * la date à gauche, les séances en cartes à droite.
 *
 * En lecture, la tuile de statut d'une carte ouvre la clôture de la séance
 * (faite, sautée, modifiée) et le reste de la carte ouvre la séance. En mode
 * Modifier, chaque carte prend une poignée pour la glisser vers un autre jour
 * et un menu pour la changer, la tirer à nouveau, la déplacer, la dupliquer
 * ou la retirer ; chaque jour, un bouton pour en ajouter une.
 */
export function PlanDayList({
  model,
  mode,
  nameOf,
  workoutOf,
  raceName,
  intermediateRace,
  blockedDays,
  onStatus,
  onOpen,
  onOpenActivity,
  edit,
  footer,
}: PlanDayListProps) {
  const { t } = useTranslation(["plan", "activity"]);
  const f = usePlanFormats();
  const editing = mode === "edit";
  const drag = edit?.drag ?? null;

  const facts = (minutes: number, km: number | null) => (
    <span className="zn-plansess__facts">
      {minutes > 0 && <span>{formatDurationMinutes(minutes)}</span>}
      {km != null && km > 0 && <span>{formatKm(km, f.locale)}</span>}
    </span>
  );

  const card = (slot: PlanWeekSession, day: number): ReactNode => {
    const { session, index } = slot;
    const name = nameOf(session);

    if (slot.kind === "race" || slot.kind === "intermediate") {
      const intermediate = slot.kind === "intermediate";
      const sub = intermediate ? intermediateRace?.raceName : raceName;
      return (
        <div key={index} className="zn-plansess" data-kind={slot.kind}>
          {intermediate && <span className="zn-plansess__tag">{t("page.race.intermediate")}</span>}
          <div className="zn-plansess__race">
            <Flag size={20} />
            <span className="zn-plansess__racename">
              <span>{intermediate ? t("page.race.intermediate") : t("page.race.title")}</span>
              {sub && <span className="zn-plansess__racesub">{sub}</span>}
            </span>
          </div>
        </div>
      );
    }

    const isActivity = slot.kind === "activity";
    const statusKey = session.status === "modified" ? "modified" : slot.status;
    const dragging = drag?.source.week === model.weekNumber && drag.source.index === index;
    const notes = !editing && session.notes
      ? (f.locale === "en-GB" ? session.notesEn ?? session.notes : session.notes)
          .split("\n")
          .filter(Boolean)[0]
          // Une fourchette d'allure ne se coupe pas en son milieu.
          ?.replace(/ - /g, "\u00a0-\u00a0")
      : null;

    return (
      <div
        key={index}
        className="zn-plansess"
        data-status={slot.status}
        data-dragging={dragging || undefined}
        style={dragging ? ({ "--zn-dx": `${drag!.dx}px`, "--zn-dy": `${drag!.dy}px` } as CSSProperties) : undefined}
      >
        {slot.tag && <span className="zn-plansess__tag">{t(`page.tag.${slot.tag}`)}</span>}
        <div className="zn-plansess__card" data-edit={editing || undefined}>
          {editing ? (
            <button
              type="button"
              className="zn-plansess__grip"
              aria-label={t("page.edit.grip", { name })}
              onPointerDown={(e) => edit?.startDrag(e, { week: model.weekNumber, index, day })}
              // Le clavier (Entrée, Espace) ouvre le choix du jour ; un clic de
              // souris, qui suit un glisser, ne le rouvre pas.
              onClick={(e) => {
                if (e.detail === 0) edit?.onMove(index);
              }}
            >
              <svg viewBox="0 0 10 16" width="10" height="16" aria-hidden="true">
                <circle cx="2" cy="2" r="1.5" />
                <circle cx="8" cy="2" r="1.5" />
                <circle cx="2" cy="8" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="2" cy="14" r="1.5" />
                <circle cx="8" cy="14" r="1.5" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              className="zn-plansess__state"
              data-status={slot.status}
              aria-haspopup="dialog"
              aria-label={t(`page.status.${statusKey}`, { name })}
              onClick={(e) => onStatus?.(index, e.currentTarget)}
            >
              <StatusGlyph status={slot.status} />
            </button>
          )}
          <button
            type="button"
            className="zn-plansess__open"
            onClick={() => onOpen?.(index)}
            disabled={editing && isActivity}
            tabIndex={editing ? -1 : undefined}
            aria-label={editing ? undefined : t("page.open", { name })}
          >
            <span className="zn-plansess__icon" aria-hidden="true">
              <SessionIcon session={session} workout={workoutOf(session.workoutId)} />
            </span>
            <span className="zn-plansess__text">
              <span className="zn-plansess__name">{name}</span>
              {facts(slot.durationMin, slot.distanceKm)}
              {notes && <span className="zn-plansess__note">{notes}</span>}
            </span>
          </button>
          {editing && edit && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button type="button" className="zn-iconbtn zn-iconbtn--flat" aria-label={t("page.edit.actions", { name })}>
                  <MoreVertical size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" collisionPadding={16} className="zn-more__list">
                {!isActivity && (
                  <DropdownMenuItem onSelect={() => edit.onChange(index)}>{t("page.edit.change")}</DropdownMenuItem>
                )}
                {!isActivity && edit.onRedraw && edit.canRedraw(session) && (
                  <DropdownMenuItem onSelect={() => edit.onRedraw?.(index)}>{t("page.edit.redraw")}</DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={() => edit.onMove(index)}>{t("page.edit.move")}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => edit.onDuplicate(index)}>{t("page.edit.duplicate")}</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" className="zn-more__danger" onSelect={() => edit.onRemove(index)}>
                  {t("page.edit.remove")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  };

  const offPlanCard = (activity: ComplementaryActivity) => {
    const name = `${t(`activity:discipline.${activity.discipline}`)} · ${t(
      `activity:purpose.${purposeLabelKey(activity.discipline, activity.purpose)}`,
    )}`;
    const body = (
      <>
        <span className="zn-plansess__icon" aria-hidden="true">
          {activity.discipline === "cycling" ? <Bike size={18} /> : activity.discipline === "swimming" ? <Pool size={18} /> : <Run size={18} />}
        </span>
        <span className="zn-plansess__text">
          <span className="zn-plansess__name">{name}</span>
          {facts(activity.durationMin, activity.distanceKm ?? null)}
        </span>
      </>
    );
    return (
      <div key={activity.id} className="zn-plansess" data-status="done" data-kind="offplan">
        <span className="zn-plansess__tag">{t("page.tag.offPlan")}</span>
        <div className="zn-plansess__card">
          <span className="zn-plansess__state" data-status="done" role="img" aria-label={t("page.status.offPlan", { name })}>
            <Check size={16} />
          </span>
          {onOpenActivity && !editing ? (
            <button type="button" className="zn-plansess__open" onClick={() => onOpenActivity(activity)}>
              {body}
            </button>
          ) : (
            <span className="zn-plansess__open" data-static="true">
              {body}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <ol className="zn-plandays" data-mode={mode}>
        {model.days.map((day) => {
          const over = drag?.over?.week === model.weekNumber && drag.over.day === day.dayOfWeek;
          const blocked = blockedDays?.has(day.dayOfWeek) ?? false;
          const many = !editing && day.sessions.length + day.offPlan.length > 1;
          return (
            <li
              key={day.dayOfWeek}
              className="zn-planday"
              data-today={day.isToday || undefined}
              data-rest={day.rest || undefined}
              data-over={over || undefined}
              data-week={model.weekNumber}
              data-day={day.dayOfWeek}
              data-drop-week={editing ? model.weekNumber : undefined}
              data-drop-day={editing ? day.dayOfWeek : undefined}
            >
              <div className="zn-planday__date">
                <span className="zn-planday__box">
                  <span className="zn-planday__dow">{f.dayShort(day.date)}</span>
                  <span className="zn-planday__num">{f.dayNumber(day.date)}</span>
                  <span className="zn-planday__mon">{f.monthShort(day.date)}</span>
                </span>
                {many && <span className="zn-planday__rail" aria-hidden="true" />}
              </div>
              <div className="zn-planday__stack">
                {blocked && <span className="zn-plansess__tag" data-blocked="true">{t("page.tag.blocked")}</span>}
                {/* En mode Modifier, les activités hors plan s'effacent : elles ne
                    sont pas des séances du plan, rien ne s'y déplace ni ne s'y
                    change. Un jour qui n'a qu'elles s'y lit donc en repos. */}
                {(editing ? day.sessions.length === 0 : day.rest) && (
                  <p className="zn-planday__rest">
                    <Moon size={20} />
                    {t("page.day.rest")}
                  </p>
                )}
                {day.sessions.map((slot) => card(slot, day.dayOfWeek))}
                {!editing && day.offPlan.map(offPlanCard)}
                {editing && edit && (
                  <button type="button" className="zn-planday__add" onClick={() => edit.onAdd(day.dayOfWeek)}>
                    <Plus size={16} />
                    {t("page.edit.addSession")}
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {footer}
    </>
  );
}
