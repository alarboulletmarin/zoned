import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Copy,
  Dices,
  Eye,
  Lock,
  LockOpen,
  Star,
  Trash2,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Segmented, type SegmentedOption } from "@/components/ui/segmented";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  ACTIVITY_INTENSITIES,
  activityKindOf,
  activitySessionZone,
  applyActivityDraft,
} from "@/lib/activitySession";
import {
  durationDigits,
  durationToMinutes,
  formatDurationDigits,
  minutesToDurationDigits,
  normalizeDurationDigits,
} from "@/lib/durationFields";
import { usePickLocale } from "@/lib/i18n-utils";
import { SESSION_TYPE_LABELS } from "@/lib/labels";
import { sessionColor } from "@/lib/sessionColors";
import {
  canBeLoose,
  catalogRange,
  fixedSession,
  looseKmEstimate,
  looseSession,
  rangeMidpoint,
  sessionPrecision,
} from "@/lib/sessionPrecision";
import { sessionDiscipline } from "@/lib/planStats";
import type { AnyWorkoutTemplate } from "@/types";
import { getDominantZone, isStrengthWorkout } from "@/types";
import type { CrossTrainingIntensity, PlanSession, SessionPrecision } from "@/types/plan";

export interface WeekSessionSheetTarget {
  sessionIndex: number;
  session: PlanSession;
  /** Le gabarit du catalogue, `null` pour une activité ou une séance inconnue. */
  workout: AnyWorkoutTemplate | null;
  name: string;
}

interface WeekSessionSheetProps {
  target: WeekSessionSheetTarget | null;
  /** La durée du profil pour un vélotaf, pour la dire sous le champ. */
  commuteProfileMin: number | null;
  onClose: () => void;
  onSave: (sessionIndex: number, next: PlanSession) => void;
  onView: (workoutId: string) => void;
  onRedraw?: (sessionIndex: number) => void;
  onToggleLock: (sessionIndex: number) => void;
  onMove: (sessionIndex: number, day: number) => void;
  /** Copies the session onto its day; the copy is then dragged where it goes. */
  onDuplicate?: (sessionIndex: number) => void;
  onDelete: (sessionIndex: number) => void;
}

const DAYS = [0, 1, 2, 3, 4, 5, 6] as const;

/**
 * La feuille d'une séance de la semaine : ce qui s'ouvre d'un appui sur sa
 * carte. Elle remplace, au pouce, le menu contextuel posé à la position du
 * doigt, qui est un geste de souris : une feuille en bas se lit et se vise.
 *
 * Elle porte la seule décision qu'une séance de semaine demande, COMMENT ELLE
 * COMPTE (`lib/sessionPrecision.ts`) : souple, elle garde sa fourchette et la
 * semaine la compte au milieu ; fixée, la durée et les kilomètres posés sont
 * ceux qui comptent. Une activité y règle sa durée et son effort, comme
 * avant. Et sous la décision, les gestes du menu : voir, re-tirer,
 * verrouiller, déplacer, retirer.
 */
