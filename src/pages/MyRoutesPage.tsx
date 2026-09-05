import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { ArrowRight, Plus, Route as RouteIcon, Trash2 } from "@/components/icons";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SEOHead } from "@/components/seo";
import { useRoutes } from "@/hooks/useRoutes";
import { useIsEnglish } from "@/lib/i18n-utils";
import { ROUTE_STORAGE_SOFT_LIMIT } from "@/lib/routeGenerator";
import type { Discipline } from "@/types";
import { toast } from "sonner";

/** The two disciplines the generator can route. A saved route never carries a
 *  third, but the raw value is printed rather than swallowed if one appears. */
const DISCIPLINE_KEY: Partial<Record<Discipline, string>> = {
  running: "form.disciplineRunning",
  cycling: "form.disciplineCycling",
};

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

      <div className="zn-rt">
        {/* 1 — what is stored, counted, and the way to store one more */}
        <section className="zn-rt__band zn-rt__band--first">
          <div className="zn-rt__head">
            <div
              className="zn-stack zn-rt__headtext"
              style={{ "--gap": "var(--sp-6)" } as CSSProperties}
            >
              <span className="zn-kicker">
                {t("list.kicker", {
                  count: routes.length,
                  limit: ROUTE_STORAGE_SOFT_LIMIT,
                })}
              </span>
              <h1 className="zn-display" data-level="2">
                {t("myRoutes")}
              </h1>
              <p className="zn-body zn-body--lead zn-rt__lede">{t("list.lede")}</p>
            </div>

            <Button asChild>
              <Link to="/routes">
                <Plus size={17} />
                {t("newRoute")}
              </Link>
            </Button>
          </div>
        </section>

        {/* 2 — the index, or the reason there is none */}
        <section className="zn-rt__band">
          {reachedSoftLimit && (
            <Alert
              kind="warning"
              title={t("list.softLimitTitle", { limit: ROUTE_STORAGE_SOFT_LIMIT })}
              className="zn-rt__notice"
            >
              {t("list.softLimitReached", { limit: ROUTE_STORAGE_SOFT_LIMIT })}
            </Alert>
          )}

          {routes.length === 0 ? (
            <EmptyState
              variant="not-started"
              icon={RouteIcon}
              title={t("list.emptyTitle")}
              description={t("list.empty")}
              action={
                // The header already spends the screen's one vermillon fill on
                // this exact call, so here it is the outlined accent.
                <Button variant="outline-primary" asChild>
                  <Link to="/routes">
                    <Plus size={17} />
                    {t("list.emptyCta")}
                  </Link>
                </Button>
              }
            />
          ) : (
            <ul className="zn-rt__list">
              {routes.map((route) => {
                const disciplineKey = DISCIPLINE_KEY[route.discipline];
                return (
                  <li key={route.id} className="zn-rt__item">
                    <Link to={`/routes/${route.id}`} className="zn-rt__item-link">
                      <span className="zn-rt__item-name">{route.name}</span>
                      <span className="zn-mono zn-rt__facts">
                        <strong>{(route.distanceM / 1000).toFixed(1)} km</strong>
                        <span>↑ {route.elevationGainM} m</span>
                        <span>{disciplineKey ? t(disciplineKey) : route.discipline}</span>
                        <span>{t("list.savedAt", { date: formatDate(route.generatedAt) })}</span>
                      </span>
                    </Link>

                    <div className="zn-rt__item-actions">
                      <Button
                        asChild
                        variant="outline"
                        size="icon-sm"
                        aria-label={t("list.open", { name: route.name })}
                      >
                        <Link to={`/routes/${route.id}`}>
                          <ArrowRight size={16} />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="zn-rt__danger"
                        aria-label={t("list.deleteRoute", { name: route.name })}
                        onClick={() => onDelete(route.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

export default MyRoutesPage;
