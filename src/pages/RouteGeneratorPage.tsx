import {
  lazy,
  Suspense,
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Activity, ArrowLeftRight, Check, ChevronDown, ChevronLeft, ChevronRight, Clock, Download, EyeOff, Loader2, Maximize2, Minimize2, Pencil, RotateCcw, Save, TrendingUp, X } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/useIsMobile";
import { SEOHead } from "@/components/seo";
import {
  RouteParametersForm,
  type RouteFormSubmitPayload,
} from "@/components/domain/RouteParametersForm";
import { RouteCandidateCard } from "@/components/domain/RouteCandidateCard";
import { generateRouteCandidates } from "@/lib/routeGenerator";
import { useRouteEditor } from "@/hooks/useRouteEditor";
import {
  buildManualRouteIntent,
  buildTrainingRoutePreset,
  buildWorkoutRoutePreset,
  getDistanceMatchLabel,
  poiBoostForSession,
  rankRouteCandidates,
  type DistanceMatchLabel,
  type RankedRouteCandidate,
} from "@/lib/routeGenerator/recommendation";
import { downloadRouteGpx } from "@/lib/export/gpx";
import { useRoutes } from "@/hooks/useRoutes";
import { useSettings } from "@/hooks/useSettings";
import { formatDurationMinutes } from "@/components/visualization/transforms";
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

function MapSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("zn-rt__mapskel", className)} />;
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
  const isMobile = useIsMobile();

  const [candidates, setCandidates] = useState<DisplayCandidate[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewStart, setPreviewStart] = useState<RouteCoordinate | null>(null);
  const [lastPayload, setLastPayload] = useState<RouteFormSubmitPayload | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reversedIds, setReversedIds] = useState<Record<string, boolean>>({});
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  // Desktop one-page layout: the "why this route" panel is folded by default
  // so the map keeps the maximum vertical room. Users only pop it open when
  // they want to compare the rationale or read the elevation profile.
  const [detailsOpen, setDetailsOpen] = useState(false);

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

  // Edit mode is entirely owned by useRouteEditor: state machine,
  // debounced re-route with AbortController, waypoint mutators. The
  // hook reads displayPoints lazily via a ref so the caller doesn't
  // need to pre-compute it (it's actually derived *from* this hook's
  // editPreview, which would otherwise create a circular dependency).
  // `onApply` plugs the edited route back into the candidates array
  // and clears the active reverse flag.
  const editorOnApply = useCallback((next: Route) => {
    setCandidates((prev) => {
      const idx = prev.findIndex((c) => c.route.id === next.id);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], route: next, recommendation: null };
      return updated;
    });
    setReversedIds((prev) => ({ ...prev, [next.id]: false }));
  }, []);
  const editorDisplayPointsRef = useRef<RouteCoordinate[]>([]);
  const {
    editWaypoints,
    editPreview,
    isReRouting,
    onEnterEdit,
    onExitEdit,
    onApplyEdit,
    onWaypointMove,
    onWaypointInsert,
    onWaypointRemove,
  } = useRouteEditor({
    route,
    getDisplayPoints: useCallback(() => editorDisplayPointsRef.current, []),
    onApply: editorOnApply,
  });

  const isEditing = editWaypoints != null;
  const displayedRoute = editPreview ?? route;

  const displayPoints = useMemo(() => {
    if (!displayedRoute) return [] as RouteCoordinate[];
    if (isEditing) return displayedRoute.points;
    return isSelectedReversed ? [...displayedRoute.points].reverse() : displayedRoute.points;
  }, [displayedRoute, isSelectedReversed, isEditing]);
  // Mirror displayPoints into the ref the editor reads via getDisplayPoints
  //, refs don't trigger renders, so this assignment during the render
  // pass is safe (and avoids the useEffect tick lag).
  editorDisplayPointsRef.current = displayPoints;

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
  // Each entry keeps its original index so a click on the muted polyline
  // can promote it as the new selection (cf. onCandidateSelect).
  const candidateTraces = useMemo(
    () =>
      candidates
        .map((c, index) => ({
          index,
          points: c.route.points,
          label: `${t("form.candidate", { index: index + 1 })} · ${(c.route.distanceM / 1000).toFixed(1)} km`,
        }))
        .filter(({ index }) => index !== selectedIndex),
    [candidates, selectedIndex, t],
  );

  const displayDurationSec =
    isEditing && displayedRoute
      ? displayedRoute.estimatedDurationSec
      : selectedRecommendation?.predictedDurationSec ?? route?.estimatedDurationSec ?? 0;
  // Single source of truth for the distance-vs-target descriptor,
  // returns one of three mutually exclusive labels (very_close / close
  // / approximate) so the UI never shows two contradictory chips.
  const distanceMatchLabel: DistanceMatchLabel | null = displayedRoute
    ? getDistanceMatchLabel(
        displayedRoute.constraints.targetDistanceKm,
        displayedRoute.distanceM / 1000,
      )
    : null;

  const onReverseTrace = useCallback(() => {
    if (!route) return;
    setReversedIds((prev) => ({ ...prev, [route.id]: !prev[route.id] }));
  }, [route]);

  const onMapClick = useCallback((point: RouteCoordinate) => {
    setPreviewStart(point);
  }, []);

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

  const onSave = async () => {
    if (!route) return;
    const routeToSave: Route = {
      ...route,
      points: displayPoints,
      elevation: displayElevation,
      estimatedDurationSec: displayDurationSec || route.estimatedDurationSec,
      ...(trainingPreset?.planSessionRef ? { planSessionRef: trainingPreset.planSessionRef } : {}),
    };
    if (await saveRoute(routeToSave)) {
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
        <div className="zn-rt">
          <section className="zn-rt__band">
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

  // ─── Blocks shared by the phone and the desktop arrangement ───────────
  //
  // Secondary nav (Mes parcours / Trouver une piste) lives in the global
  // Sidebar rather than in this header: they belong to the same navigation
  // domain as /routes itself, which keeps this screen to a single h1.

  // The session this route is being built for, quoted from the plan or from
  // the library. One block covers both: only the headline sentence and the
  // link back to the plan differ.
  const presetNode: ReactNode = trainingPreset ? (
    <div className="zn-rt__preset">
      <span className="zn-kicker">
        {t(`recommendation.eyebrow.${trainingPreset.intent.source}`)}
      </span>
      <p className="zn-rt__preset-title">
        {presetSession
          ? t("recommendation.optimizedFor", {
              session: presetSessionLabel ?? t("recommendation.genericSession"),
            })
          : t("recommendation.optimizedForWorkout", {
              session: presetSessionLabel ?? t("recommendation.genericSession"),
              workout: presetTitle ?? t("recommendation.genericWorkout"),
            })}
      </p>
      <p className="zn-mono zn-rt__facts">
        {t("recommendation.sessionSummary", {
          distance: trainingPreset.formDefaults.targetDistanceKm.toFixed(1),
          duration: presetSession
            ? presetSession.targetDurationMin ?? presetSession.estimatedDurationMin
            : trainingPreset.intent.targetDurationMin ?? 0,
        })}
      </p>
      {presetSessionNotes && <p className="zn-rt__preset-note">{presetSessionNotes}</p>}
      <div className="zn-cluster">
        <span className="zn-rt__tag">
          {t(`recommendation.preferences.${trainingPreset.intent.terrainPreference}`)}
        </span>
        <span className="zn-rt__tag">
          {t(`recommendation.preferences.continuity_${trainingPreset.intent.continuityPriority}`)}
        </span>
        {trainingPreset.intent.repeatabilityPriority !== "low" && (
          <span className="zn-rt__tag">{t("recommendation.preferences.repeatable")}</span>
        )}
      </div>
      {presetSession && trainingPreset.planSessionRef && (
        <Button variant="link" size="sm" asChild>
          <Link
            to={`/plan/${trainingPreset.planSessionRef.planId}?week=${trainingPreset.planSessionRef.weekNumber}`}
          >
            {t("recommendation.backToPlan")}
          </Link>
        </Button>
      )}
    </div>
  ) : null;

  // Map plus the marks that ride on it. The frame, the radius and the
  // clipping belong to .zn-rt__map; the map itself fills the cell.
  const mapBlock = (
    <div className="zn-rt__map">
      {!route && (
        <p className="zn-rt__maphint">
          {previewStart ? t("form.mapPickedHint") : t("form.mapPickStartHint")}
        </p>
      )}

      <Suspense fallback={<MapSkeleton className="zn-rt__mapskel--fill" />}>
        <RouteMap
          points={displayPoints}
          candidates={isEditing ? [] : candidateTraces}
          onCandidateSelect={isEditing ? undefined : setSelectedIndex}
          pois={isEditing ? undefined : displayedRoute?.pois}
          start={route ? null : previewStart}
          showDirection={!!route && !isEditing}
          onMapClick={!route ? onMapClick : undefined}
          editableWaypoints={editWaypoints ?? undefined}
          editClosedLoop={isEditing && route?.shape === "loop"}
          onWaypointMove={onWaypointMove}
          onWaypointInsert={onWaypointInsert}
          onWaypointRemove={onWaypointRemove}
        />
      </Suspense>

      {isEditing && (
        <p className="zn-rt__maphint" data-kind="edit">
          {isReRouting ? t("edit.rerouting") : t("edit.hint")}
        </p>
      )}

      {displayedRoute && isMobile && (
        <p className="zn-rt__readout">
          {(displayedRoute.distanceM / 1000).toFixed(1)} km · ↑ {displayedRoute.elevationGainM} m
        </p>
      )}

      {!isMobile && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMapExpanded((v) => !v);
          }}
          onPointerDownCapture={(e) => e.stopPropagation()}
          className="zn-rt__mapbtn zn-rt__mapbtn--corner"
          aria-label={isMapExpanded ? t("form.mapShrink") : t("form.mapExpand")}
        >
          {isMapExpanded ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          {isMapExpanded ? t("form.mapShrink") : t("form.mapExpand")}
        </button>
      )}

      {/* The phone keeps its editing affordances on the map; the desktop has
          a dedicated strip under it, so exactly one of the two is on screen. */}
      {isMobile && route && !isEditing && (
        <div className="zn-rt__mapdock">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReverseTrace();
            }}
            onPointerDownCapture={(e) => e.stopPropagation()}
            className="zn-rt__mapbtn"
          >
            {/* No aria-label: the visible text is the name, and it is the one
                that says whether the trace is already reversed. */}
            <ArrowLeftRight size={15} />
            {isSelectedReversed ? t("form.reversedActive") : t("form.reverseDirection")}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEnterEdit();
            }}
            onPointerDownCapture={(e) => e.stopPropagation()}
            className="zn-rt__mapbtn"
            data-tone="accent"
            aria-label={t("edit.enter")}
            title={t("edit.enter")}
          >
            <Pencil size={15} />
            {t("edit.enter")}
          </button>
        </div>
      )}

      {isMobile && isEditing && (
        <div className="zn-rt__mapdock">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExitEdit();
            }}
            onPointerDownCapture={(e) => e.stopPropagation()}
            className="zn-rt__mapbtn"
          >
            <X size={15} />
            {t("edit.cancel")}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onApplyEdit();
            }}
            onPointerDownCapture={(e) => e.stopPropagation()}
            disabled={isReRouting || !editPreview}
            className="zn-rt__mapbtn"
            data-tone="accent"
          >
            {isReRouting ? <Loader2 size={15} className="zn-route-spin" /> : <Check size={15} />}
            {t("edit.apply")}
          </button>
        </div>
      )}
    </div>
  );

  // ─── The numbers, on the rule under the map ───────────────────────────
  // Distance, ascent and duration are the headline of a generated route; the
  // pager beside them says which of the three proposals they belong to.
  const statsBar = route ? (
    <div className="zn-rt__stats">
      <h3 className="zn-rt__statline">
        <span className="zn-rt__stat">
          <Activity size={14} />
          {((displayedRoute?.distanceM ?? 0) / 1000).toFixed(1)}
          <span className="zn-rt__stat-unit">km</span>
        </span>
        <span className="zn-rt__stat">
          <TrendingUp size={14} />
          {displayedRoute?.elevationGainM ?? 0}
          <span className="zn-rt__stat-unit">m</span>
        </span>
        <span className="zn-rt__stat">
          <Clock size={14} />
          {formatDurationMinutes(displayDurationSec / 60)}
        </span>
      </h3>

      {candidates.length > 1 && (
        <div className="zn-rt__pager">
          <Button
            variant="ghost"
            size="icon-sm"
            className="zn-rt__pager-step"
            onClick={() => setSelectedIndex((i) => (i - 1 + candidates.length) % candidates.length)}
            aria-label={t("form.candidatePrev")}
          >
            <ChevronLeft size={16} />
          </Button>
          <span className="zn-rt__pager-label">
            {t("form.candidate", { index: selectedIndex + 1 })}
            <span className="zn-rt__pager-total">{` / ${candidates.length}`}</span>
          </span>
          <Button
            variant="ghost"
            size="icon-sm"
            className="zn-rt__pager-step"
            onClick={() => setSelectedIndex((i) => (i + 1) % candidates.length)}
            aria-label={t("form.candidateNext")}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  ) : null;

  // ─── The action strip ─────────────────────────────────────────────────
  // Two groups on one rule: what you do to the trace on the left, what you do
  // with it on the right. In edit mode the left group flips to cancel/apply so
  // every editing affordance stays in one predictable place.
  const actionStrip = route ? (
    <div className="zn-rt__strip">
      <div className="zn-cluster">
        {isEditing ? (
          <>
            <Button variant="outline" size="sm" onClick={onExitEdit}>
              <X size={16} />
              {t("edit.cancel")}
            </Button>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={onApplyEdit}
              disabled={isReRouting || !editPreview}
            >
              {isReRouting ? <Loader2 size={16} className="zn-route-spin" /> : <Check size={16} />}
              {t("edit.apply")}
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={onEnterEdit}>
              <Pencil size={16} />
              {t("edit.enter")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onReverseTrace}
            >
              <ArrowLeftRight size={16} />
              {isSelectedReversed ? t("form.reversedActive") : t("form.reverseDirection")}
            </Button>
          </>
        )}
      </div>

      <span className="zn-rt__strip-rule" aria-hidden="true" />

      <div className="zn-cluster zn-push">
        <Button onClick={onSave} size="sm">
          <Save size={16} />
          {t("result.save")}
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onRegenerate}
          disabled={isGenerating}
          aria-label={t("form.regenerate")}
          title={t("form.regenerate")}
        >
          <RotateCcw size={16} />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={onExport}
          aria-label={t("result.exportGpx")}
          title={t("result.exportGpx")}
        >
          <Download size={16} />
        </Button>
      </div>
    </div>
  ) : null;

  // The verdicts: how close the trace landed, and why the algorithm ranked it
  // first. Outlined tags, never fills, a row of filled tags would spend the
  // screen's one accent six times over.
  const verdicts = (
    <div className="zn-cluster" style={{ "--gap": "var(--sp-3)" } as CSSProperties}>
      {distanceMatchLabel && (
        <span className="zn-rt__tag" data-match={distanceMatchLabel}>
          {t(`recommendation.distanceMatch.${distanceMatchLabel}`)}
        </span>
      )}
      {selectedRecommendation?.reasons.map((reason) => (
        <span key={reason} className="zn-rt__tag">
          {t(`recommendation.reasons.${reason}`)}
        </span>
      ))}
    </div>
  );

  // ─── "Why this route", folded away ────────────────────────────────────
  const detailsPanel = route ? (
    <div className="zn-rt__details">
      <button
        type="button"
        onClick={() => setDetailsOpen((v) => !v)}
        aria-expanded={detailsOpen}
        className="zn-rt__summary"
      >
        <span className="zn-row" style={{ "--gap": "var(--sp-5)" } as CSSProperties}>
          <span className="zn-kicker">{t("recommendation.resultEyebrow")}</span>
          {selectedRecommendation && (
            <span className="zn-rt__tag">
              {t(`recommendation.accents.${selectedRecommendation.accent}`)}
            </span>
          )}
        </span>
        <ChevronDown size={16} className="zn-rt__summary-chevron" />
      </button>

      {detailsOpen && (
        <div className="zn-rt__panel">
          {verdicts}
          {displayElevation.length > 1 && (
            <Suspense fallback={null}>
              <ElevationChart profile={displayElevation} />
            </Suspense>
          )}
        </div>
      )}
    </div>
  ) : null;

  // ─── The phone's result strip ─────────────────────────────────────────
  // One line of facts and the three output actions; the alternates sweep
  // sideways underneath so the map never loses its height.
  const mobileResult = route ? (
    <div className="zn-rt__result">
      <div className="zn-row zn-row--split">
        <div className="zn-fill zn-stack" style={{ "--gap": "var(--sp-2)" } as CSSProperties}>
          <span className="zn-kicker zn-truncate">
            {selectedRecommendation
              ? t(`recommendation.accents.${selectedRecommendation.accent}`)
              : t("recommendation.accents.closest_to_target")}
          </span>
          <span className="zn-mono zn-rt__facts">
            <strong>{((displayedRoute?.distanceM ?? 0) / 1000).toFixed(1)} km</strong>
            <span>↑ {displayedRoute?.elevationGainM ?? 0} m</span>
            <span>{formatDurationMinutes(displayDurationSec / 60)}</span>
          </span>
        </div>

        <div className="zn-row zn-fixed" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
          <Button onClick={onSave} size="sm">
            <Save size={16} />
            {t("result.save")}
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={onRegenerate}
            disabled={isGenerating}
            aria-label={t("form.regenerate")}
            title={t("form.regenerate")}
          >
            <RotateCcw size={16} />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={onExport}
            aria-label={t("result.exportGpx")}
            title={t("result.exportGpx")}
          >
            <Download size={16} />
          </Button>
        </div>
      </div>

      {candidates.length > 1 && (
        <div
          className="zn-rt__cands zn-scroll-x"
          role="group"
          aria-label={t("form.candidatesLabel")}
        >
          {candidates.map((c, i) => (
            <RouteCandidateCard
              key={c.route.id}
              route={c.route}
              recommendation={c.recommendation}
              selected={i === selectedIndex}
              onSelect={() => setSelectedIndex(i)}
            />
          ))}
        </div>
      )}

      {distanceMatchLabel && (
        <span className="zn-rt__tag" data-match={distanceMatchLabel}>
          {t(`recommendation.distanceMatch.${distanceMatchLabel}`)}
        </span>
      )}
    </div>
  ) : null;

  // ─── One arrangement: rail then stage ─────────────────────────────────
  // Side by side on a desktop, stacked on a phone. /routes is the app's one
  // fullscreen route, App.tsx hides the footer for it, so the screen claims
  // exactly one viewport and each column scrolls inside itself.
  return (
    <>
      <SEOHead title={t("title")} description={t("subtitle")} canonical="/routes" />

      <div className="zn-rt__screen">
        <header className="zn-rt__topline">
          <h1 className="zn-title" data-level="4">
            {t("title")}
          </h1>
        </header>

        <div className="zn-rt__grid" data-expanded={!isMobile && isMapExpanded}>
          <aside className="zn-rt__rail">
            {presetNode}
            <RouteParametersForm
              key={trainingPreset ? `${trainingPreset.planSessionRef?.planId}-${trainingPreset.planSessionRef?.weekNumber}-${trainingPreset.planSessionRef?.sessionIndex}` : "manual-route-form"}
              isGenerating={isGenerating}
              onSubmit={onSubmit}
              onError={(msg) => toast.error(msg)}
              onStartChange={(point) => setPreviewStart(point)}
              externalStart={previewStart}
              initialValues={trainingPreset?.formDefaults}
              compact={isMobile}
            />
          </aside>

          <main className="zn-rt__stage">
            {mapBlock}
            {isMobile ? (
              mobileResult
            ) : (
              <>
                {statsBar}
                {actionStrip}
                {detailsPanel}
              </>
            )}
          </main>
        </div>
      </div>
    </>
  );
}

export default RouteGeneratorPage;