export function WeekSessionSheet({
  target,
  commuteProfileMin,
  onClose,
  onSave,
  onView,
  onRedraw,
  onToggleLock,
  onMove,
  onDuplicate,
  onDelete,
}: WeekSessionSheetProps) {
  const { t } = useTranslation(["library", "plan"]);
  const pickLocale = usePickLocale();
  // Sous 900px, la feuille vient du bas, où le pouce la cherche ; au-dessus,
  // elle vient du bord, à côté du tableau qu'elle règle.
  const fromBottom = useMediaQuery("(max-width: 900px)");

  const [precision, setPrecision] = useState<SessionPrecision>("fixed");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [intensity, setIntensity] = useState<CrossTrainingIntensity>("easy");
  const [moving, setMoving] = useState(false);

  const session = target?.session ?? null;
  const workout = target?.workout ?? null;
  const activity = session ? activityKindOf(session.workoutId) : null;
  const loosable = !!workout && !activity && canBeLoose(workout);
  const range = workout ? catalogRange(workout) : null;
  const discipline = session ? sessionDiscipline(session) : "running";
  // Les kilomètres se posent à pied et à vélo ; en natation on compte en
  // mètres partout ailleurs, et un champ en km y ferait saisir un facteur mille.
  const asksDistance = !activity && (discipline === "running" || discipline === "cycling");

  // The sheet opens on touchend, and the browser then replays the same tap as
  // mousedown/click on whatever is now under the finger: the scene, which
  // dismisses the sheet before it is seen. The first half-second of
  // mousedown is that echo, never a dismissal.
  const openedAt = useRef(0);
  // Where the sheet opens: on its body, not on the duration field. Left to
  // the browser, showModal() would focus that field, and a phone answers a
  // focused field with its keyboard and a zoom, so the sheet opened on a
  // question nobody asked. The duration is one tap away, like the rest.
  const bodyRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!session) return;
    openedAt.current = Date.now();
    setPrecision(sessionPrecision(session));
    setDuration(minutesToDurationDigits(session.estimatedDurationMin));
    setDistance(
      session.targetDistanceKm && session.targetDistanceKm > 0
        ? String(session.targetDistanceKm).replace(".", ",")
        : "",
    );
    setIntensity(session.intensity ?? "easy");
    setMoving(false);
  }, [session]);

  const precisionOptions = useMemo<SegmentedOption<SessionPrecision>[]>(
    () => [
      { value: "loose", label: t("library:weekly.sheet.loose") },
      { value: "fixed", label: t("library:weekly.sheet.fixed") },
    ],
    [t],
  );
  const intensityOptions = useMemo<SegmentedOption<CrossTrainingIntensity>[]>(
    () =>
      ACTIVITY_INTENSITIES.map((id) => ({
        value: id,
        label: t(`plan:activitySession.intensity${id.charAt(0).toUpperCase()}${id.slice(1)}`),
      })),
    [t],
  );

  if (!target || !session) {
    return <Sheet open={false} />;
  }

  const minutes = durationToMinutes(duration);
  const distanceKm = Number.parseFloat(distance.replace(",", "."));
  const zone = activity
    ? activitySessionZone(session)
    : workout && !isStrengthWorkout(workout)
      ? getDominantZone(workout)
      : null;
  const typeLabel = SESSION_TYPE_LABELS[session.sessionType];
  const looseMinutes = range ? rangeMidpoint(range) : session.estimatedDurationMin;
  const looseKm = looseKmEstimate({ ...session, estimatedDurationMin: looseMinutes });
  const asksDuration = activity ? activity.timed : precision === "fixed" || !loosable;
  const canSave = !asksDuration || (minutes !== undefined && minutes > 0);

  const tidyDuration = () => {
    const tidy = normalizeDurationDigits(duration);
    if (tidy !== duration) setDuration(tidy);
  };

  const save = () => {
    if (!canSave) return;
    let next: PlanSession;
    if (activity) {
      next = applyActivityDraft(session, { durationMin: minutes ?? 0, intensity });
    } else if (loosable && precision === "loose") {
      next = looseSession(session, workout!);
    } else if (loosable) {
      next = fixedSession(session, minutes ?? 0, asksDistance ? distanceKm : undefined);
    } else {
      next = { ...session, estimatedDurationMin: minutes ?? session.estimatedDurationMin };
    }
    onSave(target.sessionIndex, next);
  };

  const action = (index: number, fn: (i: number) => void) => () => {
    fn(index);
    onClose();
  };

  return (
    <Sheet open onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={fromBottom ? "bottom" : "right"}
        className="zn-wksheet"
        initialFocus={bodyRef}
        onMouseDown={(e) => {
          if (Date.now() - openedAt.current < 500) e.preventDefault();
        }}
      >
        <SheetHeader>
          <span className="zn-kicker zn-kicker--xs">
            {t(`library:weekly.days.${session.dayOfWeek}`)}
          </span>
          <span className="zn-wksheet__type">
            <span
              className="zn-sess__dot"
              aria-hidden="true"
              style={{ "--zn-dot": sessionColor(session.sessionType) } as CSSProperties}
            />
            <span className="zn-mono">
              {zone !== null && `Z${zone} · `}
              {typeLabel ? pickLocale(typeLabel) : session.sessionType}
            </span>
            {session.isKeySession && (
              <span className="zn-sess__key" title={t("library:weekly.keySession")}>
                <Star filled />
              </span>
            )}
          </span>
          <SheetTitle>{target.name}</SheetTitle>
          <SheetDescription className="sr-only">{t("library:weekly.slot.adjust")}</SheetDescription>
        </SheetHeader>

        {/* tabIndex -1 : la cible du focus d'ouverture (voir bodyRef), sans
            arrêt de tabulation supplémentaire ; l'anneau est éteint dans
            base.css, comme celui du menu mobile. */}
        <form
          ref={bodyRef}
          tabIndex={-1}
          className="zn-wksheet__body"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          {/* ── Comment elle compte ── */}
          {loosable && (
            <div className="zn-wksheet__how">
              <Segmented
                value={precision}
                onChange={setPrecision}
                options={precisionOptions}
                label={t("library:weekly.sheet.how")}
              />
              {precision === "loose" ? (
                <div className="zn-wksheet__card">
                  <span className="zn-wksheet__card-title">
                    {t("library:weekly.sheet.looseTitle", { min: range!.min, max: range!.max })}
                  </span>
                  <span className="zn-caption zn-wksheet__hint">
                    {looseKm !== null
                      ? t("library:weekly.sheet.looseCountsKm", {
                          minutes: looseMinutes,
                          km: String(looseKm).replace(".", ","),
                        })
                      : t("library:weekly.sheet.looseCounts", { minutes: looseMinutes })}
                  </span>
                </div>
              ) : null}
              <span className="zn-caption zn-wksheet__hint">
                {t(precision === "loose" ? "library:weekly.sheet.looseHint" : "library:weekly.sheet.fixedHint")}
              </span>
            </div>
          )}

          {/* ── La durée (et les km) ── */}
          {asksDuration && (
            <div className="zn-wksheet__fields">
              <label className="zn-wksheet__field">
                <span className="zn-kicker zn-kicker--inline zn-plabel">
                  {t("library:weekly.sheet.duration")}
                </span>
                {/* type text, pas number : le masque h:mm porte un deux-points.
                    inputMode numeric donne le pavé de chiffres, voir
                    lib/durationFields.ts. */}
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  placeholder="h:mm"
                  value={formatDurationDigits(duration)}
                  onChange={(e) => setDuration(durationDigits(e.target.value))}
                  onBlur={tidyDuration}
                  className="zn-pfield zn-wksheet__durfield"
                />
                {activity?.kind === "commute" && (
                  <span className="zn-caption zn-wksheet__hint">
                    {commuteProfileMin !== null
                      ? t("plan:activitySession.commuteHint", { minutes: commuteProfileMin })
                      : t("plan:activitySession.commuteNoProfile")}
                  </span>
                )}
              </label>
              {asksDistance && loosable && precision === "fixed" && (
                <label className="zn-wksheet__field">
                  <span className="zn-kicker zn-kicker--inline zn-plabel">
                    {t("library:weekly.sheet.distance")}
                    <span className="zn-faint"> · {t("library:weekly.sheet.distanceOptional")}</span>
                  </span>
                  <span className="zn-wksheet__unitfield">
                    <input
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      placeholder="0,0"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value.replace(/[^\d.,]/g, ""))}
                      className="zn-pfield zn-wksheet__kmfield"
                    />
                    <span className="zn-mono">{t("library:weekly.sheet.distanceUnit")}</span>
                  </span>
                </label>
              )}
            </div>
          )}

          {/* ── L'effort d'une activité ── */}
          {activity?.aerobic && (
            <div className="zn-wksheet__field">
              <Segmented
                value={intensity}
                onChange={setIntensity}
                options={intensityOptions}
                label={t("plan:activitySession.intensity")}
              />
              <span className="zn-caption zn-wksheet__hint">
                {t("plan:activitySession.intensityHint")}
              </span>
            </div>
          )}

          {/* ── Les gestes du menu ── */}
          <div className="zn-wksheet__actions">
            {workout && !activity && (
              <button type="button" className="zn-wksheet__action" onClick={action(target.sessionIndex, () => onView(session.workoutId))}>
                <Eye />
                {t("library:weekly.sheet.view")}
              </button>
            )}
            {onRedraw && !activity && !session.locked && (
              <button type="button" className="zn-wksheet__action" onClick={action(target.sessionIndex, onRedraw)}>
                <Dices />
                {t("library:weekly.slot.reroll")}
              </button>
            )}
            <button type="button" className="zn-wksheet__action" onClick={action(target.sessionIndex, onToggleLock)}>
              {session.locked ? <LockOpen /> : <Lock />}
              {t(session.locked ? "library:weekly.slot.unlock" : "library:weekly.slot.lock")}
            </button>
            <button
              type="button"
              className="zn-wksheet__action"
              aria-expanded={moving}
              onClick={() => setMoving((v) => !v)}
            >
              <ArrowRight />
              {t("library:weekly.sheet.move")}
            </button>
            {moving && (
              <div className="zn-wksheet__days" role="group" aria-label={t("library:weekly.sheet.moveTo")}>
                {DAYS.map((day) => (
                  <button
                    key={day}
                    type="button"
                    className="zn-wksheet__day"
                    disabled={day === session.dayOfWeek}
                    aria-current={day === session.dayOfWeek ? "true" : undefined}
                    onClick={action(target.sessionIndex, (i) => onMove(i, day))}
                  >
                    {t(`library:weekly.daysShort.${day}`)}
                  </button>
                ))}
              </div>
            )}
            {onDuplicate && (
              <button type="button" className="zn-wksheet__action" onClick={action(target.sessionIndex, onDuplicate)}>
                <Copy />
                {t("library:weekly.slot.duplicate")}
              </button>
            )}
            <button
              type="button"
              className="zn-wksheet__action"
              data-variant="destructive"
              onClick={action(target.sessionIndex, onDelete)}
            >
              <Trash2 />
              {t("library:weekly.sheet.remove")}
            </button>
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {t("library:weekly.sheet.cancel")}
            </Button>
            <Button type="submit" disabled={!canSave}>
              {t("library:weekly.sheet.save")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
