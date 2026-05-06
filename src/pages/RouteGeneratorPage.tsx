import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ArrowLeftRight, ArrowRight, Check, Download, EyeOff, Maximize2, Minimize2, Pencil, RotateCcw, Save, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import {
  RouteParametersForm,
  type RouteFormSubmitPayload,
} from "@/components/domain/RouteParametersForm";
import { BrouterError, generateRouteCandidates, routeFromWaypoints } from "@/lib/routeGenerator";
import {
  buildManualRouteIntent,
  buildTrainingRoutePreset,
  buildWorkoutRoutePreset,
  poiBoostForSession,
  rankRouteCandidates,
  type RankedRouteCandidate,
} from "@/lib/routeGenerator/recommendation";
import { downloadRouteGpx } from "@/lib/export/gpx";
import { useRoutes } from "@/hooks/useRoutes";
import { useSettings } from "@/hooks/useSettings";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { Segmented, type SegmentedOption } from "@/components/ui/segmented";
import { cn } from "@/lib/utils";
import { usePickLang, usePickLocale } from "@/lib/i18n-utils";
import { loadRunnerProfile } from "@/lib/runnerProfile";
import { SESSION_TYPE_LABELS } from "@/lib/labels";
import type { WorkoutTemplate } from "@/types";
import type { Route, RouteCoordinate } from "@/types/route";
import type { PlanSession } from "@/types/plan";

const RouteMap = lazy(() =>
  import("@/components/visualization/route/RouteMap").then((m) => ({
    default: m.RouteMap,
  })),
);
const ElevationChart = lazy(() =>
  import("@/components/visualization/route/ElevationChart").then((m) => ({
    default: m.ElevationChart,
  })),
);

function MapSkeleton() {
  return (
    <div className="h-72 w-full animate-pulse rounded-xl border border-border/60 bg-muted/40 sm:h-96 lg:h-[28rem]" />
  );
}

/**
 * Pick the editor's initial waypoint list by sampling the trace at roughly
 * one-kilometre intervals. The original Brouter "via points" aren't stored
 * on the Route, so we approximate: a denser handle list lets the user grab
 * the trace closer to the spot they want to move without having to insert
 * a fresh waypoint first. Capped at 10 to keep the map readable.
 */
function deriveInitialWaypoints(
  route: Route,
  displayPoints: RouteCoordinate[],
): RouteCoordinate[] {
  const pts = displayPoints.length > 0 ? displayPoints : route.points;
  if (pts.length < 3) return pts;

  const totalM = route.distanceM;
  if (totalM <= 0) return [pts[0], pts[pts.length - 1]];

  // ~1 mid-handle per km, clamped between 2 and 8 so a short loop stays
  // editable and a long ride doesn't get cluttered.
  const midCount = Math.max(2, Math.min(8, Math.round(totalM / 1_000)));
  const stepCount = midCount + 1;

  const waypoints: RouteCoordinate[] = [pts[0]];
  for (let s = 1; s < stepCount; s += 1) {
    const fraction = s / stepCount;
    const idx = Math.max(1, Math.min(pts.length - 2, Math.round(fraction * (pts.length - 1))));
    waypoints.push(pts[idx]);
  }
  waypoints.push(pts[pts.length - 1]);
  return waypoints;
}

interface DisplayCandidate {
  route: Route;
  recommendation: RankedRouteCandidate | null;
}

interface RouteGeneratorLocationState {
  planRouteSession?: {
    session: PlanSession;
    planSessionRef: NonNullable<Route["planSessionRef"]>;
  };
  workoutRouteWorkout?: WorkoutTemplate;
}

