import { useState, useEffect, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { X, Search, Clock, Loader2, Heart, Dumbbell, Plus } from "@/components/icons";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { loadAllWorkouts, loadDisciplineWorkouts } from "@/data/workouts";
import { loadAllStrengthSessions } from "@/data/strength";
import { getCustomWorkouts, isCustomWorkoutId } from "@/lib/customWorkoutStorage";
import { useFavorites } from "@/hooks";
import { IntensityBadge } from "@/components/domain/IntensityBadge";
import { useScrollLock } from "@/components/ui/native-dialog";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useSheetDrag } from "@/hooks/useSheetDrag";
import type { WorkoutTemplate, WorkoutCategory, SessionType } from "@/types";
import type { StrengthWorkoutTemplate } from "@/types/strength";
import { usePickLang } from "@/lib/i18n-utils";
import { sessionColor } from "@/lib/sessionColors";
import { PANEL_ACTIVITY_KINDS, activityWorkoutId } from "@/lib/activitySession";
import { loadCommutePattern } from "@/lib/athleteProfile";

// ── Category to sessionType mapping for the zone dots ─────────────

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

/** The fine-grained name printed under a session (Seuil, VMA, Côtes…). */
const CATEGORY_LABEL_KEY: Record<string, string> = {
  endurance: "endurance",
  long_run: "long_run",
  tempo: "tempo",
  threshold: "threshold",
  vma_intervals: "vo2max",
  fartlek: "fartlek",
  hills: "hills",
  race_pace: "race_pace",
  recovery: "recovery",
  mixed: "mixed",
  assessment: "mixed",
};

// ── The groups: every catalog, one chip each ──────────────────────

/**
 * Coarser than the categories, on purpose: someone building a week thinks
 * "a footing, a quality session, the long one", not "threshold or tempo".
 * The fine name stays printed on each item. Cycling and swimming get their
 * own chips because their catalogs could not be reached from here at all,
 * and "mine" is the door back to what the builder produced.
 */
type Group =
  | "all"
  | "easy"
  | "quality"
  | "long"
  | "strength"
  | "cycling"
  | "swimming"
  | "activities"
  | "mine";

const GROUPS: Group[] = [
  "all",
  "easy",
  "quality",
  "long",
  "strength",
  "cycling",
  "swimming",
  "activities",
  "mine",
];

const GROUP_CATEGORIES: Partial<Record<Group, WorkoutCategory[]>> = {
  easy: ["recovery", "endurance", "mixed", "assessment"],
  quality: ["tempo", "threshold", "vma_intervals", "fartlek", "hills", "race_pace"],
  long: ["long_run"],
};

const DAYS = [0, 1, 2, 3, 4, 5, 6] as const;

// ── Props ─────────────────────────────────────────────────────────

interface PlanWorkoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  /** Render as inline content (no fixed positioning), used on desktop/tablet */
  inline?: boolean;
  /** Mobile: tap a workout to select it, then tap a calendar cell to place it */
  onSelectWorkout?: (workoutId: string) => void;
  /**
   * The day a tapped session lands on. With `onDayChange`, the panel shows
   * the seven days so the day can be picked from the panel itself, which is
   * what the dock's "add a session" needs: it opens without a day chosen.
   */
  day?: number;
  onDayChange?: (day: number) => void;
  /** The door to the builder: a session made to the minute, placed on `day`. */
  onCreateWorkout?: () => void;
}

// ── Component ─────────────────────────────────────────────────────

