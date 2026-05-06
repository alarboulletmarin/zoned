import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, MapPin } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { Discipline } from "@/types";
import type {
  RouteCoordinate,
  RouteShape,
  RouteSurface,
} from "@/types/route";

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
}

const DISTANCE_OPTIONS_KM = [5, 8, 10, 15, 20, 30] as const;

export function RouteParametersForm({ isGenerating, onSubmit, onError }: RouteParametersFormProps) {
  const { t } = useTranslation("routes");

  const [shape, setShape] = useState<Extract<RouteShape, "loop" | "out_and_back">>("loop");
  const [discipline, setDiscipline] = useState<Discipline>("running");
  const [distanceKm, setDistanceKm] = useState<number>(8);
  const [surface, setSurface] = useState<RouteSurface>("mixed");
  const [bearingDeg, setBearingDeg] = useState<number>(0);
  const [start, setStart] = useState<RouteCoordinate | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const requestGps = () => {
    if (!("geolocation" in navigator)) {
      onError?.(t("errors.geolocationUnavailable"));
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStart([pos.coords.longitude, pos.coords.latitude]);
        setIsLocating(false);
      },
      () => {
        onError?.(t("errors.geolocationDenied"));
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

  return (
    <div className="space-y-5 rounded-xl border border-border/60 bg-background p-4 sm:p-6">
      {/* Shape */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">{t("form.shape")}</legend>
        <div className="flex flex-wrap gap-2">
          {(["loop", "out_and_back"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setShape(s)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                shape === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {s === "loop" ? t("form.shapeLoop") : t("form.shapeOutAndBack")}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Discipline */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">{t("form.discipline")}</legend>
        <div className="flex flex-wrap gap-2">
          {(["running", "cycling"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDiscipline(d)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                discipline === d
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {d === "running" ? t("form.disciplineRunning") : t("form.disciplineCycling")}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Distance */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">{t("form.distance")}</legend>
        <div className="flex flex-wrap gap-2">
          {DISTANCE_OPTIONS_KM.map((km) => (
            <button
              key={km}
              type="button"
              onClick={() => setDistanceKm(km)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                distanceKm === km
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {t("form.distanceKm", { value: km })}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Surface */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">{t("form.surface")}</legend>
        <div className="flex flex-wrap gap-2">
          {(["road", "trail", "mixed"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSurface(s)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm transition-colors",
                surface === s
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {t(`form.surface${s.charAt(0).toUpperCase()}${s.slice(1)}`)}
            </button>
          ))}
        </div>
      </fieldset>

      {/* Bearing — only for out-and-back */}
      {shape === "out_and_back" && (
        <fieldset className="space-y-2">
          <label htmlFor="bearing" className="block text-sm font-semibold">
            {t("form.bearing")}
          </label>
          <input
            id="bearing"
            type="range"
            min={0}
            max={359}
            value={bearingDeg}
            onChange={(e) => setBearingDeg(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">{bearingDeg}°</p>
        </fieldset>
      )}

      {/* Start point */}
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">{t("form.start")}</legend>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={start ? "outline" : "default"}
            size="sm"
            onClick={requestGps}
            disabled={isLocating}
            className="gap-2"
          >
            {isLocating ? <Loader2 className="size-4 animate-spin" /> : <MapPin className="size-4" />}
            {t("form.useGps")}
          </Button>
          {start && (
            <span className="text-xs text-muted-foreground">
              {start[1].toFixed(4)}, {start[0].toFixed(4)}
            </span>
          )}
        </div>
      </fieldset>

      <Button
        type="button"
        size="lg"
        className="w-full"
        onClick={submit}
        disabled={isGenerating || !start}
      >
        {isGenerating && <Loader2 className="mr-2 size-4 animate-spin" />}
        {t("form.generate")}
      </Button>
    </div>
  );
}

export default RouteParametersForm;
