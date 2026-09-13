import { useState, useCallback, useEffect } from "react";
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
import { DateInput } from "@/components/ui/date-input";
import type { Unavailability, UnavailabilityReason } from "@/types/plan";

interface UnavailabilityManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  unavailabilities: Unavailability[];
  onSave: (items: Unavailability[]) => void;
}

const REASONS: UnavailabilityReason[] = ["travel", "injury", "work", "weather", "other"];

interface UnavailGroup {
  from: string;
  to: string;
  reason?: UnavailabilityReason;
  note?: string;
}

/** Group consecutive days with the same reason into ranges for display */
function groupConsecutive(items: Unavailability[]): UnavailGroup[] {
  if (items.length === 0) return [];
  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date));
  const groups: UnavailGroup[] = [];
  let current: UnavailGroup = { from: sorted[0].date, to: sorted[0].date, reason: sorted[0].reason, note: sorted[0].note };

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    // Check if consecutive (next day) and same reason
    const prevDate = new Date(prev.date + "T00:00:00");
    prevDate.setDate(prevDate.getDate() + 1);
    const nextIso = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}-${String(prevDate.getDate()).padStart(2, "0")}`;
    if (curr.date === nextIso && curr.reason === prev.reason) {
      current.to = curr.date;
    } else {
      groups.push(current);
      current = { from: curr.date, to: curr.date, reason: curr.reason, note: curr.note };
    }
  }
  groups.push(current);
  return groups;
}

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
  const [newFrom, setNewFrom] = useState("");
  const [newTo, setNewTo] = useState("");
  const [newReason, setNewReason] = useState<UnavailabilityReason | "">("");
  const [newNote, setNewNote] = useState("");

  // Sync local state from prop every time the sheet opens
  useEffect(() => {
    if (open) {
      setItems([...unavailabilities]);
      setShowForm(false);
      setNewFrom("");
      setNewTo("");
      setNewReason("");
      setNewNote("");
    }
  }, [open, unavailabilities]);

  const handleAdd = useCallback(() => {
    if (!newFrom) return;
    const endDate = newTo && newTo >= newFrom ? newTo : newFrom;
    // Expand range into individual day entries
    const newItems: Unavailability[] = [];
    const [sy, sm, sd] = newFrom.split("-").map(Number);
    const [ey, em, ed] = endDate.split("-").map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    const existing = new Set(items.map((i) => i.date));
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (existing.has(iso)) continue; // skip duplicates
      const item: Unavailability = { date: iso };
      if (newReason) item.reason = newReason;
      if (newNote.trim()) item.note = newNote.trim();
      newItems.push(item);
    }
    setItems((prev) => [...prev, ...newItems].sort((a, b) => a.date.localeCompare(b.date)));
    setNewFrom("");
    setNewTo("");
    setNewReason("");
    setNewNote("");
    setShowForm(false);
  }, [newFrom, newTo, newReason, newNote, items]);

  const handleSave = useCallback(() => {
    onSave(items);
  }, [items, onSave]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>{t("unavailability.title")}</SheetTitle>
          <SheetDescription className="sr-only">
            {t("unavailability.title")}
          </SheetDescription>
        </SheetHeader>

        <div className="zn-punavail">
          {/* Existing items */}
          {items.length === 0 && !showForm && (
            <p className="zn-punavail__empty">{t("unavailability.empty")}</p>
          )}

          {groupConsecutive(items).map((group) => (
            <div key={group.from} className="zn-punavail__row">
              <span className="zn-punavail__date">
                {group.from === group.to ? group.from : `${group.from} → ${group.to}`}
              </span>
              {group.reason && (
                <span className="zn-kicker zn-kicker--inline">
                  {reasonLabel(group.reason, t)}
                </span>
              )}
              {group.note && (
                <span className="zn-punavail__note zn-truncate">{group.note}</span>
              )}
              <Button
                variant="ghost"
                size="icon-sm"
                className="zn-push"
                onClick={() => {
                  // Remove all days in this group
                  setItems((prev) => prev.filter((i) => i.date < group.from || i.date > group.to));
                }}
                title={t("unavailability.delete")}
                aria-label={t("unavailability.delete")}
              >
                <Trash2 size={16} />
              </Button>
            </div>
          ))}

          {/* Add form */}
          {showForm && (
            <div className="zn-punavail__form">
              <div className="zn-punavail__pair">
                <div>
                  <label htmlFor="unavail-from" className="zn-kicker zn-kicker--inline zn-plabel">
                    {t("unavailability.from")}
                  </label>
                  <DateInput
                    id="unavail-from"
                    value={newFrom}
                    onChange={(e) => {
                      setNewFrom(e.target.value);
                      // Auto-set "to" if empty or before "from"
                      if (!newTo || e.target.value > newTo) setNewTo(e.target.value);
                    }}
                  />
                </div>
                <div>
                  <label htmlFor="unavail-to" className="zn-kicker zn-kicker--inline zn-plabel">
                    {t("unavailability.to")}
                  </label>
                  <DateInput
                    id="unavail-to"
                    value={newTo}
                    min={newFrom}
                    onChange={(e) => setNewTo(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="unavail-reason" className="zn-kicker zn-kicker--inline zn-plabel">
                  {t("unavailability.reason")}
                </label>
                <select
                  id="unavail-reason"
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value as UnavailabilityReason | "")}
                  className="zn-pfield"
                >
                  <option value="">-</option>
                  {REASONS.map((r) => (
                    <option key={r} value={r}>
                      {reasonLabel(r, t)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="unavail-note" className="zn-kicker zn-kicker--inline zn-plabel">
                  {t("unavailability.note")}
                </label>
                <input
                  id="unavail-note"
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="zn-pfield"
                />
              </div>
              <div className="zn-punavail__actions">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                >
                  {t("view.cancel")}
                </Button>
                <Button
                  size="sm"
                  disabled={!newFrom}
                  onClick={handleAdd}
                >
                  {t("unavailability.add")}
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div
            className="zn-punavail__actions"
            data-align={showForm ? undefined : "split"}
          >
            {!showForm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowForm(true)}
              >
                <Plus size={16} />
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
