import { useTranslation } from "react-i18next";

interface PlanEditDockProps {
  onCancel: () => void;
  onSave: () => void;
}

/**
 * La barre Annuler / Enregistrer du mode Modifier, en pilule fixe en bas de
 * l'écran : la seule surface flottante de la page, et Enregistrer le seul
 * vermillon. Annuler rend le plan tel qu'il était à l'entrée du mode ;
 * Enregistrer en sort avec un seul changement annulable.
 */
export function PlanEditDock({ onCancel, onSave }: PlanEditDockProps) {
  const { t } = useTranslation("plan");
  return (
    <div className="zn-editdock" role="group" aria-label={t("page.edit.title")}>
      <button type="button" className="zn-editdock__cancel" onClick={onCancel}>
        {t("page.edit.cancel")}
      </button>
      <button type="button" className="zn-editdock__save" onClick={onSave}>
        {t("page.edit.save")}
      </button>
    </div>
  );
}
