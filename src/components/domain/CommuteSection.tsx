import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";
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
 * Commute (vélotaf) settings — a recurring pattern (weekdays + duration) that
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
        <CardTitle className="flex items-center gap-2">
          <Route className="size-5" />
          {t("commute.title")}
        </CardTitle>
        <CardDescription>{t("commute.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Discipline */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("commute.discipline")}
          </label>
          <Select
            value={discipline}
            onValueChange={(v) => setDiscipline(v as CommuteDiscipline)}
          >
            <SelectTrigger className="max-w-xs">
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
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("commute.daysOfWeek")}
          </label>
          <div className="flex flex-wrap gap-2">
            {DAY_KEYS.map((key, index) => {
              const selected = days.has(index);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleDay(index)}
                  className={cn(
                    "rounded-md border px-3 py-2 text-sm font-medium transition-colors min-w-[52px]",
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-input bg-background hover:bg-muted",
                  )}
                >
                  {t(`commute.${key}`)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <label htmlFor="commuteDuration" className="text-sm font-medium">
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
            className="flex h-10 w-32 rounded-md border border-input bg-transparent px-3 py-1 text-center text-base tabular-nums shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <p className="text-xs text-muted-foreground">
            {t("commute.durationHint")}
          </p>
        </div>

        {/* Include in plan */}
        <div className="flex items-start gap-3">
          <input
            id="commuteInclude"
            type="checkbox"
            checked={includeInPlan}
            onChange={(e) => setIncludeInPlan(e.target.checked)}
            className="mt-1 size-4 rounded border-input accent-primary"
          />
          <div className="flex-1">
            <label
              htmlFor="commuteInclude"
              className="text-sm font-medium cursor-pointer"
            >
              {t("commute.includeInPlan")}
            </label>
            <p className="text-xs text-muted-foreground">
              {t("commute.includeInPlanHint")}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleSave} disabled={!canSave}>
            <Save className="size-4" />
            {t("commute.save")}
          </Button>
          {hasStored && (
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="size-4" />
              {t("commute.delete")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
