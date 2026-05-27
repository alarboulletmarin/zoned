import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ArrowRight, Download, EyeOff, Loader2, MapPin, RotateCcw, Save } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp } from "@/components/editorial";
import { AddressSearchInput } from "@/components/domain/AddressSearchInput";
import { findNearbyTracks, type NearbyTrack } from "@/lib/routeGenerator/poi/overpass";
import { BrouterError, routeFromWaypoints } from "@/lib/routeGenerator";
import { downloadRouteGpx } from "@/lib/export/gpx";
import { useRoutes } from "@/hooks/useRoutes";
import { useSettings } from "@/hooks/useSettings";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { cn } from "@/lib/utils";
import type { Route, RouteCoordinate, RoutePoiSummary } from "@/types/route";

const RouteMap = lazy(() =>
  import("@/components/visualization/route/RouteMap").then((m) => ({
    default: m.RouteMap,
  })),
);

function MapSkeleton() {
  return (
    <div className="h-72 w-full animate-pulse rounded-xl border border-border/60 bg-muted/40 sm:h-96 lg:h-[28rem]" />
  );
}

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
        <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border/60 bg-muted/10 p-10 text-center">
            <EyeOff className="size-10 text-muted-foreground" />
            <div className="space-y-1">
              <h1 className="text-xl font-bold">{t("disabled.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("disabled.body")}</p>
            </div>
            <Button asChild>
              <Link to="/settings">{t("disabled.cta")}</Link>
            </Button>
          </div>
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
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 space-y-1">
          <EditorialTitle as="h1" size="md">{t("trackFinder.title")}</EditorialTitle>
          <FadeUp as="p" delay={0.1} className="text-sm text-muted-foreground">
            {t("trackFinder.subtitle")}
          </FadeUp>
          <Link
            to="/routes"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            {t("trackFinder.backToGenerator")} <ArrowRight className="size-3.5" />
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,360px)_1fr] xl:gap-8">
          <aside className="min-w-0 space-y-4">
            <div className="rounded-xl border border-border/60 bg-background p-4 sm:p-5">
              <fieldset className="space-y-2">
                <legend className="text-sm font-semibold">{t("form.start")}</legend>
                <AddressSearchInput
                  onSelect={(point, label) => updateStart(point, label)}
                  onClear={() => updateStart(null, null)}
                  selectedLabel={startLabel}
                  disabled={isLocating}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant={start ? "outline" : "secondary"}
                    size="sm"
                    onClick={requestGps}
                    disabled={isLocating}
                    className="gap-2"
                  >
                    {isLocating ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
                    {isLocating ? t("form.gpsLocating") : t("form.useGps")}
                  </Button>
                  {start && (
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {start[1].toFixed(4)}, {start[0].toFixed(4)}
                    </span>
                  )}
                </div>
              </fieldset>
              <Button
                type="button"
                size="lg"
                className="mt-4 h-12 w-full text-base font-semibold"
                onClick={onSearch}
                disabled={!start || isSearching}
              >
                {isSearching && <Loader2 className="mr-2 size-4 animate-spin" />}
                {t("trackFinder.search")}
              </Button>
              <p className="mt-2 text-[11px] text-muted-foreground">
                {t("trackFinder.searchHint", { radius: Math.round(SEARCH_RADIUS_M / 1_000) })}
              </p>
            </div>

            {tracks && tracks.length > 0 && (
              <div className="rounded-xl border border-border/60 bg-background p-2">
                <p className="px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {t("trackFinder.results", { count: tracks.length })}
                </p>
                <ul className="space-y-1">
                  {tracks.map((track) => {
                    const isSelected = track.id === selectedTrackId;
                    return (
                      <li key={track.id}>
                        <button
                          type="button"
                          onClick={() => onPickTrack(track)}
                          className={cn(
                            "flex w-full items-start justify-between gap-3 rounded-lg border p-3 text-left transition-colors",
                            isSelected
                              ? "border-primary bg-primary/5"
                              : "border-transparent hover:border-border/60 hover:bg-accent/50",
                          )}
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {track.name ?? t("trackFinder.unnamedTrack")}
                            </p>
                            <p className="text-[11px] tabular-nums text-muted-foreground">
                              {t("trackFinder.distance", { km: formatHaversineKm(track.haversineDistanceM) })}
                            </p>
                          </div>
                          {isSelected && isRouting && (
                            <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </aside>

          <main className="min-w-0 space-y-4 lg:sticky lg:top-20 lg:self-start">
            <div className="relative">
              <Suspense fallback={<MapSkeleton />}>
                <RouteMap
                  points={route?.points ?? []}
                  pois={tracks ? trackPois : route?.pois}
                  start={route ? null : start}
                  showDirection={!!route}
                />
              </Suspense>
            </div>

            {route && (
              <>
                <div className="grid grid-cols-3 gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("result.actualDistance")}</p>
                    <p className="text-lg font-semibold tabular-nums">
                      {(route.distanceM / 1000).toFixed(2)} km
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("result.elevationGain")}</p>
                    <p className="text-lg font-semibold tabular-nums">{route.elevationGainM} m</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("result.estimatedDuration")}</p>
                    <p className="text-lg font-semibold tabular-nums">
                      {formatDurationMinutes(route.estimatedDurationSec / 60)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button onClick={onSave} className="gap-2">
                    <Save className="size-4" />
                    {t("result.save")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => selectedTrack && void buildRouteToTrack(selectedTrack)}
                    className="gap-2"
                    disabled={!selectedTrack || isRouting}
                  >
                    <RotateCcw className="size-4" />
                    {t("form.regenerate")}
                  </Button>
                  <Button variant="outline" onClick={onExport} className="gap-2">
                    <Download className="size-4" />
                    {t("result.exportGpx")}
                  </Button>
                </div>
              </>
            )}

            {!route && tracks && tracks.length > 0 && !isRouting && (
              <div className="rounded-xl border border-dashed border-border/60 bg-muted/10 p-4 text-sm text-muted-foreground">
                {t("trackFinder.pickHint")}
              </div>
            )}

            {tracks?.length === 0 && (
              <div className="rounded-xl border border-amber-300/60 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-100">
                {t("trackFinder.noResults")}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default TrackFinderPage;
