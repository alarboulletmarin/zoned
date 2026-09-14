import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";

import { Activity as ActivityIcon, Bike, Pool, Run } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Segmented } from "@/components/ui/segmented";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { rpeColor } from "@/lib/sessionColors";
import {
  ACTIVITY_DISCIPLINE_META,
  ACTIVITY_DISCIPLINES,
  ACTIVITY_LIMITS,
  ACTIVITY_PURPOSES,
  defaultRpe,
  type ActivityDiscipline,
  type ActivityDraft,
  type ActivityPurpose,
  type ComplementaryActivity,
} from "@/types/activity";

/**
 * Saisir une activité complémentaire.
 *
 * **C'est un relevé, pas une séance.** La différence tient dans ce que le
 * formulaire demande : une séance du catalogue a une structure, des zones et
 * une allure cible, et on la CHOISIT ; ici on a déjà pédalé, on tape ce qu'on
 * a fait. D'où un formulaire qui n'a ni recherche, ni catalogue, ni aperçu :
 * une date, une discipline, un motif, une durée, et trois précisions.
 *
 * ── Ce que le formulaire refuse de demander ──────────────────────────────
 *
 * Une seule chose est obligatoire, la DURÉE. Tout le reste peut rester vide,
 * y compris la distance. Rendre la distance obligatoire aurait paru anodin et
 * aurait fermé la porte au cas le plus fréquent, le trajet quotidien dont on
 * connaît le temps par cœur et jamais le kilométrage exact. Un relevé
 * approximatif enregistré vaut infiniment mieux qu'un relevé exact jamais
 * saisi.
 *
 * Les champs qui n'ont pas de sens ne s'affichent pas : pas de dénivelé en
 * natation, pas de watts ailleurs qu'à vélo. `ACTIVITY_DISCIPLINE_META` en est
 * la seule source, pour que les trois écrans qui montrent ces champs ne
 * divergent pas.
 *
 * La natation se saisit en MÈTRES, et se stocke en kilomètres comme le reste.
 * La conversion est ici, à la frontière, et nulle part ailleurs.
 *
 * ── Le RPE ───────────────────────────────────────────────────────────────
 *
 * Il est optionnel à l'écran mais jamais absent du calcul : sans lui, le motif
 * en donne un (`defaultRpe`), parce que la charge est une durée fois un
 * effort et qu'une charge nulle sur un volume non nul est un chiffre qui ment.
 * Le curseur part donc SUR ce défaut, et le toucher est une correction, pas
 * une saisie de plus.
 */

interface ActivityLogPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** La date pré-remplie, "YYYY-MM-DD". Le jour choisi de l'écran appelant. */
  defaultDate: string;
  /** L'activité à modifier. Absente, le panneau en crée une. */
  activity?: ComplementaryActivity | null;
  /** Pré-réglages venus du motif récurrent du profil, quand il existe. */
  suggestion?: { discipline: ActivityDiscipline; durationMin: number } | null;
  onSave: (draft: ActivityDraft) => void;
  onDelete?: (id: string) => void;
}

const DISCIPLINE_ICONS = {
  cycling: Bike,
  running: Run,
  swimming: Pool,
  other: ActivityIcon,
} as const;

/** Un nombre saisi, ou `undefined`. La virgule décimale française est admise. */
function parseOptional(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (trimmed === "") return undefined;
  const value = Number.parseFloat(trimmed.replace(",", "."));
  return Number.isFinite(value) && value >= 0 ? value : undefined;
}

