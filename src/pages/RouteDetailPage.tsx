import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ArrowLeft, Download, Trash2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { EditorialTitle } from "@/components/editorial";
import { downloadRouteGpx } from "@/lib/export/gpx";
import { useRoutes } from "@/hooks/useRoutes";
import { formatDurationMinutes } from "@/components/visualization/transforms";
import type { Route } from "@/types/route";
import { getRoute } from "@/lib/routeStorage";

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
    <div className="h-72 w-full animate-pulse border-2 border-foreground bg-muted/40 sm:h-96" />
  );
}

/** Single inline stat — mono uppercase label, bold value. Mirrors the
 *  HeroStat strip used on the workout detail page. */
function RouteStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground mb-1">
        {label}
      </dt>
      <dd className="font-sans font-bold text-lg sm:text-xl tabular-nums">{value}</dd>
    </div>
  );
}

export function RouteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation("routes");
  const navigate = useNavigate();
  const { deleteRoute } = useRoutes();
  const [route, setRoute] = useState<Route | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    void getRoute(id).then((found) => {
      if (!cancelled) setRoute(found);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!route) {
    return (
      <div className="space-y-4 py-10">
        <Button asChild variant="ghost" className="gap-2">
          <Link to="/routes/mine">
            <ArrowLeft className="size-4" /> {t("myRoutes")}
          </Link>
        </Button>
        <p className="font-mono text-[11px] text-muted-foreground">{t("list.empty")}</p>
      </div>
    );
  }

  const onExport = () => {
    const filename = downloadRouteGpx(route);
    toast.success(filename);
  };

  const onDelete = async () => {
    if (await deleteRoute(route.id)) {
      toast.success(t("result.deleted"));
      navigate("/routes/mine");
    }
  };

  return (
    <>
      <SEOHead title={route.name} description={t("subtitle")} canonical={`/routes/${route.id}`} noindex />
      <div className="space-y-6 py-6">
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link to="/routes/mine">
            <ArrowLeft className="size-4" /> {t("myRoutes")}
          </Link>
        </Button>

        <header className="space-y-4 border-t border-filet pt-5 md:pt-6">
          <EditorialTitle as="h1" size="md">{route.name}</EditorialTitle>
          <dl className="grid grid-cols-3 gap-x-6 gap-y-4 max-w-md">
            <RouteStat label={t("result.actualDistance")} value={`${(route.distanceM / 1000).toFixed(2)} km`} />
            <RouteStat label={t("result.elevationGain")} value={`${route.elevationGainM} m`} />
            <RouteStat
              label={t("result.estimatedDuration")}
              value={formatDurationMinutes(route.estimatedDurationSec / 60)}
            />
          </dl>
        </header>

        <Suspense fallback={<MapFallback />}>
          <RouteMap points={route.points} pois={route.pois} />
        </Suspense>

        {route.elevation.length > 1 && (
          <div className="border-t border-filet pt-4">
            <p className="mb-2 font-mono text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
              {t("result.elevationProfile")}
            </p>
            <Suspense fallback={null}>
              <ElevationChart profile={route.elevation} />
            </Suspense>
          </div>
        )}

        {route.planSessionRef && (
          <div className="flex flex-col gap-3 border-2 border-foreground p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
                {t("result.linkedToPlan")}
              </p>
              <p className="mt-1 text-sm text-foreground">
                {t("result.linkedToPlanBody", { week: route.planSessionRef.weekNumber })}
              </p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to={`/plan/${route.planSessionRef.planId}?week=${route.planSessionRef.weekNumber}`}>
                {t("result.backToPlan")}
              </Link>
            </Button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onExport} className="gap-2">
            <Download className="size-4" />
            {t("result.exportGpx")}
          </Button>
          <Button variant="ghost" onClick={onDelete} className="gap-2 text-destructive hover:text-destructive">
            <Trash2 className="size-4" />
            {t("result.delete")}
          </Button>
        </div>
      </div>
    </>
  );
}

export default RouteDetailPage;
