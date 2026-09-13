import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Route, Save, Trash2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  clearCommutePattern,
  loadCommutePattern,
  saveCommutePattern,
} from "@/lib/athleteProfile";
import type { CommutePattern } from "@/types/athlete-profile";

type CommuteDiscipline = CommutePattern["discipline"];

const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

/**
 * Commute (vélotaf) settings, a recurring pattern (weekdays + duration) that
 * the athlete does independently of their plan. When "include in plan" is on
 * the generator will later reduce easy volume to account for the load; when
 * off it simply shows as context next to weekly stats.
 */
export function CommuteSection() {
  const { t } = useTranslation("profile");
  const [discipline, setDiscipline] = useState<CommuteDiscipline>("cycling");
  const [days, setDays] = useState<Set<number>>(() => new Set());
  const [durationMin, setDurationMin] = useState<string>("");
  const [includeInPlan, setIncludeInPlan] = useState(false);
  const [hasStored, setHasStored] = useState(false);

  useEffect(() => {
    const existing = loadCommutePattern();
    if (!existing) return;
    setDiscipline(existing.discipline);
    setDays(new Set(existing.daysOfWeek));
    setDurationMin(String(existing.durationMin));
    setIncludeInPlan(existing.includeInPlan);
    setHasStored(true);
  }, []);

  const toggleDay = (dayIndex: number) => {
    setDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayIndex)) next.delete(dayIndex);
      else next.add(dayIndex);
      return next;
    });
  };

  const handleDurationChange = (value: string) => {
    if (value === "") {
      setDurationMin("");
      return;
    }
    const num = parseInt(value, 10);
    if (Number.isNaN(num) || num < 0) return;
    if (num > 240) {
      setDurationMin("240");
      return;
    }
    setDurationMin(String(num));
  };

  const parsedDuration = durationMin === "" ? 0 : parseInt(durationMin, 10);
  const canSave = days.size > 0 && parsedDuration > 0 && parsedDuration <= 240;

  const handleSave = () => {
    if (!canSave) {
      toast.error(t("commute.invalid"));
      return;
    }
    const ok = saveCommutePattern({
      version: 1,
      discipline,
      daysOfWeek: Array.from(days),
      durationMin: parsedDuration,
      includeInPlan,
      updatedAt: "",
    });
    if (!ok) {
      toast.error(t("commute.invalid"));
      return;
    }
    setHasStored(true);
    toast.success(t("commute.saved"));
  };

  const handleDelete = () => {
    clearCommutePattern();
    setDays(new Set());
    setDurationMin("");
    setIncludeInPlan(false);
    setDiscipline("cycling");
    setHasStored(false);
    toast.success(t("commute.deleted"));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="zn-row" style={{ "--gap": "var(--sp-5)" } as CSSProperties}>
          <Route size={20} />
          {t("commute.title")}
        </CardTitle>
        <CardDescription>{t("commute.description")}</CardDescription>
      </CardHeader>
      <CardContent className="zn-stack" style={{ "--gap": "var(--sp-13)" } as CSSProperties}>
        {/* Discipline */}
        <div className="zn-stack" style={{ "--gap": "var(--sp-5)" } as CSSProperties}>
          <label className="zn-commute__label">
            {t("commute.discipline")}
          </label>
          <Select
            value={discipline}
            onValueChange={(v) => setDiscipline(v as CommuteDiscipline)}
          >
            <SelectTrigger className="zn-commute__select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cycling">
                {t("commute.disciplineCycling")}
              </SelectItem>
              <SelectItem value="running">
                {t("commute.disciplineRunning")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Days of week */}
        <div className="zn-stack" style={{ "--gap": "var(--sp-5)" } as CSSProperties}>
          <label className="zn-commute__label">
            {t("commute.daysOfWeek")}
          </label>
          <div className="zn-cluster">
            {DAY_KEYS.map((key, index) => {
              const selected = days.has(index);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleDay(index)}
                  aria-pressed={selected}
                  className="zn-commute__day"
                >
                  {t(`commute.${key}`)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration */}
        <div className="zn-stack" style={{ "--gap": "var(--sp-5)" } as CSSProperties}>
          <label htmlFor="commuteDuration" className="zn-commute__label">
            {t("commute.durationMin")}
          </label>
          <input
            id="commuteDuration"
            type="number"
            min={0}
            max={240}
            placeholder="30"
            value={durationMin}
            onChange={(e) => handleDurationChange(e.target.value)}
            className="zn-route-field zn-route-field--num"
            style={{ "--w": "112px" } as CSSProperties}
          />
          <p className="zn-commute__hint">
            {t("commute.durationHint")}
          </p>
        </div>

        {/* Include in plan */}
        <div className="zn-row zn-row--start">
          <input
            id="commuteInclude"
            type="checkbox"
            checked={includeInPlan}
            onChange={(e) => setIncludeInPlan(e.target.checked)}
            className="zn-commute__check"
          />
          <div className="zn-fill">
            <label
              htmlFor="commuteInclude"
              className="zn-commute__check-label"
            >
              {t("commute.includeInPlan")}
            </label>
            <p className="zn-commute__hint">
              {t("commute.includeInPlanHint")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="zn-cluster">
          <Button onClick={handleSave} disabled={!canSave}>
            <Save size={16} />
            {t("commute.save")}
          </Button>
          {hasStored && (
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 size={16} />
              {t("commute.delete")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
