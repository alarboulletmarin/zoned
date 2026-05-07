import { useTranslation } from "react-i18next";

import { MiniRouteMap } from "@/components/visualization/route/MiniRouteMap";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { cn } from "@/lib/utils";
import type { Route } from "@/types/route";
import type { RankedRouteCandidate } from "@/lib/routeGenerator/recommendation";

interface RouteCandidateCardProps {
  route: Route;
  recommendation: RankedRouteCandidate | null;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Strava-style candidate card: mini-map thumbnail on the left, stats and
 * the recommendation accent on the right. Tapping promotes the candidate
 * to the active selection (parent-controlled). Selected state uses a
 * primary border + tinted fill so it reads as the current pick at a
 * glance, without needing a separate radio control.
 */
export function RouteCandidateCard({
  route,
  recommendation,
  selected,
  onSelect,
}: RouteCandidateCardProps) {
  const { t } = useTranslation("routes");
  const distanceKm = (route.distanceM / 1000).toFixed(1);
  const durationSec = recommendation?.predictedDurationSec ?? route.estimatedDurationSec;
  const accentKey = recommendation
    ? `recommendation.accents.${recommendation.accent}`
    : "recommendation.accents.closest_to_target";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors",
        selected
          ? "border-primary bg-primary/5"
          : "border-border/60 bg-background hover:border-primary/40",
      )}
      aria-pressed={selected}
    >
      <MiniRouteMap
        points={route.points}
        color={selected ? "#ea580c" : "#94a3b8"}
        className="h-14 w-20"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-semibold text-foreground">{t(accentKey)}</p>
          {selected && (
            <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-primary-foreground">
              {t("recommendation.selected")}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="font-medium tabular-nums text-foreground">{distanceKm} km</span>
          <span className="tabular-nums">↑ {route.elevationGainM} m</span>
          <span className="tabular-nums">{formatDurationMinutes(durationSec / 60)}</span>
        </div>
      </div>
    </button>
  );
}
