import { useTranslation } from "react-i18next";

import { MiniRouteMap } from "@/components/visualization/route/MiniRouteMap";
import { formatDurationMinutes } from "@/components/visualization/transforms";
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
      className="zn-route-cand"
      aria-pressed={selected}
    >
      <MiniRouteMap
        points={route.points}
        color="currentColor"
        background="var(--surface-band)"
        className="zn-route-cand__map"
      />
      <div className="zn-fill">
        <div className="zn-row zn-row--split zn-row--baseline">
          <p className="zn-route-cand__title">{t(accentKey)}</p>
          {selected && (
            <span className="zn-route-cand__flag">{t("recommendation.selected")}</span>
          )}
        </div>
        <div className="zn-route-cand__facts">
          <strong>{distanceKm} km</strong>
          <span>↑ {route.elevationGainM} m</span>
          <span>{formatDurationMinutes(durationSec / 60)}</span>
        </div>
      </div>
    </button>
  );
}
