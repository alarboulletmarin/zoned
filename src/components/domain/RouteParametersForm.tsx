import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Bike,
  ChevronDown,
  Footprints,
  Loader2,
  MapPin,
  Mountain,
  RefreshCw,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Segmented, type SegmentedOption } from "@/components/ui/segmented";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import type { Discipline } from "@/types";
import type { RouteCoordinate, RouteShape, RouteSurface } from "@/types/route";

import { AddressSearchInput } from "./AddressSearchInput";
import { CompassInput } from "./CompassInput";

export interface RouteFormSubmitPayload {
  start: RouteCoordinate;
  shape: Extract<RouteShape, "loop" | "out_and_back">;
  discipline: Discipline;
  targetDistanceKm: number;
  surface: RouteSurface;
  elevationGainTargetM?: number;
  bearingDeg?: number;
}

interface RouteParametersFormProps {
  isGenerating: boolean;
  onSubmit: (payload: RouteFormSubmitPayload) => void;
  onError?: (message: string) => void;
  /** Notify parent when start point changes so it can preview on the map. */
  onStartChange?: (point: RouteCoordinate | null) => void;
  /**
   * External start updates pushed by the parent (e.g. user clicked the map).
   * The form switches to "manual point" mode and clears any geocoded label.
   */
  externalStart?: RouteCoordinate | null;
  initialValues?: Partial<Pick<RouteFormSubmitPayload, "shape" | "discipline" | "targetDistanceKm" | "surface" | "elevationGainTargetM" | "bearingDeg">>;
  /**
   * Compact mode for the mobile top-bar layout: hides niche fields
   * (Surface, Bearing) so the form fits in ~250px. Sensible defaults
   * still apply (mixed surface, bearing 0). Desktop keeps the full set.
   */
  compact?: boolean;
}

const CARDINAL_KEYS = [
  "directionN",
  "directionNE",
  "directionE",
  "directionSE",
  "directionS",
  "directionSW",
  "directionW",
  "directionNW",
] as const;

/**
 * Discipline-aware distance ceiling. Cycling routinely covers 100+ km on a
 * single ride while running tops out around an ultra distance, so a single
 * 50 km cap was bottlenecking both ends. Swimming has no on-road routing,
 * so its cap is irrelevant (the segmented control disables it elsewhere).
 */
const MAX_DISTANCE_KM_BY_DISCIPLINE: Record<Discipline, number> = {
  running: 80,
  cycling: 200,
  swimming: 50,
};

function clampDistance(km: number, max: number): number {
  if (!Number.isFinite(km)) return 1;
  return Math.min(max, Math.max(1, Math.round(km * 2) / 2));
}

function maxAscentFor(discipline: Discipline, distanceKm: number): number {
  if (discipline === "running") {
    return Math.max(1000, Math.min(5000, Math.round(distanceKm * 80)));
  }
  if (discipline === "cycling") {
    return Math.max(2000, Math.min(10000, Math.round(distanceKm * 120)));
  }
  return 0;
}

function clampAscent(meters: number, max: number): number {
  if (!Number.isFinite(meters)) return 0;
  return Math.min(max, Math.max(0, Math.round(meters / 10) * 10));
}

