import { lazy, Suspense, useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ArrowRight, Download, RotateCcw, Save } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import {
  RouteParametersForm,
  type RouteFormSubmitPayload,
} from "@/components/domain/RouteParametersForm";
import { generateRoute } from "@/lib/routeGenerator";
import { downloadRouteGpx } from "@/lib/export/gpx";
import { useRoutes } from "@/hooks/useRoutes";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import type { Route } from "@/types/route";

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

function MapFallback() {
  return (
    <div className="h-72 w-full animate-pulse rounded-xl border border-border/60 bg-muted/40 sm:h-96" />
  );
}

export function RouteGeneratorPage() {
  const { t } = useTranslation("routes");
  const navigate = useNavigate();
  const { saveRoute } = useRoutes();

  const [route, setRoute] = useState<Route | null>(null);
  const [lastPayload, setLastPayload] = useState<RouteFormSubmitPayload | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = useCallback(
    async (payload: RouteFormSubmitPayload, seed: number) => {
      setIsGenerating(true);
      try {
        const result = await generateRoute({
          start: payload.start,
          targetDistanceKm: payload.targetDistanceKm,
          discipline: payload.discipline,
          shape: payload.shape,
          surface: payload.surface,
          seed,
          bearingDeg: payload.bearingDeg,
        });
        setRoute(result);
        setLastPayload(payload);
      } catch (err) {
        console.warn("RouteGenerator: routing failed", err);
        toast.error(t("errors.routingFailed"));
      } finally {
        setIsGenerating(false);
      }
    },
    [t],
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
    if (saveRoute(route)) {
      toast.success(t("result.saved"));
      navigate(`/routes/${route.id}`);
    } else {
      toast.error(t("result.saveFailed"));
    }
  };

  const onExport = () => {
    if (!route) return;
    const filename = downloadRouteGpx(route);
    toast.success(filename);
  };

  return (
    <>
      <SEOHead title={t("title")} description={t("subtitle")} canonical="/routes" />
      <div className="space-y-6 py-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-bold sm:text-3xl">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          <Link
            to="/routes/mine"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            {t("myRoutes")} <ArrowRight className="size-3.5" />
          </Link>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
          <RouteParametersForm
            isGenerating={isGenerating}
            onSubmit={onSubmit}
            onError={(msg) => toast.error(msg)}
          />

          <div className="space-y-4">
            {route ? (
              <>
                <Suspense fallback={<MapFallback />}>
                  <RouteMap points={route.points} />
                </Suspense>

                <div className="grid grid-cols-3 gap-3 rounded-xl border border-border/60 bg-muted/20 p-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">{t("result.actualDistance")}</p>
                    <p className="text-lg font-semibold">
                      {(route.distanceM / 1000).toFixed(2)} km
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("result.elevationGain")}</p>
                    <p className="text-lg font-semibold">{route.elevationGainM} m</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t("result.estimatedDuration")}</p>
                    <p className="text-lg font-semibold">
                      {formatDurationMinutes(route.estimatedDurationSec / 60)}
                    </p>
                  </div>
                </div>

                {route.elevation.length > 1 && (
                  <div className="rounded-xl border border-border/60 bg-background p-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {t("result.elevationProfile")}
                    </p>
                    <Suspense fallback={null}>
                      <ElevationChart profile={route.elevation} />
                    </Suspense>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button onClick={onSave} className="gap-2">
                    <Save className="size-4" />
                    {t("result.save")}
                  </Button>
                  <Button variant="outline" onClick={onRegenerate} className="gap-2" disabled={isGenerating}>
                    <RotateCcw className="size-4" />
                    {t("form.regenerate")}
                  </Button>
                  <Button variant="outline" onClick={onExport} className="gap-2">
                    <Download className="size-4" />
                    {t("result.exportGpx")}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/10 p-6 text-center text-sm text-muted-foreground sm:h-96">
                <p>{t("subtitle")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default RouteGeneratorPage;
