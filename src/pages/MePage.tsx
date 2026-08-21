import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Gauge,
  Heart,
  CalendarRange,
  Dumbbell,
  Target,
  Plus,
  AlertTriangle,
} from "@/components/icons";
import { SEOHead } from "@/components/seo";
import { EditorialTitle, FadeUp } from "@/components/editorial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DataExportImport } from "@/components/domain/DataExportImport";
import { ClearAllDataDialog } from "@/components/domain/ClearAllDataDialog";
import { zoneClass } from "@/lib/zoneColors";
import { cn } from "@/lib/utils";
import { usePickLang } from "@/lib/i18n-utils";
import { useFavorites } from "@/hooks";
import { usePlans } from "@/hooks/usePlans";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useAppStats } from "@/hooks/useAppStats";
import { getRunnerProfileOrMigrate } from "@/lib/runnerProfile";
import { calculateAllZones, loadUserZonePrefs } from "@/lib/zones";
import { getCustomWorkouts } from "@/lib/customWorkoutStorage";
import { downloadBackup } from "@/lib/downloadBackup";
import { isLocalStorageAvailable } from "@/lib/backup";
import {
  computeStorageKeyStats,
  totalBytes,
  totalObjects,
  presentKeyCount,
  formatStorageSize,
} from "@/lib/storageInventory";
import { ZONE_META, DIFFICULTY_META, type ZoneNumber } from "@/types";
import type { Difficulty } from "@/types";

