import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  WorkoutCard,
  WorkoutFilters,
  defaultFilters,
  type WorkoutFiltersState,
} from "@/components/domain";
import { allWorkouts } from "@/data/workouts";
import { getEstimatedDuration } from "@/types";
import type { WorkoutCategory } from "@/types";

export function LibraryPage() {
  const { t } = useTranslation("library");
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<WorkoutFiltersState>(() => {
    const category = searchParams.get("category") as WorkoutCategory | null;
    return {
      ...defaultFilters,
      category: category || "all",
    };
  });

  // Update URL when category changes
  useEffect(() => {
    if (filters.category !== "all") {
      setSearchParams({ category: filters.category });
    } else {
      setSearchParams({});
    }
  }, [filters.category, setSearchParams]);

  // Filter workouts
  const filteredWorkouts = useMemo(() => {
    return allWorkouts.filter((workout) => {
      // Category filter
      if (filters.category !== "all" && workout.category !== filters.category) {
        return false;
      }

      // Difficulty filter
      if (
        filters.difficulty !== "all" &&
        workout.difficulty !== filters.difficulty
      ) {
        return false;
      }

      // Terrain filter
      if (filters.terrain !== "all") {
        const env = workout.environment;
        if (filters.terrain === "hills" && !env.requiresHills) return false;
        if (filters.terrain === "track" && !env.requiresTrack) return false;
        if (filters.terrain === "flat" && (env.requiresHills || env.requiresTrack)) return false;
      }

      // Target system filter
      if (filters.targetSystem !== "all" && workout.targetSystem !== filters.targetSystem) {
        return false;
      }

      // Duration filter
      const duration = getEstimatedDuration(workout);
      if (
        duration < filters.durationRange[0] ||
        duration > filters.durationRange[1]
      ) {
        return false;
      }

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          workout.name.toLowerCase().includes(query) ||
          workout.nameEn.toLowerCase().includes(query) ||
          workout.description.toLowerCase().includes(query) ||
          workout.descriptionEn.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [filters]);

  return (
    <div className="py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle", { count: filteredWorkouts.length })}
          </p>
        </div>

        {/* Mobile filter toggle */}
        <Button
          variant="outline"
          size="sm"
          className="lg:hidden"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
        >
          <Filter className="size-4 mr-2" />
          {t("filters.category")}
        </Button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Filters - Desktop */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20">
            <WorkoutFilters filters={filters} onFiltersChange={setFilters} />
          </div>
        </aside>

        {/* Mobile Filters Drawer */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setShowMobileFilters(false)}
            />
            <div className="absolute inset-y-0 right-0 w-full max-w-xs bg-background border-l p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold">{t("filters.category")}</h2>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setShowMobileFilters(false)}
                >
                  ×
                </Button>
              </div>
              <WorkoutFilters filters={filters} onFiltersChange={setFilters} />
            </div>
          </div>
        )}

        {/* Workout Grid */}
        <div className="flex-1">
          {filteredWorkouts.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredWorkouts.map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">{t("noResults")}</p>
              <Button
                variant="link"
                onClick={() => setFilters(defaultFilters)}
                className="mt-2"
              >
                {t("clearFilters")}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
