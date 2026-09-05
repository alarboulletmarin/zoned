import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { loadAllWorkouts } from "@/data/workouts";
import type { WorkoutTemplate } from "@/types";
import { SESSION_TYPE_LABELS } from "@/lib/labels";
import { usePickLang, usePickLocale } from "@/lib/i18n-utils";

interface SwapSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentWorkoutId: string;
  sessionType: string;
  onSelect: (workout: WorkoutTemplate) => void;
}

export function SwapSessionDialog({ open, onOpenChange, currentWorkoutId, sessionType, onSelect }: SwapSessionDialogProps) {
  const { t } = useTranslation("common");
  const pick = usePickLang();
  const pickLocale = usePickLocale();
  const [allWorkouts, setAllWorkouts] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    loadAllWorkouts().then((workouts) => {
      setAllWorkouts(workouts);
      setIsLoading(false);
    });
  }, [open]);

  const filteredWorkouts = useMemo(() => {
    return allWorkouts
      .filter(w => w.id !== currentWorkoutId)
      .filter(w => filterType === "all" || w.sessionType === filterType)
      .filter(w => {
        if (!search) return true;
        const name = pick(w, "name");
        return name.toLowerCase().includes(search.toLowerCase());
      })
      .slice(0, 30);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allWorkouts, currentWorkoutId, filterType, search, pick]);

  const availableTypes = useMemo(() => {
    const types = new Set(allWorkouts.map(w => w.sessionType));
    return [...types].sort();
  }, [allWorkouts]);

  /** The chosen filter is the accent as a stroke, never as a second fill. */
  const filterVariant = (value: string) =>
    filterType === value ? "outline-primary" : "outline";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="zn-pdialog--list">
        <DialogHeader>
          <DialogTitle>
            {t("plans.replaceSession")}
          </DialogTitle>
          <DialogDescription>
            {t("plans.chooseFromLibrary")}
          </DialogDescription>
        </DialogHeader>

        <div className="zn-ppick">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("plans.searchWorkouts")}
            className="zn-pfield"
          />

          <div className="zn-ppick__filters">
            <Button
              variant={filterVariant("all")}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              {t("plans.all")}
            </Button>
            {/* Show a "Same type" quick filter */}
            <Button
              variant={filterVariant(sessionType)}
              size="sm"
              onClick={() => setFilterType(sessionType)}
            >
              {pickLocale(SESSION_TYPE_LABELS[sessionType], sessionType)}
            </Button>
            {availableTypes
              .filter(type => type !== sessionType)
              .map(type => (
                <Button
                  key={type}
                  variant={filterVariant(type)}
                  size="sm"
                  onClick={() => setFilterType(type)}
                >
                  {pickLocale(SESSION_TYPE_LABELS[type], type)}
                </Button>
              ))}
          </div>

          {isLoading ? (
            <div className="zn-ppick__wait">
              <Spinner />
            </div>
          ) : filteredWorkouts.length === 0 ? (
            <p className="zn-ppick__empty">{t("plans.noMatchingWorkouts")}</p>
          ) : (
            <ul className="zn-ppick__list">
              {filteredWorkouts.map((workout) => (
                <li key={workout.id}>
                  <button
                    type="button"
                    className="zn-ppick__item"
                    onClick={() => onSelect(workout)}
                  >
                    <span className="zn-ppick__text">
                      <span className="zn-ppick__name">
                        {pick(workout, "name")}
                      </span>
                      <span className="zn-ppick__meta">
                        {workout.typicalDuration.min}-{workout.typicalDuration.max} min
                      </span>
                    </span>
                    <Badge variant="outline">
                      {pickLocale(SESSION_TYPE_LABELS[workout.sessionType], workout.sessionType)}
                    </Badge>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
