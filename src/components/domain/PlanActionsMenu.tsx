import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Copy, Download, FileText, Pencil, Share, Trash2 } from "@/components/icons";
import { ActionsMenu } from "@/components/ui/actions-menu";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usePlanExport } from "@/components/domain/PlanExportMenu";
import type { TrainingPlan } from "@/types/plan";

/**
 * Le bouton ··· d'un plan ou d'une semaine enregistrée (/plans, /weeks) :
 * exporter, partager s'il y a lieu, dupliquer, renommer, et, sous un
 * séparateur, supprimer. Le bouton et ses règles sont ceux d'`ActionsMenu`.
 *
 * Supprimer n'agit pas ici : il ouvre la boîte de confirmation de la page.
 */
interface PlanActionsMenuProps {
  plan: TrainingPlan;
  /** L'étiquette du bouton, qui nomme l'objet (Actions du plan X). */
  label: string;
  /** Les noms qu'a déjà la page, ceux des activités compris, pour l'export. */
  workoutNames?: Record<string, string>;
  onShare?: () => void;
  onDuplicate: () => void;
  onRename: () => void;
  onDelete: () => void;
  className?: string;
}

export function PlanActionsMenu({
  plan,
  label,
  workoutNames,
  onShare,
  onDuplicate,
  onRename,
  onDelete,
  className,
}: PlanActionsMenuProps) {
  const { t } = useTranslation("plan");
  const { t: tc } = useTranslation("common");
  const { isExporting, handleExportPDF, handleExportICS, handleExportJSON } = usePlanExport(
    plan,
    workoutNames,
  );
  // Renommer met le focus dans le champ du nom : le menu ne doit pas le
  // reprendre en se fermant, comme il le fait pour tout autre choix.
  const keepFocus = useRef(false);

  return (
    <ActionsMenu
      label={label}
      busy={isExporting}
      className={className}
      onCloseAutoFocus={(e) => {
        if (keepFocus.current) {
          e.preventDefault();
          keepFocus.current = false;
        }
      }}
    >
      {/* Exporter et partager en UNE rangée de cases, à toutes les
          largeurs : un format se choisit d'un seul geste, sans sous-menu.
          Le sous-menu demandait un second clic, et sur un téléphone il
          n'avait de place ni à droite ni à gauche du menu. Une rangée et
          pas une colonne : empilés, les formats portaient le menu au-delà
          de la place sous le bouton sur un iPhone SE, et Supprimer passait
          sous un défilement. Partager rejoint la rangée quand il existe :
          c'est une façon de plus de sortir l'objet de l'app. */}
      <DropdownMenuLabel>{onShare ? t("plansPage.menu.exportShare") : tc("export.title")}</DropdownMenuLabel>
      <div
        className="zn-more__formats"
        data-count={onShare ? 4 : 3}
        role="group"
        aria-label={onShare ? t("plansPage.menu.exportShare") : tc("export.title")}
      >
        <DropdownMenuItem aria-label={tc("export.pdf")} title={tc("export.pdf")} onSelect={handleExportPDF} disabled={isExporting}>
          <FileText />
          {t("plansPage.menu.formats.pdf")}
        </DropdownMenuItem>
        <DropdownMenuItem aria-label={tc("export.calendar")} title={tc("export.calendar")} onSelect={handleExportICS} disabled={isExporting}>
          <Calendar />
          {t("plansPage.menu.formats.ics")}
        </DropdownMenuItem>
        <DropdownMenuItem aria-label={tc("export.json")} title={tc("export.json")} onSelect={handleExportJSON} disabled={isExporting}>
          <Download />
          {t("plansPage.menu.formats.json")}
        </DropdownMenuItem>
        {onShare && (
          <DropdownMenuItem aria-label={t("plansPage.menu.share")} title={t("plansPage.menu.share")} onSelect={onShare}>
            <Share />
            {t("plansPage.menu.formats.link")}
          </DropdownMenuItem>
        )}
      </div>
      <DropdownMenuSeparator />
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
      <DropdownMenuItem variant="destructive" className="zn-more__danger" onSelect={onDelete}>
        <Trash2 />
        {t("plansPage.menu.delete")}
      </DropdownMenuItem>
    </ActionsMenu>
  );
}
