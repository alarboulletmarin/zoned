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
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "@/components/icons";
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {t("plans.replaceSession")}
          </DialogTitle>
          <DialogDescription>
            {t("plans.chooseFromLibrary")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("plans.searchWorkouts")}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Type filter */}
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              {t("plans.all")}
            </Button>
            {/* Show a "Same type" quick filter */}
            <Button
              variant={filterType === sessionType ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(sessionType)}
            >
              {pickLocale(SESSION_TYPE_LABELS[sessionType], sessionType)}
            </Button>
            {availableTypes
              .filter(t => t !== sessionType)
              .map(type => (
                <Button
                  key={type}
                  variant={filterType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType(type)}
                >
                  {pickLocale(SESSION_TYPE_LABELS[type], type)}
                </Button>
              ))}
          </div>
        </div>

        {/* Workout list */}
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0 mt-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredWorkouts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("plans.noMatchingWorkouts")}
            </p>
          ) : (
            filteredWorkouts.map((workout) => {
              const label = SESSION_TYPE_LABELS[workout.sessionType];
              return (
                <Card
                  key={workout.id}
                  interactive
                  className="cursor-pointer"
                  onClick={() => onSelect(workout)}
                >
                  <CardContent className="p-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {pick(workout, "name")}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {workout.typicalDuration.min}-{workout.typicalDuration.max} min
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {pickLocale(label, workout.sessionType)}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
