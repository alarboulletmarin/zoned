import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { ZoneBadge } from "@/components/domain/ZoneBadge";
import { useWorkouts } from "@/hooks";
import { usePickLang } from "@/lib/i18n-utils";
import { normalizeSearch } from "@/lib/search-utils";
import { getDominantZone } from "@/types";
import type { WorkoutTemplate } from "@/types";
import { getWorkoutDuration, formatDurationMinutes } from "@/components/visualization";

const MAX_SUGGESTIONS = 3;

/**
 * Nearest-workout heuristic for an invalid `/workout/:id`.
 *
 * Real ids are `PREFIX-NNN` (`THR-001`, registered per category in
 * `ID_PREFIX_REGISTRY`, scripts/qa-workout-schema.ts). A bad id almost always
 * keeps a real prefix — the workout it pointed at was renumbered or retired,
 * not invented — so the first pass looks for other templates sharing that
 * prefix and ranks them by how close their number is to the one requested.
 *
 * If the prefix itself doesn't exist (an old slug-style link, a typo), the
 * fallback tokenises the id and scores it against workout names instead.
 */
function suggestNearestWorkouts(
  id: string | undefined,
  workouts: WorkoutTemplate[],
): WorkoutTemplate[] {
  if (!id || workouts.length === 0) return [];

  const [prefix, numStr] = id.split("-");
  if (prefix) {
    const sameBucket = workouts.filter((w) => w.id.startsWith(`${prefix}-`));
    if (sameBucket.length > 0) {
      const num = numStr ? parseInt(numStr, 10) : NaN;
      if (!Number.isNaN(num)) {
        sameBucket.sort((a, b) => {
          const an = parseInt(a.id.split("-")[1] ?? "", 10);
          const bn = parseInt(b.id.split("-")[1] ?? "", 10);
          return Math.abs(an - num) - Math.abs(bn - num);
        });
      }
      return sameBucket.slice(0, MAX_SUGGESTIONS);
    }
  }

  const tokens = normalizeSearch(id.replace(/[-_]/g, " "))
    .split(/\s+/)
    .filter((tk) => tk.length >= 3);
  if (tokens.length === 0) return [];

  return workouts
    .map((w) => {
      const name = normalizeSearch(w.name);
      const score = tokens.reduce((acc, tk) => acc + (name.includes(tk) ? 1 : 0), 0);
      return { w, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_SUGGESTIONS)
    .map((s) => s.w);
}

/** Redesigned inline panel shown by `WorkoutDetailPage` for an invalid id. */
export function WorkoutNotFound({ id }: { id: string | undefined }) {
  const { t } = useTranslation("common");
  const pickLang = usePickLang();
  const { workouts } = useWorkouts();
  const suggestions = suggestNearestWorkouts(id, workouts);

  return (
    <div className="py-12 max-w-lg mx-auto">
      <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground">
        {t("errors.workoutNotFoundPanel.eyebrow")}
      </p>
      <h1 className="font-sans font-bold text-4xl sm:text-5xl uppercase leading-[0.9] tracking-tight mt-3">
        {t("errors.workoutNotFoundPanel.title")}
      </h1>
      <p className="mt-4 text-muted-foreground">
        {suggestions.length > 0
          ? t("errors.workoutNotFoundPanel.descriptionSuggestions")
          : t("errors.workoutNotFoundPanel.descriptionGeneric")}
      </p>

      {suggestions.length > 0 && (
        <div className="mt-5 flex flex-col">
          {suggestions.map((w) => {
            const zone = getDominantZone(w);
            return (
              <Link
                key={w.id}
                to={`/workout/${w.id}`}
                className="flex items-center gap-3 py-3 border-t border-filet last-of-type:border-b hover:bg-secondary/50 transition-colors"
              >
                <ZoneBadge zone={zone} />
                <span className="flex-1 text-sm font-medium truncate">
                  {pickLang(w, "name")}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {formatDurationMinutes(getWorkoutDuration(w))}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      <div className="mt-6">
        <Button asChild>
          <Link to="/library">
            <ArrowLeft className="mr-2 size-4" />
            {t("errors.workoutNotFoundPanel.openLibrary")}
          </Link>
        </Button>
      </div>
    </div>
  );
}