export function RouteGeneratorPage() {
  const { t } = useTranslation("routes");
  const navigate = useNavigate();
  const location = useLocation();
  const { saveRoute } = useRoutes();
  const { settings } = useSettings();
  const pickLang = usePickLang();
  const pickLocale = usePickLocale();

  const [candidates, setCandidates] = useState<DisplayCandidate[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewStart, setPreviewStart] = useState<RouteCoordinate | null>(null);
  const [lastPayload, setLastPayload] = useState<RouteFormSubmitPayload | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reversedIds, setReversedIds] = useState<Record<string, boolean>>({});
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [editWaypoints, setEditWaypoints] = useState<RouteCoordinate[] | null>(null);
  const [lastValidWaypoints, setLastValidWaypoints] = useState<RouteCoordinate[] | null>(null);
  const [editPreview, setEditPreview] = useState<Route | null>(null);
  const [isReRouting, setIsReRouting] = useState(false);

  const routeState = location.state as RouteGeneratorLocationState | null;
  const runnerProfile = useMemo(() => loadRunnerProfile(), []);
  const trainingPreset = useMemo(() => {
    const planRouteSession = routeState?.planRouteSession;
    if (planRouteSession) {
      return buildTrainingRoutePreset({
        session: planRouteSession.session,
        runnerProfile,
        planSessionRef: planRouteSession.planSessionRef,
      });
    }

    if (routeState?.workoutRouteWorkout) {
      return buildWorkoutRoutePreset({
        workout: routeState.workoutRouteWorkout,
        runnerProfile,
      });
    }

    return null;
  }, [routeState, runnerProfile]);

  const presetSession = routeState?.planRouteSession?.session ?? null;
  const presetWorkout = routeState?.workoutRouteWorkout ?? null;
  const presetSessionLabel = trainingPreset?.intent.sessionType
    ? pickLocale(SESSION_TYPE_LABELS[trainingPreset.intent.sessionType], trainingPreset.intent.sessionType)
    : null;
  const presetSessionNotes = presetSession
    ? pickLang(presetSession, "notes")
    : presetWorkout
      ? pickLang(presetWorkout, "description")
      : "";
  const presetTitle = presetWorkout ? pickLang(presetWorkout, "name") : null;

  const selectedCandidate = candidates[selectedIndex] ?? null;
  const route = selectedCandidate?.route ?? null;
  const isSelectedReversed = route ? !!reversedIds[route.id] : false;
  const selectedRecommendation = selectedCandidate?.recommendation ?? null;

  const isEditing = editWaypoints != null;
  const displayedRoute = editPreview ?? route;

  const displayPoints = useMemo(() => {
    if (!displayedRoute) return [] as RouteCoordinate[];
    if (isEditing) return displayedRoute.points;
    return isSelectedReversed ? [...displayedRoute.points].reverse() : displayedRoute.points;
  }, [displayedRoute, isSelectedReversed, isEditing]);

  const displayElevation = useMemo(() => {
    if (!displayedRoute) return [] as Route["elevation"];
    if (isEditing || !isSelectedReversed) return displayedRoute.elevation;
    const total = displayedRoute.elevation[displayedRoute.elevation.length - 1]?.distanceM ?? 0;
    return [...displayedRoute.elevation]
      .map((p) => ({ distanceM: total - p.distanceM, altitudeM: p.altitudeM }))
      .reverse();
  }, [displayedRoute, isSelectedReversed, isEditing]);

  // Pre-compute the unselected traces once so RouteMap can render them in
  // the muted background layer without re-deriving the array each render.
  const candidateTraces = useMemo(
    () => candidates.filter((_, i) => i !== selectedIndex).map((c) => c.route.points),
    [candidates, selectedIndex],
  );

  const displayDurationSec =
    isEditing && displayedRoute
      ? displayedRoute.estimatedDurationSec
      : selectedRecommendation?.predictedDurationSec ?? route?.estimatedDurationSec ?? 0;
  const distanceDeviationRatio = displayedRoute
    ? Math.abs(displayedRoute.distanceM / (displayedRoute.constraints.targetDistanceKm * 1000) - 1)
    : 0;

  const onReverseTrace = useCallback(() => {
    if (!route) return;
    setReversedIds((prev) => ({ ...prev, [route.id]: !prev[route.id] }));
  }, [route]);

  const onMapClick = useCallback((point: RouteCoordinate) => {
    setPreviewStart(point);
  }, []);

  const reRoute = useCallback(
    async (waypoints: RouteCoordinate[]) => {
      if (!route) return;
      setIsReRouting(true);
      try {
        const next = await routeFromWaypoints({
          waypoints,
          discipline: route.discipline,
          shape: route.shape,
          surface: route.constraints.surface,
          routeId: route.id,
          name: route.name,
        });
        setEditPreview(next);
        setLastValidWaypoints(waypoints);
      } catch (err) {
        console.warn("RouteGenerator: re-route failed", err);
        // Brouter answers 400 when one of the waypoints isn't on its routing
        // graph — typically dragged into the sea, into a building, or onto a
        // private road. Revert to the last accepted layout so the user sees
        // their drag bounce back, and tell them why.
        const isUnreachable = err instanceof BrouterError && (err.status === 400 || err.status === 0);
        if (isUnreachable && lastValidWaypoints) {
          setEditWaypoints(lastValidWaypoints);
          toast.error(t("errors.unreachableWaypoint"));
        } else {
          toast.error(t("errors.routingFailed"));
        }
      } finally {
        setIsReRouting(false);
      }
    },
    [route, t, lastValidWaypoints],
  );

  const onEnterEdit = useCallback(() => {
    if (!route) return;
    const waypoints = deriveInitialWaypoints(route, displayPoints);
    setEditWaypoints(waypoints);
    setLastValidWaypoints(waypoints);
    setEditPreview(null);
  }, [route, displayPoints]);

  const onExitEdit = useCallback(() => {
    setEditWaypoints(null);
    setLastValidWaypoints(null);
    setEditPreview(null);
  }, []);

  const onApplyEdit = useCallback(() => {
    if (!editPreview) {
      onExitEdit();
      return;
    }
    setCandidates((prev) => {
      const idx = prev.findIndex((c) => c.route.id === editPreview.id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], route: editPreview, recommendation: null };
      return next;
    });
    setReversedIds((prev) => ({ ...prev, [editPreview.id]: false }));
    setEditWaypoints(null);
    setLastValidWaypoints(null);
    setEditPreview(null);
    toast.success(t("edit.applied"));
  }, [editPreview, onExitEdit, t]);

  const onWaypointMove = useCallback(
    (index: number, point: RouteCoordinate) => {
      if (!editWaypoints) return;
      const isLoop = route?.shape === "loop";
      const lastIdx = editWaypoints.length - 1;
      const next = editWaypoints.map((wp, i) => {
        if (i === index) return point;
        // Closed loops keep first and last in lockstep so the routing
        // request still closes — otherwise dragging the start would leave
        // the end stranded at the original location.
        if (isLoop && (index === 0 || index === lastIdx)) {
          if (i === 0 || i === lastIdx) return point;
        }
        return wp;
      });
      setEditWaypoints(next);
      void reRoute(next);
    },
    [editWaypoints, reRoute, route],
  );

  const onWaypointInsert = useCallback(
    (insertIndex: number, point: RouteCoordinate) => {
      if (!editWaypoints) return;
      const next = [
        ...editWaypoints.slice(0, insertIndex),
        point,
        ...editWaypoints.slice(insertIndex),
      ];
      setEditWaypoints(next);
      void reRoute(next);
    },
    [editWaypoints, reRoute],
  );

  const onWaypointRemove = useCallback(
    (index: number) => {
      if (!editWaypoints) return;
      if (editWaypoints.length <= 2) return;
      const next = editWaypoints.filter((_, i) => i !== index);
      setEditWaypoints(next);
      void reRoute(next);
    },
    [editWaypoints, reRoute],
  );

  const generate = useCallback(
    async (payload: RouteFormSubmitPayload, seed: number) => {
      setIsGenerating(true);
      try {
        const results = await generateRouteCandidates({
          start: payload.start,
          targetDistanceKm: payload.targetDistanceKm,
          discipline: payload.discipline,
          shape: payload.shape,
          surface: payload.surface,
          elevationGainTargetM: payload.elevationGainTargetM,
          seed,
          bearingDeg: payload.bearingDeg,
          count: 3,
          poiBoost: poiBoostForSession(trainingPreset?.intent.sessionType),
        });
        if (results.length === 0) {
          toast.error(t("errors.noConvergence"));
          return;
        }
        const nextCandidates = trainingPreset
          ? rankRouteCandidates(results, {
              intent: trainingPreset.intent,
              athlete: trainingPreset.athlete,
            }).map((entry) => ({ route: entry.route, recommendation: entry }))
          : rankRouteCandidates(results, {
              intent: buildManualRouteIntent({
                discipline: payload.discipline,
                shape: payload.shape,
                targetDistanceKm: payload.targetDistanceKm,
                surface: payload.surface,
                elevationGainTargetM: payload.elevationGainTargetM,
              }),
              athlete: runnerProfile
                ? {
                    vma: runnerProfile.vma,
                    runnerLevel: runnerProfile.runnerLevel,
                    currentWeeklyKm: runnerProfile.currentWeeklyKm,
                    currentLongRunKm: runnerProfile.currentLongRunKm,
                  }
                : null,
            }).map((entry) => ({ route: entry.route, recommendation: entry }));
        setCandidates(nextCandidates);
        setSelectedIndex(0);
        setLastPayload(payload);
      } catch (err) {
        console.warn("RouteGenerator: routing failed", err);
        toast.error(t("errors.routingFailed"));
      } finally {
        setIsGenerating(false);
      }
    },
    [runnerProfile, t, trainingPreset],
  );

  const onSubmit = (payload: RouteFormSubmitPayload) => {
    generate(payload, Date.now());
  };

  const onRegenerate = () => {
    if (!lastPayload) return;
    // Pick a fresh seed so the algorithm produces a different orientation.
    generate(lastPayload, Date.now());
  };

  const onSave = () => {
    if (!route) return;
    const routeToSave: Route = {
      ...route,
      points: displayPoints,
      elevation: displayElevation,
      estimatedDurationSec: displayDurationSec || route.estimatedDurationSec,
      ...(trainingPreset?.planSessionRef ? { planSessionRef: trainingPreset.planSessionRef } : {}),
    };
    if (saveRoute(routeToSave)) {
      toast.success(t("result.saved"));
      navigate(`/routes/${routeToSave.id}`);
    } else {
      toast.error(t("result.saveFailed"));
    }
  };

  const onExport = () => {
    if (!route) return;
    const exported: Route = isSelectedReversed
      ? { ...route, points: displayPoints, elevation: displayElevation }
      : route;
    const filename = downloadRouteGpx(exported);
    toast.success(filename);
  };

  if (!settings.routeGeneratorEnabled) {
    return (
      <>
        <SEOHead title={t("title")} description={t("subtitle")} canonical="/routes" noindex />
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
      <SEOHead title={t("title")} description={t("subtitle")} canonical="/routes" />
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold sm:text-3xl">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <Link
              to="/routes/mine"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {t("myRoutes")} <ArrowRight className="size-3.5" />
            </Link>
            <Link
              to="/routes/tracks"
              className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              {t("trackFinder.entry")} <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </header>

        <div
          className={cn(
            "grid grid-cols-1 gap-6 xl:gap-8",
            isMapExpanded ? "lg:grid-cols-1" : "lg:grid-cols-[minmax(0,360px)_1fr]",
          )}
        >
          <aside className={cn("min-w-0", isMapExpanded && "lg:hidden")}>
            {trainingPreset && presetSession && (
              <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                  {t(`recommendation.eyebrow.${trainingPreset.intent.source}`)}
                </p>
                <div className="mt-2 space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">
                    {t("recommendation.optimizedFor", { session: presetSessionLabel ?? t("recommendation.genericSession") })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("recommendation.sessionSummary", {
                      distance: trainingPreset.formDefaults.targetDistanceKm.toFixed(1),
                      duration: presetSession.targetDurationMin ?? presetSession.estimatedDurationMin,
                    })}
                  </p>
                  {presetSessionNotes && (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {presetSessionNotes}
                    </p>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground">
                    {t(`recommendation.preferences.${trainingPreset.intent.terrainPreference}`)}
                  </span>
                  <span className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground">
                    {t(`recommendation.preferences.continuity_${trainingPreset.intent.continuityPriority}`)}
                  </span>
                  {trainingPreset.intent.repeatabilityPriority !== "low" && (
                    <span className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground">
                      {t("recommendation.preferences.repeatable")}
                    </span>
                  )}
                </div>
                <div className="mt-3">
                  <Link
                    to={`/plan/${trainingPreset.planSessionRef?.planId}?week=${trainingPreset.planSessionRef?.weekNumber}`}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    {t("recommendation.backToPlan")}
                  </Link>
                </div>
              </div>
            )}
            {trainingPreset && !presetSession && presetWorkout && (
              <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/80">
                  {t(`recommendation.eyebrow.${trainingPreset.intent.source}`)}
                </p>
                <div className="mt-2 space-y-1.5">
                  <p className="text-sm font-semibold text-foreground">
                    {t("recommendation.optimizedForWorkout", {
                      session: presetSessionLabel ?? t("recommendation.genericSession"),
                      workout: presetTitle ?? t("recommendation.genericWorkout"),
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("recommendation.sessionSummary", {
                      distance: trainingPreset.formDefaults.targetDistanceKm.toFixed(1),
                      duration: trainingPreset.intent.targetDurationMin ?? 0,
                    })}
                  </p>
                  {presetSessionNotes && (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {presetSessionNotes}
                    </p>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground">
                    {t(`recommendation.preferences.${trainingPreset.intent.terrainPreference}`)}
                  </span>
                  <span className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground">
                    {t(`recommendation.preferences.continuity_${trainingPreset.intent.continuityPriority}`)}
                  </span>
                  {trainingPreset.intent.repeatabilityPriority !== "low" && (
                    <span className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground">
                      {t("recommendation.preferences.repeatable")}
                    </span>
                  )}
                </div>
              </div>
            )}
            <RouteParametersForm
              key={trainingPreset ? `${trainingPreset.planSessionRef?.planId}-${trainingPreset.planSessionRef?.weekNumber}-${trainingPreset.planSessionRef?.sessionIndex}` : "manual-route-form"}
              isGenerating={isGenerating}
              onSubmit={onSubmit}
              onError={(msg) => toast.error(msg)}
              onStartChange={(point) => setPreviewStart(point)}
              externalStart={previewStart}
              initialValues={trainingPreset?.formDefaults}
            />
          </aside>

          <main
            className={cn(
              "min-w-0 space-y-4",
              !isMapExpanded && "lg:sticky lg:top-20 lg:self-start",
            )}
          >
            <div className="relative">
              {!route && (
                <div className="pointer-events-none absolute left-1/2 top-3 z-[600] -translate-x-1/2 rounded-full border border-border/60 bg-background/95 px-3 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm">
                  {previewStart ? t("form.mapPickedHint") : t("form.mapPickStartHint")}
                </div>
              )}
              <Suspense fallback={<MapSkeleton />}>
                <RouteMap
                  points={displayPoints}
                  candidates={isEditing ? [] : candidateTraces}
                  pois={isEditing ? undefined : displayedRoute?.pois}
                  start={route ? null : previewStart}
                  showDirection={!!route && !isEditing}
                  onMapClick={!route ? onMapClick : undefined}
                  editableWaypoints={editWaypoints ?? undefined}
                  editClosedLoop={isEditing && route?.shape === "loop"}
                  onWaypointMove={onWaypointMove}
                  onWaypointInsert={onWaypointInsert}
                  onWaypointRemove={onWaypointRemove}
                  className={
                    isMapExpanded
                      ? "h-[calc(100vh-160px)] sm:h-[calc(100vh-160px)] lg:h-[calc(100vh-160px)]"
                      : undefined
                  }
                />
              </Suspense>
              {isEditing && (
                <div className="pointer-events-none absolute left-1/2 top-3 z-[600] -translate-x-1/2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-[11px] font-medium text-primary shadow-sm backdrop-blur-sm">
                  {isReRouting ? t("edit.rerouting") : t("edit.hint")}
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMapExpanded((v) => !v);
                }}
                onPointerDownCapture={(e) => e.stopPropagation()}
                className="absolute right-3 top-3 z-[1100] inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/95 px-2.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm hover:bg-background"
                aria-label={isMapExpanded ? t("form.mapShrink") : t("form.mapExpand")}
              >
                {isMapExpanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
                <span className="hidden sm:inline">
                  {isMapExpanded ? t("form.mapShrink") : t("form.mapExpand")}
                </span>
              </button>
              {route && !isEditing && (
                <div className="absolute bottom-3 right-3 z-[1100] flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReverseTrace();
                    }}
                    onPointerDownCapture={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/95 px-2.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm hover:bg-background"
                    aria-label={t("form.reverseDirection")}
                    title={t("form.reverseDirection")}
                  >
                    <ArrowLeftRight className="size-3.5" />
                    <span className="hidden sm:inline">
                      {isSelectedReversed ? t("form.reversedActive") : t("form.reverseDirection")}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEnterEdit();
                    }}
                    onPointerDownCapture={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                    aria-label={t("edit.enter")}
                    title={t("edit.enter")}
                  >
                    <Pencil className="size-3.5" />
                    <span className="hidden sm:inline">{t("edit.enter")}</span>
                  </button>
                </div>
              )}
              {isEditing && (
                <div className="absolute bottom-3 right-3 z-[1100] flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onExitEdit();
                    }}
                    onPointerDownCapture={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/95 px-2.5 py-1.5 text-xs font-medium shadow-sm backdrop-blur-sm hover:bg-background"
                  >
                    <X className="size-3.5" />
                    <span className="hidden sm:inline">{t("edit.cancel")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApplyEdit();
                    }}
                    onPointerDownCapture={(e) => e.stopPropagation()}
                    disabled={isReRouting || !editPreview}
                    className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Check className="size-3.5" />
                    <span className="hidden sm:inline">{t("edit.apply")}</span>
                  </button>
                </div>
              )}
            </div>

            {!trainingPreset && candidates.length > 1 && (
              <Segmented
                value={String(selectedIndex)}
                onChange={(v) => setSelectedIndex(Number(v))}
                label={t("form.candidatesLabel")}
                options={candidates.map<SegmentedOption<string>>((c, i) => ({
                  value: String(i),
                  label: `${t("form.candidate", { index: i + 1 })} · ${(c.route.distanceM / 1000).toFixed(1)} km`,
                }))}
              />
            )}

            {trainingPreset && candidates.length > 0 && (
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {candidates.map((candidate, index) => (
                  <button
                    key={candidate.route.id}
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    className={`rounded-xl border p-3 text-left transition-colors ${
                      index === selectedIndex
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/60 bg-background hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {candidate.recommendation
                            ? t(`recommendation.accents.${candidate.recommendation.accent}`)
                            : t("recommendation.accents.closest_to_target")}
                        </p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {(candidate.recommendation?.reasons ?? ["closest_to_target_distance"])
                            .slice(0, 2)
                            .map((reason) => t(`recommendation.reasons.${reason}`))
                            .join(" · ")}
                        </p>
                      </div>
                      {index === selectedIndex && (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                          {t("recommendation.selected")}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{(candidate.route.distanceM / 1000).toFixed(1)} km</span>
                      <span>D+ {candidate.route.elevationGainM} m</span>
                      <span>
                        {formatDurationMinutes(
                          (candidate.recommendation?.predictedDurationSec ?? candidate.route.estimatedDurationSec) / 60,
                        )}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {route && (
              <>
                {selectedRecommendation && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">
                          {t("recommendation.resultEyebrow")}
                        </p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {t(`recommendation.accents.${selectedRecommendation.accent}`)}
                        </p>
                      </div>
                      <span className="rounded-full border border-primary/20 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground">
                        {t("recommendation.scoreLabel", { score: Math.round(selectedRecommendation.score * 100) })}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedRecommendation.reasons.map((reason) => (
                        <span
                          key={reason}
                          className="rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground"
                        >
                          {t(`recommendation.reasons.${reason}`)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {distanceDeviationRatio > 0.05 && (
                  <div className="rounded-xl border border-amber-300/60 bg-amber-50/80 p-4 text-sm text-amber-900 dark:border-amber-700/60 dark:bg-amber-950/30 dark:text-amber-100">
                    <p className="font-semibold">{t("result.approximate")}</p>
                    <p className="mt-1 text-xs leading-relaxed text-amber-800/90 dark:text-amber-200/90">
                      {t("result.approximateExplain")}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("result.actualDistance")}</p>
                    <p className="text-lg font-semibold tabular-nums">
                      {((displayedRoute?.distanceM ?? 0) / 1000).toFixed(2)} km
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("result.elevationGain")}</p>
                    <p className="text-lg font-semibold tabular-nums">{displayedRoute?.elevationGainM ?? 0} m</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("result.estimatedDuration")}</p>
                    <p className="text-lg font-semibold tabular-nums">
                      {formatDurationMinutes(displayDurationSec / 60)}
                    </p>
                  </div>
                </div>

                {displayElevation.length > 1 && (
                  <div className="rounded-xl border border-border/60 bg-background p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("result.elevationProfile")}
                    </p>
                    <Suspense fallback={null}>
                      <ElevationChart profile={displayElevation} />
                    </Suspense>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button onClick={onSave} className="gap-2">
                    <Save className="size-4" />
                    {t("result.save")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onRegenerate}
                    className="gap-2"
                    disabled={isGenerating}
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
          </main>
        </div>

        {/* "How it works" — collapsed by default to keep the page action-first.
            Detailed enough to explain the routing pipeline, privacy posture
            and known limits. Uses native <details> for zero-JS toggling. */}
        <section className="mt-10">
          <details className="group rounded-xl border border-border/60 bg-muted/10 p-4 sm:p-5 [&[open]>summary>span:last-child]:rotate-180">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-sm font-semibold sm:text-base">
              <span className="flex items-center gap-2">
                {t("howItWorks.title")}
              </span>
              <span className="inline-flex size-6 items-center justify-center rounded-full border border-border/60 text-xs transition-transform">
                ▾
              </span>
            </summary>
            <div className="mt-4 space-y-5 text-sm leading-relaxed text-muted-foreground">
              <p className="text-foreground">{t("howItWorks.intro")}</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {(["step1", "step2", "step3", "step4"] as const).map((step) => (
                  <div
                    key={step}
                    className="rounded-lg border border-border/60 bg-background p-3"
                  >
                    <p className="mb-1 font-semibold text-foreground">
                      {t(`howItWorks.${step}Title`)}
                    </p>
                    <p>{t(`howItWorks.${step}Body`)}</p>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground">
                    {t("howItWorks.privacyTitle")}
                  </p>
                  <p className="text-xs">{t("howItWorks.privacyBody")}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground">
                    {t("howItWorks.limitsTitle")}
                  </p>
                  <p className="text-xs">{t("howItWorks.limitsBody")}</p>
                </div>
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-foreground">
                    {t("howItWorks.sourcesTitle")}
                  </p>
                  <p className="text-xs">{t("howItWorks.sourcesBody")}</p>
                </div>
              </div>
            </div>
          </details>
        </section>
      </div>
    </>
  );
}

export default RouteGeneratorPage;
