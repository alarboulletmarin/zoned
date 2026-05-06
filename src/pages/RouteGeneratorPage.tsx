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
import type { Route, RouteCoordinate } from "@/types/route";

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

export function RouteGeneratorPage() {
  const { t } = useTranslation("routes");
  const navigate = useNavigate();
  const { saveRoute } = useRoutes();

  const [route, setRoute] = useState<Route | null>(null);
  const [previewStart, setPreviewStart] = useState<RouteCoordinate | null>(null);
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
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 space-y-1">
          <h1 className="text-2xl font-bold sm:text-3xl">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          <Link
            to="/routes/mine"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            {t("myRoutes")} <ArrowRight className="size-3.5" />
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,360px)_1fr] xl:gap-8">
          <aside className="min-w-0">
            <RouteParametersForm
              isGenerating={isGenerating}
              onSubmit={onSubmit}
              onError={(msg) => toast.error(msg)}
              onStartChange={(point) => setPreviewStart(point)}
            />
          </aside>

          <main className="min-w-0 space-y-4 lg:sticky lg:top-20 lg:self-start">
            <Suspense fallback={<MapSkeleton />}>
              <RouteMap
                points={route?.points ?? []}
                start={route ? null : previewStart}
              />
            </Suspense>

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
      </div>
    </>
  );
}

export default RouteGeneratorPage;
