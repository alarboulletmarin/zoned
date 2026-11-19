import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Copy, Download, FileText, Pencil, Share, Trash2 } from "@/components/icons";
import { ActionsMenu } from "@/components/ui/actions-menu";
import {
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlanExport } from "@/components/domain/PlanExportMenu";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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
  // Sur un téléphone, un sous-menu n'a de place ni à droite ni à gauche du
  // menu : Radix le poussait hors de l'écran. Sous 640 px, les trois formats
  // sont posés dans le menu lui-même, sous un intitulé, en une rangée.
  const flat = useMediaQuery("(max-width: 639px)");

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
      {flat ? (
        <>
          {/* Trois formats sur UNE rangée : empilés, ils portaient le menu à
              330 px, plus que la place sous le bouton sur un téléphone ; il
              s'ouvrait alors vers le haut, par-dessus la barre, et Supprimer
              ne se voyait plus qu'en faisant défiler. */}
          {/* Partager rejoint la rangée quand il existe : c'est une
              quatrième façon de sortir l'objet de l'app, et une ligne de
              moins. Sur un iPhone SE, la ligne de trop faisait défiler le
              menu d'une semaine et cachait Supprimer. */}
          <DropdownMenuLabel>{onShare ? t("plansPage.menu.exportShare") : tc("export.title")}</DropdownMenuLabel>
          <div
            className="zn-more__formats"
            data-count={onShare ? 4 : 3}
            role="group"
            aria-label={onShare ? t("plansPage.menu.exportShare") : tc("export.title")}
          >
            <DropdownMenuItem aria-label={tc("export.pdf")} onSelect={handleExportPDF} disabled={isExporting}>
              <FileText />
              {t("plansPage.menu.formats.pdf")}
            </DropdownMenuItem>
            <DropdownMenuItem aria-label={tc("export.calendar")} onSelect={handleExportICS} disabled={isExporting}>
              <Calendar />
              {t("plansPage.menu.formats.ics")}
            </DropdownMenuItem>
            <DropdownMenuItem aria-label={tc("export.json")} onSelect={handleExportJSON} disabled={isExporting}>
              <Download />
              {t("plansPage.menu.formats.json")}
            </DropdownMenuItem>
            {onShare && (
              <DropdownMenuItem aria-label={t("plansPage.menu.share")} onSelect={onShare}>
                <Share />
                {t("plansPage.menu.formats.link")}
              </DropdownMenuItem>
            )}
          </div>
          <DropdownMenuSeparator />
        </>
      ) : (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger disabled={isExporting}>
            <Download />
            {t("plansPage.menu.export")}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="zn-more__list" collisionPadding={16}>
            <DropdownMenuItem onSelect={handleExportPDF} disabled={isExporting}>
              <FileText />
              {tc("export.pdf")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleExportICS} disabled={isExporting}>
              <Calendar />
              {tc("export.calendar")}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleExportJSON} disabled={isExporting}>
              <Download />
              {tc("export.json")}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )}
      {onShare && !flat && (
        <DropdownMenuItem onSelect={onShare}>
          <Share />
          {t("plansPage.menu.share")}
        </DropdownMenuItem>
      )}
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
