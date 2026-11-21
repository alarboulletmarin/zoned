import { useTranslation } from "react-i18next";
import {
  Calendar,
  CalendarOff,
  Copy,
  Download,
  FileText,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Share,
  Shuffle,
  Trash2,
  Undo2,
} from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePlanExport } from "@/components/domain/PlanExportMenu";
import type { AnyWorkoutTemplate } from "@/types";
import type { TrainingPlan } from "@/types/plan";

interface PlanMenuProps {
  plan: TrainingPlan;
  name: string;
  workoutNames: Record<string, string>;
  workoutTemplates: Record<string, AnyWorkoutTemplate>;
  /** Absent : le plan ne se rejoue pas depuis un lien (plans libres, semaines). */
  onShare?: () => void;
  onEditDates: () => void;
  onUnavailability: () => void;
  onReschedule: () => void;
  onAddWeek: () => void;
  onDuplicate: () => void;
  onRename: () => void;
  onDelete: () => void;
  onUndo?: () => void;
}

/**
 * Le menu ··· de la page d'un plan : les gestes nécessaires, jamais
 * quotidiens. Exporter et partager en une rangée de formats, comme le menu
 * d'une carte de /plans (`PlanActionsMenu`), puis les dates, les
 * indisponibilités et la réorganisation, l'ajout d'une semaine, dupliquer et
 * renommer, et Supprimer en dernier.
 *
 * Exporter n'est plus l'aplat vermillon de l'écran : sur cette page, le seul
 * vermillon est Enregistrer, en mode Modifier.
 */
export function PlanMenu({
  plan,
  name,
  workoutNames,
  workoutTemplates,
  onShare,
  onEditDates,
  onUnavailability,
  onReschedule,
  onAddWeek,
  onDuplicate,
  onRename,
  onDelete,
  onUndo,
}: PlanMenuProps) {
  const { t } = useTranslation(["plan", "common"]);
  const { isExporting, handleExportPDF, handleExportICS, handleExportJSON } = usePlanExport(
    plan,
    workoutNames,
    workoutTemplates,
  );
  const exportLabel = onShare ? t("plansPage.menu.exportShare") : t("common:export.title");
  const hasUnavailability = (plan.config.unavailabilities ?? []).length > 0;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button type="button" className="zn-iconbtn" aria-label={t("page.tools.more", { name })}>
          {isExporting ? <Loader2 className="zn-spin" size={20} /> : <MoreHorizontal size={20} />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" collisionPadding={16} className="zn-more__list">
        <DropdownMenuLabel>{exportLabel}</DropdownMenuLabel>
        <div className="zn-more__formats" data-count={onShare ? 4 : 3} role="group" aria-label={exportLabel}>
          <DropdownMenuItem aria-label={t("common:export.pdf")} title={t("common:export.pdf")} onSelect={handleExportPDF} disabled={isExporting}>
            <FileText />
            {t("plansPage.menu.formats.pdf")}
          </DropdownMenuItem>
          <DropdownMenuItem aria-label={t("common:export.calendar")} title={t("common:export.calendar")} onSelect={handleExportICS} disabled={isExporting}>
            <Calendar />
            {t("plansPage.menu.formats.ics")}
          </DropdownMenuItem>
          <DropdownMenuItem aria-label={t("common:export.json")} title={t("common:export.json")} onSelect={handleExportJSON} disabled={isExporting}>
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
        {onUndo && (
          <DropdownMenuItem onSelect={onUndo}>
            <Undo2 />
            {t("page.edit.undoSaved")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={onEditDates}>
          <Calendar />
          {plan.config.startDate ? t("page.menu.editDates") : t("page.menu.addDates")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onUnavailability}>
          <CalendarOff />
          {t("unavailability.title")}
        </DropdownMenuItem>
        <DropdownMenuItem disabled={!hasUnavailability} onSelect={onReschedule}>
          <Shuffle />
          {t("reschedule.button")}
        </DropdownMenuItem>
        {!plan.config.isSingleWeek && (
          <DropdownMenuItem onSelect={onAddWeek}>
            <Plus />
            {t("page.menu.addWeek")}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onDuplicate}>
          <Copy />
          {t("plansPage.menu.duplicate")}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onRename}>
          <Pencil />
          {t("plansPage.menu.rename")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" className="zn-more__danger" onSelect={onDelete}>
          <Trash2 />
          {t("view.delete")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
