import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "@/components/icons";
import type { AutoChange } from "@/types/plan";

interface ReschedulePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changes: AutoChange[];
  workoutNames: Record<string, string>;
  onApply: () => void;
}

export function ReschedulePreviewDialog({
  open,
  onOpenChange,
  changes,
  workoutNames,
  onApply,
}: ReschedulePreviewDialogProps) {
  const { t } = useTranslation("plan");
  const noChanges = changes.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("reschedule.title")}</DialogTitle>
          <DialogDescription>{t("reschedule.description")}</DialogDescription>
        </DialogHeader>

        {noChanges ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {t("reschedule.noChanges")}
          </p>
        ) : (
          <div className="space-y-3 py-2">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0" />
              {t("reschedule.skippedCount", { count: changes.length })}
            </p>
            <ul className="space-y-1.5 max-h-[40vh] overflow-y-auto">
              {changes.map((change, i) => (
                <li
                  key={`skip-${i}`}
                  className="flex items-center gap-2 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 px-3 py-2 text-sm"
                >
                  <span className="text-xs font-medium text-muted-foreground tabular-nums shrink-0">
                    S{change.weekNumber}
                  </span>
                  <span className="truncate min-w-0">
                    {workoutNames[change.workoutId ?? ""] || change.workoutId}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("view.cancel")}</Button>
          </DialogClose>
          {!noChanges && (
            <Button onClick={onApply}>{t("reschedule.apply")}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
