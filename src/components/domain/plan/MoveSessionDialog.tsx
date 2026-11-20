import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Segmented } from "@/components/ui/segmented";
import { getPlanMonday, getSessionCalendarDate, isoDateOnly } from "@/lib/planDates";
import type { TrainingPlan } from "@/types/plan";
import { usePlanFormats } from "./planFormat";

export interface MoveTarget {
  week: number;
  index: number;
  day: number;
  name: string;
}

interface MoveSessionDialogProps {
  plan: TrainingPlan;
  target: MoveTarget | null;
  /** Les semaines affichées en mode Modifier, où la séance peut aller. */
  weeks: number[];
  onClose: () => void;
  onMove: (toWeek: number, toDay: number) => void;
}

/**
 * Déplacer une séance sans glisser : l'équivalent clavier et lecteur
 * d'écran de la poignée. On choisit la semaine parmi celles affichées, puis
 * le jour.
 */
export function MoveSessionDialog({ plan, target, weeks, onClose, onMove }: MoveSessionDialogProps) {
  const { t } = useTranslation("plan");
  const f = usePlanFormats();
  const [week, setWeek] = useState(target?.week ?? weeks[0] ?? 1);

  useEffect(() => {
    if (target) setWeek(target.week);
  }, [target]);

  const monday = getPlanMonday(plan);
  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("page.edit.moveTitle")}</DialogTitle>
          <DialogDescription>{t("page.edit.moveDescription", { name: target?.name ?? "" })}</DialogDescription>
        </DialogHeader>
        {weeks.length > 1 && (
          <Segmented<string>
            label={t("page.edit.moveWeek")}
            value={String(week)}
            onChange={(v) => setWeek(Number(v))}
            options={weeks.map((n) => ({ value: String(n), label: t("page.sheet.weekShort", { n }) }))}
          />
        )}
        <div className="zn-movedays" role="group" aria-label={t("page.edit.moveDay")}>
          {[0, 1, 2, 3, 4, 5, 6].map((day) => {
            const iso = isoDateOnly(getSessionCalendarDate(monday, week, day));
            const here = target?.week === week && target.day === day;
            return (
              <button
                key={day}
                type="button"
                className="zn-movedays__day"
                disabled={here}
                aria-label={here ? `${f.dayDate(iso)}, ${t("page.edit.moveCurrent")}` : f.dayDate(iso)}
                onClick={() => onMove(week, day)}
              >
                <span>{f.dayShort(iso)}</span>
                <strong>{f.dayNumber(iso)}</strong>
              </button>
            );
          })}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("view.cancel")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
