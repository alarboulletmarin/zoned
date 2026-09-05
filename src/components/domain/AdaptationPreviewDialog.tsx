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

/** Ink by default; the one unambiguously good change takes the success hue. */
type ChangeTone = "up" | "ink" | "quiet";

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

  function changeLabel(change: AutoChange): { label: string; tone: ChangeTone } {
    if (change.kind === "volume_adjusted" && change.reason === "capacity") {
      return { label: t("adaptation.volumeIncreased"), tone: "up" };
    }
    if (change.kind === "volume_adjusted") {
      return { label: t("adaptation.volumeReduced"), tone: "ink" };
    }
    if (change.kind === "recovery_inserted") {
      return { label: t("adaptation.recoveryInserted"), tone: "ink" };
    }
    if (change.reason === "missed_key") {
      return { label: t("adaptation.missedKey"), tone: "ink" };
    }
    return { label: change.kind, tone: "quiet" };
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="zn-pdialog">
        <DialogHeader>
          <DialogTitle>{t("adaptation.title")}</DialogTitle>
          <DialogDescription>{t("adaptation.description")}</DialogDescription>
        </DialogHeader>

        {noChanges ? (
          <p className="zn-ppreview__empty">{t("adaptation.noChanges")}</p>
        ) : (
          <div className="zn-ppreview">
            <p className="zn-ppreview__summary">{displaySummary}</p>

            <ul className="zn-ppreview__list">
              {changes.map((change, i) => {
                const { label, tone } = changeLabel(change);
                return (
                  <li key={`change-${i}`} className="zn-ppreview__item">
                    <span className="zn-ppreview__week">
                      {t("adaptation.weekN", { week: change.weekNumber })}
                    </span>
                    <span className="zn-ppreview__label" data-tone={tone}>
                      {label}
                    </span>
                    {change.reason === "fatigue" && (
                      <span className="zn-ppreview__flag" title={t("adaptation.fatigue")}>
                        <AlertTriangle size={14} />
                      </span>
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