export function MePage() {
  const { t } = useTranslation("profile");
  const pickLang = usePickLang();
  const stats = useAppStats();

  // Read once on mount — this page has no in-place editing of its own; values
  // and zones change on /me/zones, and a fresh mount here (return navigation)
  // re-reads storage anyway.
  const [profile] = useState(() => getRunnerProfileOrMigrate());
  const [zonePrefs] = useState(() => loadUserZonePrefs());
  const [storageOk, setStorageOk] = useState(true);

  useEffect(() => {
    setStorageOk(isLocalStorageAvailable());
  }, []);

  const { favorites } = useFavorites();
  const { plans, isLoading: plansLoading } = usePlans();
  const { workouts } = useWorkouts();
  const customWorkouts = getCustomWorkouts();

  const weeks = useMemo(() => plans.filter((p) => p.config.isSingleWeek), [plans]);
  const fullPlans = useMemo(() => plans.filter((p) => !p.config.isSingleWeek), [plans]);
  const openPlan = fullPlans[0];
  const modifiedSessions = useMemo(() => {
    if (!openPlan) return 0;
    return openPlan.weeks
      .flatMap((w) => w.sessions)
      .filter((s) => s.status === "modified").length;
  }, [openPlan]);

  const zones = zonePrefs ? calculateAllZones(zonePrefs) : [];
  const hasValues = profile?.vma !== undefined || profile?.fcMax !== undefined;

  const storageStats = computeStorageKeyStats((key) => localStorage.getItem(key));
  const storageSize = formatStorageSize(totalBytes(storageStats));
  const storageKeyCount = presentKeyCount(storageStats);
  const storageObjectCount = totalObjects(storageStats);

  const favoriteWorkouts = favorites
    .map((id) => workouts.find((w) => w.id === id))
    .filter((w): w is NonNullable<typeof w> => !!w);

  if (!hasValues && favorites.length === 0 && plans.length === 0 && customWorkouts.length === 0) {
    return (
      <>
        <SEOHead noindex title={t("me.dashboard.seoTitle")} description={t("me.dashboard.seoDescription")} />
        <div className="py-8 max-w-2xl mx-auto">
          <EmptyState
            icon={Gauge}
            variant="not-started"
            title={t("me.dashboard.emptyStateTitle")}
            description={t("me.dashboard.emptyStateBody")}
            action={
              <Button asChild>
                <Link to="/me/zones">{t("me.dashboard.emptyStateCta")}</Link>
              </Button>
            }
            hint={
              stats.workouts > 0
                ? t("me.dashboard.emptyStateNote", { count: stats.workouts })
                : undefined
            }
          />
          {/* A blank device is exactly when someone restores a backup from
              another device — the empty state still needs the import entry
              point, not just the "start from scratch" CTA above. */}
          <DataExportImport />
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead noindex title={t("me.dashboard.seoTitle")} description={t("me.dashboard.seoDescription")} />
      <div className="py-8 max-w-6xl mx-auto space-y-8">
        {!storageOk && (
          <div className="flex items-start gap-3 border-2 border-destructive p-4">
            <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{t("me.dashboard.storageDeniedWarning")}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px] items-end">
          <div>
            <p className="font-mono text-[11px] tracking-wide uppercase text-muted-foreground">
              {t("me.dashboard.eyebrow")}
            </p>
            <EditorialTitle as="h1" size="xl" className="mt-2">
              {t("me.dashboard.title")}
            </EditorialTitle>
            <FadeUp as="p" delay={0.1} className="mt-3 text-muted-foreground max-w-xl">
              {t("me.dashboard.intro")}
            </FadeUp>
          </div>
          <Card>
            <CardContent className="pt-6">
              <p className="font-mono text-[10px] tracking-wide uppercase text-muted-foreground">
                {t("me.dashboard.storageLabel")}
              </p>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="font-mono text-4xl">{storageSize}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  {t("me.dashboard.storageKeys", { count: storageKeyCount })} ·{" "}
                  {t("me.dashboard.storageObjects", { count: storageObjectCount })}
                </span>
              </div>
              <Button variant="link" asChild className="px-0 mt-2 h-auto">
                <Link to="/me/storage">{t("me.dashboard.footerInventory")}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Mes valeurs */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-baseline justify-between">
                <CardTitle className="font-mono text-[10px] tracking-wide uppercase text-muted-foreground">
                  {t("me.dashboard.valuesTitle")}
                </CardTitle>
                <Button variant="link" asChild className="px-0 h-auto font-mono text-[10px] tracking-wide uppercase">
                  <Link to="/me/zones">{t("me.dashboard.edit")}</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {hasValues ? (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 font-mono">
                  {profile?.vma !== undefined && (
                    <div>
                      <div className="text-3xl">{profile.vma}</div>
                      <div className="text-[10px] tracking-wide uppercase text-muted-foreground mt-1.5">
                        {t("me.dashboard.vma")}
                      </div>
                    </div>
                  )}
                  {profile?.fcMax !== undefined && (
                    <div>
                      <div className="text-3xl">{profile.fcMax}</div>
                      <div className="text-[10px] tracking-wide uppercase text-muted-foreground mt-1.5">
                        {t("me.dashboard.fcMax")}
                      </div>
                    </div>
                  )}
                  {profile?.currentWeeklyKm !== undefined && (
                    <div>
                      <div className="text-3xl">{profile.currentWeeklyKm}</div>
                      <div className="text-[10px] tracking-wide uppercase text-muted-foreground mt-1.5">
                        {t("me.dashboard.weeklyKm")}
                      </div>
                    </div>
                  )}
                  {profile?.currentLongRunKm !== undefined && (
                    <div>
                      <div className="text-3xl">{profile.currentLongRunKm}</div>
                      <div className="text-[10px] tracking-wide uppercase text-muted-foreground mt-1.5">
                        {t("me.dashboard.longRunKm")}
                      </div>
                    </div>
                  )}
                  {profile?.runnerLevel !== undefined && (
                    <div>
                      <div className="text-xl mt-1.5">
                        {pickLang(DIFFICULTY_META[profile.runnerLevel as Difficulty], "label")}
                      </div>
                      <div className="text-[10px] tracking-wide uppercase text-muted-foreground mt-1.5">
                        {t("me.dashboard.level")}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-start gap-3">
                  <p className="text-sm text-muted-foreground">{t("me.dashboard.valuesEmpty")}</p>
                  <Button asChild>
                    <Link to="/me/zones">{t("me.dashboard.valuesEmptyCta")}</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Mes zones */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-baseline justify-between">
                <CardTitle className="font-mono text-[10px] tracking-wide uppercase text-muted-foreground">
                  {t("me.dashboard.zonesTitle")}
                </CardTitle>
                <Button variant="link" asChild className="px-0 h-auto font-mono text-[10px] tracking-wide uppercase">
                  <Link to="/me/zones">{t("me.dashboard.adjustZone")}</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {zones.length > 0 ? (
                <div className="border border-border">
                  {zones.map((z) => (
                    <div
                      key={z.zone}
                      className={cn(
                        "grid grid-cols-[56px_1fr_auto] gap-3 items-center px-3 py-2 border-b border-border last:border-b-0 text-sm",
                        z.isManual && "bg-accent-acid/20"
                      )}
                    >
                      <span className={cn("font-mono text-xs font-bold", zoneClass(z.zone as ZoneNumber, "text"))}>
                        Z{z.zone}
                      </span>
                      <span className="text-muted-foreground truncate">
                        {pickLang(ZONE_META[z.zone as ZoneNumber], "label")}
                        {z.isManual && (
                          <Badge variant="secondary" className="ml-2">
                            {t("me.dashboard.manualBadge")}
                          </Badge>
                        )}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {z.paceMinPerKm !== undefined && z.paceMaxPerKm !== undefined
                          ? `${z.paceMinPerKm.toFixed(2)}–${z.paceMaxPerKm.toFixed(2)} min/km`
                          : z.hrMin !== undefined
                            ? `${z.hrMin}–${z.hrMax} bpm`
                            : "—"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("me.dashboard.zonesEmpty")}</p>
              )}
            </CardContent>
          </Card>

          {/* Favoris */}
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[10px] tracking-wide uppercase text-muted-foreground flex items-center gap-2">
                <Heart className="size-3.5" />
                {t("me.dashboard.favoritesTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl mb-3">{favorites.length}</div>
              {favoriteWorkouts.length > 0 ? (
                <div className="flex flex-col">
                  {favoriteWorkouts.slice(0, 3).map((w) => (
                    <Link
                      key={w.id}
                      to={`/workout/${w.id}`}
                      className="flex items-center justify-between py-2 border-t border-border text-sm text-muted-foreground hover:text-foreground"
                    >
                      <span className="truncate">{pickLang(w, "name")}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("me.dashboard.favoritesEmpty")}</p>
              )}
              {favorites.length > 0 && (
                <Button variant="link" asChild className="px-0 mt-2 h-auto font-mono text-[11px]">
                  <Link to="/favorites">{t("me.dashboard.favoritesSeeAll", { count: favorites.length })}</Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Mes semaines */}
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[10px] tracking-wide uppercase text-muted-foreground flex items-center gap-2">
                <CalendarRange className="size-3.5" />
                {t("me.dashboard.weeksTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl mb-3">{weeks.length}</div>
              {weeks.length > 0 ? (
                <div className="flex flex-col">
                  {weeks.slice(0, 3).map((w) => (
                    <Link
                      key={w.id}
                      to={`/weeks/${w.id}`}
                      className="flex items-center justify-between py-2 border-t border-border text-sm text-muted-foreground hover:text-foreground"
                    >
                      <span className="truncate">{pickLang(w, "name")}</span>
                      <span className="font-mono text-xs shrink-0 ml-2">
                        {w.weeks[0]?.sessions.length ?? 0}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("me.dashboard.weeksEmpty")}</p>
              )}
              <p className="text-xs text-muted-foreground mt-3">{t("me.dashboard.weeksNote")}</p>
            </CardContent>
          </Card>

          {/* Séances créées */}
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[10px] tracking-wide uppercase text-muted-foreground flex items-center gap-2">
                <Dumbbell className="size-3.5" />
                {t("me.dashboard.workoutsTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl mb-3">{customWorkouts.length}</div>
              {customWorkouts.length > 0 ? (
                <div className="flex flex-col">
                  {customWorkouts.slice(0, 3).map((w) => (
                    <Link
                      key={w.id}
                      to={`/workout/${w.id}`}
                      className="flex items-center justify-between py-2 border-t border-border text-sm text-muted-foreground hover:text-foreground"
                    >
                      <span className="truncate">{pickLang(w, "name") || w.id}</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{t("me.dashboard.workoutsEmpty")}</p>
              )}
              <Button variant="link" asChild className="px-0 mt-2 h-auto font-mono text-[11px]">
                <Link to="/workout/builder">
                  <Plus className="size-3" />
                  {t("me.dashboard.workoutsCreate")}
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Plans ouverts */}
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-[10px] tracking-wide uppercase text-muted-foreground flex items-center gap-2">
                <Target className="size-3.5" />
                {t("me.dashboard.plansTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-3xl mb-3">{plansLoading ? "—" : fullPlans.length}</div>
              {openPlan ? (
                <>
                  <Link to={`/plan/${openPlan.id}`} className="block py-2 border-t border-border">
                    <div className="text-sm text-muted-foreground truncate">{pickLang(openPlan, "name")}</div>
                    <div className="text-xs font-mono text-muted-foreground mt-1">
                      {openPlan.totalWeeks} sem.
                    </div>
                  </Link>
                  {modifiedSessions > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      {t("me.dashboard.plansModified", { count: modifiedSessions })}
                      {" · "}
                      <Link to={`/plan/${openPlan.id}`} className="underline">
                        {t("me.dashboard.plansSeeGaps")}
                      </Link>
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-muted-foreground">{t("me.dashboard.plansEmpty")}</p>
              )}
            </CardContent>
          </Card>

          {/* Ce qui n'existe pas */}
          <Card className="bg-ink text-paper border-ink">
            <CardHeader>
              <CardTitle className="font-mono text-[10px] tracking-wide uppercase opacity-70">
                {t("me.dashboard.absenceTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent className="font-mono text-xs">
              {[
                ["absenceAccount", "absenceAccountValue"],
                ["absenceTracker", "absenceTrackerValue"],
                ["absenceNetwork", "absenceNetworkValue"],
                ["absenceWatch", "absenceWatchValue"],
                ["absenceCompleted", "absenceCompletedValue"],
              ].map(([labelKey, valueKey]) => (
                <div key={labelKey} className="flex items-center justify-between py-2 border-t border-paper/20 last:border-b last:border-paper/20">
                  <span>{t(`me.dashboard.${labelKey}`)}</span>
                  <span className="opacity-60">{t(`me.dashboard.${valueKey}`)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Emporter ou effacer */}
        <Card className="bg-ink text-paper border-ink">
          <CardHeader>
            <CardTitle className="font-mono text-[10px] tracking-wide uppercase opacity-70">
              {t("me.dashboard.dataEyebrow")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg font-semibold">{t("me.dashboard.dataTitle")}</p>
            <p className="text-sm opacity-80 max-w-2xl">{t("me.dashboard.dataBody")}</p>
            <div className="flex flex-wrap gap-3">
              <Button onClick={downloadBackup}>{t("me.dashboard.exportAll")}</Button>
              <ClearAllDataDialog onExportFirst={downloadBackup}>
                <Button variant="destructive" className="border-destructive bg-transparent">
                  {t("me.dashboard.clearAll")}
                </Button>
              </ClearAllDataDialog>
            </div>
          </CardContent>
        </Card>

        {/* Import — reuses the proven Settings flow (parse, diff-free confirm
            dialog with merge/replace, rollback on failure) rather than a
            second hand-rolled implementation. */}
        <DataExportImport />

        <p className="font-mono text-[11px] text-muted-foreground">
          {t("me.dashboard.footerCache")}
        </p>
      </div>
    </>
  );
}
