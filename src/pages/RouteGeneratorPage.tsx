import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ArrowRight, Download, EyeOff, RotateCcw, Save } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import {
  RouteParametersForm,
  type RouteFormSubmitPayload,
} from "@/components/domain/RouteParametersForm";
import { generateRouteCandidates } from "@/lib/routeGenerator";
import { downloadRouteGpx } from "@/lib/export/gpx";
import { useRoutes } from "@/hooks/useRoutes";
import { useSettings } from "@/hooks/useSettings";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import { Segmented, type SegmentedOption } from "@/components/ui/segmented";
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
  const { settings } = useSettings();

  const [candidates, setCandidates] = useState<Route[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [previewStart, setPreviewStart] = useState<RouteCoordinate | null>(null);
  const [lastPayload, setLastPayload] = useState<RouteFormSubmitPayload | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const route = candidates[selectedIndex] ?? null;
  // Pre-compute the unselected traces once so RouteMap can render them in
  // the muted background layer without re-deriving the array each render.
  const candidateTraces = useMemo(
    () => candidates.filter((_, i) => i !== selectedIndex).map((c) => c.points),
    [candidates, selectedIndex],
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
          seed,
          bearingDeg: payload.bearingDeg,
          count: 3,
        });
        if (results.length === 0) {
          // generateRouteCandidates rejects every attempt that misses the
          // target by more than 20% — when nothing survives, surface a
          // dedicated error rather than show a blank state.
          toast.error(t("errors.noConvergence"));
          return;
        }
        setCandidates(results);
        setSelectedIndex(0);
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
                candidates={candidateTraces}
                pois={route?.pois}
                start={route ? null : previewStart}
              />
            </Suspense>

            {candidates.length > 1 && (
              <Segmented
                value={String(selectedIndex)}
                onChange={(v) => setSelectedIndex(Number(v))}
                label={t("form.candidatesLabel")}
                options={candidates.map<SegmentedOption<string>>((c, i) => ({
                  value: String(i),
                  label: `${t("form.candidate", { index: i + 1 })} · ${(c.distanceM / 1000).toFixed(1)} km`,
                }))}
              />
            )}

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
