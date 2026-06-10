import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback, lazy, Suspense, type ComponentType } from "react";
import { useTranslation } from "react-i18next";
import { Analytics } from "@vercel/analytics/react";
import { toast, Toaster } from "sonner";
import { MobileSidebar, TopBar, Footer } from "@/components/layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FavoritesProvider } from "@/hooks";
import { SettingsProvider } from "@/hooks/useSettings";
import { CommandPaletteProvider, useCommandPalette } from "@/components/search";
import { GlossaryMatcherProvider } from "@/contexts/GlossaryMatcherContext";
import { StorageWarning } from "@/components/domain/StorageWarning";
import { PWAInstallPrompt } from "@/components/domain/PWAInstallPrompt";
import { usePWA } from "@/hooks/usePWA";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { i18nReady } from "@/i18n";

/** React.lazy that also waits for the active language's translation bundles
 *  (loaded in parallel with the page chunk). The page renders only once both
 *  are ready, behind the same Suspense fallback — no flash of raw i18n keys.
 *  After the first page, i18nReady is resolved and this is free. */
function lazyPage<T extends ComponentType<unknown>>(
  loader: () => Promise<{ default: T }>
) {
  return lazy(() =>
    Promise.all([loader(), i18nReady]).then(([module]) => module)
  );
}

