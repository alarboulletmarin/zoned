import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useTranslation } from "react-i18next";

import { Activity as ActivityIcon, Bike, ChevronDown, Pool, Run } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Segmented } from "@/components/ui/segmented";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { formatDurationMinutes } from "@/components/visualization";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { recallDurations, type ActivityRecall } from "@/lib/activityRecall";
import {
  durationDigits,
  durationToMinutes,
  formatDurationDigits,
  minutesToDurationDigits,
  normalizeDurationDigits,
} from "@/lib/durationFields";
import { rpeColor, rpeWordKey } from "@/lib/sessionColors";
import {
  ACTIVITY_DISCIPLINE_META,
  ACTIVITY_DISCIPLINES,
  ACTIVITY_LIMITS,
  ACTIVITY_PURPOSES,
  defaultRpe,
  type ActivityDiscipline,
  type ActivityDisciplineMeta,
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
 * ── Une seule question à la fois ─────────────────────────────────────────
 *
 * Une seule chose est obligatoire, la DURÉE, et l'écran le dit maintenant
 * autrement qu'en une phrase : les six champs étaient alignés au même poids
 * sous une ligne qui annonçait qu'un seul comptait, ce qui démentait la
 * phrase juste au-dessus. Les précisions sont donc REPLIÉES, et la personne
 * qui note son trajet du matin voit trois choix déjà faits et un champ à
 * remplir.
 *
 * Le repli s'ouvre tout seul dans les deux cas où le cacher mentirait : quand
 * on modifie une activité qui en porte déjà, et quand un rappel vient d'en
 * poser. Rien ne s'enregistre que l'écran ne montre.
 *
 * ── La durée, un champ au masque h:mm ────────────────────────────────────
 *
 * Le champ en minutes demandait une conversion mentale avant la première
 * frappe : on pense 1 h 25, on tapait 85. Le masque la supprime sans ajouter
 * de case : un seul champ, un clavier numérique, et les chiffres qui entrent
 * par la DROITE comme sur un chronomètre, 45 donne 0:45 et 125 donne 1:25. Le
 * parsing reste tolérant, 0:90 vaut 1 h 30 et se range à l'écran quand le
 * champ est quitté plutôt que d'être refusé (`lib/durationFields.ts`).
 *
 * ── Les rappels ──────────────────────────────────────────────────────────
 *
 * Le vélotaf se répète, et la réponse était déjà dans le journal. Une rangée
 * de trois durées déjà enregistrées, même sport et même motif, la repose d'un
 * appui (`lib/activityRecall.ts`). C'est de la reconnaissance au lieu du
 * rappel de mémoire, et ça ne pré-remplit rien : un relevé posé par la machine
 * sans être regardé serait un chiffre inventé qui compte dans la charge.
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
 * une saisie de plus. Il suit la durée et ne la précède pas : la valeur est
 * déjà bonne, elle n'a pas à retarder le seul champ vide de l'écran.
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
  /**
   * Le journal, trié du plus récent au plus ancien, d'où se tirent les
   * rappels. Absent, le formulaire n'en propose aucun et ne perd rien
   * d'autre : c'est exactement l'état du premier jour.
   */
  history?: readonly ComplementaryActivity[];
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

/** Une distance en kilomètres, écrite dans l'unité de SAISIE de la discipline. */
function distanceToField(
  distanceKm: number | undefined,
  meta: ActivityDisciplineMeta,
): string {
  if (distanceKm === undefined || meta.distance === "none") return "";
  return meta.distance === "meters"
    ? String(Math.round(distanceKm * 1000))
    : String(distanceKm);
}

/** Les précisions d'un état de formulaire, prises ensemble. */
interface DetailFields {
  distance: string;
  elevation: string;
  watts: string;
  note: string;
}

const EMPTY_DETAILS: DetailFields = { distance: "", elevation: "", watts: "", note: "" };

/** Le repli ne peut pas rester fermé sur quelque chose de saisi. */
function hasDetails(details: DetailFields): boolean {
  return (
    details.distance !== "" ||
    details.elevation !== "" ||
    details.watts !== "" ||
    details.note !== ""
  );
}

export function ActivityLogPanel({
  open,
  onOpenChange,
  defaultDate,
  activity,
  suggestion,
  history,
  onSave,
  onDelete,
}: ActivityLogPanelProps) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  const [date, setDate] = useState(defaultDate);
  const [discipline, setDiscipline] = useState<ActivityDiscipline>("cycling");
  const [purpose, setPurpose] = useState<ActivityPurpose>("commute");
  const [duration, setDuration] = useState("");
  const [details, setDetails] = useState<DetailFields>(EMPTY_DETAILS);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rpe, setRpe] = useState(defaultRpe("commute"));
  const [rpeTouched, setRpeTouched] = useState(false);

  /* Le formulaire se recharge à CHAQUE ouverture, et non au montage : le
     panneau reste monté entre deux saisies, donc sans ça la deuxième
     activité du jour rouvrirait avec les chiffres de la première. */
  useEffect(() => {
    if (!open) return;
    if (activity) {
      const meta = ACTIVITY_DISCIPLINE_META[activity.discipline];
      const loaded: DetailFields = {
        distance: distanceToField(activity.distanceKm, meta),
        elevation: activity.elevationGainM === undefined ? "" : String(activity.elevationGainM),
        watts: activity.avgWatts === undefined ? "" : String(activity.avgWatts),
        note: activity.note ?? "",
      };
      setDate(activity.date);
      setDiscipline(activity.discipline);
      setPurpose(activity.purpose);
      setDuration(minutesToDurationDigits(activity.durationMin));
      setDetails(loaded);
      /* Une précision déjà saisie ne se cache pas derrière un repli : on
         viendrait souvent la corriger, et elle serait invisible. */
      setDetailsOpen(hasDetails(loaded));
      setRpe(activity.rpe ?? defaultRpe(activity.purpose));
      setRpeTouched(activity.rpe !== undefined);
      return;
    }
    setDate(defaultDate);
    setDiscipline(suggestion?.discipline ?? "cycling");
    setPurpose("commute");
    setDuration(minutesToDurationDigits(suggestion?.durationMin ?? 0));
    setDetails(EMPTY_DETAILS);
    setDetailsOpen(false);
    setRpe(defaultRpe("commute"));
    setRpeTouched(false);
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

  /* Les rappels viennent du journal, donc seulement en création : modifier une
     activité, c'est corriger CELLE-CI, et proposer d'y reposer une autre durée
     inviterait à écraser ce qu'on venait relire. */
  const recalls = useMemo(
    () => (activity || !history ? [] : recallDurations(history, discipline, purpose)),
    [activity, history, discipline, purpose],
  );

  /* Un rappel pose la durée ET les précisions qui allaient avec, parce
     qu'elles décrivent le même trajet. Le repli s'ouvre donc s'il en pose :
     rien ne s'enregistre que l'écran ne montre. */
  const applyRecall = (recall: ActivityRecall) => {
    const filled: DetailFields = {
      ...details,
      distance: distanceToField(recall.distanceKm, meta),
      elevation:
        meta.elevation && recall.elevationGainM !== undefined
          ? String(recall.elevationGainM)
          : "",
      watts: meta.watts && recall.avgWatts !== undefined ? String(recall.avgWatts) : "",
    };
    setDuration(minutesToDurationDigits(recall.durationMin));
    setDetails(filled);
    if (hasDetails(filled)) setDetailsOpen(true);
    if (recall.rpe !== undefined) {
      setRpe(recall.rpe);
      setRpeTouched(true);
    }
  };

  const parsedDuration = durationToMinutes(duration);
  const canSave =
    parsedDuration !== undefined &&
    parsedDuration >= ACTIVITY_LIMITS.durationMin.min &&
    parsedDuration <= ACTIVITY_LIMITS.durationMin.max;

  const handleSubmit = () => {
    if (!canSave || parsedDuration === undefined) return;
    const rawDistance = meta.distance === "none" ? undefined : parseOptional(details.distance);
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
      elevationGainM: meta.elevation ? parseOptional(details.elevation) : undefined,
      avgWatts: meta.watts ? parseOptional(details.watts) : undefined,
      rpe,
      note: details.note.trim() || undefined,
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
      duration={duration}
      setDuration={setDuration}
      recalls={recalls}
      onRecall={applyRecall}
      details={details}
      setDetails={setDetails}
      detailsOpen={detailsOpen}
      setDetailsOpen={setDetailsOpen}
      rpe={rpe}
      setRpe={(value) => {
        setRpe(value);
        setRpeTouched(true);
      }}
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
  /** Les chiffres saisis, masque retiré. Voir `lib/durationFields.ts`. */
  duration: string;
  setDuration: (v: string) => void;
  recalls: ActivityRecall[];
  onRecall: (recall: ActivityRecall) => void;
  details: DetailFields;
  setDetails: (v: DetailFields) => void;
  detailsOpen: boolean;
  setDetailsOpen: (v: boolean) => void;
  rpe: number;
  setRpe: (v: number) => void;
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
  duration,
  setDuration,
  recalls,
  onRecall,
  details,
  setDetails,
  detailsOpen,
  setDetailsOpen,
  rpe,
  setRpe,
  canSave,
  onCancel,
  onSubmit,
  onDelete,
}: ActivityFormProps) {
  const { t } = useTranslation(["activity", "plan", "common"]);
  const meta = ACTIVITY_DISCIPLINE_META[discipline];
  const durationRef = useRef<HTMLInputElement>(null);

  /* Le focus part sur le SEUL champ vide de l'écran, mais seulement là où le
     poser ne fait pas monter un clavier : `pointer: fine`, donc une souris.

     Au doigt, le clavier logiciel ouvrait par-dessus le formulaire à la
     seconde où il s'ouvrait : il masque la moitié basse, donc la discipline,
     le motif et le bouton d'enregistrement, et il rend la date et les deux
     rangées de choix inatteignables sans le refermer d'abord. Un panneau qui
     s'ouvre à moitié caché pour désigner un champ qu'on atteindrait d'un appui
     coûte plus qu'il ne fait gagner : le premier geste devient un renvoi du
     clavier, pas une réponse à la question.

     À la souris, rien ne recouvre l'écran, et le formulaire répond à la
     première frappe sans viser. En modification, rien n'est focalisé, quel que
     soit le pointeur : on vient corriger un champ précis, et le clavier
     masquerait ceux qu'on relit. */
  const pointsWithoutKeyboard = useMediaQuery("(pointer: fine)");
  useEffect(() => {
    if (isEdit || !pointsWithoutKeyboard) return;
    durationRef.current?.focus({ preventScroll: true });
  }, [isEdit, pointsWithoutKeyboard]);

  /* Le curseur revient à la FIN après chaque frappe, tant que le champ est
     tenu. C'est ce qui rend le masque prévisible : les chiffres entrent par la
     droite, donc l'effacement doit toujours retirer le dernier, où que le
     doigt ait posé le curseur dans 1:25. */
  useEffect(() => {
    const field = durationRef.current;
    if (!field || document.activeElement !== field) return;
    const end = field.value.length;
    field.setSelectionRange(end, end);
  }, [duration]);

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

  /* Le rangement se fait à la SORTIE du champ, jamais pendant la frappe : le
     premier chiffre de 90 serait devenu 0:09 avant que le second n'arrive. */
  const tidyDuration = () => {
    const tidy = normalizeDurationDigits(duration);
    if (tidy !== duration) setDuration(tidy);
  };

  const currentDuration = durationToMinutes(duration);

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

        {/* La durée, seule question de l'écran qui attende une réponse. Les
            rappels la précèdent : on les lit avant de décider de taper. */}
        <label className="zn-actlog__duration">
          <span className="zn-kicker zn-kicker--inline zn-plabel">
            {t("activity:form.duration")}
          </span>

          {/* La puce ne porte que la DURÉE, qui est ce qui distingue deux
              rappels. Les précisions qu'elle pose aussi ne tiendraient pas sur
              une ligne de téléphone à trois puces ; elles se montrent là où
              elles atterrissent, dans le repli que l'appui ouvre. */}
          {recalls.length > 0 && (
            <div className="zn-actlog__recalls">
              {recalls.map((recall) => (
                <button
                  key={recall.durationMin}
                  type="button"
                  className="zn-actlog__recall"
                  data-selected={currentDuration === recall.durationMin}
                  onClick={() => onRecall(recall)}
                >
                  {formatDurationMinutes(recall.durationMin)}
                </button>
              ))}
            </div>
          )}

          {/* type text et pas number : un champ numérique natif refuse le
              deux-points du masque, et sur un clavier logiciel il ouvre un
              pavé qui porte aussi le point et le moins. inputMode numeric et
              pattern donnent le pavé de CHIFFRES seuls, sur iOS comme sur
              Android. */}
          <input
            ref={durationRef}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            placeholder={t("activity:form.durationPlaceholder")}
            value={formatDurationDigits(duration)}
            onChange={(e) => setDuration(durationDigits(e.target.value))}
            onBlur={tidyDuration}
            className="zn-pfield zn-actlog__durfield"
          />
        </label>

        {/* Le même curseur que la clôture d'une séance, à dessein : c'est la
            même question, et deux échelles d'effort différentes dans la même
            app rendraient les deux illisibles. Le mot sous l'échelle vient de
            la même table que la clôture, pour la même raison. */}
        <div className="zn-prpe">
          <div className="zn-prpe__head">
            <span className="zn-kicker zn-kicker--inline">{t("activity:form.rpe")}</span>
            {/* Le mot avec le chiffre, et pas sous l'échelle : un 7 nu oblige à
                se rappeler ce qu'il vaut, et une ligne d'ancrage de plus sous
                dix paliers aurait coûté une rangée pour le dire moins bien. */}
            <span className="zn-prpe__value">
              <span className="zn-actlog__rpeword">{t(`common:${rpeWordKey(rpe)}`)}</span>
              {rpe}/10
            </span>
          </div>
          <div
            className="zn-prpe__scale"
            role="slider"
            aria-valuemin={ACTIVITY_LIMITS.rpe.min}
            aria-valuemax={ACTIVITY_LIMITS.rpe.max}
            aria-valuenow={rpe}
            aria-valuetext={`${rpe}/10 ${t(`common:${rpeWordKey(rpe)}`)}`}
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

        {/* Les précisions, repliées. Elles étaient alignées au même poids que
            la durée sous une phrase qui annonçait qu'une seule chose était
            obligatoire ; l'écran disait donc le contraire de la phrase. */}
        <details
          className="zn-actlog__more"
          open={detailsOpen}
          onToggle={(e) => setDetailsOpen(e.currentTarget.open)}
        >
          <summary className="zn-actlog__moresummary">
            <span>
              {t(
                meta.distance !== "none" || meta.elevation || meta.watts
                  ? "activity:form.more"
                  : "activity:form.moreNote",
              )}
            </span>
            <ChevronDown size={18} className="zn-actlog__morechevron" />
          </summary>

          <div className="zn-actlog__morepanel">
            {(meta.distance !== "none" || meta.elevation || meta.watts) && (
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
                      value={details.distance}
                      onChange={(e) => setDetails({ ...details, distance: e.target.value })}
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
                      value={details.elevation}
                      onChange={(e) => setDetails({ ...details, elevation: e.target.value })}
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
                      value={details.watts}
                      onChange={(e) => setDetails({ ...details, watts: e.target.value })}
                      className="zn-pfield"
                    />
                  </label>
                )}
              </div>
            )}

            <label className="zn-actlog__field">
              <span className="zn-kicker zn-kicker--inline zn-plabel">
                {t("activity:form.note")}
              </span>
              <textarea
                value={details.note}
                onChange={(e) =>
                  setDetails({
                    ...details,
                    note: e.target.value.slice(0, ACTIVITY_LIMITS.noteMaxLength),
                  })
                }
                rows={2}
                placeholder={t("activity:form.notePlaceholder")}
                className="zn-pfield"
              />
            </label>
          </div>
        </details>
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
