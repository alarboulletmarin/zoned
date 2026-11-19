import { useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Calendar,
  Copy,
  Download,
  FileText,
  Loader2,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlanExport } from "@/components/domain/PlanExportMenu";
import { cn } from "@/lib/utils";
import type { TrainingPlan } from "@/types/plan";

/**
 * Le bouton ··· d'un plan sur /plans : exporter, dupliquer, renommer, et, sous
 * un séparateur, supprimer. C'est là que vivent les gestes rares, pour que la
 * carte ne porte plus une rangée de boutons au poids de son contenu.
 *
 * Supprimer n'agit pas ici : il ouvre la boîte de confirmation de la page.
 * Radix porte le clavier (flèches, Entrée, Échap) et rend le focus au bouton.
 */
interface PlanActionsMenuProps {
  plan: TrainingPlan;
  /** Le nom affiché, pour l'étiquette du bouton. */
  name: string;
  onDuplicate: () => void;
  onRename: () => void;
  onDelete: () => void;
  className?: string;
}

export function PlanActionsMenu({
  plan,
  name,
  onDuplicate,
  onRename,
  onDelete,
  className,
}: PlanActionsMenuProps) {
  const { t } = useTranslation("plan");
  const { t: tc } = useTranslation("common");
  const { isExporting, handleExportPDF, handleExportICS, handleExportJSON } = usePlanExport(plan);
  // Renommer met le focus dans le champ du nom : le menu ne doit pas le
  // reprendre en se fermant, comme il le fait pour tout autre choix.
  const keepFocus = useRef(false);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn("zn-planmenu", className)}
          aria-label={t("plansPage.menu.label", { name })}
        >
          {isExporting ? <Loader2 className="zn-spin" size={20} /> : <MoreHorizontal size={20} />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="zn-planmenu__list"
        onCloseAutoFocus={(e) => {
          if (keepFocus.current) {
            e.preventDefault();
            keepFocus.current = false;
          }
        }}
      >
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={isExporting}>
            <Download />
            {t("plansPage.menu.export")}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="zn-planmenu__list">
            <DropdownMenuItem onSelect={handleExportPDF}>
              <FileText />
              {tc("export.pdf")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleExportICS}>
              <Calendar />
              {tc("export.calendar")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleExportJSON}>
              <Download />
              {tc("export.json")}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem onSelect={onDuplicate}>
          <Copy />
          {t("plansPage.menu.duplicate")}
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() => {
            keepFocus.current = true;
            onRename();
          }}
        >
          <Pencil />
          {t("plansPage.menu.rename")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" className="zn-planmenu__delete" onSelect={onDelete}>
          <Trash2 />
          {t("plansPage.menu.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