// All pages lazy loaded for optimal code-splitting
const HomePage = lazyPage(() => import("@/pages/HomePage").then(m => ({ default: m.HomePage })));
const LibraryPage = lazyPage(() => import("@/pages/LibraryPage").then(m => ({ default: m.LibraryPage })));
const DrawSessionPage = lazyPage(() => import("@/pages/DrawSessionPage").then(m => ({ default: m.DrawSessionPage })));
const WeeksListPage = lazyPage(() => import("@/pages/WeeksListPage").then(m => ({ default: m.WeeksListPage })));
const WeekViewPage = lazyPage(() => import("@/pages/WeekViewPage").then(m => ({ default: m.WeekViewPage })));
const WeekNewPage = lazyPage(() => import("@/pages/WeekNewPage").then(m => ({ default: m.WeekNewPage })));
const PrebuiltWeeksPage = lazyPage(() => import("@/pages/PrebuiltWeeksPage").then(m => ({ default: m.PrebuiltWeeksPage })));
const PrebuiltWeekDetailPage = lazyPage(() => import("@/pages/PrebuiltWeekDetailPage").then(m => ({ default: m.PrebuiltWeekDetailPage })));
const WorkoutDetailPage = lazyPage(() => import("@/pages/WorkoutDetailPage").then(m => ({ default: m.WorkoutDetailPage })));
const MyZonesPage = lazyPage(() => import("@/pages/MyZonesPage").then(m => ({ default: m.MyZonesPage })));
const FavoritesPage = lazyPage(() => import("@/pages/FavoritesPage").then(m => ({ default: m.FavoritesPage })));
const ContributePage = lazyPage(() => import("@/pages/ContributePage").then(m => ({ default: m.ContributePage })));
const AboutPage = lazyPage(() => import("@/pages/AboutPage").then(m => ({ default: m.AboutPage })));
const LearnPage = lazyPage(() => import("@/pages/LearnPage").then(m => ({ default: m.LearnPage })));
const MethodologyPage = lazyPage(() => import("@/pages/MethodologyPage").then(m => ({ default: m.MethodologyPage })));
const ArticlePage = lazyPage(() => import("@/pages/ArticlePage").then(m => ({ default: m.ArticlePage })));
const GlossaryPage = lazyPage(() => import("@/pages/GlossaryPage").then(m => ({ default: m.GlossaryPage })));
const GlossaryTermPage = lazyPage(() => import("@/pages/GlossaryTermPage").then(m => ({ default: m.GlossaryTermPage })));
const SettingsPage = lazyPage(() => import("@/pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const CollectionsPage = lazyPage(() => import("@/pages/CollectionsPage").then(m => ({ default: m.CollectionsPage })));
const CollectionDetailPage = lazyPage(() => import("@/pages/CollectionDetailPage").then(m => ({ default: m.CollectionDetailPage })));
const ChangelogPage = lazyPage(() => import("@/pages/ChangelogPage").then(m => ({ default: m.ChangelogPage })));
const PlansPage = lazyPage(() => import("@/pages/PlansPage").then(m => ({ default: m.PlansPage })));
const PlanNewPage = lazyPage(() => import("@/pages/PlanNewPage").then(m => ({ default: m.PlanNewPage })));
const PlanCreatePage = lazyPage(() => import("@/pages/PlanCreatePage").then(m => ({ default: m.PlanCreatePage })));
const FreePlanCreatePage = lazyPage(() => import("@/pages/FreePlanCreatePage").then(m => ({ default: m.FreePlanCreatePage })));
const PlanViewPage = lazyPage(() => import("@/pages/PlanViewPage").then(m => ({ default: m.PlanViewPage })));
const PrebuiltPlansPage = lazyPage(() => import("@/pages/PrebuiltPlansPage").then(m => ({ default: m.PrebuiltPlansPage })));
const PrebuiltPlanDetailPage = lazyPage(() => import("@/pages/PrebuiltPlanDetailPage").then(m => ({ default: m.PrebuiltPlanDetailPage })));
const PlanMethodologyPage = lazyPage(() => import("@/pages/PlanMethodologyPage").then(m => ({ default: m.PlanMethodologyPage })));
const NutritionGuidePage = lazyPage(() => import("@/pages/NutritionGuidePage").then(m => ({ default: m.NutritionGuidePage })));
const NutritionHubPage = lazyPage(() => import("@/pages/NutritionHubPage").then(m => ({ default: m.NutritionHubPage })));
const GuidesPage = lazyPage(() => import("@/pages/GuidesPage").then(m => ({ default: m.GuidesPage })));
const CalculateursPage = lazyPage(() => import("@/pages/CalculateursPage").then(m => ({ default: m.CalculateursPage })));
const ZonesCalculatorPage = lazyPage(() => import("@/pages/ZonesCalculatorPage").then(m => ({ default: m.ZonesCalculatorPage })));
const PaceCalculatorPage = lazyPage(() => import("@/pages/PaceCalculatorPage").then(m => ({ default: m.PaceCalculatorPage })));
const TreadmillConverterPage = lazyPage(() => import("@/pages/TreadmillConverterPage").then(m => ({ default: m.TreadmillConverterPage })));
const SplitGeneratorPage = lazyPage(() => import("@/pages/SplitGeneratorPage").then(m => ({ default: m.SplitGeneratorPage })));
const VmaCalculatorPage = lazyPage(() => import("@/pages/VmaCalculatorPage").then(m => ({ default: m.VmaCalculatorPage })));
const FtpTestPage = lazyPage(() => import("@/pages/tests/FtpTestPage").then(m => ({ default: m.FtpTestPage })));
const CssTestPage = lazyPage(() => import("@/pages/tests/CssTestPage").then(m => ({ default: m.CssTestPage })));
const RaceEquivalencePage = lazyPage(() => import("@/pages/RaceEquivalencePage").then(m => ({ default: m.RaceEquivalencePage })));
const RacePrepGuidePage = lazyPage(() => import("@/pages/RacePrepGuidePage").then(m => ({ default: m.RacePrepGuidePage })));
const WarmupGuidePage = lazyPage(() => import("@/pages/WarmupGuidePage").then(m => ({ default: m.WarmupGuidePage })));
const PaceConverterPage = lazyPage(() => import("@/pages/PaceConverterPage").then(m => ({ default: m.PaceConverterPage })));
const PaceTablePage = lazyPage(() => import("@/pages/PaceTablePage").then(m => ({ default: m.PaceTablePage })));
const AgeGradedPage = lazyPage(() => import("@/pages/AgeGradedPage").then(m => ({ default: m.AgeGradedPage })));
const WhatIfPage = lazyPage(() => import("@/pages/WhatIfPage").then(m => ({ default: m.WhatIfPage })));
const WorkoutBuilderPage = lazyPage(() => import("@/pages/WorkoutBuilderPage").then(m => ({ default: m.WorkoutBuilderPage })));
const RaceSimulatorPage = lazyPage(() => import("@/pages/RaceSimulatorPage").then(m => ({ default: m.RaceSimulatorPage })));
const CompareHubPage = lazyPage(() => import("@/pages/CompareHubPage").then(m => ({ default: m.CompareHubPage })));
const CompareDetailPage = lazyPage(() => import("@/pages/CompareDetailPage").then(m => ({ default: m.CompareDetailPage })));
const RunnerProfilePage = lazyPage(() => import("@/pages/RunnerProfilePage").then(m => ({ default: m.RunnerProfilePage })));
const RouteGeneratorPage = lazyPage(() => import("@/pages/RouteGeneratorPage").then(m => ({ default: m.RouteGeneratorPage })));
const MyRoutesPage = lazyPage(() => import("@/pages/MyRoutesPage").then(m => ({ default: m.MyRoutesPage })));
const RouteDetailPage = lazyPage(() => import("@/pages/RouteDetailPage").then(m => ({ default: m.RouteDetailPage })));
const TrackFinderPage = lazyPage(() => import("@/pages/TrackFinderPage").then(m => ({ default: m.TrackFinderPage })));
const NotFoundPage = lazyPage(() => import("@/pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));

// Command palette body: lazy so its search index (workout structures,
// collections, command surfaces, unified search) stays out of the entry
// chunk. Mounted on first open; the chunk is also preloaded at idle below,
// so by the time a human presses Cmd+K it is already in cache.
const LazyCommandPalette = lazy(() =>
  Promise.all([
    import("@/components/search/CommandPalette").then(m => ({ default: m.CommandPalette })),
    i18nReady,
  ]).then(([module]) => module)
);

function DeferredCommandPalette() {
  const { isOpen } = useCommandPalette();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (isOpen) setMounted(true);
  }, [isOpen]);
  if (!mounted) return null;
  return (
    <Suspense fallback={null}>
      <LazyCommandPalette />
    </Suspense>
  );
}

// Preload sidebar pages after initial render to eliminate navigation latency
function preloadSidebarPages() {
  const pages = [
    () => import("@/pages/HomePage"),
    () => import("@/pages/LibraryPage"),
    () => import("@/pages/PlansPage"),
    () => import("@/pages/FavoritesPage"),
    () => import("@/pages/CalculateursPage"),
    () => import("@/pages/CollectionsPage"),
    () => import("@/pages/LearnPage"),
    () => import("@/pages/GlossaryPage"),
    () => import("@/pages/MethodologyPage"),
    () => import("@/components/search/CommandPalette"),
  ];
  // Stagger preloads to not block the main thread
  pages.forEach((load, i) => setTimeout(load, 1000 + i * 200));
}

/** Routes that take over the full viewport (Strava-style map experiences,
 *  immersive editors). The Zoned Footer is hidden so the page can claim
 *  the entire vertical space without the user being pushed past the
 *  fold to satisfy a footer below the map. */
const FULLSCREEN_ROUTES = ["/routes"];

function ConditionalFooter() {
  const { pathname } = useLocation();
  if (FULLSCREEN_ROUTES.includes(pathname)) return null;
  return <Footer />;
}

function ScrollToTopOnNavigate() {
  const location = useLocation();
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    // Skip scroll-to-top when returning to a plan with a specific week
    if (location.pathname.startsWith("/plan/") && location.search.includes("week=")) return;
    const state = location.state as { returnScrollY?: number } | null;
    if (state?.returnScrollY != null) return;
    window.scrollTo(0, 0);
  }, [location.pathname, location.search, location.state]);

  // Announce page change for screen readers
  useEffect(() => {
    const title = document.title || location.pathname;
    setAnnouncement(title);
  }, [location.pathname]);

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {announcement}
    </div>
  );
}

