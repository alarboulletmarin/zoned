import { useTranslation } from "react-i18next";
import { Segmented } from "@/components/ui/segmented";
import { useIsMobile } from "@/hooks/useIsMobile";
import type { PlanViewMode } from "@/hooks/usePlanViewMode";

interface PlanViewModeSelectorProps {
  value: PlanViewMode;
  onChange: (mode: PlanViewMode) => void;
  className?: string;
}

/* Pas d'icône : CalendarRange, Calendar et CalendarDays partagent le même cadre
   extérieur au path près — seul l'intérieur change, soit deux pixels de
   différence à la taille où le segmented les rend. Le libellé masqué était ce
   qui réduisait chaque segment à un rond ; rendu, la pilule redevient une
   pilule sans qu'on touche à son rayon.

   `desktopOnly` se filtre ici et non plus en CSS : usePlanViewMode rabat sur la
   même bascule, donc le contrôle ne peut plus proposer une vue que la page ne
   rendra pas. */
const MODES: { value: PlanViewMode; labelKey: string; desktopOnly?: boolean }[] = [
  { value: "calendar", labelKey: "viewMode.calendar", desktopOnly: true },
  { value: "weekly", labelKey: "viewMode.weekly" },
  { value: "monthly", labelKey: "viewMode.monthly", desktopOnly: true },
  { value: "list", labelKey: "viewMode.list" },
];

export function PlanViewModeSelector({
  value,
  onChange,
  className,
}: PlanViewModeSelectorProps) {
  const { t } = useTranslation("plan");
  const isMobile = useIsMobile();

  return (
    <Segmented<PlanViewMode>
      value={value}
      onChange={onChange}
      label={t("viewMode.label")}
      className={className}
      options={MODES.filter((m) => !(isMobile && m.desktopOnly)).map((m) => ({
        value: m.value,
        label: t(m.labelKey),
      }))}
    />
  );
}
