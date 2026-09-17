import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Segmented, type SegmentedOption } from "@/components/ui/segmented";
import {
  ACTIVITY_INTENSITIES,
  type ActivityDraft,
  type ActivityKind,
} from "@/lib/activitySession";
import {
  durationDigits,
  durationToMinutes,
  formatDurationDigits,
  minutesToDurationDigits,
  normalizeDurationDigits,
} from "@/lib/durationFields";
import type { CrossTrainingIntensity } from "@/types/plan";

export interface ActivitySessionDialogTarget {
  kind: ActivityKind;
  /** Vrai pour une activité déjà posée qu'on règle, faux pour un ajout. */
  editing: boolean;
  /** Choisir un effort n'a de sens qu'avec une zone derrière. */
  aerobic: boolean;
  initial: ActivityDraft;
  /** La durée du profil quand l'activité est un vélotaf, pour le dire. */
  commuteProfileMin: number | null;
}

interface ActivitySessionDialogProps {
  target: ActivitySessionDialogTarget | null;
  onCancel: () => void;
  onSave: (draft: ActivityDraft) => void;
}

/**
 * La seule question qu'une activité de semaine pose : combien de temps, et à
 * quel effort. Deux réponses, et la carte pèse dans le volume, la charge, la
 * polarisation et le rythme comme une séance du catalogue.
 *
 * Le champ de durée est celui du journal d'activités, au même masque h:mm et
 * pour les mêmes raisons (`lib/durationFields.ts`) : on pense 1 h 25, on ne
 * pense pas 85. L'effort est trois mots et pas une échelle de dix : on
 * PRÉVOIT un vélotaf facile, on ne le prévoit pas à 3/10 ; l'échelle fine est
 * celle du relevé, après coup, dans le journal.
 */
export function ActivitySessionDialog({ target, onCancel, onSave }: ActivitySessionDialogProps) {
  const { t } = useTranslation("plan");
  const [duration, setDuration] = useState("");
  const [intensity, setIntensity] = useState<CrossTrainingIntensity>("easy");

  // Le formulaire se remplit à l'ouverture, depuis ce que la cible porte.
  useEffect(() => {
    if (!target) return;
    setDuration(minutesToDurationDigits(target.initial.durationMin));
    setIntensity(target.initial.intensity);
  }, [target]);

  const intensityOptions = useMemo<SegmentedOption<CrossTrainingIntensity>[]>(
    () =>
      ACTIVITY_INTENSITIES.map((id) => ({
        value: id,
        label: t(`activitySession.intensity${id.charAt(0).toUpperCase()}${id.slice(1)}`),
      })),
    [t],
  );

  const minutes = durationToMinutes(duration);
  const canSave = minutes !== undefined && minutes > 0;

  const tidyDuration = () => {
    const tidy = normalizeDurationDigits(duration);
    if (tidy !== duration) setDuration(tidy);
  };

  const submit = () => {
    if (!canSave) return;
    onSave({ durationMin: minutes, intensity });
  };

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onCancel()}>
      {target && (
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t(target.editing ? "activitySession.editTitle" : "activitySession.addTitle")}
              {" · "}
              {t(`activity.${target.kind}`)}
            </DialogTitle>
            <DialogDescription>{t("activitySession.sub")}</DialogDescription>
          </DialogHeader>

          {/* noValidate: the duration field carries pattern="[0-9]*" for the
              numeric keypad, and its displayed value holds the mask's colon,
              which native validation would refuse on submit. */}
          <form
            className="zn-actsess"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <label className="zn-actsess__duration">
              <span className="zn-kicker zn-kicker--inline zn-plabel">
                {t("activitySession.duration")}
              </span>
              {/* type text et pas number : un champ numérique refuse le
                  deux-points du masque. inputMode numeric donne le pavé de
                  chiffres seuls, voir ActivityLogPanel. */}
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                autoFocus
                placeholder={t("activitySession.durationPlaceholder")}
                value={formatDurationDigits(duration)}
                onChange={(e) => setDuration(durationDigits(e.target.value))}
                onBlur={tidyDuration}
                className="zn-pfield zn-actsess__durfield"
              />
              {target.kind === "commute" && (
                <span className="zn-caption zn-actsess__hint">
                  {target.commuteProfileMin !== null
                    ? t("activitySession.commuteHint", { minutes: target.commuteProfileMin })
                    : t("activitySession.commuteNoProfile")}
                </span>
              )}
            </label>

            {target.aerobic && (
              <div className="zn-actsess__field">
                <Segmented
                  value={intensity}
                  onChange={setIntensity}
                  options={intensityOptions}
                  label={t("activitySession.intensity")}
                />
                <span className="zn-caption zn-actsess__hint">
                  {t("activitySession.intensityHint")}
                </span>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancel}>
                {t("activitySession.cancel")}
              </Button>
              <Button type="submit" disabled={!canSave}>
                {t("activitySession.save")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      )}
    </Dialog>
  );
}
