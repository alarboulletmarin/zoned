import { useTranslation } from "react-i18next";
import { Segmented } from "@/components/ui/segmented";
import type { ViewMode } from "@/hooks/useViewMode";

interface ViewModeSelectorProps {
  value: ViewMode;
  onChange: (mode: ViewMode) => void;
  className?: string;
}

/* Le mot plutôt que le glyphe. Trois pictogrammes de grille se distinguent par
   la taille de leurs carrés, deux pixels d'écart à 18 px, et c'est le libellé
   masqué qui réduisait chaque segment à un rond : un rayon de pilule sur une
   boîte carrée fait un cercle. Rendu, la pilule redevient une pilule sans qu'on
   touche à son rayon.

   Même geste que PlanViewModeSelector, et le même <Segmented> derrière : le
   tabindex roulant, les flèches et Home/End viennent avec. */
const MODES: { value: ViewMode; labelKey: string }[] = [
  { value: "compact", labelKey: "viewMode.compact" },
  { value: "grid", labelKey: "viewMode.grid" },
  { value: "list", labelKey: "viewMode.list" },
];

export function ViewModeSelector({ value, onChange, className }: ViewModeSelectorProps) {
  const { t } = useTranslation("library");

  return (
    <Segmented<ViewMode>
      value={value}
      onChange={onChange}
      label={t("viewMode.label")}
      className={className}
      options={MODES.map((m) => ({ value: m.value, label: t(m.labelKey) }))}
    />
  );
}