export function PlanWorkoutPanel({
  isOpen,
  onClose,
  inline,
  onSelectWorkout,
  day,
  onDayChange,
  onCreateWorkout,
}: PlanWorkoutPanelProps) {
  const { t } = useTranslation("plan");
  const { t: tStrength } = useTranslation("strength");
  const { t: tLibrary } = useTranslation("library");
  const pick = usePickLang();
  const [allWorkouts, setAllWorkouts] = useState<WorkoutTemplate[]>([]);
  const [cyclingWorkouts, setCyclingWorkouts] = useState<WorkoutTemplate[]>([]);
  const [swimmingWorkouts, setSwimmingWorkouts] = useState<WorkoutTemplate[]>([]);
  const [strengthSessions, setStrengthSessions] = useState<StrengthWorkoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [group, setGroup] = useState<Group>("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const { favorites } = useFavorites();

  // Le vélotaf du profil, lu à l'ouverture : c'est une habitude déclarée, et
  // la ligne sous l'entrée dit avec quelle durée elle se posera.
  const commutePattern = useMemo(() => (isOpen ? loadCommutePattern() : null), [isOpen]);

  // Le calendrier derrière ne bouge plus sous le doigt. Compteur partagé avec
  // les autres panneaux, donc un dialogue ouvert par-dessus ne le rend pas trop tôt.
  //
  // La requête média n'est pas un raffinement : les deux modes sont montés en
  // même temps et c'est le CSS qui cache la sheet au-dessus de 768px. Sans elle,
  // ouvrir le panneau latéral sur desktop figeait le défilement de la page
  // entière au nom d'une sheet que personne ne voyait.
  const sheetIsOnScreen = useMediaQuery("(max-width: 767px)");
  useScrollLock(isOpen && !inline && sheetIsOnScreen);

  // Le glisser-pour-fermer est le même que celui des sheets de la primitive :
  // hooks/useSheetDrag.ts. La prise est marquée data-sheet-handle ci-dessous.
  const sheetDrag = useSheetDrag(!inline, onClose);

  // Every catalog loads when the panel opens: running (with the sessions the
  // builder made), strength, cycling and swimming.
  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    Promise.all([
      loadAllWorkouts(),
      loadAllStrengthSessions(),
      loadDisciplineWorkouts("cycling"),
      loadDisciplineWorkouts("swimming"),
    ]).then(([workouts, strength, cycling, swimming]) => {
      setAllWorkouts([...workouts, ...getCustomWorkouts()]);
      setStrengthSessions(strength);
      setCyclingWorkouts(cycling);
      setSwimmingWorkouts(swimming);
      setIsLoading(false);
    });
  }, [isOpen]);

  const matchesSearch = useCallback(
    (w: { name: string; nameEn?: string; description?: string; descriptionEn?: string }) => {
      if (!search) return true;
      const q = search.toLowerCase();
      const name = pick(w as WorkoutTemplate, "name");
      const desc = pick(w as WorkoutTemplate, "description");
      return name.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
    },
    [search, pick],
  );

  // The pool a group draws from, then search and favourites on top.
  const filteredWorkouts = useMemo(() => {
    let pool: WorkoutTemplate[];
    if (group === "cycling") pool = cyclingWorkouts;
    else if (group === "swimming") pool = swimmingWorkouts;
    else if (group === "mine") pool = allWorkouts.filter((w) => isCustomWorkoutId(w.id));
    else pool = allWorkouts;
    const categories = GROUP_CATEGORIES[group];
    return pool
      .filter((w) => !categories || categories.includes(w.category))
      .filter((w) => !favoritesOnly || favorites.includes(w.id))
      .filter(matchesSearch)
      .slice(0, 30);
  }, [allWorkouts, cyclingWorkouts, swimmingWorkouts, group, favoritesOnly, favorites, matchesSearch]);

  const filteredStrength = useMemo(() => {
    if (group !== "strength") return [];
    return strengthSessions
      .filter((s) => !favoritesOnly || favorites.includes(s.id))
      .filter(matchesSearch)
      .slice(0, 20);
  }, [strengthSessions, group, favoritesOnly, favorites, matchesSearch]);

  // ── Desktop drag handlers ────────────────────────────────────

  const handleDragStart = useCallback(
    (e: React.DragEvent, workout: WorkoutTemplate) => {
      e.dataTransfer.effectAllowed = "copyMove";
      e.dataTransfer.setData("workout-id", workout.id);
    },
    [],
  );

  const select = (workoutId: string) => {
    onSelectWorkout?.(workoutId);
    if (!inline) onClose();
  };

  // ── Don't render if closed ───────────────────────────────────
  if (!isOpen) return null;

  const dayName = day != null ? tLibrary(`weekly.days.${day}`) : "";

  const panelContent = (
    <div className="zn-planpanel__body">
      {/* Header, the sheet's drag handle on a phone. */}
      <div className="zn-planpanel__bar" data-sheet-handle={!inline || undefined}>
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

      {/* La consigne reste au desktop, où le geste (glisser) ne va pas de soi.
          Sur la sheet elle coûtait 37px des 251 de liste pour redire ce que
          l'utilisateur vient de faire en appuyant sur +. */}
      {inline && (
        <p className="zn-planpanel__hint">
          {onSelectWorkout
            ? t("workoutPanel.hintClick")
            : t("workoutPanel.hintDrag")}
        </p>
      )}

      {/* The day a tapped session lands on, when it can be chosen here. */}
      {onSelectWorkout && day != null && onDayChange && (
        <div className="zn-planpanel__days" role="group" aria-label={t("workoutPanel.day")}>
          {DAYS.map((d) => (
            <button
              key={d}
              type="button"
              className="zn-planpanel__day"
              aria-pressed={d === day}
              onClick={() => onDayChange(d)}
            >
              {tLibrary(`weekly.daysShort.${d}`)}
            </button>
          ))}
        </div>
      )}

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

      {/* The catalogs, one chip each, and the favourites toggle. */}
      <div className="zn-planpanel__filters">
        <div className="zn-planpanel__chips" role="group" aria-label={t("workoutPanel.groupLabel")}>
          {GROUPS.map((g) => (
            <button
              key={g}
              type="button"
              className="zn-planpanel__chip"
              aria-pressed={g === group}
              onClick={() => setGroup(g)}
            >
              {t(`workoutPanel.groups.${g}`)}
            </button>
          ))}
        </div>
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
        {/* The door to the builder, first: a session made to the minute lands
            on the chosen day. The accent as a stroke, never a second fill. */}
        {onCreateWorkout && (
          <button type="button" className="zn-planpanel__create" onClick={onCreateWorkout}>
            <span className="zn-planpanel__create-plus"><Plus /></span>
            <span className="zn-planpanel__item-main">
              <span className="zn-planpanel__item-name">{t("workoutPanel.create")}</span>
              {day != null && (
                <span className="zn-planpanel__item-sub">
                  {t("workoutPanel.createHint", { day: dayName })}
                </span>
              )}
            </span>
          </button>
        )}

        {group === "strength" ? (
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
                  onClick={() => select(session.id)}
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
                  <Grab />
                </div>
              );
            })
          )
        ) : group === "activities" ? (
          <>
            {PANEL_ACTIVITY_KINDS.map((kind) => {
              const workoutId = activityWorkoutId(kind);
              return (
                <div
                  key={kind}
                  draggable={!!inline}
                  onDragStart={inline ? (e) => {
                    e.dataTransfer.effectAllowed = "copyMove";
                    e.dataTransfer.setData("workout-id", workoutId);
                  } : undefined}
                  onClick={() => select(workoutId)}
                  className="zn-planpanel__item"
                  data-draggable={inline ? "true" : undefined}
                >
                  {/* No aerobic zone behind a cross-training slot: the mark stays
                      hollow rather than borrowing a colour it has no claim to. */}
                  <span className="zn-sess__dot" />
                  <div className="zn-planpanel__item-main">
                    <span className="zn-planpanel__item-name">
                      {t(`crossTraining.${kind}`)}
                    </span>
                    {kind === "commute" && commutePattern && (
                      <span className="zn-planpanel__item-sub">
                        {t("workoutPanel.commuteProfile", { minutes: commutePattern.durationMin })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        ) : isLoading ? (
          <div className="zn-planpanel__state">
            <Loader2 className="zn-planpanel__loader" />
          </div>
        ) : filteredWorkouts.length === 0 ? (
          <div className="zn-planpanel__state">
            <p className="zn-body zn-body--sm zn-muted">
              {group === "mine" && !favoritesOnly && !search
                ? t("workoutPanel.noMine")
                : favoritesOnly
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
            const labelKey = CATEGORY_LABEL_KEY[workout.category];

            return (
              <div
                key={workout.id}
                data-workout-id={workout.id}
                draggable={!!inline}
                onDragStart={inline ? (e) => handleDragStart(e, workout) : undefined}
                onClick={!inline && onSelectWorkout ? () => select(workout.id) : undefined}
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
                    <span className="zn-planpanel__item-cat">
                      {labelKey ? t(`workoutFilter.${labelKey}`) : workout.category}
                    </span>
                    <Clock />
                    {formatDurationMinutes(workout.typicalDuration.min)}-{formatDurationMinutes(workout.typicalDuration.max)}
                  </span>
                </div>
                <Grab />
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
          {...sheetDrag}
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

/** The six-dot drag mark, on every draggable item. */
function Grab() {
  return (
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
  );
}
