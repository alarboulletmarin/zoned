import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ArrowRight,
  Bike,
  Footprints,
  Loader2,
  MapPin,
  Mountain,
  RefreshCw,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Segmented, type SegmentedOption } from "@/components/ui/segmented";
import { cn } from "@/lib/utils";

import type { Discipline } from "@/types";
import type { RouteCoordinate, RouteShape, RouteSurface } from "@/types/route";

import { AddressSearchInput } from "./AddressSearchInput";

export interface RouteFormSubmitPayload {
  start: RouteCoordinate;
  shape: Extract<RouteShape, "loop" | "out_and_back">;
  discipline: Discipline;
  targetDistanceKm: number;
  surface: RouteSurface;
  bearingDeg?: number;
}

interface RouteParametersFormProps {
  isGenerating: boolean;
  onSubmit: (payload: RouteFormSubmitPayload) => void;
  onError?: (message: string) => void;
  /** Notify parent when start point changes so it can preview on the map. */
  onStartChange?: (point: RouteCoordinate | null) => void;
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

export function RouteParametersForm({
  isGenerating,
  onSubmit,
  onError,
  onStartChange,
}: RouteParametersFormProps) {
  const { t } = useTranslation("routes");

  const [shape, setShape] = useState<Extract<RouteShape, "loop" | "out_and_back">>("loop");
  const [discipline, setDiscipline] = useState<Discipline>("running");
  const [distanceKm, setDistanceKm] = useState<number>(8);
  const [surface, setSurface] = useState<RouteSurface>("mixed");
  const [bearingDeg, setBearingDeg] = useState<number>(0);
  const [start, setStart] = useState<RouteCoordinate | null>(null);
  const [startLabel, setStartLabel] = useState<string | null>(null);
  const [editingDistance, setEditingDistance] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const maxDistanceKm = MAX_DISTANCE_KM_BY_DISCIPLINE[discipline];

  // When the user switches from cycling (200 km) to running (80 km), clamp
  // the current distance back into range so the slider stays consistent.
  useEffect(() => {
    setDistanceKm((d) => Math.min(d, maxDistanceKm));
  }, [maxDistanceKm]);

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

  return (
    <form
      // pb-24 leaves room for the fixed CTA on mobile so the last fieldset
      // never sits behind it. Reset on tablet+ where the CTA inlines.
      className="space-y-5 rounded-xl border border-border/60 bg-background p-4 pb-24 sm:p-5 sm:pb-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      {/* Forme */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">{t("form.shape")}</legend>
        <Segmented value={shape} onChange={setShape} options={shapeOptions} label={t("form.shape")} />
      </fieldset>

      {/* Discipline */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">{t("form.discipline")}</legend>
        <Segmented
          value={discipline}
          onChange={setDiscipline}
          options={disciplineOptions}
          label={t("form.discipline")}
        />
      </fieldset>

      {/* Surface */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">{t("form.surface")}</legend>
        <Segmented value={surface} onChange={setSurface} options={surfaceOptions} label={t("form.surface")} />
      </fieldset>

      {/* Distance */}
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

      {/* Bearing — only for out-and-back */}
      {shape === "out_and_back" && (
        <fieldset className="space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <legend className="text-sm font-semibold">{t("form.bearing")}</legend>
            <span className="text-sm font-semibold tabular-nums">{bearingDisplay}</span>
          </div>
          <Slider
            value={[bearingDeg]}
            onValueChange={([v]) => setBearingDeg(v)}
            min={0}
            max={359}
            step={1}
            aria-label={t("form.bearing")}
          />
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

      {/* CTA — pinned to viewport bottom on mobile, inline on tablet+.
          `fixed` (vs `sticky`) is required because the form's height is often
          smaller than the viewport, so a sticky bottom never engages.

          z-[1100] sits above Leaflet's tallest pane (popup at 700, controls
          at 1000) so the bar can't slip behind the map. Background is
          fully opaque (no `backdrop-blur`) — combining `position: fixed`
          with `backdrop-filter` triggers a known WebKit bug where the
          element starts scrolling with the content on iOS Safari. */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-[1100] border-t border-border/60 bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.08)]",
          "sm:static sm:mx-0 sm:mt-2 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none",
        )}
      >
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
