/**
 * ExportDatePicker - Date/time picker for ICS export
 *
 * Simple modal-style picker to select when to schedule the workout
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, Clock } from "@/components/icons";
import { DateInput } from "@/components/ui/date-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExportDatePickerProps {
  onSelect: (dateTime: Date) => void;
  onCancel: () => void;
}

export function ExportDatePicker({ onSelect, onCancel }: ExportDatePickerProps) {
  const { t } = useTranslation("common");
  const now = new Date();

  // Default to tomorrow at 7:00 AM
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(7, 0, 0, 0);

  const [date, setDate] = useState(tomorrow.toISOString().split("T")[0]);
  const [time, setTime] = useState("07:00");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const [hours, minutes] = time.split(":").map(Number);
    const selectedDate = new Date(date);
    selectedDate.setHours(hours, minutes, 0, 0);
    onSelect(selectedDate);
  };

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="zn-row" style={{ "--gap": "var(--sp-5)" } as React.CSSProperties}>
            <Calendar size={20} />
            {t("export.selectDateTime")}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="zn-stack"
          style={{ "--gap": "var(--sp-8)" } as React.CSSProperties}
        >
          <div className="zn-stack" style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}>
            <label
              htmlFor="export-date"
              className="zn-row zn-label zn-field-label"
              style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}
            >
              <Calendar />
              {t("export.dateLabel")}
            </label>
            <DateInput
              id="export-date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="zn-stack" style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}>
            <label
              htmlFor="export-time"
              className="zn-row zn-label zn-field-label"
              style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}
            >
              <Clock />
              {t("export.timeLabel")}
            </label>
            <input
              id="export-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="zn-native-field"
              required
            />
          </div>

          <div className="zn-row" style={{ "--gap": "var(--sp-5)" } as React.CSSProperties}>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="zn-fill"
            >
              {t("actions.cancel")}
            </Button>
            <Button type="submit" className="zn-fill">
              {t("export.download")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
