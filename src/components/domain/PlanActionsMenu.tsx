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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlanExport } from "@/components/domain/PlanExportMenu";
import { useMediaQuery } from "@/hooks/useMediaQuery";
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
  // Sur un téléphone, un sous-menu n'a de place ni à droite ni à gauche du
  // menu : Radix le poussait hors de l'écran. Sous 640 px, les trois formats
  // sont posés dans le menu lui-même, sous un intitulé, en une rangée.
  const flat = useMediaQuery("(max-width: 639px)");

  const exportItems = (
    <>
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
    </>
  );

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
        collisionPadding={16}
        className="zn-planmenu__list"
        onCloseAutoFocus={(e) => {
          if (keepFocus.current) {
            e.preventDefault();
            keepFocus.current = false;
          }
        }}
      >
        {flat ? (
          <>
            {/* Trois formats sur UNE rangée : empilés, ils portaient le menu
                à 330 px, plus que la place sous le bouton sur un téléphone ;
                il s'ouvrait alors vers le haut, par-dessus la barre, et
                Supprimer ne se voyait plus qu'en faisant défiler. */}
            <DropdownMenuLabel>{tc("export.title")}</DropdownMenuLabel>
            <div className="zn-planmenu__formats" role="group" aria-label={tc("export.title")}>
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
            </div>
            <DropdownMenuSeparator />
          </>
        ) : (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={isExporting}>
              <Download />
              {t("plansPage.menu.export")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="zn-planmenu__list" collisionPadding={16}>
              {exportItems}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
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
        <DropdownMenuItem variant="destructive" className="zn-planmenu__delete" onSelect={onDelete}>
          <Trash2 />
          {t("plansPage.menu.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
