import { useState, useEffect, useMemo } from "react";
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

interface SwapSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentWorkoutId: string;
  sessionType: string;
  onSelect: (workout: WorkoutTemplate) => void;
  isEn: boolean;
}

const SESSION_TYPE_LABELS: Record<string, { fr: string; en: string }> = {
  recovery: { fr: "R\u00e9cup\u00e9ration", en: "Recovery" },
  endurance: { fr: "Endurance", en: "Endurance" },
  tempo: { fr: "Tempo", en: "Tempo" },
  threshold: { fr: "Seuil", en: "Threshold" },
  vo2max: { fr: "VO2max", en: "VO2max" },
  speed: { fr: "Vitesse", en: "Speed" },
  long_run: { fr: "Sortie longue", en: "Long Run" },
  hills: { fr: "C\u00f4tes", en: "Hills" },
  fartlek: { fr: "Fartlek", en: "Fartlek" },
  race_specific: { fr: "Allure course", en: "Race Specific" },
  intervals: { fr: "Intervalles", en: "Intervals" },
  mixed: { fr: "Mixte", en: "Mixed" },
  technique: { fr: "Technique", en: "Technique" },
  "warm-up": { fr: "\u00c9chauffement", en: "Warm-up" },
};

export function SwapSessionDialog({ open, onOpenChange, currentWorkoutId, sessionType, onSelect, isEn }: SwapSessionDialogProps) {
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
        const name = isEn ? w.nameEn : w.name;
        return name.toLowerCase().includes(search.toLowerCase());
      })
      .slice(0, 30);
  }, [allWorkouts, currentWorkoutId, filterType, search, isEn]);

  const availableTypes = useMemo(() => {
    const types = new Set(allWorkouts.map(w => w.sessionType));
    return [...types].sort();
  }, [allWorkouts]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEn ? "Replace session" : "Remplacer la s\u00e9ance"}
          </DialogTitle>
          <DialogDescription>
            {isEn ? "Choose a workout from the library" : "Choisissez une s\u00e9ance dans la biblioth\u00e8que"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {/* Search */}
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isEn ? "Search workouts..." : "Rechercher une s\u00e9ance..."}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {/* Type filter */}
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
            >
              {isEn ? "All" : "Tous"}
            </Button>
            {/* Show a "Same type" quick filter */}
            <Button
              variant={filterType === sessionType ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType(sessionType)}
            >
              {SESSION_TYPE_LABELS[sessionType]
                ? (isEn ? SESSION_TYPE_LABELS[sessionType].en : SESSION_TYPE_LABELS[sessionType].fr)
                : sessionType}
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
                  {SESSION_TYPE_LABELS[type]
                    ? (isEn ? SESSION_TYPE_LABELS[type].en : SESSION_TYPE_LABELS[type].fr)
                    : type}
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
              {isEn ? "No matching workouts" : "Aucune s\u00e9ance correspondante"}
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
                        {isEn ? workout.nameEn : workout.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {workout.typicalDuration.min}-{workout.typicalDuration.max} min
                      </p>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-xs">
                      {label ? (isEn ? label.en : label.fr) : workout.sessionType}
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