export function RouteParametersForm({
  isGenerating,
  onSubmit,
  onError,
  onStartChange,
  externalStart,
  initialValues,
  compact = false,
}: RouteParametersFormProps) {
  const { t } = useTranslation("routes");

  const [shape, setShape] = useState<Extract<RouteShape, "loop" | "out_and_back">>(initialValues?.shape ?? "loop");
  const [discipline, setDiscipline] = useState<Discipline>(initialValues?.discipline ?? "running");
  const [distanceKm, setDistanceKm] = useState<number>(initialValues?.targetDistanceKm ?? 8);
  const [surface, setSurface] = useState<RouteSurface>(initialValues?.surface ?? "mixed");
  const [useElevationTarget, setUseElevationTarget] = useState(initialValues?.elevationGainTargetM != null);
  const [elevationGainTargetM, setElevationGainTargetM] = useState<number>(initialValues?.elevationGainTargetM ?? 0);
  const [bearingDeg, setBearingDeg] = useState<number>(initialValues?.bearingDeg ?? 0);
  const [start, setStart] = useState<RouteCoordinate | null>(null);
  const [startLabel, setStartLabel] = useState<string | null>(null);
  const [editingDistance, setEditingDistance] = useState(false);
  const [editingElevation, setEditingElevation] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    if (!externalStart) return;
    const same = start && start[0] === externalStart[0] && start[1] === externalStart[1];
    if (same) return;
    setStart(externalStart);
    setStartLabel(t("form.mapPickedStart"));
    onStartChange?.(externalStart);
  }, [externalStart, start, t, onStartChange]);

  const maxDistanceKm = MAX_DISTANCE_KM_BY_DISCIPLINE[discipline];
  const maxAscentM = maxAscentFor(discipline, distanceKm);

  // When the user switches from cycling (200 km) to running (80 km), clamp
  // the current distance back into range so the slider stays consistent.
  useEffect(() => {
    setDistanceKm((d) => Math.min(d, maxDistanceKm));
  }, [maxDistanceKm]);

  useEffect(() => {
    setElevationGainTargetM((m) => clampAscent(m, maxAscentM));
    if (maxAscentM === 0) {
      setUseElevationTarget(false);
    }
  }, [maxAscentM]);

  const updateStart = (point: RouteCoordinate | null, label: string | null) => {
    setStart(point);
    setStartLabel(label);
    onStartChange?.(point);
  };

  const requestGps = async () => {
    if (!("geolocation" in navigator)) {
      onError?.(t("errors.geolocationUnavailable"));
      return;
    }

    // Detect a previously denied permission so the user gets an actionable
    // message rather than a silent no-op when the browser caches the refusal.
    if ("permissions" in navigator) {
      try {
        const status = await navigator.permissions.query({ name: "geolocation" as PermissionName });
        if (status.state === "denied") {
          onError?.(t("errors.geolocationBlocked"));
          return;
        }
      } catch {
        // Permissions API may not support `geolocation` in some browsers — skip gracefully.
      }
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const point: RouteCoordinate = [pos.coords.longitude, pos.coords.latitude];
        updateStart(point, t("form.gpsActive"));
        setIsLocating(false);
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? t("errors.geolocationBlocked")
            : err.code === err.TIMEOUT
              ? t("errors.geolocationTimeout")
              : t("errors.geolocationDenied");
        onError?.(message);
        setIsLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 },
    );
  };

  const submit = () => {
    if (!start) return;
    onSubmit({
      start,
      shape,
      discipline,
      targetDistanceKm: distanceKm,
      surface,
      elevationGainTargetM: useElevationTarget ? elevationGainTargetM : undefined,
      bearingDeg: shape === "out_and_back" ? bearingDeg : undefined,
    });
  };

  // ── Options pour les segmented controls ────────────────────────
  const shapeOptions: SegmentedOption<Extract<RouteShape, "loop" | "out_and_back">>[] = [
    { value: "loop", label: t("form.shapeLoop"), icon: <RefreshCw className="size-3.5" /> },
    { value: "out_and_back", label: t("form.shapeOutAndBack"), icon: <ArrowRight className="size-3.5" /> },
  ];

  const disciplineOptions: SegmentedOption<Discipline>[] = [
    { value: "running", label: t("form.disciplineRunning"), icon: <Footprints className="size-3.5" /> },
    { value: "cycling", label: t("form.disciplineCycling"), icon: <Bike className="size-3.5" /> },
  ];

  const surfaceOptions: SegmentedOption<RouteSurface>[] = [
    { value: "road", label: t("form.surfaceRoad") },
    { value: "trail", label: t("form.surfaceTrail"), icon: <Mountain className="size-3.5" /> },
    { value: "mixed", label: t("form.surfaceMixed") },
  ];

  // Cardinal label for the bearing.
  const cardinalIndex = Math.round(bearingDeg / 45) % 8;
  const cardinalLabel = t(`form.${CARDINAL_KEYS[cardinalIndex]}`);
  const bearingDisplay = t("form.bearingValue", { cardinal: cardinalLabel, deg: bearingDeg });

  // Selected option metadata for the compact chip popovers — chips show
  // the active label + icon so the user knows the current value at a
  // glance (Strava/Komoot 2025 pattern).
  const selectedDiscipline = disciplineOptions.find((o) => o.value === discipline);
  const selectedShape = shapeOptions.find((o) => o.value === shape);

  if (compact) {
    // Two-option toggles flip directly on tap: a popover for a binary
    // choice is one tap of friction too many (Linear / Strava / Spotify
    // all use direct toggles). Distance, being continuous, keeps a
    // popover Slider with quick-pick chips.
    const toggleDiscipline = () =>
      setDiscipline((d) => (d === "running" ? "cycling" : "running"));
    const toggleShape = () =>
      setShape((s) => (s === "loop" ? "out_and_back" : "loop"));

    // Common chip class. `data-[state=open]` lets Radix flip the look
    // when the linked Popover opens — no React mirror needed.
    const chipBase =
      "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-background px-3.5 text-sm font-medium transition-colors active:scale-[0.97] active:bg-accent data-[state=open]:border-primary data-[state=open]:bg-primary/10";

    // Curated quick-pick distances for the slider popover. Filter out
    // values above the discipline ceiling so cycling-only marathons
    // don't show up when the user is in running mode.
    const DISTANCE_PRESETS = [5, 10, 21.1, 42.2, 80].filter(
      (d) => d <= maxDistanceKm,
    );

    return (
      <form
        data-slot="route-form"
        className="space-y-2.5 rounded-xl border border-border/60 bg-background p-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {/* Row 1 — filter chips. Discipline + Shape are tap-to-flip
            (binary toggles, role="switch" for AT). Distance opens a
            polished slider popover with quick presets. */}
        <div className="-mx-3 flex gap-2 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <button
            type="button"
            role="switch"
            aria-checked={discipline === "cycling"}
            aria-label={`${t("form.discipline")} : ${selectedDiscipline?.label}`}
            onClick={toggleDiscipline}
            className={chipBase}
          >
            {selectedDiscipline?.icon}
            <span>{selectedDiscipline?.label}</span>
          </button>

          <button
            type="button"
            role="switch"
            aria-checked={shape === "out_and_back"}
            aria-label={`${t("form.shape")} : ${selectedShape?.label}`}
            onClick={toggleShape}
            className={chipBase}
          >
            {selectedShape?.icon}
            <span>{selectedShape?.label}</span>
          </button>

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={t("form.distance")}
                aria-haspopup="dialog"
                className={`${chipBase} tabular-nums`}
              >
                <span>{distanceKm.toFixed(1)} {t("form.distanceUnit")}</span>
                <ChevronDown className="size-3.5 opacity-60" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8} className="w-72 space-y-3 p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-muted-foreground">{t("form.distance")}</span>
                <span className="text-base font-semibold tabular-nums">
                  {distanceKm.toFixed(1)} {t("form.distanceUnit")}
                </span>
              </div>
              <Slider
                value={[distanceKm]}
                onValueChange={([v]) => setDistanceKm(clampDistance(v, maxDistanceKm))}
                min={1}
                max={maxDistanceKm}
                step={0.5}
                aria-label={t("form.distance")}
                className="[&>span:first-child]:h-2 [&_[role=slider]]:size-5"
              />
              <div className="flex flex-wrap gap-1.5">
                {DISTANCE_PRESETS.map((d) => {
                  // Tight tolerance — only the preset itself counts as
                  // active. Once the user drags the slider, the chip
                  // releases (slider step = 0.5 km, presets like 21.1 km
                  // and 42.2 km are no longer matched).
                  const active = Math.abs(distanceKm - d) < 0.05;
                  return (
                    <button
                      key={d}
                      type="button"
                      // Bypass clampDistance's 0.5 km rounding here so a
                      // tap on "21.1 km" lands on exactly 21.1 km, not
                      // 21.0 km. The slider still snaps elsewhere.
                      onClick={() => setDistanceKm(Math.min(d, maxDistanceKm))}
                      data-active={active}
                      className="rounded-full border border-border/60 px-2.5 py-1 text-xs tabular-nums transition-colors hover:bg-accent data-[active=true]:border-primary data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                    >
                      {d} {t("form.distanceUnit")}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Row 2 — address full-width with GPS as inline icon button. */}
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <AddressSearchInput
              onSelect={(point, label) => updateStart(point, label)}
              onClear={() => updateStart(null, null)}
              selectedLabel={startLabel}
              disabled={isLocating}
            />
          </div>
          <Button
            type="button"
            variant={start ? "outline" : "secondary"}
            size="icon"
            onClick={requestGps}
            disabled={isLocating}
            aria-label={t("form.useGps")}
            title={t("form.useGps")}
            className="h-10 w-10 shrink-0"
          >
            {isLocating ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
          </Button>
        </div>

        {/* Row 3 — primary CTA. */}
        <Button
          type="submit"
          size="lg"
          className="h-11 w-full text-base font-semibold"
          disabled={isGenerating || !start}
        >
          {isGenerating && <Loader2 className="mr-2 size-4 animate-spin" />}
          {t("form.generate")}
        </Button>
      </form>
    );
  }

  // Desktop / tablet — full vertical form with all fieldsets visible.
  return (
    <form
      data-slot="route-form"
      className="space-y-5 rounded-xl border border-border/60 bg-background p-4 sm:p-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">{t("form.shape")}</legend>
        <Segmented value={shape} onChange={setShape} options={shapeOptions} label={t("form.shape")} />
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">{t("form.discipline")}</legend>
        <Segmented
          value={discipline}
          onChange={setDiscipline}
          options={disciplineOptions}
          label={t("form.discipline")}
        />
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">{t("form.surface")}</legend>
        <Segmented value={surface} onChange={setSurface} options={surfaceOptions} label={t("form.surface")} />
      </fieldset>

      <fieldset className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <legend className="text-sm font-semibold">{t("form.distance")}</legend>
          {editingDistance ? (
            <input
              type="number"
              min={1}
              max={maxDistanceKm}
              step={0.5}
              autoFocus
              value={distanceKm}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) => setDistanceKm(clampDistance(Number(e.target.value) || 1, maxDistanceKm))}
              onBlur={() => setEditingDistance(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setEditingDistance(false);
                if (e.key === "Escape") setEditingDistance(false);
              }}
              className="w-24 rounded-md border border-primary bg-background px-2 py-1 text-right text-base font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-label={t("form.distanceEdit")}
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingDistance(true)}
              className="rounded-md px-2 py-0.5 text-base font-semibold tabular-nums hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label={t("form.distanceEdit")}
            >
              {distanceKm.toFixed(1)} {t("form.distanceUnit")}
            </button>
          )}
        </div>
        <Slider
          value={[distanceKm]}
          onValueChange={([v]) => setDistanceKm(clampDistance(v, maxDistanceKm))}
          min={1}
          max={maxDistanceKm}
          step={0.5}
          aria-label={t("form.distance")}
        />
        <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
          <span>{t("form.distanceMin")}</span>
          <span>{t("form.distanceMaxValue", { max: maxDistanceKm })}</span>
        </div>
      </fieldset>

      {/* D+ */}
      {maxAscentM > 0 && (
        <fieldset className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <legend className="text-sm font-semibold">{t("form.elevationTarget")}</legend>
              <p className="text-xs text-muted-foreground">{t("form.elevationTargetHint")}</p>
            </div>
            <Button
              type="button"
              variant={useElevationTarget ? "outline" : "ghost"}
              size="sm"
              onClick={() => setUseElevationTarget((prev) => !prev)}
            >
              {useElevationTarget ? t("form.elevationTargetDisable") : t("form.elevationTargetEnable")}
            </Button>
          </div>

          {useElevationTarget && (
            <>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-sm text-muted-foreground">{t("form.elevationTargetValue")}</span>
                {editingElevation ? (
                  <input
                    type="number"
                    min={0}
                    max={maxAscentM}
                    step={10}
                    autoFocus
                    value={elevationGainTargetM}
                    onFocus={(e) => e.currentTarget.select()}
                    onChange={(e) => setElevationGainTargetM(clampAscent(Number(e.target.value) || 0, maxAscentM))}
                    onBlur={() => setEditingElevation(false)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === "Escape") setEditingElevation(false);
                    }}
                    className="w-24 rounded-md border border-primary bg-background px-2 py-1 text-right text-base font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-primary/20"
                    aria-label={t("form.elevationTargetEdit")}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingElevation(true)}
                    className="rounded-md px-2 py-0.5 text-base font-semibold tabular-nums hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    aria-label={t("form.elevationTargetEdit")}
                  >
                    {elevationGainTargetM} {t("form.elevationUnit")}
                  </button>
                )}
              </div>
              <Slider
                value={[elevationGainTargetM]}
                onValueChange={([v]) => setElevationGainTargetM(clampAscent(v, maxAscentM))}
                min={0}
                max={maxAscentM}
                step={10}
                aria-label={t("form.elevationTarget")}
              />
              <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
                <span>{t("form.elevationMin")}</span>
                <span>{t("form.elevationMaxValue", { max: maxAscentM })}</span>
              </div>
            </>
          )}
        </fieldset>
      )}

      {/* Bearing — only for out-and-back. */}
      {shape === "out_and_back" && (
        <fieldset className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <legend className="text-sm font-semibold">{t("form.bearing")}</legend>
            <span className="sr-only">{bearingDisplay}</span>
          </div>
          <div className="flex justify-center pt-1">
            <CompassInput
              value={bearingDeg}
              onChange={(v) => setBearingDeg(((v % 360) + 360) % 360)}
              cardinalLabel={cardinalLabel}
              ariaLabel={t("form.bearing")}
            />
          </div>
        </fieldset>
      )}

      {/* Point de départ */}
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

      {/* CTA stays inline at the end of the form — no fixed positioning.
          Both desktop (in a sticky aside) and mobile (inside a bottom
          sheet) flow naturally with this approach. The mobile sheet
          renders the form deep enough that the CTA is reached by
          dragging the sheet up; that's the same flow Strava uses for
          "regenerate with these settings". */}
      <div className="mt-2">
        <Button
          type="submit"
          size="lg"
          className="h-12 w-full text-base font-semibold"
          disabled={isGenerating || !start}
        >
          {isGenerating && <Loader2 className="mr-2 size-4 animate-spin" />}
          {t("form.generate")}
        </Button>
      </div>
    </form>
  );
}

export default RouteParametersForm;
