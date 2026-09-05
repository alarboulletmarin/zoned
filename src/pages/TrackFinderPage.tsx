import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ArrowRight, Download, EyeOff, Loader2, MapPin, RotateCcw, Save } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/seo";
import { StatBlock } from "@/components/domain/StatBlock";
import { AddressSearchInput } from "@/components/domain/AddressSearchInput";
import { findNearbyTracks, type NearbyTrack } from "@/lib/routeGenerator/poi/overpass";
import { BrouterError, routeFromWaypoints } from "@/lib/routeGenerator";
import { downloadRouteGpx } from "@/lib/export/gpx";
import { useRoutes } from "@/hooks/useRoutes";
import { useSettings } from "@/hooks/useSettings";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import type { Route, RouteCoordinate, RoutePoiSummary } from "@/types/route";

const RouteMap = lazy(() =>
  import("@/components/visualization/route/RouteMap").then((m) => ({
    default: m.RouteMap,
  })),
);

function MapSkeleton() {
  return <Skeleton className="zn-rt__mapskel" />;
}

/**
 * RouteMap ships its own Tailwind base — `h-72 sm:h-96 lg:h-[28rem]` plus a
 * rounded border. It is a visualization component and out of this lot's scope,
 * and Tailwind's utilities layer beats the component layer this family's CSS
 * lives in, so the override has to be Tailwind too. Only the frame is dropped:
 * the outline, the radius and the clipping belong to `.zn-rt__map`, and the
 * map keeps its own heights.
 */
const MAP_FRAME = "rounded-none border-0";

const SEARCH_RADIUS_M = 15_000;
const MAX_RESULTS = 10;

function formatHaversineKm(meters: number): string {
  return (meters / 1000).toFixed(1);
}

