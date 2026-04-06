import { useTranslation } from "react-i18next";
import type { RefObject } from "react";
import { Search, Heart } from "@/components/icons";
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
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors",
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

  const showRunningFilters = activityType === "running" || activityType === "all";
  const showStrengthFilters = activityType === "strength" || activityType === "all";

  return (
    <div className={cn("space-y-5", className)}>
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
      {showRunningFilters && (
        <div className="space-y-2">
          <FilterGroupLabel>{t("filters.category")}</FilterGroupLabel>
          <div className="flex flex-wrap gap-2">
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
      {showStrengthFilters && (
        <div className="space-y-2">
          <FilterGroupLabel>{tStrength("title")}</FilterGroupLabel>
          <div className="flex flex-wrap gap-2">
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
      <div className="space-y-2">
        <FilterGroupLabel>{t("filters.difficulty")}</FilterGroupLabel>
        <div className="flex flex-wrap gap-2">
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
        <div className="space-y-2">
          <FilterGroupLabel>{t("filters.terrain")}</FilterGroupLabel>
          <div className="flex flex-wrap gap-2">
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
        <div className="space-y-2">
          <FilterGroupLabel>{t("filters.targetSystem")}</FilterGroupLabel>
          <div className="flex flex-wrap gap-2">
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
        <div className="space-y-2">
          <FilterGroupLabel>{tStrength("detail.equipmentNeeded")}</FilterGroupLabel>
          <div className="flex flex-wrap gap-2">
            {strengthEquipmentOptions.map((eq) => (
              <FilterChip
                key={eq}
                label={tStrength(`equipment.${eq}`)}
                selected={filters.equipment.includes(eq)}
                onClick={() => toggleFilter("equipment", eq)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Strength: Muscle Group */}
      {showStrengthFilters && (
        <div className="space-y-2">
          <FilterGroupLabel>{tStrength("detail.targetMuscles")}</FilterGroupLabel>
          <div className="flex flex-wrap gap-2">
            {muscleGroupOptions.map((m) => (
              <FilterChip
                key={m}
                label={tStrength(`muscles.${m}`)}
                selected={filters.muscleGroup.includes(m)}
                onClick={() => toggleFilter("muscleGroup", m)}
              />
            ))}
          </div>
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
