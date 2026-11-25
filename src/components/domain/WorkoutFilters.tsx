import { useTranslation } from "react-i18next";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Difficulty } from "@/types";
import type { StrengthCategory, StrengthEquipment, MuscleGroup } from "@/types/strength";
import { strengthCategories } from "@/data/strength";
import {
  defaultFilters,
  type ActivityType,
  type WorkoutFiltersState,
} from "@/lib/libraryFilters";

export { defaultFilters, type ActivityType, type WorkoutFiltersState };

// Equipment options for strength filter
const strengthEquipmentOptions: StrengthEquipment[] = [
  "none",
  "resistance_band",
  "dumbbells",
  "kettlebell",
  "barbell",
  "pull_up_bar",
  "box",
  "foam_roller",
  "medicine_ball",
];

// Muscle group options for strength filter
const muscleGroupOptions: MuscleGroup[] = [
  "quadriceps",
  "hamstrings",
  "glutes",
  "calves",
  "hip_flexors",
  "adductors",
  "core_anterior",
  "core_lateral",
  "core_posterior",
  "upper_back",
  "shoulders",
  "chest",
];

const difficultyOptions: Difficulty[] = ["beginner", "intermediate", "advanced", "elite"];

interface WorkoutFiltersProps {
  filters: WorkoutFiltersState;
  onFiltersChange: (filters: WorkoutFiltersState) => void;
  className?: string;
  activityType?: ActivityType;
  onActivityTypeChange?: (next: ActivityType) => void;
  sportCounts?: Record<ActivityType, number>;
}

/* ── Chip ──
   A filter value the athlete switches on or off. Selected is a full ink
   inversion, never a tint, the paint lives in `library.css`. */
function Chip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={selected}
      onClick={onClick}
      className="zn-chip"
    >
      {label}
    </button>
  );
}

/* ── One filter row: an 88px mono label, then its chips ── */
function FilterRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("zn-lib__row", className)} role="group" aria-label={label}>
      {/* The row is already named for assistive tech by the group label. */}
      <span
        className="zn-kicker zn-kicker--inline zn-lib__rowlabel"
        aria-hidden="true"
      >
        {label}
      </span>
      {children}
    </div>
  );
}

/* ── Expandable chip group, progressive disclosure ──
   Renders straight into the row rather than into a box of its own, so a long
   list still reads as one line of chips. */
function ExpandableChipGroup({
  items,
  initialCount = 4,
  renderChip,
  hasSelected,
}: {
  items: readonly string[];
  initialCount?: number;
  renderChip: (item: string) => React.ReactNode;
  hasSelected?: (item: string) => boolean;
}) {
  const [expanded, setExpanded] = useState(() =>
    hasSelected ? items.slice(initialCount).some(hasSelected) : false
  );
  const visible = expanded ? items : items.slice(0, initialCount);
  const hiddenCount = items.length - initialCount;

  return (
    <>
      {visible.map((item) => renderChip(item))}
      {!expanded && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="zn-chip zn-chip--more"
        >
          +{hiddenCount}
        </button>
      )}
    </>
  );
}

/**
 * The filter band: rows of chips under the discipline strip, then the duration
 * range, the favourites switch and the clear button.
 *
 * It is one band on every viewport, the drawer it used to hide behind on
 * mobile is gone, so the same filters are visible whatever the screen.
 */
export function WorkoutFilters({
  filters,
  onFiltersChange,
  className,
  activityType = "all",
}: WorkoutFiltersProps) {
  const { t } = useTranslation("library");
  const { t: tStrength } = useTranslation("strength");

  const toggleFilter = <K extends keyof WorkoutFiltersState>(
    key: K,
    value: WorkoutFiltersState[K] extends (infer T)[] ? T : never
  ) => {
    const current = filters[key] as unknown[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: next });
  };

  const showStrengthFilters = activityType === "strength";

  return (
    <section
      className={cn("zn-lib__filters", className)}
      aria-label={t("filters.title")}
    >
      {/* Difficulty (shared) */}
      <FilterRow label={t("filters.difficulty")}>
        {difficultyOptions.map((d) => (
          <Chip
            key={d}
            label={t(`difficulty.${d}`)}
            selected={filters.difficulty.includes(d)}
            onClick={() => toggleFilter("difficulty", d)}
          />
        ))}
      </FilterRow>

      {showStrengthFilters && (
        <FilterRow label={tStrength("title")}>
          {strengthCategories.map((cat) => (
            <Chip
              key={cat}
              label={tStrength(`categories.${cat}`)}
              selected={filters.strengthCategory.includes(cat as StrengthCategory)}
              onClick={() => toggleFilter("strengthCategory", cat as StrengthCategory)}
            />
          ))}
        </FilterRow>
      )}

      {/* Strength: equipment */}
      {showStrengthFilters && (
        <FilterRow label={tStrength("detail.equipmentNeeded")}>
          <ExpandableChipGroup
            items={strengthEquipmentOptions}
            initialCount={4}
            hasSelected={(eq) => filters.equipment.includes(eq as StrengthEquipment)}
            renderChip={(eq) => (
              <Chip
                key={eq}
                label={tStrength(`equipment.${eq}`)}
                selected={filters.equipment.includes(eq as StrengthEquipment)}
                onClick={() => toggleFilter("equipment", eq as StrengthEquipment)}
              />
            )}
          />
        </FilterRow>
      )}

      {/* Strength: muscle group */}
      {showStrengthFilters && (
        <FilterRow label={tStrength("detail.targetMuscles")}>
          <ExpandableChipGroup
            items={muscleGroupOptions}
            initialCount={4}
            hasSelected={(m) => filters.muscleGroup.includes(m as MuscleGroup)}
            renderChip={(m) => (
              <Chip
                key={m}
                label={tStrength(`muscles.${m}`)}
                selected={filters.muscleGroup.includes(m as MuscleGroup)}
                onClick={() => toggleFilter("muscleGroup", m as MuscleGroup)}
              />
            )}
          />
        </FilterRow>
      )}
    </section>
  );
}