export function TrackFinderPage() {
  const { t } = useTranslation("routes");
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { saveRoute } = useRoutes();

  const [start, setStart] = useState<RouteCoordinate | null>(null);
  const [startLabel, setStartLabel] = useState<string | null>(null);
  const [tracks, setTracks] = useState<NearbyTrack[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [isRouting, setIsRouting] = useState(false);
  const fetchAbortRef = useRef<AbortController | null>(null);

  const selectedTrack = useMemo(
    () => tracks?.find((t) => t.id === selectedTrackId) ?? null,
    [tracks, selectedTrackId],
  );

  const trackPois: RoutePoiSummary[] = useMemo(() => {
    if (!tracks) return [];
    return tracks.map((t) => ({ type: "track", point: t.point, name: t.name }));
  }, [tracks]);

  useEffect(() => {
    return () => {
      fetchAbortRef.current?.abort();
    };
  }, []);

  const updateStart = useCallback((point: RouteCoordinate | null, label: string | null) => {
    setStart(point);
    setStartLabel(label);
    // Discard previous results so we don't show stale tracks for a new start.
    setTracks(null);
    setSelectedTrackId(null);
    setRoute(null);
  }, []);

  const requestGps = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      toast.error(t("errors.geolocationUnavailable"));
      return;
    }
    if ("permissions" in navigator) {
      try {
        const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
        if (status.state === "denied") {
          toast.error(t("errors.geolocationBlocked"));
          return;
        }
      } catch {
        // Permissions API may not support 'geolocation' on some browsers — skip silently.
      }
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        updateStart([pos.coords.longitude, pos.coords.latitude], t("form.gpsActive"));
        setIsLocating(false);
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? t("errors.geolocationBlocked")
            : err.code === err.TIMEOUT
              ? t("errors.geolocationTimeout")
              : t("errors.geolocationDenied");
        toast.error(message);
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  }, [t, updateStart]);

  const onSearch = useCallback(async () => {
    if (!start) return;
    fetchAbortRef.current?.abort();
    const ctrl = new AbortController();
    fetchAbortRef.current = ctrl;

    setIsSearching(true);
    setTracks(null);
    setSelectedTrackId(null);
    setRoute(null);

    try {
      const found = await findNearbyTracks({
        center: start,
        radiusM: SEARCH_RADIUS_M,
        signal: ctrl.signal,
      });
      if (ctrl.signal.aborted) return;
      setTracks(found.slice(0, MAX_RESULTS));
      if (found.length === 0) {
        toast.error(t("trackFinder.noResults"));
      }
    } catch (err) {
      if (ctrl.signal.aborted) return;
      console.warn("TrackFinder: search failed", err);
      toast.error(t("trackFinder.searchFailed"));
    } finally {
      if (!ctrl.signal.aborted) setIsSearching(false);
    }
  }, [start, t]);

  const buildRouteToTrack = useCallback(
    async (track: NearbyTrack) => {
      if (!start) return;
      setIsRouting(true);
      setRoute(null);
      try {
        const next = await routeFromWaypoints({
          waypoints: [start, track.point, start],
          discipline: "running",
          shape: "out_and_back",
          surface: "road",
          name: track.name
            ? t("trackFinder.routeName", { name: track.name })
            : t("trackFinder.routeNameUnknown"),
        });
        setRoute({
          ...next,
          // Keep the track POI on the saved route so the marker shows up
          // on map and detail views without a fresh Overpass call.
          pois: [{ type: "track", point: track.point, name: track.name }],
        });
      } catch (err) {
        console.warn("TrackFinder: routing failed", err);
        const isUnreachable = err instanceof BrouterError && (err.status === 400 || err.status === 0);
        toast.error(
          isUnreachable ? t("trackFinder.routeUnreachable") : t("errors.routingFailed"),
        );
      } finally {
        setIsRouting(false);
      }
    },
    [start, t],
  );

  const onPickTrack = useCallback(
    (track: NearbyTrack) => {
      setSelectedTrackId(track.id);
      void buildRouteToTrack(track);
    },
    [buildRouteToTrack],
  );

  const onSave = useCallback(async () => {
    if (!route) return;
    if (await saveRoute(route)) {
      toast.success(t("result.saved"));
      navigate(`/routes/${route.id}`);
    } else {
      toast.error(t("result.saveFailed"));
    }
  }, [route, saveRoute, t, navigate]);

  const onExport = useCallback(() => {
    if (!route) return;
    const filename = downloadRouteGpx(route);
    toast.success(filename);
  }, [route]);

  if (!settings.routeGeneratorEnabled) {
    return (
      <>
        <SEOHead title={t("trackFinder.title")} description={t("trackFinder.subtitle")} canonical="/routes/tracks" noindex />
        <div className="zn-rt">
          <section className="zn-rt__band zn-rt__band--first">
            <EmptyState
              variant="not-started"
              icon={EyeOff}
              title={t("disabled.title")}
              description={t("disabled.body")}
              action={
                <Button asChild>
                  <Link to="/settings">{t("disabled.cta")}</Link>
                </Button>
              }
            />
          </section>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title={t("trackFinder.title")}
        description={t("trackFinder.subtitle")}
        canonical="/routes/tracks"
      />

      <div className="zn-rt">
        {/* 1 — what this screen looks for, and how far it looks */}
        <section className="zn-rt__band zn-rt__band--first">
          <div className="zn-rt__head">
            <div
              className="zn-stack zn-rt__headtext"
              style={{ "--gap": "var(--sp-6)" } as CSSProperties}
            >
              <span className="zn-kicker">
                {t("trackFinder.kicker", { radius: Math.round(SEARCH_RADIUS_M / 1_000) })}
              </span>
              <h1 className="zn-display" data-level="2">
                {t("trackFinder.title")}
              </h1>
              <p className="zn-body zn-body--lead zn-rt__lede">{t("trackFinder.subtitle")}</p>
            </div>

            <Button variant="outline" asChild>
              <Link to="/routes">
                {t("trackFinder.backToGenerator")}
                <ArrowRight size={17} />
              </Link>
            </Button>
          </div>
        </section>

        {/* 2 — the search on the left, the cartography on the right */}
        <section className="zn-rt__band zn-rt__split">
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-10)" } as CSSProperties}
          >
            <div className="zn-rt__panelcard">
              <fieldset className="zn-rt__field">
                <legend className="zn-rt__legend">{t("form.start")}</legend>
                <AddressSearchInput
                  onSelect={(point, label) => updateStart(point, label)}
                  onClear={() => updateStart(null, null)}
                  selectedLabel={startLabel}
                  disabled={isLocating}
                />
                <div className="zn-cluster">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={requestGps}
                    disabled={isLocating}
                  >
                    {isLocating ? (
                      <Loader2 size={16} className="zn-route-spin" />
                    ) : (
                      <MapPin size={16} />
                    )}
                    {isLocating ? t("form.gpsLocating") : t("form.useGps")}
                  </Button>
                  {start && (
                    <span className="zn-route-form__coords">
                      {start[1].toFixed(4)}, {start[0].toFixed(4)}
                    </span>
                  )}
                </div>
              </fieldset>

              <div
                className="zn-stack"
                style={{ "--gap": "var(--sp-5)" } as CSSProperties}
              >
                <Button
                  type="button"
                  className="zn-rt__submit"
                  onClick={onSearch}
                  disabled={!start || isSearching}
                >
                  {isSearching && <Loader2 size={17} className="zn-route-spin" />}
                  {t("trackFinder.search")}
                </Button>
                <p className="zn-rt__hint">
                  {t("trackFinder.searchHint", { radius: Math.round(SEARCH_RADIUS_M / 1_000) })}
                </p>
              </div>
            </div>

            {tracks && tracks.length > 0 && (
              <div className="zn-rt__tracks">
                <p className="zn-kicker zn-rt__tracks-head">
                  {t("trackFinder.results", { count: tracks.length })}
                </p>
                <ul className="zn-rt__tracklist">
                  {tracks.map((track) => {
                    const isSelected = track.id === selectedTrackId;
                    return (
                      <li key={track.id}>
                        <button
                          type="button"
                          onClick={() => onPickTrack(track)}
                          className="zn-rt__track"
                          aria-pressed={isSelected}
                        >
                          <span className="zn-fill">
                            <span className="zn-rt__track-name">
                              {track.name ?? t("trackFinder.unnamedTrack")}
                            </span>
                            <span className="zn-rt__track-dist">
                              {t("trackFinder.distance", {
                                km: formatHaversineKm(track.haversineDistanceM),
                              })}
                            </span>
                          </span>
                          {isSelected && isRouting && (
                            <Loader2 size={16} className="zn-rt__track-wait" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <div
            className="zn-stack zn-rt__sticky"
            style={{ "--gap": "var(--sp-10)" } as CSSProperties}
          >
            <div className="zn-rt__map">
              <Suspense fallback={<MapSkeleton />}>
                <RouteMap
                  points={route?.points ?? []}
                  pois={tracks ? trackPois : route?.pois}
                  start={route ? null : start}
                  showDirection={!!route}
                  className={MAP_FRAME}
                />
              </Suspense>
            </div>

            {route && (
              <>
                <div className="zn-rt__figures">
                  <StatBlock
                    size="sm"
                    value={`${(route.distanceM / 1000).toFixed(2)} km`}
                    label={t("result.actualDistance")}
                  />
                  <StatBlock
                    size="sm"
                    value={`${route.elevationGainM} m`}
                    label={t("result.elevationGain")}
                  />
                  <StatBlock
                    size="sm"
                    value={formatDurationMinutes(route.estimatedDurationSec / 60)}
                    label={t("result.estimatedDuration")}
                  />
                </div>

                <div className="zn-cluster">
                  <Button onClick={onSave}>
                    <Save size={17} />
                    {t("result.save")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => selectedTrack && void buildRouteToTrack(selectedTrack)}
                    disabled={!selectedTrack || isRouting}
                  >
                    <RotateCcw size={17} />
                    {t("form.regenerate")}
                  </Button>
                  <Button variant="outline" onClick={onExport}>
                    <Download size={17} />
                    {t("result.exportGpx")}
                  </Button>
                </div>
              </>
            )}

            {!route && tracks && tracks.length > 0 && !isRouting && (
              <Alert kind="info">{t("trackFinder.pickHint")}</Alert>
            )}

            {tracks?.length === 0 && (
              <Alert kind="warning" title={t("trackFinder.noResultsTitle")}>
                {t("trackFinder.noResults")}
              </Alert>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

export default TrackFinderPage;
