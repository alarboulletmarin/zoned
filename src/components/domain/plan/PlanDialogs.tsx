import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Clock, Flag, Trash2 } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast";
import { AddWeekToPlanSheet } from "@/components/domain/AddWeekToPlanSheet";
import { AdaptationPreviewDialog } from "@/components/domain/AdaptationPreviewDialog";
import { ReschedulePreviewDialog } from "@/components/domain/ReschedulePreviewDialog";
import { UnavailabilityManager } from "@/components/domain/UnavailabilityManager";
import { formatDateMedium, formatDateShort, formatWeekday, usePickLocale } from "@/lib/i18n-utils";
import { SESSION_TYPE_LABELS } from "@/lib/labels";
import type { TrainingPlan } from "@/types/plan";
import type { usePlanActions } from "./usePlanActions";

export type PlanDialog = "dates" | "unavailability" | "addWeek" | "duplicate" | "rename" | "delete" | null;

interface PlanDialogsProps {
  plan: TrainingPlan;
  planName: string;
  dialog: PlanDialog;
  onClose: () => void;
  selectedWeek: number;
  workoutNames: Record<string, string>;
  actions: ReturnType<typeof usePlanActions>;
  reload: () => void;
  onDuplicated: (newId: string) => void;
  onDeleted: () => void;
}

function nextMondayIso(): { iso: string; date: Date } {
  const now = new Date();
  const day = now.getDay();
  const until = day === 0 ? 1 : day === 1 ? 7 : 8 - day;
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + until);
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  return { iso, date };
}

/**
 * Les boîtes de la page d'un plan, celles qu'elle avait déjà : les dates,
 * les indisponibilités et leur réorganisation, l'ajout d'une semaine,
 * l'adaptation, la validation d'une semaine, la suppression ; plus renommer
 * et dupliquer, qui vivaient sur /plans et que le menu ··· reprend.
 */
