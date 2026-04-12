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
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight } from "@/components/icons";
import type { AutoChange, PlanSession } from "@/types/plan";

interface ReschedulePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changes: AutoChange[];
  unplaced: PlanSession[];
  onApply: () => void;
}

export function ReschedulePreviewDialog({
  open,
  onOpenChange,
  changes,
  unplaced,
  onApply,
}: ReschedulePreviewDialogProps) {
  const { t } = useTranslation("plan");

  const noChanges = changes.length === 0 && unplaced.length === 0;
  const movedChanges = changes.filter((c) => c.kind === "moved");
  const skippedChanges = changes.filter((c) => c.kind === "skipped");

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
          <div className="space-y-4 py-2">
            {/* Moved sessions */}
            {movedChanges.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t("reschedule.moved")}</p>
                <ul className="space-y-1.5">
                  {movedChanges.map((change, i) => (
                    <li
                      key={`moved-${i}`}
                      className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2 text-sm"
                    >
                      <ArrowRight className="size-4 text-primary shrink-0" />
                      <span className="truncate min-w-0">
                        {change.workoutId ?? "?"}
                      </span>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        {t("reschedule.fromTo", {
                          from: change.weekNumber,
                          fromDay: (change.fromDay ?? 0) + 1,
                          to: change.toWeekNumber ?? change.weekNumber,
                          toDay: (change.toDay ?? 0) + 1,
                        })}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skipped sessions */}
            {skippedChanges.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">{t("reschedule.skipped")}</p>
                <ul className="space-y-1.5">
                  {skippedChanges.map((change, i) => (
                    <li
                      key={`skipped-${i}`}
                      className="flex items-center gap-2 rounded-md border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20 px-3 py-2 text-sm"
                    >
                      <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                      <span className="truncate min-w-0">
                        {change.workoutId ?? "?"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Unplaced key sessions */}
            {unplaced.length > 0 && (
              <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 p-3 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300">
                  <AlertTriangle className="size-4 shrink-0" />
                  {t("reschedule.unplacedCount", { count: unplaced.length })}
                </div>
                <ul className="space-y-1 text-sm text-amber-600 dark:text-amber-400">
                  {unplaced.map((session, i) => (
                    <li key={`unplaced-${i}`} className="truncate">
                      {session.workoutId}
                    </li>
                  ))}
                </ul>
              </div>
            )}
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
