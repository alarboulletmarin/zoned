import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Bike,
  ChevronDown,
  Run,
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

/**
 * Quick-pick elevation targets for the compact mobile chip popover.
 * Shared with the slider so a tap on a preset matches the snap step
 * (10 m). Filtered by `maxAscentM` at render time so a 1000 m preset
 * doesn't show on a 5 km running route capped at 400 m.
 */
const ELEVATION_PRESETS = [0, 100, 300, 600, 1000] as const;

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
        // Permissions API may not support `geolocation` in some browsers, skip gracefully.
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
    { value: "loop", label: t("form.shapeLoop"), icon: <RefreshCw /> },
    { value: "out_and_back", label: t("form.shapeOutAndBack"), icon: <ArrowRight /> },
  ];

  const disciplineOptions: SegmentedOption<Discipline>[] = [
    { value: "running", label: t("form.disciplineRunning"), icon: <Run /> },
    { value: "cycling", label: t("form.disciplineCycling"), icon: <Bike /> },
  ];

  const surfaceOptions: SegmentedOption<RouteSurface>[] = [
    { value: "road", label: t("form.surfaceRoad") },
    { value: "trail", label: t("form.surfaceTrail"), icon: <Mountain /> },
    { value: "mixed", label: t("form.surfaceMixed") },
  ];

  // Cardinal label for the bearing.
  const cardinalIndex = Math.round(bearingDeg / 45) % 8;
  const cardinalLabel = t(`form.${CARDINAL_KEYS[cardinalIndex]}`);
  const bearingDisplay = t("form.bearingValue", { cardinal: cardinalLabel, deg: bearingDeg });

  // Selected option metadata for the compact chip popovers, chips show
  // the active label + icon so the user knows the current value at a
  // glance (Strava/Komoot 2025 pattern).
  const selectedDiscipline = disciplineOptions.find((o) => o.value === discipline);
  const selectedShape = shapeOptions.find((o) => o.value === shape);

  if (compact) {
    // Strava Routes 2025 mobile pattern:
    //   • Row 1: sport pill (icon-only with chevron) + address field
    //     + GPS + submit, all aligned in a single search-bar height.
    //   • Row 2: 3 filter chips (shape, distance, elevation), text
    //     labels, no icons, in an explicit horizontal scroll. Letting
    //     the right edge be cut signals "more on the right" rather
    //     than wrapping into orphan rows.
    //
    // The previous icon-only attempt for shape (loop/out-and-back) was
    // dropped per Nielsen Norman: those pictograms have no universal
    // convention and cost the user a guess. Shape now opens a small
    // popover list, mirroring distance/elevation.
    const DISTANCE_PRESETS = [5, 10, 21.1, 42.2, 80].filter(
      (d) => d <= maxDistanceKm,
    );

    return (
      <form
        data-slot="route-form"
        className="zn-route-bar"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {/* Row 1, Strava-style search bar: sport picker on the left,
            address in the middle (flex-1), GPS + submit icons on the
            right. Single line, tap targets ≥44px (Apple HIG). */}
        <div className="zn-row" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={`${t("form.discipline")} : ${selectedDiscipline?.label}`}
                aria-haspopup="dialog"
                className="zn-route-chip zn-route-chip--sport"
              >
                {selectedDiscipline?.icon}
                <ChevronDown size={16} className="zn-route-chip__glyph" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8} className="zn-route-menu">
              {disciplineOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDiscipline(opt.value)}
                  data-active={discipline === opt.value}
                  className="zn-route-menu__item"
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <div className="zn-fill">
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
            size="icon-lg"
            onClick={requestGps}
            disabled={isLocating}
            aria-label={t("form.useGps")}
            title={t("form.useGps")}
          >
            {isLocating ? <Loader2 className="zn-route-spin" /> : <MapPin />}
          </Button>
          <Button
            type="submit"
            size="icon-lg"
            disabled={isGenerating || !start}
            aria-label={t("form.generate")}
            title={t("form.generate")}
          >
            {isGenerating ? <Loader2 className="zn-route-spin" /> : <ArrowRight />}
          </Button>
        </div>

        {/* Row 2, filter chips, labelled text only, horizontal scroll
            assumed when chips don't fit (cf. Strava Routes filter row).
            Hidden scrollbars; if the row overflows the right edge,
            iOS rubber-banding makes the affordance discoverable. */}
        <div className="zn-route-chips zn-scroll-x">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={`${t("form.shape")} : ${selectedShape?.label}`}
                aria-haspopup="dialog"
                className="zn-route-chip"
              >
                <span>{selectedShape?.label}</span>
                <ChevronDown size={14} className="zn-route-chip__glyph" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" sideOffset={8} className="zn-route-menu">
              {shapeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setShape(opt.value)}
                  data-active={shape === opt.value}
                  className="zn-route-menu__item"
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-label={t("form.distance")}
                aria-haspopup="dialog"
                className="zn-route-chip zn-route-chip--num"
              >
                <span>{distanceKm.toFixed(1)} {t("form.distanceUnit")}</span>
                <ChevronDown size={14} className="zn-route-chip__glyph" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              sideOffset={8}
              className="zn-stack"
              style={{ "--gap": "var(--sp-6)" } as CSSProperties}
            >
              <div className="zn-row zn-row--split zn-row--baseline">
                <span className="zn-kicker zn-kicker--inline">{t("form.distance")}</span>
                <span className="zn-route-readout">
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
              />
              <div className="zn-cluster">
                {DISTANCE_PRESETS.map((d) => {
                  const active = Math.abs(distanceKm - d) < 0.05;
                  return (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDistanceKm(Math.min(d, maxDistanceKm))}
                      data-active={active}
                      className="zn-route-preset"
                    >
                      {d} {t("form.distanceUnit")}
                    </button>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          {maxAscentM > 0 && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-label={t("form.elevationTarget")}
                  aria-haspopup="dialog"
                  className="zn-route-chip zn-route-chip--num"
                >
                  <span>
                    {useElevationTarget && elevationGainTargetM > 0
                      ? `↑ ${elevationGainTargetM} ${t("form.elevationUnit")}`
                      : `↑ ${t("form.elevationFree")}`}
                  </span>
                  <ChevronDown size={14} className="zn-route-chip__glyph" />
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                sideOffset={8}
                className="zn-stack"
                style={{ "--gap": "var(--sp-6)" } as CSSProperties}
              >
                {/* No on/off toggle on mobile: zero is "libre" (auto),
                    any positive value is the explicit target. The
                    slider is always visible, moving it past 0 turns
                    the chip into a hard target without an extra tap. */}
                <div className="zn-row zn-row--split zn-row--baseline">
                  <span className="zn-kicker zn-kicker--inline">
                    {t("form.elevationTarget")}
                  </span>
                  <span className="zn-route-readout">
                    {useElevationTarget && elevationGainTargetM > 0
                      ? `${elevationGainTargetM} ${t("form.elevationUnit")}`
                      : t("form.elevationFree")}
                  </span>
                </div>
                <Slider
                  value={[useElevationTarget ? elevationGainTargetM : 0]}
                  onValueChange={([v]) => {
                    const next = clampAscent(v, maxAscentM);
                    setElevationGainTargetM(next);
                    setUseElevationTarget(next > 0);
                  }}
                  min={0}
                  max={maxAscentM}
                  step={10}
                  aria-label={t("form.elevationTarget")}
                />
                <div className="zn-cluster">
                  {ELEVATION_PRESETS.filter((m) => m <= maxAscentM).map((m) => {
                    const active =
                      m === 0
                        ? !useElevationTarget || elevationGainTargetM === 0
                        : useElevationTarget && elevationGainTargetM === m;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setElevationGainTargetM(clampAscent(m, maxAscentM));
                          setUseElevationTarget(m > 0);
                        }}
                        data-active={active}
                        className="zn-route-preset"
                      >
                        {m === 0 ? t("form.elevationFree") : `${m} ${t("form.elevationUnit")}`}
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </form>
    );
  }

  // Desktop / tablet, full vertical form with all fieldsets visible.
  return (
    <form
      data-slot="route-form"
      className="zn-route-form"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <fieldset className="zn-route-form__field">
        <legend className="zn-route-form__legend">{t("form.shape")}</legend>
        <Segmented value={shape} onChange={setShape} options={shapeOptions} label={t("form.shape")} />
      </fieldset>

      <fieldset className="zn-route-form__field">
        <legend className="zn-route-form__legend">{t("form.discipline")}</legend>
        <Segmented
          value={discipline}
          onChange={setDiscipline}
          options={disciplineOptions}
          label={t("form.discipline")}
        />
      </fieldset>

      <fieldset className="zn-route-form__field">
        <legend className="zn-route-form__legend">{t("form.surface")}</legend>
        <Segmented value={surface} onChange={setSurface} options={surfaceOptions} label={t("form.surface")} />
      </fieldset>

      <fieldset className="zn-route-form__field" style={{ "--field-gap": "var(--sp-6)" } as CSSProperties}>
        <div className="zn-row zn-row--split" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
          <legend className="zn-route-form__legend">{t("form.distance")}</legend>
          <div className="zn-row" style={{ "--gap": "var(--sp-3)" } as CSSProperties}>
            <input
              type="number"
              min={1}
              max={maxDistanceKm}
              step={0.5}
              value={distanceKm}
              onFocus={(e) => e.currentTarget.select()}
              onChange={(e) =>
                setDistanceKm(clampDistance(Number(e.target.value) || 1, maxDistanceKm))
              }
              className="zn-route-field zn-route-field--num"
              style={{ "--w": "84px" } as CSSProperties}
              aria-label={t("form.distanceEdit")}
            />
            <span className="zn-kicker zn-kicker--inline">{t("form.distanceUnit")}</span>
          </div>
        </div>
        <Slider
          value={[distanceKm]}
          onValueChange={([v]) => setDistanceKm(clampDistance(v, maxDistanceKm))}
          min={1}
          max={maxDistanceKm}
          step={0.5}
          aria-label={t("form.distance")}
        />
        {/* Presets, discipline-aware ceiling filters out anything beyond
            the slider's max (e.g. Marathon on a 30 km running cap, all
            three presets on a sub-21 km cycling cap). */}
        <div className="zn-cluster">
          {[
            { label: "5K", km: 5 },
            { label: "10K", km: 10 },
            { label: "Semi", km: 21.1 },
            { label: "Marathon", km: 42.2 },
          ]
            .filter((p) => p.km <= maxDistanceKm)
            .map((p) => {
              const active = Math.abs(distanceKm - p.km) < 0.05;
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setDistanceKm(clampDistance(p.km, maxDistanceKm))}
                  data-active={active}
                  className="zn-route-preset"
                >
                  {p.label}
                </button>
              );
            })}
        </div>
        <div className="zn-route-form__scale">
          <span>{t("form.distanceMin")}</span>
          <span>{t("form.distanceMaxValue", { max: maxDistanceKm })}</span>
        </div>
      </fieldset>

      {/* D+ */}
      {maxAscentM > 0 && (
        <fieldset className="zn-route-form__field" style={{ "--field-gap": "var(--sp-6)" } as CSSProperties}>
          <div className="zn-row zn-row--split" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
            <div>
              <legend className="zn-route-form__legend">{t("form.elevationTarget")}</legend>
              <p className="zn-route-form__hint">{t("form.elevationTargetHint")}</p>
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
              <div className="zn-row zn-row--split zn-row--baseline" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
                <span className="zn-kicker zn-kicker--inline">{t("form.elevationTargetValue")}</span>
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
                    className="zn-route-field zn-route-field--num"
                    style={{ "--w": "96px" } as CSSProperties}
                    aria-label={t("form.elevationTargetEdit")}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingElevation(true)}
                    className="zn-route-preset"
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
              <div className="zn-route-form__scale">
                <span>{t("form.elevationMin")}</span>
                <span>{t("form.elevationMaxValue", { max: maxAscentM })}</span>
              </div>
            </>
          )}
        </fieldset>
      )}

      {/* Bearing, only for out-and-back. */}
      {shape === "out_and_back" && (
        <fieldset className="zn-route-form__field" style={{ "--field-gap": "var(--sp-6)" } as CSSProperties}>
          <div className="zn-row zn-row--split zn-row--baseline" style={{ "--gap": "var(--sp-4)" } as CSSProperties}>
            <legend className="zn-route-form__legend">{t("form.bearing")}</legend>
            <span className="sr-only">{bearingDisplay}</span>
          </div>
          <div className="zn-route-form__compass">
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
      <fieldset className="zn-route-form__field">
        <legend className="zn-route-form__legend">{t("form.start")}</legend>
        <AddressSearchInput
          onSelect={(point, label) => updateStart(point, label)}
          onClear={() => updateStart(null, null)}
          selectedLabel={startLabel}
          disabled={isLocating}
        />
        <div className="zn-cluster">
          <Button
            type="button"
            variant={start ? "outline" : "secondary"}
            size="sm"
            onClick={requestGps}
            disabled={isLocating}
          >
            {isLocating ? <Loader2 className="zn-route-spin" /> : <MapPin />}
            {isLocating ? t("form.gpsLocating") : t("form.useGps")}
          </Button>
          {start && (
            <span className="zn-route-form__coords">
              {start[1].toFixed(4)}, {start[0].toFixed(4)}
            </span>
          )}
        </div>
      </fieldset>

      {/* Sticky CTA, pinned to the bottom of the scrollable aside so
          the user always sees "Générer" regardless of scroll position
          (long forms with elevation target + bearing can outgrow short
          viewports). Negative margins extend the bar across the full
          form padding so the bg fully covers content scrolled behind. */}
      <div className="zn-route-form__foot">
        <Button
          type="submit"
          size="lg"
          className="zn-route-form__submit"
          disabled={isGenerating || !start}
        >
          {isGenerating && <Loader2 className="zn-route-spin" />}
          {t("form.generate")}
        </Button>
      </div>
    </form>
  );
}

export default RouteParametersForm;
