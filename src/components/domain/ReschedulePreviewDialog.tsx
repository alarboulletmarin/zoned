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
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
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
      <DialogContent className="zn-pdialog">
        <DialogHeader>
          <DialogTitle>{t("reschedule.title")}</DialogTitle>
          <DialogDescription>{t("reschedule.description")}</DialogDescription>
        </DialogHeader>

        {noChanges ? (
          <p className="zn-ppreview__empty">{t("reschedule.noChanges")}</p>
        ) : (
          <div className="zn-ppreview">
            <Alert kind="warning" title={t("reschedule.skippedCount", { count: changes.length })}>
              {t("reschedule.skippedIntact")}
            </Alert>

            <ul className="zn-ppreview__list">
              {changes.map((change, i) => (
                <li key={`skip-${i}`} className="zn-ppreview__item">
                  <span className="zn-ppreview__week">S{change.weekNumber}</span>
                  <span className="zn-ppreview__label zn-truncate">
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
