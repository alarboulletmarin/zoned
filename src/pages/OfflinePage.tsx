import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/seo";
import { usePWA } from "@/hooks/usePWA";
import { useAppStats } from "@/hooks/useAppStats";
import { cn } from "@/lib/utils";

/**
 * `/offline` — what still works without a network vs what waits for one.
 *
 * Zoned is a client-only app: the catalogue, plans, calculators and every
 * export are already in the browser once the service worker has cached them,
 * so "offline" is a normal mode, not a failure state. This page explains the
 * split instead of showing a dead end, and its counts come from the same
 * `useAppStats()` the rest of the app uses — nothing here is hardcoded prose
 * that can drift from the real catalogue.
 */
export function OfflinePage() {
  const { t } = useTranslation("common");
  const { isOnline } = usePWA();
  const stats = useAppStats();
  const navigate = useNavigate();

  return (
    <>
      <SEOHead noindex title={t("seo.offlineTitle")} />
      <div className="py-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-3">
          <p className="font-mono text-[11px] tracking-[0.14em] uppercase text-muted-foreground">
            {t("offline.eyebrow")}
          </p>
          <Badge variant={isOnline ? "outline" : "default"}>
            {isOnline ? t("offline.statusOnline") : t("offline.statusOffline")}
          </Badge>
        </div>

        <h1 className="font-sans font-bold text-4xl sm:text-5xl uppercase leading-[0.9] tracking-tight mt-3">
          {t("offline.title")}
        </h1>

        <p className="mt-4 text-muted-foreground max-w-prose">
          {t("offline.description")}
        </p>

        <div className="grid sm:grid-cols-2 gap-6 mt-8">
          <div className="border-t-2 border-foreground pt-3.5">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-primary">
              {t("offline.worksTitle")}
            </p>
            <ul className="mt-2.5 text-sm">
              <li className="py-2 border-t border-filet">
                {t("offline.worksCatalogue", { count: stats.workouts })}
              </li>
              <li className="py-2 border-t border-filet">
                {t("offline.worksPlans", { count: stats.plans })}
              </li>
              <li className="py-2 border-t border-filet">
                {t("offline.worksCalculators", { count: stats.calculators })}
              </li>
              <li className="py-2 border-t border-filet">{t("offline.worksExports")}</li>
              <li className="py-2 border-t border-filet">{t("offline.worksMethodology")}</li>
            </ul>
          </div>

          <div className="border-t-2 border-filet pt-3.5">
            <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted-foreground">
              {t("offline.waitsTitle")}
            </p>
            <ul className="mt-2.5 text-sm text-muted-foreground">
              <li className="py-2 border-t border-filet">{t("offline.waitsRoutes")}</li>
              <li className="py-2 border-t border-filet">{t("offline.waitsCatalogueUpdate")}</li>
              <li className="py-2 border-t border-filet">{t("offline.waitsShare")}</li>
            </ul>
            <p className="font-mono text-[11px] text-muted-foreground mt-3.5 leading-relaxed">
              {t("offline.autoResume")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mt-8">
          <Button
            className={cn("bg-accent-acid text-ink hover:bg-accent-acid/90")}
            onClick={() => navigate("/")}
          >
            {t("offline.continueCta")}
          </Button>
          <Button variant="ghost" onClick={() => window.location.reload()}>
            {t("offline.retryCta")}
          </Button>
        </div>
      </div>
    </>
  );
}
