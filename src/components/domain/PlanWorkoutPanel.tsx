import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { X, Search, Clock, Loader2, Heart, Dumbbell } from "@/components/icons";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { loadAllWorkouts } from "@/data/workouts";
import { loadAllStrengthSessions } from "@/data/strength";
import { getCustomWorkouts } from "@/lib/customWorkoutStorage";
import { useFavorites } from "@/hooks";
import { IntensityBadge } from "@/components/domain/IntensityBadge";
import type { WorkoutTemplate, WorkoutCategory, SessionType } from "@/types";
import type { StrengthWorkoutTemplate } from "@/types/strength";
import { usePickLang } from "@/lib/i18n-utils";
import { SESSION_COLORS, sessionColor } from "@/lib/sessionColors";

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
  categories: WorkoutCategory[];
  dotColor: string;
}

const FILTERS: FilterDef[] = [
  { key: "all", categories: [], dotColor: "" },
  { key: "endurance", categories: ["endurance"], dotColor: SESSION_COLORS.endurance },
  { key: "long_run", categories: ["long_run"], dotColor: SESSION_COLORS.long_run },
  { key: "tempo", categories: ["tempo"], dotColor: SESSION_COLORS.tempo },
  { key: "threshold", categories: ["threshold"], dotColor: SESSION_COLORS.threshold },
  { key: "vo2max", categories: ["vma_intervals"], dotColor: SESSION_COLORS.vo2max },
  { key: "fartlek", categories: ["fartlek"], dotColor: SESSION_COLORS.fartlek },
  { key: "hills", categories: ["hills"], dotColor: SESSION_COLORS.hills },
  { key: "race_pace", categories: ["race_pace"], dotColor: SESSION_COLORS.race_specific },
  { key: "recovery", categories: ["recovery"], dotColor: SESSION_COLORS.recovery },
  { key: "mixed", categories: ["mixed", "assessment"], dotColor: "#9ca3af" },
  { key: "strength", categories: [], dotColor: "#8b5cf6" },
  { key: "cross_training", categories: [], dotColor: "#6b7280" },
];

interface CrossTrainingItem {
  id: string;
  type: string;
  translationKey: string;
  defaultDuration: number;
}

const CROSS_TRAINING_ITEMS: CrossTrainingItem[] = [
  { id: "ct-cycling", type: "cycling", translationKey: "cycling", defaultDuration: 0 },
  { id: "ct-swimming", type: "swimming", translationKey: "swimming", defaultDuration: 0 },
  { id: "ct-yoga", type: "yoga", translationKey: "yoga", defaultDuration: 0 },
  { id: "ct-rest", type: "rest", translationKey: "rest", defaultDuration: 0 },
];

// ── Props ─────────────────────────────────────────────────────────

interface PlanWorkoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Render as inline content (no fixed positioning) — used on desktop/tablet */
  inline?: boolean;
  /** Mobile: tap a workout to select it, then tap a calendar cell to place it */
  onSelectWorkout?: (workoutId: string) => void;
}

// ── Component ─────────────────────────────────────────────────────

