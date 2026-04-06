import { useTranslation } from "react-i18next";
import { useState, type RefObject } from "react";
import { X, Search, Heart } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { WorkoutCategory, Difficulty, TargetSystem } from "@/types";
import type { StrengthCategory, StrengthEquipment, MuscleGroup } from "@/types/strength";
import { categories } from "@/data/workouts";
import { strengthCategories } from "@/data/strength";

export type ActivityType = "running" | "strength" | "all";

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
  searchInputRef?: RefObject<HTMLInputElement | null>;
  hideSearch?: boolean;
  activityType?: ActivityType;
}

const DURATION_MIN = 0;
const DURATION_MAX = 240;

/* ── Chip / tag button ── */
function FilterChip({
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
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

/* ── Group heading ── */
function FilterGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
      {children}
    </span>
  );
}

/* ── Expandable chip group — progressive disclosure ── */
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
    <div className="flex flex-wrap gap-1.5">
      {visible.map((item) => renderChip(item))}
      {!expanded && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="inline-flex items-center rounded-full border border-dashed border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          +{hiddenCount}
        </button>
      )}
    </div>
  );
}

export function WorkoutFilters({
  filters,
  onFiltersChange,
  className,
  searchInputRef,
  hideSearch = false,
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

  // Categories always shown when the type matches (including "all")
  const showRunningCategories = activityType === "running" || activityType === "all";
  const showStrengthCategories = activityType === "strength" || activityType === "all";
  // Specific filters only shown when a type is explicitly selected (not "all")
  const showRunningFilters = activityType === "running";
  const showStrengthFilters = activityType === "strength";

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      {!hideSearch && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            ref={searchInputRef}
            type="text"
            aria-label={t("filters.searchLabel")}
            placeholder={t("filters.search")}
            value={filters.searchQuery}
            onChange={(e) => updateFilter("searchQuery", e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-md border border-input bg-transparent text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      )}

      {/* Running: Category */}
      {showRunningCategories && (
        <div className="space-y-1.5">
          <FilterGroupLabel>{t("filters.category")}</FilterGroupLabel>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <FilterChip
                key={cat}
                label={t(`categories.${cat}`)}
                selected={filters.category.includes(cat as WorkoutCategory)}
                onClick={() => toggleFilter("category", cat as WorkoutCategory)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Strength: Category */}
      {showStrengthCategories && (
        <div className="space-y-1.5">
          <FilterGroupLabel>{tStrength("title")}</FilterGroupLabel>
          <div className="flex flex-wrap gap-1.5">
            {strengthCategories.map((cat) => (
              <FilterChip
                key={cat}
                label={tStrength(`categories.${cat}`)}
                selected={filters.strengthCategory.includes(cat as StrengthCategory)}
                onClick={() => toggleFilter("strengthCategory", cat as StrengthCategory)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Difficulty (shared) */}
      <div className="space-y-1.5">
        <FilterGroupLabel>{t("filters.difficulty")}</FilterGroupLabel>
        <div className="flex flex-wrap gap-1.5">
          {difficultyOptions.map((d) => (
            <FilterChip
              key={d}
              label={t(`difficulty.${d}`)}
              selected={filters.difficulty.includes(d)}
              onClick={() => toggleFilter("difficulty", d)}
            />
          ))}
        </div>
      </div>

      {/* Running: Terrain */}
      {showRunningFilters && (
        <div className="space-y-1.5">
          <FilterGroupLabel>{t("filters.terrain")}</FilterGroupLabel>
          <div className="flex flex-wrap gap-1.5">
            {terrainOptions.map((ter) => (
              <FilterChip
                key={ter}
                label={t(`terrain.${ter}`)}
                selected={filters.terrain.includes(ter)}
                onClick={() => toggleFilter("terrain", ter)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Running: Target System */}
      {showRunningFilters && (
        <div className="space-y-1.5">
          <FilterGroupLabel>{t("filters.targetSystem")}</FilterGroupLabel>
          <div className="flex flex-wrap gap-1.5">
            {targetSystems.map((sys) => (
              <FilterChip
                key={sys}
                label={t(`targetSystem.${sys}`)}
                selected={filters.targetSystem.includes(sys)}
                onClick={() => toggleFilter("targetSystem", sys)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Strength: Equipment */}
      {showStrengthFilters && (
        <div className="space-y-1.5">
          <FilterGroupLabel>{tStrength("detail.equipmentNeeded")}</FilterGroupLabel>
          <ExpandableChipGroup
            items={strengthEquipmentOptions}
            initialCount={4}
            hasSelected={(eq) => filters.equipment.includes(eq as StrengthEquipment)}
            renderChip={(eq) => (
              <FilterChip
                key={eq}
                label={tStrength(`equipment.${eq}`)}
                selected={filters.equipment.includes(eq as StrengthEquipment)}
                onClick={() => toggleFilter("equipment", eq as StrengthEquipment)}
              />
            )}
          />
        </div>
      )}

      {/* Strength: Muscle Group */}
      {showStrengthFilters && (
        <div className="space-y-1.5">
          <FilterGroupLabel>{tStrength("detail.targetMuscles")}</FilterGroupLabel>
          <ExpandableChipGroup
            items={muscleGroupOptions}
            initialCount={4}
            hasSelected={(m) => filters.muscleGroup.includes(m as MuscleGroup)}
            renderChip={(m) => (
              <FilterChip
                key={m}
                label={tStrength(`muscles.${m}`)}
                selected={filters.muscleGroup.includes(m as MuscleGroup)}
                onClick={() => toggleFilter("muscleGroup", m as MuscleGroup)}
              />
            )}
          />
        </div>
      )}

      {/* Duration Range */}
      <div className="space-y-3">
        <FilterGroupLabel>{t("filters.duration")}</FilterGroupLabel>
        <Slider
          value={filters.durationRange}
          min={DURATION_MIN}
          max={DURATION_MAX}
          step={5}
          onValueChange={(value) =>
            updateFilter("durationRange", value as [number, number])
          }
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{filters.durationRange[0]} min</span>
          <span>{filters.durationRange[1]} min</span>
        </div>
      </div>

      {/* Favorites Only */}
      <div className="flex items-center justify-between py-2">
        <label htmlFor="favoritesOnly" className="flex items-center gap-2 text-sm font-medium cursor-pointer">
          <Heart className="size-4 text-red-500" />
          {t("filters.favoritesOnly")}
        </label>
        <Switch
          id="favoritesOnly"
          checked={filters.favoritesOnly}
          onCheckedChange={(checked) => updateFilter("favoritesOnly", checked)}
        />
      </div>

      {/* Clear Filters — desktop only (mobile has it in the drawer footer) */}
      {!hideSearch && hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="w-full"
        >
          <X className="size-4 mr-1" />
          {t("clearFilters")}
        </Button>
      )}
    </div>
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
