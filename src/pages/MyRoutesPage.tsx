import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ArrowRight, Plus, Route as RouteIcon, Trash2 } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SEOHead } from "@/components/seo";
import { EditorialTitle } from "@/components/editorial";
import { useRoutes } from "@/hooks/useRoutes";
import { useIsEnglish } from "@/lib/i18n-utils";
import { ROUTE_STORAGE_SOFT_LIMIT } from "@/lib/routeGenerator";
import { toast } from "sonner";

export function MyRoutesPage() {
  const { t } = useTranslation("routes");
  const isEnglish = useIsEnglish();
  const { routes, deleteRoute } = useRoutes();

  const formatDate = (iso: string): string => {
    const date = new Date(iso);
    return date.toLocaleDateString(isEnglish ? "en-US" : "fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const onDelete = async (id: string) => {
    if (await deleteRoute(id)) {
      toast.success(t("result.deleted"));
    }
  };

  const reachedSoftLimit = routes.length >= ROUTE_STORAGE_SOFT_LIMIT;

  return (
    <>
      <SEOHead title={t("myRoutes")} description={t("subtitle")} canonical="/routes/mine" noindex />
      <div className="space-y-6 py-6">
        <header className="flex items-center justify-between gap-4 border-t border-filet pt-5 md:pt-6">
          <div>
            <p className="font-mono text-[10px] md:text-[11px] tracking-[0.16em] uppercase text-muted-foreground">
              {t("myRoutes")}
            </p>
            <EditorialTitle as="h1" size="md" className="mt-1">{t("myRoutes")}</EditorialTitle>
            <p className="mt-2 font-mono text-[11px] text-muted-foreground">
              {routes.length} / {ROUTE_STORAGE_SOFT_LIMIT}
            </p>
          </div>
          <Button asChild>
            <Link to="/routes" className="gap-2">
              <Plus className="size-4" />
              {t("newRoute")}
            </Link>
          </Button>
        </header>

        {reachedSoftLimit && (
          <div className="border-2 border-zone-3 p-3 font-mono text-[11px] text-foreground">
            {t("list.softLimitReached", { limit: ROUTE_STORAGE_SOFT_LIMIT })}
          </div>
        )}

        {routes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 border-2 border-dashed border-muted-foreground py-14 text-center">
            <RouteIcon className="size-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">{t("list.empty")}</p>
            <Button asChild>
              <Link to="/routes" className="gap-2">
                <Plus className="size-4" />
                {t("list.emptyCta")}
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {routes.map((route) => (
              <li
                key={route.id}
                className="flex items-center justify-between gap-3 bg-card p-4 transition-colors hover:bg-secondary"
              >
                <Link to={`/routes/${route.id}`} className="flex flex-1 flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{route.name}</span>
                    <span className="inline-flex items-center border border-foreground px-1.5 py-0.5 font-mono text-[10px] tracking-[0.08em] uppercase text-muted-foreground">
                      {route.discipline}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 font-mono text-[11px] text-muted-foreground">
                    <span>{(route.distanceM / 1000).toFixed(1)} km</span>
                    <span>D+ {route.elevationGainM} m</span>
                    <span>{t("list.savedAt", { date: formatDate(route.generatedAt) })}</span>
                  </div>
                </Link>
                <div className="flex items-center gap-1">
                  <Button asChild variant="ghost" size="icon" aria-label={t("myRoutes")}>
                    <Link to={`/routes/${route.id}`}>
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={t("result.delete")}
                    onClick={() => onDelete(route.id)}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export default MyRoutesPage;
