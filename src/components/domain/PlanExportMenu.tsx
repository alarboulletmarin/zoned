import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Download, Calendar, FileText, Loader2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { exportPlanToICS, exportPlanToPDF } from "@/lib/export";
import { getWorkoutById } from "@/data/workouts";
import { toast } from "sonner";
import type { TrainingPlan } from "@/types/plan";
import type { WorkoutTemplate } from "@/types";

interface PlanExportMenuProps {
  plan: TrainingPlan;
  /** Pre-loaded workout names (optional — loaded on demand if absent) */
  workoutNames?: Record<string, string>;
  /** Pre-loaded workout templates (optional — loaded on demand if absent) */
  workoutTemplates?: Record<string, WorkoutTemplate>;
  isEn: boolean;
  size?: "sm" | "default";
  /** Called when ICS export needs user to pick training days (list mode) */
  onIcsDialogOpen?: () => void;
  /** When provided, used to determine if days are already assigned (non-list mode) */
  planViewMode?: string;
}

/**
 * Collects all unique workout IDs from a plan and resolves names + templates.
 */
function resolvePlanWorkouts(plan: TrainingPlan, isEn: boolean) {
  const names: Record<string, string> = {};
  const templates: Record<string, WorkoutTemplate> = {};

  const ids = new Set<string>();
  for (const week of plan.weeks) {
    for (const session of week.sessions) {
      if (session.workoutId && !session.workoutId.startsWith("__")) {
        ids.add(session.workoutId);
      }
    }
  }

  for (const id of ids) {
    const w = getWorkoutById(id);
    if (w) {
      names[id] = isEn ? (w.nameEn || w.name) : w.name;
      templates[id] = w;
    }
  }

  return { names, templates };
}

export function PlanExportMenu({
  plan,
  workoutNames: preloadedNames,
  workoutTemplates: preloadedTemplates,
  isEn,
  size = "default",
  onIcsDialogOpen,
  planViewMode,
}: PlanExportMenuProps) {
  const { t } = useTranslation("common");
  const [isExporting, setIsExporting] = useState(false);

  const getWorkoutData = useCallback(() => {
    if (preloadedNames && preloadedTemplates && Object.keys(preloadedNames).length > 0) {
      return { names: preloadedNames, templates: preloadedTemplates };
    }
    return resolvePlanWorkouts(plan, isEn);
  }, [plan, isEn, preloadedNames, preloadedTemplates]);

  const handleExportPDF = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const { names, templates } = getWorkoutData();
      await exportPlanToPDF(plan, names, templates, isEn);
      toast.success(t("export.success.pdf"));
    } catch {
      toast.error(t("export.error.pdf"));
    } finally {
      setIsExporting(false);
    }
  }, [plan, isEn, isExporting, getWorkoutData, t]);

  const handleExportICS = useCallback(() => {
    // If days are already assigned (calendar/weekly/monthly mode), export directly
    if (planViewMode && planViewMode !== "list") {
      const usedDays = [...new Set(plan.weeks.flatMap(w => w.sessions.map(s => s.dayOfWeek)))].sort();
      const longRunDay = plan.config.longRunDay ?? 6;
      setIsExporting(true);
      try {
        const { names, templates } = getWorkoutData();
        exportPlanToICS(plan, names, templates, isEn, usedDays, longRunDay);
        toast.success(t("export.success.calendar"));
      } catch {
        toast.error(t("export.error.calendar"));
      } finally {
        setIsExporting(false);
      }
      return;
    }
    // Otherwise open the dialog for day selection
    onIcsDialogOpen?.();
  }, [plan, isEn, planViewMode, onIcsDialogOpen, getWorkoutData, t, isExporting]);

  const handleExportJSON = useCallback(() => {
    const json = JSON.stringify(plan, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `plan-${plan.name || plan.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(isEn ? "Plan exported" : "Plan exporté");
  }, [plan, isEn]);

  const isSmall = size === "sm";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={isSmall ? "outline" : "default"}
          size={isSmall ? "sm" : "default"}
          disabled={isExporting}
          className={isSmall ? "rounded-full" : "rounded-full px-5 py-2.5 h-auto font-bold"}
        >
          {isExporting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Download className="size-4" />
          )}
          <span className={isSmall ? "hidden sm:inline ml-1" : "ml-2"}>
            {t("export.title")}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="size-4" />
          {t("export.pdf")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportICS}>
          <Calendar className="size-4" />
          {t("export.calendar")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON}>
          <Download className="size-4" />
          {t("export.json")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
