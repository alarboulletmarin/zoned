import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { X, Search, Clock, Loader2, Heart } from "@/components/icons";
import { loadAllWorkouts } from "@/data/workouts";
import { useFavorites } from "@/hooks";
import type { WorkoutTemplate, WorkoutCategory, SessionType } from "@/types";

// ── Color map (same as PlanCalendar) ──────────────────────────────

const SESSION_COLORS: Record<string, string> = {
  recovery: "#94a3b8",
  endurance: "#60a5fa",
  long_run: "#2563eb",
  tempo: "#eab308",
  threshold: "#f97316",
  vo2max: "#ef4444",
  speed: "#f87171",
  fartlek: "#a855f7",
  hills: "#22c55e",
  race_specific: "#f59e0b",
};

// ── Category to sessionType mapping for filter dots ───────────────

const CATEGORY_SESSION_TYPE: Record<string, SessionType> = {
  recovery: "recovery",
  endurance: "endurance",
  tempo: "tempo",
  threshold: "threshold",
  vma_intervals: "vo2max",
  long_run: "long_run",
  hills: "hills",
  fartlek: "fartlek",
  race_pace: "race_specific",
  mixed: "endurance",
  assessment: "endurance",
};

// ── Filter definitions ────────────────────────────────────────────

interface FilterDef {
  key: string;
  labelFr: string;
  labelEn: string;
  categories: WorkoutCategory[];
  dotColor: string;
}

const FILTERS: FilterDef[] = [
  { key: "all", labelFr: "Tous", labelEn: "All", categories: [], dotColor: "" },
  { key: "endurance", labelFr: "Endurance", labelEn: "Endurance", categories: ["endurance"], dotColor: SESSION_COLORS.endurance },
  { key: "long_run", labelFr: "Sortie longue", labelEn: "Long Run", categories: ["long_run"], dotColor: SESSION_COLORS.long_run },
  { key: "tempo", labelFr: "Tempo", labelEn: "Tempo", categories: ["tempo"], dotColor: SESSION_COLORS.tempo },
  { key: "threshold", labelFr: "Seuil", labelEn: "Threshold", categories: ["threshold"], dotColor: SESSION_COLORS.threshold },
  { key: "vo2max", labelFr: "VMA", labelEn: "VO2max", categories: ["vma_intervals"], dotColor: SESSION_COLORS.vo2max },
  { key: "fartlek", labelFr: "Fartlek", labelEn: "Fartlek", categories: ["fartlek"], dotColor: SESSION_COLORS.fartlek },
  { key: "hills", labelFr: "C\u00f4tes", labelEn: "Hills", categories: ["hills"], dotColor: SESSION_COLORS.hills },
  { key: "race_pace", labelFr: "Allure course", labelEn: "Race Pace", categories: ["race_pace"], dotColor: SESSION_COLORS.race_specific },
  { key: "recovery", labelFr: "R\u00e9cup\u00e9ration", labelEn: "Recovery", categories: ["recovery"], dotColor: SESSION_COLORS.recovery },
  { key: "mixed", labelFr: "Mixte", labelEn: "Mixed", categories: ["mixed", "assessment"], dotColor: "#9ca3af" },
  { key: "cross_training", labelFr: "Activités", labelEn: "Activities", categories: [], dotColor: "#6b7280" },
];

interface CrossTrainingItem {
  id: string;
  type: string;
  labelFr: string;
  labelEn: string;
  defaultDuration: number;
}

const CROSS_TRAINING_ITEMS: CrossTrainingItem[] = [
  { id: "ct-strength", type: "strength", labelFr: "Renforcement musculaire", labelEn: "Strength Training", defaultDuration: 0 },
  { id: "ct-cycling", type: "cycling", labelFr: "Vélo", labelEn: "Cycling", defaultDuration: 0 },
  { id: "ct-swimming", type: "swimming", labelFr: "Natation", labelEn: "Swimming", defaultDuration: 0 },
  { id: "ct-yoga", type: "yoga", labelFr: "Yoga / Stretching", labelEn: "Yoga / Stretching", defaultDuration: 0 },
  { id: "ct-rest", type: "rest", labelFr: "Repos actif", labelEn: "Active Rest", defaultDuration: 0 },
];

// ── Props ─────────────────────────────────────────────────────────

interface PlanWorkoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isEn: boolean;
  /** Render as inline content (no fixed positioning) — used on desktop/tablet */
  inline?: boolean;
  /** Mobile: tap a workout to select it, then tap a calendar cell to place it */
  onSelectWorkout?: (workoutId: string) => void;
}

// ── Component ─────────────────────────────────────────────────────