export function PlanDialogs({
  plan,
  planName,
  dialog,
  onClose,
  selectedWeek,
  workoutNames,
  actions,
  reload,
  onDuplicated,
  onDeleted,
}: PlanDialogsProps) {
  const { t } = useTranslation("plan");
  const pickLocale = usePickLocale();
  const [startDate, setStartDate] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    if (dialog === "dates") setStartDate(plan.config.startDate || "");
    if (dialog === "rename") setName(planName);
    if (dialog === "duplicate") setName(`${planName} ${t("plansPage.copySuffix")}`);
  }, [dialog, plan.config.startDate, planName, t]);

  const close = (open: boolean) => {
    if (!open) onClose();
  };
  const validation = actions.weekValidation;

  const datesSummary = (() => {
    if (!startDate) return null;
    const [y, m, d] = startDate.split("-").map(Number);
    const start = new Date(y, m - 1, d);
    const end = new Date(y, m - 1, d + plan.totalWeeks * 7);
    const now = new Date();
    const isPast = start < new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return (
      <>
        <div className="zn-planview__summary">
          <span className="zn-planview__summary-row zn-body zn-body--sm">
            <Calendar size={16} />
            <span>
              {t("view.startLabel")} : {formatDateMedium(start)} <span className="zn-muted">({formatWeekday(start)})</span>
            </span>
          </span>
          <span className="zn-planview__summary-row zn-body zn-body--sm">
            <Flag size={16} />
            <span>
              {t("view.endLabel")} : {formatDateMedium(end)}
            </span>
          </span>
          <span className="zn-planview__summary-row zn-body zn-body--sm">
            <Clock size={16} />
            <span>
              {plan.totalWeeks} {t("duration.weeks")}
            </span>
          </span>
        </div>
        {isPast && <Alert kind="warning">{t("view.pastDateWarning")}</Alert>}
      </>
    );
  })();

  const monday = nextMondayIso();

  return (
    <>
      <UnavailabilityManager
        open={dialog === "unavailability"}
        onOpenChange={close}
        planId={plan.id}
        unavailabilities={plan.config.unavailabilities ?? []}
        onSave={(items) => {
          if (actions.saveUnavailabilities(items)) onClose();
        }}
      />

      <AddWeekToPlanSheet
        plan={plan}
        weekNumber={dialog === "addWeek" ? selectedWeek : null}
        onOpenChange={close}
        onMerged={reload}
      />

      <ReschedulePreviewDialog
        open={actions.reschedulePreview !== null}
        onOpenChange={(open) => {
          if (!open) actions.setReschedulePreview(null);
        }}
        changes={actions.reschedulePreview?.changes ?? []}
        workoutNames={workoutNames}
        onApply={actions.applyReschedule}
      />

      <AdaptationPreviewDialog
        open={actions.adaptationPreview !== null}
        onOpenChange={(open) => {
          if (!open) actions.setAdaptationPreview(null);
        }}
        changes={actions.adaptationPreview?.changes ?? []}
        summary={actions.adaptationPreview?.summary ?? ""}
        summaryEn={actions.adaptationPreview?.summaryEn ?? ""}
        onApply={actions.applyAdaptation}
      />

      <Dialog open={dialog === "delete"} onOpenChange={close}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("view.deleteTitle")}</DialogTitle>
            <DialogDescription>{t("view.deleteConfirm", { name: planName })}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("view.cancel")}</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => {
                actions.remove();
                onClose();
                onDeleted();
              }}
            >
              <Trash2 />
              {t("view.delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "rename" || dialog === "duplicate"} onOpenChange={close}>
        <DialogContent>
          <form
            className="zn-stack"
            style={{ "--gap": "var(--sp-10)" } as React.CSSProperties}
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = name.trim();
              if (!trimmed) return;
              if (dialog === "rename") {
                if (trimmed === planName || actions.rename(trimmed)) onClose();
                return;
              }
              const newId = actions.duplicatePlanAs(trimmed);
              if (newId) {
                onClose();
                toast.success(t("plansPage.duplicated", { name: trimmed }));
                onDuplicated(newId);
              }
            }}
          >
            <DialogHeader>
              <DialogTitle>{dialog === "rename" ? t("page.rename.title") : t("plansPage.menu.duplicate")}</DialogTitle>
              <DialogDescription>{planName}</DialogDescription>
            </DialogHeader>
            <div className="zn-stack" style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}>
              <label htmlFor="zn-plan-name" className="zn-label">
                {t("page.rename.label")}
              </label>
              <input
                id="zn-plan-name"
                className="zn-pfield"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="off"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t("view.cancel")}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={!name.trim()}>
                {dialog === "rename" ? t("page.rename.save") : t("plansPage.menu.duplicate")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={validation !== null}
        onOpenChange={(open) => {
          if (!open) actions.setWeekValidation(null);
        }}
      >
        <DialogContent className="zn-planview__dialog">
          <DialogHeader>
            <DialogTitle>{t("completion.confirmTitle")}</DialogTitle>
            <DialogDescription>
              {t("completion.confirmDescription", {
                count: validation?.unresolved ?? 0,
                week: validation?.weekNumber ?? 0,
              })}
            </DialogDescription>
          </DialogHeader>
          {validation && validation.unresolvedSessions.length > 0 && (
            <ul className="zn-planview__unresolved">
              {validation.unresolvedSessions.map((s, i) => {
                const label = SESSION_TYPE_LABELS[s.sessionType];
                return (
                  <li key={i}>
                    <span className="zn-body zn-body--sm zn-truncate">
                      {t(`daysShort.${s.dayOfWeek}`)} · {label ? pickLocale(label) : s.sessionType}
                    </span>
                    <span className="zn-mono zn-faint zn-fixed">{s.estimatedDurationMin}{" "}min</span>
                  </li>
                );
              })}
            </ul>
          )}
          <DialogFooter className="zn-planview__choices">
            <Button onClick={() => actions.decideWeekValidation("mark_skipped")}>
              {t("completion.markRemainingSkipped")}
            </Button>
            <Button variant="outline" onClick={() => actions.decideWeekValidation("keep_unresolved")}>
              {t("completion.keepForLater")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialog === "dates"} onOpenChange={close}>
        <DialogContent className="zn-planview__datedialog">
          <DialogHeader>
            <DialogTitle>{t("view.editDatesTitle")}</DialogTitle>
            <DialogDescription>{t("view.editDatesDescription")}</DialogDescription>
          </DialogHeader>
          <div className="zn-stack zn-planview__datebody" style={{ "--gap": "var(--sp-11)" } as React.CSSProperties}>
            <div className="zn-stack" style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}>
              <label htmlFor="edit-start-date" className="zn-label">
                {t("view.startDate")}
              </label>
              <DateInput id="edit-start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <Button variant="outline" size="sm" onClick={() => setStartDate(monday.iso)}>
              <Calendar />
              {t("view.startNextMonday")} ({formatDateShort(monday.date)})
            </Button>
            {datesSummary}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{t("view.cancel")}</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (actions.saveDates(startDate)) onClose();
              }}
            >
              {t("view.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