export function ActivityLogPanel({
  open,
  onOpenChange,
  defaultDate,
  activity,
  suggestion,
  onSave,
  onDelete,
}: ActivityLogPanelProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [date, setDate] = useState(defaultDate);
  const [discipline, setDiscipline] = useState<ActivityDiscipline>("cycling");
  const [purpose, setPurpose] = useState<ActivityPurpose>("commute");
  const [durationMin, setDurationMin] = useState("");
  const [distance, setDistance] = useState("");
  const [elevation, setElevation] = useState("");
  const [watts, setWatts] = useState("");
  const [rpe, setRpe] = useState(defaultRpe("commute"));
  const [rpeTouched, setRpeTouched] = useState(false);
  const [note, setNote] = useState("");

  /* Le formulaire se recharge à CHAQUE ouverture, et non au montage : le
     panneau reste monté entre deux saisies, donc sans ça la deuxième
     activité du jour rouvrirait avec les chiffres de la première. */
  useEffect(() => {
    if (!open) return;
    if (activity) {
      const meta = ACTIVITY_DISCIPLINE_META[activity.discipline];
      setDate(activity.date);
      setDiscipline(activity.discipline);
      setPurpose(activity.purpose);
      setDurationMin(String(activity.durationMin));
      setDistance(
        activity.distanceKm === undefined
          ? ""
          : meta.distance === "meters"
            ? String(Math.round(activity.distanceKm * 1000))
            : String(activity.distanceKm),
      );
      setElevation(activity.elevationGainM === undefined ? "" : String(activity.elevationGainM));
      setWatts(activity.avgWatts === undefined ? "" : String(activity.avgWatts));
      setRpe(activity.rpe ?? defaultRpe(activity.purpose));
      setRpeTouched(activity.rpe !== undefined);
      setNote(activity.note ?? "");
      return;
    }
    setDate(defaultDate);
    setDiscipline(suggestion?.discipline ?? "cycling");
    setPurpose("commute");
    setDurationMin(suggestion ? String(suggestion.durationMin) : "");
    setDistance("");
    setElevation("");
    setWatts("");
    setRpe(defaultRpe("commute"));
    setRpeTouched(false);
    setNote("");
  }, [open, activity, defaultDate, suggestion]);

  /* Tant que personne n'a touché le curseur, il suit le motif : passer de
     vélotaf à entraînement doit remonter l'effort par défaut, sinon une
     séance hors plan pèserait comme un trajet. Dès qu'on l'a touché, il ne
     bouge plus tout seul, c'est une valeur saisie. */
  const changePurpose = (next: ActivityPurpose) => {
    setPurpose(next);
    if (!rpeTouched) setRpe(defaultRpe(next));
  };

  const meta = ACTIVITY_DISCIPLINE_META[discipline];
  const parsedDuration = parseOptional(durationMin);
  const canSave = parsedDuration !== undefined && parsedDuration >= ACTIVITY_LIMITS.durationMin.min;

  const handleSubmit = () => {
    if (parsedDuration === undefined) return;
    const rawDistance = meta.distance === "none" ? undefined : parseOptional(distance);
    onSave({
      date,
      discipline,
      purpose,
      durationMin: parsedDuration,
      distanceKm:
        rawDistance === undefined
          ? undefined
          : meta.distance === "meters"
            ? rawDistance / 1000
            : rawDistance,
      elevationGainM: meta.elevation ? parseOptional(elevation) : undefined,
      avgWatts: meta.watts ? parseOptional(watts) : undefined,
      rpe,
      note: note.trim() || undefined,
    });
  };

  const body = (
    <ActivityForm
      isEdit={activity != null}
      date={date}
      setDate={setDate}
      discipline={discipline}
      setDiscipline={setDiscipline}
      purpose={purpose}
      setPurpose={changePurpose}
      durationMin={durationMin}
      setDurationMin={setDurationMin}
      distance={distance}
      setDistance={setDistance}
      elevation={elevation}
      setElevation={setElevation}
      watts={watts}
      setWatts={setWatts}
      rpe={rpe}
      setRpe={(value) => {
        setRpe(value);
        setRpeTouched(true);
      }}
      note={note}
      setNote={setNote}
      canSave={canSave}
      onCancel={() => onOpenChange(false)}
      onSubmit={handleSubmit}
      onDelete={activity && onDelete ? () => onDelete(activity.id) : undefined}
    />
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom">{body}</SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="zn-actlog-dialog">{body}</DialogContent>
    </Dialog>
  );
}

// ── Le corps du formulaire ─────────────────────────────────────────

interface ActivityFormProps {
  isEdit: boolean;
  date: string;
  setDate: (v: string) => void;
  discipline: ActivityDiscipline;
  setDiscipline: (v: ActivityDiscipline) => void;
  purpose: ActivityPurpose;
  setPurpose: (v: ActivityPurpose) => void;
  durationMin: string;
  setDurationMin: (v: string) => void;
  distance: string;
  setDistance: (v: string) => void;
  elevation: string;
  setElevation: (v: string) => void;
  watts: string;
  setWatts: (v: string) => void;
  rpe: number;
  setRpe: (v: number) => void;
  note: string;
  setNote: (v: string) => void;
  canSave: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
}

