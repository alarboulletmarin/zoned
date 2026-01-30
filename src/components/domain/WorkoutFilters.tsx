import { useTranslation } from "react-i18next";
import type { RefObject } from "react";
import { X, Search, Heart } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { WorkoutCategory, Difficulty, TargetSystem } from "@/types";
import { categories } from "@/data/workouts";

// Terrain filter options
export type TerrainFilter = "all" | "flat" | "hills" | "track";

// Target system options for filter
const targetSystems: TargetSystem[] = [
  "aerobic_base",
  "aerobic_power",
  "lactate_threshold",
  "vo2max",
  "speed",
  "strength",
];

export interface WorkoutFiltersState {
  category: WorkoutCategory | "all";
  difficulty: Difficulty | "all";
  durationRange: [number, number];
  searchQuery: string;
  terrain: TerrainFilter;
  targetSystem: TargetSystem | "all";
  favoritesOnly: boolean;
}

interface WorkoutFiltersProps {
  filters: WorkoutFiltersState;
  onFiltersChange: (filters: WorkoutFiltersState) => void;
  className?: string;
  searchInputRef?: RefObject<HTMLInputElement | null>;
  hideSearch?: boolean;
}

const DURATION_MIN = 10;
const DURATION_MAX = 180;

export function WorkoutFilters({
  filters,
  onFiltersChange,
  className,
  searchInputRef,
  hideSearch = false,
}: WorkoutFiltersProps) {
  const { t } = useTranslation("library");

  const updateFilter = <K extends keyof WorkoutFiltersState>(
    key: K,
    value: WorkoutFiltersState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const hasActiveFilters =
    filters.category !== "all" ||
    filters.difficulty !== "all" ||
    filters.durationRange[0] !== DURATION_MIN ||
    filters.durationRange[1] !== DURATION_MAX ||
    filters.searchQuery !== "" ||
    filters.terrain !== "all" ||
    filters.targetSystem !== "all" ||
    filters.favoritesOnly;

  const clearFilters = () => {
    onFiltersChange({
      category: "all",
      difficulty: "all",
      durationRange: [DURATION_MIN, DURATION_MAX],
      searchQuery: "",
      terrain: "all",
      targetSystem: "all",
      favoritesOnly: false,
    });
  };

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

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("filters.category")}</label>
        <Select
          value={filters.category}
          onValueChange={(value) =>
            updateFilter("category", value as WorkoutCategory | "all")
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("filters.allCategories")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allCategories")}</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {t(`categories.${cat}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Difficulty */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("filters.difficulty")}</label>
        <Select
          value={filters.difficulty}
          onValueChange={(value) =>
            updateFilter("difficulty", value as Difficulty | "all")
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("filters.allDifficulties")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allDifficulties")}</SelectItem>
            <SelectItem value="beginner">{t("difficulty.beginner")}</SelectItem>
            <SelectItem value="intermediate">
              {t("difficulty.intermediate")}
            </SelectItem>
            <SelectItem value="advanced">{t("difficulty.advanced")}</SelectItem>
            <SelectItem value="elite">{t("difficulty.elite")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Terrain */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("filters.terrain")}</label>
        <Select
          value={filters.terrain}
          onValueChange={(value) =>
            updateFilter("terrain", value as TerrainFilter)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("filters.allTerrains")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allTerrains")}</SelectItem>
            <SelectItem value="flat">{t("terrain.flat")}</SelectItem>
            <SelectItem value="hills">{t("terrain.hills")}</SelectItem>
            <SelectItem value="track">{t("terrain.track")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Target System */}
      <div className="space-y-2">
        <label className="text-sm font-medium">{t("filters.targetSystem")}</label>
        <Select
          value={filters.targetSystem}
          onValueChange={(value) =>
            updateFilter("targetSystem", value as TargetSystem | "all")
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("filters.allSystems")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filters.allSystems")}</SelectItem>
            {targetSystems.map((sys) => (
              <SelectItem key={sys} value={sys}>
                {t(`targetSystem.${sys}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Duration Range */}
      <div className="space-y-3">
        <label className="text-sm font-medium">{t("filters.duration")}</label>
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

      {/* Clear Filters */}
      {hasActiveFilters && (
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
  category: "all",
  difficulty: "all",
  durationRange: [DURATION_MIN, DURATION_MAX],
  searchQuery: "",
  terrain: "all",
  targetSystem: "all",
  favoritesOnly: false,
};
