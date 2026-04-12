import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "@/components/icons";
import { cn } from "@/lib/utils";
import type { Unavailability, UnavailabilityReason } from "@/types/plan";

interface UnavailabilityManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  unavailabilities: Unavailability[];
  onSave: (items: Unavailability[]) => void;
}

const REASONS: UnavailabilityReason[] = ["travel", "injury", "work", "weather", "other"];

function reasonLabel(reason: UnavailabilityReason, t: (key: string) => string): string {
  const map: Record<UnavailabilityReason, string> = {
    travel: t("unavailability.reasonTravel"),
    injury: t("unavailability.reasonInjury"),
    work: t("unavailability.reasonWork"),
    weather: t("unavailability.reasonWeather"),
    other: t("unavailability.reasonOther"),
  };
  return map[reason];
}

export function UnavailabilityManager({
  open,
  onOpenChange,
  unavailabilities,
  onSave,
}: UnavailabilityManagerProps) {
  const { t } = useTranslation("plan");

  const [items, setItems] = useState<Unavailability[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newReason, setNewReason] = useState<UnavailabilityReason | "">("");
  const [newNote, setNewNote] = useState("");

  // Sync local state when the sheet opens
  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) {
        setItems([...unavailabilities]);
        setShowForm(false);
        setNewDate("");
        setNewReason("");
        setNewNote("");
      }
      onOpenChange(nextOpen);
    },
    [unavailabilities, onOpenChange],
  );

  const handleAdd = useCallback(() => {
    if (!newDate) return;
    const item: Unavailability = { date: newDate };
    if (newReason) item.reason = newReason;
    if (newNote.trim()) item.note = newNote.trim();
    setItems((prev) => [...prev, item].sort((a, b) => a.date.localeCompare(b.date)));
    setNewDate("");
    setNewReason("");
    setNewNote("");
    setShowForm(false);
  }, [newDate, newReason, newNote]);

  const handleRemove = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSave = useCallback(() => {
    onSave(items);
  }, [items, onSave]);

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="max-h-[80vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{t("unavailability.title")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("unavailability.title")}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-3 px-4 pb-4">
          {/* Existing items */}
          {items.length === 0 && !showForm && (
            <p className="text-sm text-muted-foreground py-3 text-center">
              {t("unavailability.empty")}
            </p>
          )}

          {items.map((item, idx) => (
            <div
              key={`${item.date}-${idx}`}
              className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2"
            >
              <span className="text-sm font-medium tabular-nums">{item.date}</span>
              {item.reason && (
                <span className="text-xs text-muted-foreground">
                  {reasonLabel(item.reason, t)}
                </span>
              )}
              {item.note && (
                <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                  {item.note}
                </span>
              )}
              <div className="flex-1" />
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => handleRemove(idx)}
                title={t("unavailability.delete")}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}

          {/* Add form */}
          {showForm && (
            <div className="space-y-3 rounded-lg border bg-muted/20 p-3">
              <div>
                <label htmlFor="unavail-date" className="text-sm font-medium mb-1 block">
                  {t("unavailability.singleDay")}
                </label>
                <input
                  id="unavail-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="unavail-reason" className="text-sm font-medium mb-1 block">
                  {t("unavailability.reason")}
                </label>
                <select
                  id="unavail-reason"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value as UnavailabilityReason | "")}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">—</option>
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {reasonLabel(r, t)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="unavail-note" className="text-sm font-medium mb-1 block">
                  {t("unavailability.note")}
                </label>
                <input
                  id="unavail-note"
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="..."
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  {t("view.cancel")}
                </Button>
                <Button
                  size="sm"
                  disabled={!newDate}
                  onClick={handleAdd}
                >
                  {t("unavailability.add")}
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={cn("flex gap-2", showForm ? "justify-end" : "justify-between")}>
            {!showForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(true)}
              >
                <Plus className="size-4 mr-1" />
                {t("unavailability.add")}
              </Button>
            )}
            <Button size="sm" onClick={handleSave}>
              {t("view.save")}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