function ActivityForm({
  isEdit,
  date,
  setDate,
  discipline,
  setDiscipline,
  purpose,
  setPurpose,
  durationMin,
  setDurationMin,
  distance,
  setDistance,
  elevation,
  setElevation,
  watts,
  setWatts,
  rpe,
  setRpe,
  note,
  setNote,
  canSave,
  onCancel,
  onSubmit,
  onDelete,
}: ActivityFormProps) {
  const { t } = useTranslation(["activity", "plan", "common"]);
  const meta = ACTIVITY_DISCIPLINE_META[discipline];

  const disciplineOptions = useMemo(
    () =>
      ACTIVITY_DISCIPLINES.map((id) => {
        const Icon = DISCIPLINE_ICONS[id];
        return {
          value: id,
          label: t(`activity:discipline.${id}`),
          icon: <Icon size={16} />,
        };
      }),
    [t],
  );

  const purposeOptions = useMemo(
    () =>
      ACTIVITY_PURPOSES.map((id) => ({
        value: id,
        label: t(`activity:purpose.${id}`),
        title: t(`activity:purposeHint.${id}`),
      })),
    [t],
  );

  return (
    <div className="zn-actlog">
      <div className="zn-actlog__head">
        <p className="zn-actlog__title">
          {t(isEdit ? "activity:form.editTitle" : "activity:form.title")}
        </p>
        <p className="zn-actlog__sub">{t("activity:form.sub")}</p>
      </div>

      <div className="zn-actlog__body">
        <label className="zn-actlog__field">
          <span className="zn-kicker zn-kicker--inline zn-plabel">
            {t("activity:form.date")}
          </span>
          <DateInput value={date} onChange={(e) => setDate(e.target.value)} />
        </label>

        <Segmented
          value={discipline}
          onChange={setDiscipline}
          options={disciplineOptions}
          label={t("activity:form.discipline")}
        />

        <Segmented
          value={purpose}
          onChange={setPurpose}
          options={purposeOptions}
          label={t("activity:form.purpose")}
        />

        {/* La durée d'abord, et seule sur sa ligne : c'est le seul champ
            obligatoire, et le seul dont dépendent le volume ET la charge. */}
        <label className="zn-actlog__field">
          <span className="zn-kicker zn-kicker--inline zn-plabel">
            {t("activity:form.duration")}
          </span>
          <input
            type="number"
            inputMode="numeric"
            min={ACTIVITY_LIMITS.durationMin.min}
            max={ACTIVITY_LIMITS.durationMin.max}
            step={1}
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            className="zn-pfield"
            required
          />
        </label>

        {/* Les précisions. Elles sont groupées et nommées facultatives une
            fois pour toutes, plutôt que de mettre optionnel sur chaque
            étiquette, ce qui aurait fait lire quatre fois le même mot. */}
        {(meta.distance !== "none" || meta.elevation || meta.watts) && (
          <div className="zn-actlog__optional">
            <span className="zn-kicker zn-kicker--xs">{t("activity:form.optional")}</span>
            <div className="zn-actlog__row">
              {meta.distance !== "none" && (
                <label className="zn-actlog__field">
                  <span className="zn-kicker zn-kicker--inline zn-plabel">
                    {t(
                      meta.distance === "meters"
                        ? "activity:form.distanceMeters"
                        : "activity:form.distanceKm",
                    )}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min={0}
                    step={meta.distance === "meters" ? 50 : 0.1}
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="zn-pfield"
                  />
                </label>
              )}

              {meta.elevation && (
                <label className="zn-actlog__field">
                  <span className="zn-kicker zn-kicker--inline zn-plabel">
                    {t("activity:form.elevation")}
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={10}
                    value={elevation}
                    onChange={(e) => setElevation(e.target.value)}
                    className="zn-pfield"
                  />
                </label>
              )}

              {meta.watts && (
                <label className="zn-actlog__field">
                  <span className="zn-kicker zn-kicker--inline zn-plabel">
                    {t("activity:form.watts")}
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={5}
                    value={watts}
                    onChange={(e) => setWatts(e.target.value)}
                    className="zn-pfield"
                  />
                </label>
              )}
            </div>
          </div>
        )}

        {/* Le même curseur que la clôture d'une séance, à dessein : c'est la
            même question, et deux échelles d'effort différentes dans la même
            app rendraient les deux illisibles. */}
        <div className="zn-prpe">
          <div className="zn-prpe__head">
            <span className="zn-kicker zn-kicker--inline">{t("activity:form.rpe")}</span>
            <span className="zn-prpe__value">{rpe}/10</span>
          </div>
          <div
            className="zn-prpe__scale"
            role="slider"
            aria-valuemin={ACTIVITY_LIMITS.rpe.min}
            aria-valuemax={ACTIVITY_LIMITS.rpe.max}
            aria-valuenow={rpe}
            aria-label={t("activity:form.rpe")}
          >
            {Array.from({ length: 10 }, (_, i) => {
              const value = i + 1;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRpe(value)}
                  className="zn-prpe__step"
                  data-selected={rpe === value}
                >
                  <span className="zn-prpe__track">
                    <span
                      className="zn-prpe__fill"
                      style={
                        {
                          "--zn-rpe-h": `${value * 10}%`,
                          "--zn-rpe-fill": rpeColor(value),
                        } as CSSProperties
                      }
                    />
                  </span>
                  <span className="zn-prpe__num">{value}</span>
                </button>
              );
            })}
          </div>
        </div>

        <label className="zn-actlog__field">
          <span className="zn-kicker zn-kicker--inline zn-plabel">
            {t("activity:form.note")}
          </span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value.slice(0, ACTIVITY_LIMITS.noteMaxLength))}
            rows={2}
            placeholder={t("activity:form.notePlaceholder")}
            className="zn-pfield"
          />
        </label>
      </div>

      <div className="zn-actlog__foot">
        {onDelete && (
          <Button type="button" variant="ghost" onClick={onDelete} className="zn-actlog__delete">
            {t("activity:form.delete")}
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("common:actions.cancel")}
        </Button>
        <Button type="button" onClick={onSubmit} disabled={!canSave}>
          {t("activity:form.save")}
        </Button>
      </div>
    </div>
  );
}