export function PlanWorkoutPanel({ isOpen, onClose, isEn, inline, onSelectWorkout }: PlanWorkoutPanelProps) {
  const [allWorkouts, setAllWorkouts] = useState<WorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { favorites } = useFavorites();

  // Touch drag refs for mobile

  // Mobile bottom sheet drag-to-close refs
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const sheetDragStartY = useRef<number | null>(null);
  const sheetDragCurrentY = useRef<number | null>(null);

  // Load workouts when panel opens
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    loadAllWorkouts().then((workouts) => {
      setAllWorkouts(workouts);
      setIsLoading(false);
    });
  }, [isOpen]);

  // Filter + search
  const filteredWorkouts = useMemo(() => {
    const filterDef = FILTERS.find(f => f.key === activeFilter);
    return allWorkouts
      .filter(w => {
        if (favoritesOnly && !favorites.includes(w.id)) return false;
        if (activeFilter === "all") return true;
        return filterDef?.categories.includes(w.category) ?? true;
      })
      .filter(w => {
        if (!search) return true;
        const name = isEn ? w.nameEn : w.name;
        const desc = isEn ? w.descriptionEn : w.description;
        const q = search.toLowerCase();
        return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
      })
      .slice(0, 20);
  }, [allWorkouts, activeFilter, search, isEn, favoritesOnly, favorites]);

  // ── Desktop drag handlers ────────────────────────────────────

  const handleDragStart = useCallback(
    (e: React.DragEvent, workout: WorkoutTemplate) => {
      e.dataTransfer.effectAllowed = "copyMove";
      e.dataTransfer.setData("workout-id", workout.id);
    },
    [],
  );


  // ── Mobile bottom sheet drag-to-close ────────────────────────

  const handleSheetDragStart = useCallback((e: React.TouchEvent) => {
    // Only start sheet-drag from the handle bar area
    const target = e.target as HTMLElement;
    if (!target.closest("[data-sheet-handle]")) return;
    sheetDragStartY.current = e.touches[0].clientY;
    sheetDragCurrentY.current = e.touches[0].clientY;
  }, []);

  const handleSheetDragMove = useCallback((e: React.TouchEvent) => {
    if (sheetDragStartY.current === null) return;
    sheetDragCurrentY.current = e.touches[0].clientY;
    const delta = sheetDragCurrentY.current - sheetDragStartY.current;
    if (delta > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`;
    }
  }, []);

  const handleSheetDragEnd = useCallback(() => {
    if (sheetDragStartY.current === null || sheetDragCurrentY.current === null) return;
    const delta = sheetDragCurrentY.current - sheetDragStartY.current;
    sheetDragStartY.current = null;
    sheetDragCurrentY.current = null;

    if (sheetRef.current) {
      sheetRef.current.style.transform = "";
    }

    // Close if dragged down more than 100px
    if (delta > 100) {
      onClose();
    }
  }, [onClose]);

  // ── Don't render if closed ───────────────────────────────────

  if (!isOpen) return null;

  const panelContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
        <h3 className="font-semibold text-sm">
          {isEn ? "Add a workout" : "Ajouter une s\u00e9ance"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md hover:bg-muted transition-colors"
          aria-label={isEn ? "Close" : "Fermer"}
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Hint */}
      <div className="px-4 py-2 border-b shrink-0 bg-primary/5">
        <p className="text-xs text-muted-foreground text-center">
          {inline
            ? onSelectWorkout
              ? (isEn ? "Click a workout to add it to your plan" : "Cliquez sur une séance pour l'ajouter à votre plan")
              : (isEn ? "Drag a workout onto the calendar to add it" : "Glissez une séance sur le calendrier pour l'ajouter")
            : (isEn ? "Tap a workout to add it" : "Appuyez sur une séance pour l'ajouter")}
        </p>
      </div>

      {/* Search */}
      <div className="px-4 py-2 border-b shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isEn ? "Search workouts..." : "Rechercher une s\u00e9ance..."}
            className="w-full rounded-md border bg-background pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Category filter + favorites toggle */}
      <div className="px-4 py-2 border-b shrink-0 flex items-center gap-2">
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {FILTERS.map((f) => (
            <option key={f.key} value={f.key}>
              {isEn ? f.labelEn : f.labelFr}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setFavoritesOnly(v => !v)}
          className={cn(
            "shrink-0 size-9 rounded-md border flex items-center justify-center transition-colors",
            favoritesOnly
              ? "bg-primary/10 border-primary text-primary"
              : "border-input text-muted-foreground hover:text-foreground"
          )}
          title={isEn ? "Favorites only" : "Favoris uniquement"}
        >
          <Heart className={cn("size-4", favoritesOnly && "fill-primary")} />
        </button>
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto min-h-0 px-3 py-2 space-y-1.5">
        {activeFilter === "cross_training" ? (
          <div className="space-y-1.5">
            {CROSS_TRAINING_ITEMS.map((item) => (
              <div
                key={item.id}
                draggable={!!inline}
                onDragStart={inline ? (e) => {
                  e.dataTransfer.effectAllowed = "copyMove";
                  e.dataTransfer.setData("workout-id", `__activity_${item.type}__`);
                } : undefined}
                onClick={() => {
                  if (onSelectWorkout) {
                    onSelectWorkout(`__activity_${item.type}__`);
                  }
                  if (!inline) onClose();
                }}
                className={cn(
                  inline ? "cursor-grab active:cursor-grabbing" : "cursor-pointer active:scale-95",
                  "rounded-lg border bg-card p-2.5 hover:bg-accent/50 transition-all select-none"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full shrink-0 bg-muted-foreground/40" />
                  <span className="text-xs font-medium">
                    {isEn ? item.labelEn : item.labelFr}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <p className="text-sm text-muted-foreground">
              {favoritesOnly
                ? (isEn ? "No favorite workouts yet" : "Aucune séance en favoris")
                : (isEn ? "No matching workouts" : "Aucune séance correspondante")}
            </p>
            {favoritesOnly && (
              <p className="text-xs text-muted-foreground/60">
                {isEn
                  ? "Add workouts to favorites from the library first"
                  : "Ajoutez d'abord des séances en favoris depuis la bibliothèque"}
              </p>
            )}
          </div>
        ) : (
          filteredWorkouts.map((workout) => {
            const sessionType = CATEGORY_SESSION_TYPE[workout.category] || "endurance";
            const dotColor = SESSION_COLORS[sessionType] || "#9ca3af";
            const name = isEn ? workout.nameEn : workout.name;

            return (
              <div
                key={workout.id}
                data-workout-id={workout.id}
                draggable={!!inline}
                onDragStart={inline ? (e) => handleDragStart(e, workout) : undefined}
                onClick={!inline && onSelectWorkout ? () => {
                  onSelectWorkout(workout.id);
                  onClose();
                } : undefined}
                className={cn(
                  inline
                    ? "cursor-grab active:cursor-grabbing"
                    : "cursor-pointer active:scale-95",
                  "rounded-lg border bg-card p-2.5",
                  "hover:bg-accent/50 transition-all select-none",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className="size-2 rounded-full shrink-0"
                        style={{ backgroundColor: dotColor }}
                      />
                      <span className="text-xs font-medium truncate block">
                        {name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="capitalize">
                        {isEn
                          ? (FILTERS.find(f => f.categories.includes(workout.category))?.labelEn || workout.category)
                          : (FILTERS.find(f => f.categories.includes(workout.category))?.labelFr || workout.category)}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Clock className="size-2.5" />
                        {workout.typicalDuration.min}-{workout.typicalDuration.max}min
                      </span>
                    </div>
                  </div>
                  {/* Drag hint */}
                  <div className="text-muted-foreground/40 shrink-0 mt-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <circle cx="9" cy="5" r="2" />
                      <circle cx="15" cy="5" r="2" />
                      <circle cx="9" cy="12" r="2" />
                      <circle cx="15" cy="12" r="2" />
                      <circle cx="9" cy="19" r="2" />
                      <circle cx="15" cy="19" r="2" />
                    </svg>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );

  // Inline mode: render content directly (used in desktop flex layout)
  if (inline) {
    return (
      <div className="bg-card border rounded-xl flex flex-col h-[calc(100vh-10rem)] overflow-hidden">
        {panelContent}
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile (<md): Bottom sheet ── */}
      <>
        {/* Backdrop */}
        <div
          className={cn(
            "md:hidden fixed inset-0 z-20",
            "bg-black/20",
            "transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          onClick={onClose}
        />
        {/* Sheet */}
        <div
          ref={sheetRef}
          onTouchStart={handleSheetDragStart}
          onTouchMove={handleSheetDragMove}
          onTouchEnd={handleSheetDragEnd}
          className={cn(
            "md:hidden fixed bottom-0 left-0 right-0 z-30",
            "bg-background rounded-t-2xl shadow-2xl",
            "flex flex-col",
            "transition-transform duration-300",
            isOpen ? "translate-y-0" : "translate-y-full",
          )}
          style={{ height: "60vh" }}
        >
          {/* Drag handle */}
          <div
            data-sheet-handle
            className="flex justify-center pt-2 pb-1 cursor-grab shrink-0"
          >
            <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
          </div>
          {panelContent}
        </div>
      </>
    </>
  );
}