export function PlanWorkoutPanel({ isOpen, onClose, inline, onSelectWorkout }: PlanWorkoutPanelProps) {
  const { t } = useTranslation("plan");
  const { t: tStrength } = useTranslation("strength");
  const pick = usePickLang();
  const [allWorkouts, setAllWorkouts] = useState<WorkoutTemplate[]>([]);
  const [strengthSessions, setStrengthSessions] = useState<StrengthWorkoutTemplate[]>([]);
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

  // Load workouts and strength sessions when panel opens
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    Promise.all([
      loadAllWorkouts(),
      loadAllStrengthSessions(),
    ]).then(([workouts, strength]) => {
      setAllWorkouts([...workouts, ...getCustomWorkouts()]);
      setStrengthSessions(strength);
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
        const name = pick(w, "name");
        const desc = pick(w, "description");
        const q = search.toLowerCase();
        return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
      })
      .slice(0, 20);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allWorkouts, activeFilter, search, pick, favoritesOnly, favorites]);

  // Filter strength sessions by search and favorites
  const filteredStrength = useMemo(() => {
    if (activeFilter !== "strength") return [];
    return strengthSessions
      .filter(s => {
        if (favoritesOnly && !favorites.includes(s.id)) return false;
        return true;
      })
      .filter(s => {
        if (!search) return true;
        const name = pick(s, "name");
        const desc = pick(s, "description");
        const q = search.toLowerCase();
        return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
      })
      .slice(0, 20);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strengthSessions, activeFilter, search, pick, favoritesOnly, favorites]);

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
    <div className="zn-planpanel__body">
      {/* Header */}
      <div className="zn-planpanel__bar">
        <h3 className="zn-planpanel__title">{t("workoutPanel.title")}</h3>
        <button
          type="button"
          onClick={onClose}
          className="zn-planpanel__close"
          aria-label={t("workoutPanel.close")}
        >
          <X />
        </button>
      </div>

      {/* Hint */}
      <p className="zn-planpanel__hint">
        {inline
          ? onSelectWorkout
            ? t("workoutPanel.hintClick")
            : t("workoutPanel.hintDrag")
          : t("workoutPanel.hintTap")}
      </p>

      {/* Search */}
      <div className="zn-planpanel__search">
        <Search />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("workoutPanel.searchPlaceholder")}
          className="zn-planpanel__input"
        />
      </div>

      {/* Category filter + favorites toggle */}
      <div className="zn-planpanel__filters">
        <select
          value={activeFilter}
          onChange={(e) => setActiveFilter(e.target.value)}
          className="zn-planpanel__select"
        >
          {FILTERS.map((f) => (
            <option key={f.key} value={f.key}>
              {t(`workoutFilter.${f.key}`)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setFavoritesOnly(v => !v)}
          className="zn-planpanel__toggle"
          aria-pressed={favoritesOnly}
          title={t("workoutPanel.favoritesOnly")}
        >
          <Heart filled={favoritesOnly} />
        </button>
      </div>

      {/* Results list */}
      <div className="zn-planpanel__list">
        {activeFilter === "strength" ? (
          isLoading ? (
            <div className="zn-planpanel__state">
              <Loader2 className="zn-planpanel__loader" />
            </div>
          ) : filteredStrength.length === 0 ? (
            <div className="zn-planpanel__state">
              <p className="zn-body zn-body--sm zn-muted">
                {favoritesOnly
                  ? t("workoutPanel.noFavoriteStrength")
                  : t("workoutPanel.noMatchingStrength")}
              </p>
            </div>
          ) : (
            filteredStrength.map((session) => {
              const name = pick(session, "name");
              const muscles = session.primaryMuscleGroups
                .slice(0, 3)
                .map(m => tStrength(`muscles.${m}`))
                .join(", ");

              return (
                <div
                  key={session.id}
                  data-workout-id={session.id}
                  draggable={!!inline}
                  onDragStart={inline ? (e) => {
                    e.dataTransfer.effectAllowed = "copyMove";
                    e.dataTransfer.setData("workout-id", session.id);
                  } : undefined}
                  onClick={() => {
                    if (onSelectWorkout) {
                      onSelectWorkout(session.id);
                    }
                    if (!inline) onClose();
                  }}
                  className="zn-planpanel__item"
                  data-draggable={inline ? "true" : undefined}
                >
                  <div className="zn-planpanel__item-main">
                    <span className="zn-planpanel__item-name">{name}</span>
                    <span className="zn-planpanel__item-meta">
                      <Dumbbell />
                      <Clock />
                      {formatDurationMinutes(session.typicalDuration.min)}
                    </span>
                    <span className="zn-row" style={{ "--gap": "var(--sp-4)" } as React.CSSProperties}>
                      <IntensityBadge intensity={session.intensity} size="sm" />
                      <span className="zn-planpanel__item-sub">
                        {tStrength(`categories.${session.category}`)}
                      </span>
                    </span>
                    {muscles && (
                      <span className="zn-planpanel__item-sub">{muscles}</span>
                    )}
                  </div>
                  {/* Drag hint */}
                  <span className="zn-planpanel__grab">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <circle cx="9" cy="5" r="2" />
                      <circle cx="15" cy="5" r="2" />
                      <circle cx="9" cy="12" r="2" />
                      <circle cx="15" cy="12" r="2" />
                      <circle cx="9" cy="19" r="2" />
                      <circle cx="15" cy="19" r="2" />
                    </svg>
                  </span>
                </div>
              );
            })
          )
        ) : activeFilter === "cross_training" ? (
          <>
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
                className="zn-planpanel__item"
                data-draggable={inline ? "true" : undefined}
              >
                {/* No aerobic zone behind a cross-training slot: the mark stays
                    hollow rather than borrowing a colour it has no claim to. */}
                <span className="zn-sess__dot" />
                <span className="zn-planpanel__item-name">
                  {t(`crossTraining.${item.translationKey}`)}
                </span>
              </div>
            ))}
          </>
        ) : isLoading ? (
          <div className="zn-planpanel__state">
            <Loader2 className="zn-planpanel__loader" />
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <div className="zn-planpanel__state">
            <p className="zn-body zn-body--sm zn-muted">
              {favoritesOnly
                ? t("workoutPanel.noFavorites")
                : t("workoutPanel.noMatching")}
            </p>
            {favoritesOnly && (
              <p className="zn-caption zn-faint">
                {t("workoutPanel.favoritesHint")}
              </p>
            )}
          </div>
        ) : (
          filteredWorkouts.map((workout) => {
            const sessionType = CATEGORY_SESSION_TYPE[workout.category] || "endurance";
            const name = pick(workout, "name");

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
                className="zn-planpanel__item"
                data-draggable={inline ? "true" : undefined}
              >
                {/* The zone ink, straight off lib/sessionColors.ts. */}
                <span
                  className="zn-sess__dot"
                  style={{ "--zn-dot": sessionColor(sessionType) } as React.CSSProperties}
                />
                <div className="zn-planpanel__item-main">
                  <span className="zn-planpanel__item-name">{name}</span>
                  <span className="zn-planpanel__item-meta">
                    <span>
                      {(() => {
                        const filterKey = FILTERS.find(f => f.categories.includes(workout.category))?.key;
                        return filterKey ? t(`workoutFilter.${filterKey}`) : workout.category;
                      })()}
                    </span>
                    <Clock />
                    {formatDurationMinutes(workout.typicalDuration.min)}-{formatDurationMinutes(workout.typicalDuration.max)}
                  </span>
                </div>
                {/* Drag hint */}
                <span className="zn-planpanel__grab">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <circle cx="9" cy="5" r="2" />
                    <circle cx="15" cy="5" r="2" />
                    <circle cx="9" cy="12" r="2" />
                    <circle cx="15" cy="12" r="2" />
                    <circle cx="9" cy="19" r="2" />
                    <circle cx="15" cy="19" r="2" />
                  </svg>
                </span>
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
      <div className="zn-planpanel" data-mode="inline">
        {panelContent}
      </div>
    );
  }

  return (
    <>
      {/* ── Mobile (<md): Bottom sheet ── */}
      <>
        {/* Backdrop */}
        <div className="zn-planpanel__scrim" onClick={onClose} />
        {/* Sheet */}
        <div
          ref={sheetRef}
          onTouchStart={handleSheetDragStart}
          onTouchMove={handleSheetDragMove}
          onTouchEnd={handleSheetDragEnd}
          className="zn-planpanel"
          data-mode="sheet"
          data-open={isOpen}
        >
          {/* Drag handle */}
          <div data-sheet-handle className="zn-planpanel__grip" />
          {panelContent}
        </div>
      </>
    </>
  );
}
