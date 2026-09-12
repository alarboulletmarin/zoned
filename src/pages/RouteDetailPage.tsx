import { lazy, Suspense, useEffect, useState, type CSSProperties } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { ArrowLeft, Download, Trash2 } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SEOHead } from "@/components/seo";
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
  return <Skeleton className="zn-rt__mapskel" />;
}

export function RouteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation("routes");
  const navigate = useNavigate();
  const { deleteRoute } = useRoutes();
  const [route, setRoute] = useState<Route | null>(null);
  // The lookup is async, so a null route means "still reading" until it
  // resolves. Telling the two apart is what lets the missing-route case say
  // what happened instead of showing the empty-library sentence.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setIsLoading(true);
    void getRoute(id).then((found) => {
      if (cancelled) return;
      setRoute(found);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const backLink = (
    <Button asChild variant="ghost" size="sm" className="zn-rt__back">
      <Link to="/routes/mine">
        <ArrowLeft size={16} />
        {t("myRoutes")}
      </Link>
    </Button>
  );

  if (!route) {
    return (
      <div className="zn-rt">
        <section
          className="zn-rt__band zn-stack"
          style={{ "--gap": "var(--sp-11)" } as CSSProperties}
        >
          {backLink}
          {isLoading ? (
            <div
              className="zn-stack"
              style={{ "--gap": "var(--sp-11)" } as CSSProperties}
            >
              <Skeleton style={{ blockSize: "var(--sp-14)", inlineSize: "22ch" }} />
              <MapFallback />
            </div>
          ) : (
            <Alert
              kind="error"
              title={t("detail.missingTitle")}
              className="zn-rt__notice"
              action={
                <Button variant="outline-primary" asChild>
                  <Link to="/routes/mine">{t("myRoutes")}</Link>
                </Button>
              }
            >
              {t("detail.missingBody")}
            </Alert>
          )}
        </section>
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

      <div className="zn-rt">
        {/* 1 — which route this is, in figures */}
        <section
          className="zn-rt__band zn-stack"
          style={{ "--gap": "var(--sp-11)" } as CSSProperties}
        >
          {backLink}
          <div
            className="zn-stack"
            style={{ "--gap": "var(--sp-6)" } as CSSProperties}
          >
            <span className="zn-kicker">{t("detail.kicker")}</span>
            <h1 className="zn-display" data-level="2">
              {route.name}
            </h1>
            <p className="zn-mono zn-rt__facts">
              <strong>{(route.distanceM / 1000).toFixed(2)} km</strong>
              <span>↑ {route.elevationGainM} m</span>
              <span>~{formatDurationMinutes(route.estimatedDurationSec / 60)}</span>
            </p>
          </div>
        </section>

        {/* 2 — the trace, and the profile under it */}
        <section
          className="zn-rt__band zn-stack"
          style={{ "--gap": "var(--sp-11)" } as CSSProperties}
        >
          <div className="zn-rt__map">
            <Suspense fallback={<MapFallback />}>
              <RouteMap points={route.points} pois={route.pois} />
            </Suspense>
          </div>

          {route.elevation.length > 1 && (
            <div className="zn-rt__figure">
              <span className="zn-kicker">{t("result.elevationProfile")}</span>
              <Suspense fallback={null}>
                <ElevationChart profile={route.elevation} />
              </Suspense>
            </div>
          )}

          {route.planSessionRef && (
            <div className="zn-rt__linked">
              <div
                className="zn-stack"
                style={{ "--gap": "var(--sp-3)" } as CSSProperties}
              >
                <span className="zn-kicker">{t("result.linkedToPlan")}</span>
                <p className="zn-body zn-body--sm">
                  {t("result.linkedToPlanBody", { week: route.planSessionRef.weekNumber })}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link
                  to={`/plan/${route.planSessionRef.planId}?week=${route.planSessionRef.weekNumber}`}
                >
                  {t("result.backToPlan")}
                </Link>
              </Button>
            </div>
          )}
        </section>

        {/* 3 — what you can do with it */}
        <section className="zn-rt__band zn-cluster">
          <Button onClick={onExport}>
            <Download size={17} />
            {t("result.exportGpx")}
          </Button>
          <Button variant="outline" className="zn-rt__danger" onClick={onDelete}>
            <Trash2 size={17} />
            {t("result.delete")}
          </Button>
        </section>
      </div>
    </>
  );
}

export default RouteDetailPage;
