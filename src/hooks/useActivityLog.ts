import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "@/components/ui/toast";

import { useActivities } from "@/hooks/useActivities";
import { loadCommutePattern } from "@/lib/athleteProfile";
import { isoDateOnly } from "@/lib/planDates";
import type {
  ActivityDiscipline,
  ActivityDraft,
  ComplementaryActivity,
} from "@/types/activity";

/**
 * Noter une activité complémentaire, depuis n'importe quel écran.
 *
 * ── Pourquoi ce hameçon existe ───────────────────────────────────────────
 *
 * Le panneau de saisie (`ActivityLogPanel`) est une vue ; tout ce qui
 * l'entoure est le MÊME travail à chaque fois : tenir l'ouverture, retenir le
 * jour visé, distinguer une création d'une correction, écrire, dire que c'est
 * écrit, refermer, et relire le motif récurrent du profil pour pré-remplir.
 * Deux écrans en portaient chacun leur copie, et la troisième aurait été celle
 * de trop : à la première divergence, noter un trajet depuis le plan n'aurait
 * plus donné la même chose que depuis le cockpit.
 *
 * Un appelant écrit donc trois lignes et rien de plus :
 *
 *     const log = useActivityLog();
 *     <button onClick={() => log.logOn(dayIso)}>J'ai fait autre chose</button>
 *     <ActivityLogPanel {...log.panel} />
 *
 * ── Le journal vient d'ici aussi ─────────────────────────────────────────
 *
 * `activities` est rendu par le hameçon plutôt que lu à côté par l'appelant.
 * Ce n'est pas de la commodité : deux appels à `useActivities` sur un même
 * écran liraient le même magasin partagé, mais un appelant qui garderait sa
 * propre liste à jour AUTREMENT retomberait dans le problème que ce magasin
 * existe pour fermer. Une source, une liste.
 */

/** Les pré-réglages venus du motif récurrent du profil, quand il existe. */
type CommuteSuggestion = { discipline: ActivityDiscipline; durationMin: number } | null;

/** Ce qui s'étale sur `<ActivityLogPanel {...panel} />`. */
export interface ActivityLogBinding {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate: string;
  activity: ComplementaryActivity | null;
  suggestion: CommuteSuggestion;
  history: readonly ComplementaryActivity[];
  onSave: (draft: ActivityDraft) => void;
  onDelete: (id: string) => void;
}

export interface ActivityLogController {
  /** Le journal entier, trié du plus récent au plus ancien. */
  activities: ComplementaryActivity[];
  /** Ouvrir la saisie sur un jour, "YYYY-MM-DD". Sans argument, aujourd'hui. */
  logOn: (date?: string) => void;
  /** Ouvrir la correction d'une activité déjà notée. */
  edit: (activity: ComplementaryActivity) => void;
  panel: ActivityLogBinding;
}

export function useActivityLog(): ActivityLogController {
  const { t } = useTranslation("activity");
  const { activities, add, update, remove } = useActivities();

  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(() => isoDateOnly(new Date()));
  const [editing, setEditing] = useState<ComplementaryActivity | null>(null);

  /* Le motif récurrent dit ce qu'on fait D'HABITUDE, ce qui est exactement la
     bonne valeur par défaut d'un formulaire et n'a jamais valeur de relevé. Lu
     une fois par montage : il ne change pas pendant qu'on regarde l'écran. */
  const suggestion = useMemo<CommuteSuggestion>(() => {
    const pattern = loadCommutePattern();
    if (!pattern) return null;
    return { discipline: pattern.discipline, durationMin: pattern.durationMin };
  }, []);

  const logOn = useCallback((day?: string) => {
    setEditing(null);
    setDate(day ?? isoDateOnly(new Date()));
    setOpen(true);
  }, []);

  const edit = useCallback((activity: ComplementaryActivity) => {
    setEditing(activity);
    setDate(activity.date);
    setOpen(true);
  }, []);

  const onOpenChange = useCallback((next: boolean) => {
    setOpen(next);
    if (!next) setEditing(null);
  }, []);

  /* L'écriture peut échouer, et pas seulement en théorie : `localStorage` a un
     quota, et une activité que le stockage refuse doit le DIRE. Le panneau
     reste alors ouvert, avec la saisie dedans, plutôt que de se refermer sur
     un enregistrement qui n'a pas eu lieu. */
  const onSave = useCallback(
    (draft: ActivityDraft) => {
      const saved = editing ? update(editing.id, draft) : add(draft);
      if (!saved) {
        toast.error(t("toast.saveFailed"));
        return;
      }
      toast.success(t(editing ? "toast.updated" : "toast.added"));
      setOpen(false);
      setEditing(null);
    },
    [editing, update, add, t],
  );

  const onDelete = useCallback(
    (id: string) => {
      if (!remove(id)) return;
      toast.success(t("toast.deleted"));
      setOpen(false);
      setEditing(null);
    },
    [remove, t],
  );

  return {
    activities,
    logOn,
    edit,
    panel: {
      open,
      onOpenChange,
      defaultDate: date,
      activity: editing,
      suggestion,
      history: activities,
      onSave,
      onDelete,
    },
  };
}
