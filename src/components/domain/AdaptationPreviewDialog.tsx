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
import { AlertTriangle } from "@/components/icons";
import { cn } from "@/lib/utils";
import { usePickLocale } from "@/lib/i18n-utils";
import type { AutoChange } from "@/types/plan";

interface AdaptationPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changes: AutoChange[];
  summary: string;
  summaryEn: string;
  onApply: () => void;
}

export function AdaptationPreviewDialog({
  open,
  onOpenChange,
  changes,
  summary,
  summaryEn,
  onApply,
}: AdaptationPreviewDialogProps) {
  const { t } = useTranslation("plan");
  const pickLocale = usePickLocale();

  const noChanges = changes.length === 0;
  const displaySummary = pickLocale({ fr: summary, en: summaryEn });

  function changeLabel(change: AutoChange): { label: string; color: string } {
    if (change.kind === "volume_adjusted" && change.reason === "capacity") {
      return {
        label: t("adaptation.volumeIncreased"),
        color: "text-green-600 dark:text-green-400",
      };
    }
    if (change.kind === "volume_adjusted") {
      return {
        label: t("adaptation.volumeReduced"),
        color: "text-amber-600 dark:text-amber-400",
      };
    }
    if (change.kind === "recovery_inserted") {
      return {
        label: t("adaptation.recoveryInserted"),
        color: "text-blue-600 dark:text-blue-400",
      };
    }
    if (change.reason === "missed_key") {
      return {
        label: t("adaptation.missedKey"),
        color: "text-orange-600 dark:text-orange-400",
      };
    }
    return { label: change.kind, color: "text-muted-foreground" };
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("adaptation.title")}</DialogTitle>
          <DialogDescription>{t("adaptation.description")}</DialogDescription>
        </DialogHeader>

        {noChanges ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {t("adaptation.noChanges")}
          </p>
        ) : (
          <div className="space-y-4 py-2">
            <p className="text-sm bg-muted/50 rounded-lg p-3">
              {displaySummary}
            </p>

            <ul className="space-y-2">
              {changes.map((change, i) => {
                const { label, color } = changeLabel(change);
                return (
                  <li
                    key={`change-${i}`}
                    className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                  >
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-xs tabular-nums"
                    >
                      {t("adaptation.weekN", { week: change.weekNumber })}
                    </Badge>
                    <span className={cn("font-medium", color)}>{label}</span>
                    {change.reason === "fatigue" && (
                      <AlertTriangle className="size-3.5 text-amber-500 shrink-0 ml-auto" />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("adaptation.keep")}</Button>
          </DialogClose>
          {!noChanges && (
            <Button onClick={onApply}>{t("adaptation.apply")}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
