import { useTranslation } from "react-i18next";
import { useState } from "react";
import { X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { WorkoutCategory, Difficulty, TargetSystem } from "@/types";
import type { StrengthCategory, StrengthEquipment, MuscleGroup } from "@/types/strength";
import { categories } from "@/data/workouts";
import { strengthCategories } from "@/data/strength";

export type ActivityType = "running" | "strength" | "cycling" | "swimming" | "all";

// Terrain filter options
export type TerrainFilter = "flat" | "hills" | "track";

// Target system options for filter
const targetSystems: TargetSystem[] = [
  "aerobic_base",
  "aerobic_power",
  "lactate_threshold",
  "vo2max",
  "speed",
  "strength",
];

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

const terrainOptions: TerrainFilter[] = ["flat", "hills", "track"];

const difficultyOptions: Difficulty[] = ["beginner", "intermediate", "advanced", "elite"];

export interface WorkoutFiltersState {
  category: WorkoutCategory[];
  difficulty: Difficulty[];
  durationRange: [number, number];
  searchQuery: string;
  terrain: TerrainFilter[];
  targetSystem: TargetSystem[];
  favoritesOnly: boolean;
  // Strength-specific filters
  strengthCategory: StrengthCategory[];
  equipment: StrengthEquipment[];
  muscleGroup: MuscleGroup[];
}

interface WorkoutFiltersProps {
  filters: WorkoutFiltersState;
  onFiltersChange: (filters: WorkoutFiltersState) => void;
  className?: string;
  activityType?: ActivityType;
}

const DURATION_MIN = 0;
const DURATION_MAX = 300;

/* ── Chip ──
   A filter value the athlete switches on or off. Selected is a full ink
   inversion, never a tint — the paint lives in `library.css`. */
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

/* ── Expandable chip group — progressive disclosure ──
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
 * It is one band on every viewport — the drawer it used to hide behind on
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

  const updateFilter = <K extends keyof WorkoutFiltersState>(
    key: K,
    value: WorkoutFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

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

  const hasActiveFilters =
    filters.category.length > 0 ||
    filters.difficulty.length > 0 ||
    filters.durationRange[0] !== DURATION_MIN ||
    filters.durationRange[1] !== DURATION_MAX ||
    filters.searchQuery !== "" ||
    filters.terrain.length > 0 ||
    filters.targetSystem.length > 0 ||
    filters.favoritesOnly ||
    filters.strengthCategory.length > 0 ||
    filters.equipment.length > 0 ||
    filters.muscleGroup.length > 0;

  const clearFilters = () => {
    onFiltersChange({
      category: [],
      difficulty: [],
      durationRange: [DURATION_MIN, DURATION_MAX],
      searchQuery: "",
      terrain: [],
      targetSystem: [],
      favoritesOnly: false,
      strengthCategory: [],
      equipment: [],
      muscleGroup: [],
    });
  };

  // Categories always shown when the type matches (including "all").
  // Cycling and swimming workouts reuse the shared WorkoutCategory enum
  // (endurance / tempo / threshold / vma_intervals / recovery) so the same
  // running category chips apply when a discipline other than strength is
  // selected.
  const showRunningCategories =
    activityType === "running" ||
    activityType === "cycling" ||
    activityType === "swimming" ||
    activityType === "all";
  const showStrengthCategories = activityType === "strength" || activityType === "all";
  // Specific filters only shown when a type is explicitly selected (not "all")
  const showRunningFilters = activityType === "running";
  const showStrengthFilters = activityType === "strength";

  return (
    <section
      className={cn("zn-lib__filters", className)}
      aria-label={t("filters.title")}
    >
      {/* Running / cycling / swimming: category */}
      {showRunningCategories && (
        <FilterRow label={t("filters.category")}>
          {categories.map((cat) => (
            <Chip
              key={cat}
              label={t(`categories.${cat}`)}
              selected={filters.category.includes(cat as WorkoutCategory)}
              onClick={() => toggleFilter("category", cat as WorkoutCategory)}
            />
          ))}
        </FilterRow>
      )}

      {/* Strength: category */}
      {showStrengthCategories && (
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

      {/* Running: terrain */}
      {showRunningFilters && (
        <FilterRow label={t("filters.terrain")}>
          {terrainOptions.map((ter) => (
            <Chip
              key={ter}
              label={t(`terrain.${ter}`)}
              selected={filters.terrain.includes(ter)}
              onClick={() => toggleFilter("terrain", ter)}
            />
          ))}
        </FilterRow>
      )}

      {/* Running: target system */}
      {showRunningFilters && (
        <FilterRow label={t("filters.targetSystem")}>
          {targetSystems.map((sys) => (
            <Chip
              key={sys}
              label={t(`targetSystem.${sys}`)}
              selected={filters.targetSystem.includes(sys)}
              onClick={() => toggleFilter("targetSystem", sys)}
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

      {/* Duration, favourites, and the way out of every filter above. */}
      <FilterRow label={t("filters.duration")} className="zn-lib__controls">
        <div className="zn-lib__duration">
          <Slider
            value={filters.durationRange}
            min={DURATION_MIN}
            max={DURATION_MAX}
            step={5}
            thumbLabel={t("filters.duration")}
            onValueChange={(value) =>
              updateFilter("durationRange", value as [number, number])
            }
          />
          <span className="zn-mono zn-lib__duration-value">
            {t("filters.durationRange", {
              min: filters.durationRange[0],
              max: filters.durationRange[1],
            })}
          </span>
        </div>

        <label className="zn-lib__switch" htmlFor="favoritesOnly">
          <Switch
            id="favoritesOnly"
            aria-label={t("filters.favoritesOnly")}
            checked={filters.favoritesOnly}
            onCheckedChange={(checked) => updateFilter("favoritesOnly", checked)}
          />
          <span className="zn-label">{t("filters.favoritesOnly")}</span>
        </label>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="zn-push"
          >
            <X size={15} />
            {t("clearFilters")}
          </Button>
        )}
      </FilterRow>
    </section>
  );
}

// Default filter state
export const defaultFilters: WorkoutFiltersState = {
  category: [],
  difficulty: [],
  durationRange: [DURATION_MIN, DURATION_MAX],
  searchQuery: "",
  terrain: [],
  targetSystem: [],
  favoritesOnly: false,
  strengthCategory: [],
  equipment: [],
  muscleGroup: [],
};