function App() {
  const { t } = useTranslation("common");
  const { canInstall, promptInstall, dismissInstall, isOnline, updateAvailable, applyUpdate } = usePWA();
  // Toaster placement: bottom-right covers the share-sheet action row on
  // mobile (Copier / Partager / Télécharger). On small viewports we surface
  // the toast at the top instead so it never overlaps a button the user just
  // tapped, and dismiss it slightly faster.
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Preload main pages in background after first render
  useEffect(() => { preloadSidebarPages(); }, []);

  // Track if user has manually set theme preference
  const userHasSetTheme = useRef(
    typeof window !== "undefined" && localStorage.getItem("zoned-theme") !== null
  );

  // Theme — managed via ref + DOM to avoid re-rendering the entire app tree.
  // Only the TopBar icon needs to know the current theme (handled via its own state).
  const themeRef = useRef<"light" | "dark">(
    (() => {
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("zoned-theme");
        if (stored === "dark" || stored === "light") return stored;
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
      }
      return "light" as const;
    })()
  );

  // Apply initial theme (no state involved)
  useEffect(() => {
    document.documentElement.classList.toggle("dark", themeRef.current === "dark");
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      if (!userHasSetTheme.current) {
        themeRef.current = e.matches ? "dark" : "light";
        document.documentElement.classList.toggle("dark", themeRef.current === "dark");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // PWA: toast on update available
  useEffect(() => {
    if (updateAvailable) {
      toast(t("pwa.updateAvailable"), {
        action: { label: t("pwa.update"), onClick: applyUpdate },
        duration: Infinity,
      });
    }
  }, [updateAvailable]); // eslint-disable-line react-hooks/exhaustive-deps

  // PWA: toast on offline / back-online
  const prevOnline = useRef(true);
  useEffect(() => {
    if (!isOnline) {
      toast.warning(t("pwa.offline"), { id: "offline", duration: Infinity });
    } else if (!prevOnline.current) {
      toast.dismiss("offline");
      toast.success(t("pwa.backOnline"));
    }
    prevOnline.current = isOnline;
  }, [isOnline]); // eslint-disable-line react-hooks/exhaustive-deps

  // Toggle theme — NO setState, NO App re-render. Just DOM class + localStorage.
  // Transitions are disabled during the switch to avoid border/background flash.
  const toggleTheme = useCallback(() => {
    userHasSetTheme.current = true;
    document.documentElement.setAttribute("data-switching-theme", "");
    const next = themeRef.current === "dark" ? "light" : "dark";
    themeRef.current = next;
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem("zoned-theme", next);
    // Dispatch custom event so TopBar can update its icon
    window.dispatchEvent(new CustomEvent("zoned-theme-change", { detail: next }));
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.removeAttribute("data-switching-theme");
      });
    });
  }, []);

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <SettingsProvider>
        <FavoritesProvider>
          <BrowserRouter>
          <GlossaryMatcherProvider>
          <CommandPaletteProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
            >
              {t("accessibility.skipToContent", "Aller au contenu")}
            </a>
            <ScrollToTopOnNavigate />
            <div className="min-h-screen bg-background text-foreground flex flex-col">
              <TopBar
                onThemeToggle={toggleTheme}
                onMobileMenuOpen={() => setMobileSidebarOpen(true)}
              />

              {/* Mobile slide-over nav (hamburger). Desktop uses the
                  horizontal nav inside TopBar, no sidebar. */}
              <MobileSidebar
                open={mobileSidebarOpen}
                onOpenChange={setMobileSidebarOpen}
              />

              <div className="flex flex-1 min-w-0 flex-col">
                <ErrorBoundary>
                <main id="main-content" className="flex-1 px-4 md:px-6 lg:px-8 pt-20 pb-4">
                  <div className="mx-auto max-w-6xl">
                    <ErrorBoundary>
                      <Suspense fallback={<div className="min-h-screen" />}>
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/library" element={<LibraryPage />} />
                          <Route path="/library/draw" element={<DrawSessionPage />} />
                          <Route path="/weeks" element={<WeeksListPage />} />
                          <Route path="/weeks/new" element={<WeekNewPage />} />
                          <Route path="/weeks/new/prebuilt" element={<PrebuiltWeeksPage />} />
                          <Route path="/weeks/prebuilt/:slug" element={<PrebuiltWeekDetailPage />} />
                          <Route path="/weeks/:id" element={<WeekViewPage />} />
                          <Route path="/library/weekly" element={<Navigate to="/weeks" replace />} />
                          <Route path="/workout/builder" element={<WorkoutBuilderPage />} />
                          <Route path="/workout/builder/:id" element={<WorkoutBuilderPage />} />
                          <Route path="/workout/:id" element={<WorkoutDetailPage />} />
                          <Route path="/my-zones" element={<MyZonesPage />} />
                          <Route path="/calculators" element={<CalculateursPage />} />
                          <Route path="/calculators/zones" element={<ZonesCalculatorPage />} />
                          <Route path="/calculators/allures" element={<PaceCalculatorPage />} />
                          <Route path="/calculators/convertisseur" element={<PaceConverterPage />} />
                          <Route path="/calculators/table-allures" element={<PaceTablePage />} />
                          <Route path="/calculators/tapis-roulant" element={<TreadmillConverterPage />} />
                          <Route path="/calculators/splits" element={<SplitGeneratorPage />} />
                          <Route path="/calculators/vma" element={<VmaCalculatorPage />} />
                          <Route path="/calculators/ftp" element={<FtpTestPage />} />
                          <Route path="/calculators/css" element={<CssTestPage />} />
                          <Route path="/calculators/equivalence" element={<RaceEquivalencePage />} />
                          <Route path="/calculators/age-graded" element={<AgeGradedPage />} />
                          <Route path="/calculators/what-if" element={<WhatIfPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/profile" element={<RunnerProfilePage />} />
                          <Route path="/favorites" element={<FavoritesPage />} />
                          <Route path="/quiz" element={<Navigate to="/library/draw" replace />} />
                          <Route path="/contribute" element={<ContributePage />} />
                          <Route path="/about" element={<AboutPage />} />
                          <Route path="/learn" element={<LearnPage />} />
                          <Route path="/methodology" element={<MethodologyPage />} />
                          <Route path="/learn/:slug" element={<ArticlePage />} />
                          <Route path="/collections" element={<CollectionsPage />} />
                          <Route path="/collections/:slug" element={<CollectionDetailPage />} />
                          <Route path="/glossary" element={<GlossaryPage />} />
                          <Route path="/glossary/:id" element={<GlossaryTermPage />} />
                          <Route path="/changelog" element={<ChangelogPage />} />
                          <Route path="/guides" element={<GuidesPage />} />
                          <Route path="/guides/nutrition" element={<NutritionGuidePage />} />
                          <Route path="/guides/race-prep" element={<RacePrepGuidePage />} />
                          <Route path="/guides/warmup" element={<WarmupGuidePage />} />
                          <Route path="/nutrition" element={<NutritionHubPage />} />
                          <Route path="/plans" element={<PlansPage />} />
                          <Route path="/plans/methodology" element={<PlanMethodologyPage />} />
                          <Route path="/plan/new" element={<PlanNewPage />} />
                          <Route path="/plan/new/assisted" element={<PlanCreatePage />} />
                          <Route path="/plan/new/free" element={<FreePlanCreatePage />} />
                          <Route path="/plan/new/prebuilt" element={<PrebuiltPlansPage />} />
                          <Route path="/plan/prebuilt/:slug" element={<PrebuiltPlanDetailPage />} />
                          <Route path="/plan/:id" element={<PlanViewPage />} />
                          <Route path="/race-simulator" element={<RaceSimulatorPage />} />
                          <Route path="/routes" element={<RouteGeneratorPage />} />
                          <Route path="/routes/tracks" element={<TrackFinderPage />} />
                          <Route path="/routes/mine" element={<MyRoutesPage />} />
                          <Route path="/routes/:id" element={<RouteDetailPage />} />
                          <Route path="/compare" element={<CompareHubPage />} />
                          <Route path="/compare/:slug" element={<CompareDetailPage />} />
                          <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                </main>

                <ConditionalFooter />
                </ErrorBoundary>
              </div>
            </div>
            <DeferredCommandPalette />
          </CommandPaletteProvider>
          </GlossaryMatcherProvider>
          <Analytics />
          <StorageWarning />
          {canInstall && <PWAInstallPrompt onInstall={promptInstall} onDismiss={dismissInstall} />}
          <Toaster
            richColors
            closeButton
            position={isMobile ? "top-center" : "bottom-right"}
            duration={isMobile ? 2500 : 4000}
            offset={isMobile ? "calc(env(safe-area-inset-top, 0px) + 12px)" : undefined}
          />
          </BrowserRouter>
      </FavoritesProvider>
    </SettingsProvider>
  );
}

export default App;
