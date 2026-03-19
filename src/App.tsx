import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";
import { Sidebar, MobileSidebar, TopBar, Footer } from "@/components/layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FavoritesProvider } from "@/hooks";
import { SettingsProvider } from "@/hooks/useSettings";
import { CommandPaletteProvider, CommandPalette } from "@/components/search";
import { GlossaryMatcherProvider } from "@/contexts/GlossaryMatcherContext";

// All pages lazy loaded for optimal code-splitting
const HomePage = lazy(() => import("@/pages/HomePage").then(m => ({ default: m.HomePage })));
const LibraryPage = lazy(() => import("@/pages/LibraryPage").then(m => ({ default: m.LibraryPage })));
const WorkoutDetailPage = lazy(() => import("@/pages/WorkoutDetailPage").then(m => ({ default: m.WorkoutDetailPage })));
const MyZonesPage = lazy(() => import("@/pages/MyZonesPage").then(m => ({ default: m.MyZonesPage })));
const FavoritesPage = lazy(() => import("@/pages/FavoritesPage").then(m => ({ default: m.FavoritesPage })));
const QuizPage = lazy(() => import("@/pages/QuizPage").then(m => ({ default: m.QuizPage })));
const ContributePage = lazy(() => import("@/pages/ContributePage").then(m => ({ default: m.ContributePage })));
const AboutPage = lazy(() => import("@/pages/AboutPage").then(m => ({ default: m.AboutPage })));
const LearnPage = lazy(() => import("@/pages/LearnPage").then(m => ({ default: m.LearnPage })));
const MethodologyPage = lazy(() => import("@/pages/MethodologyPage").then(m => ({ default: m.MethodologyPage })));
const ArticlePage = lazy(() => import("@/pages/ArticlePage").then(m => ({ default: m.ArticlePage })));
const GlossaryPage = lazy(() => import("@/pages/GlossaryPage").then(m => ({ default: m.GlossaryPage })));
const GlossaryTermPage = lazy(() => import("@/pages/GlossaryTermPage").then(m => ({ default: m.GlossaryTermPage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const CollectionsPage = lazy(() => import("@/pages/CollectionsPage").then(m => ({ default: m.CollectionsPage })));
const CollectionDetailPage = lazy(() => import("@/pages/CollectionDetailPage").then(m => ({ default: m.CollectionDetailPage })));
const ChangelogPage = lazy(() => import("@/pages/ChangelogPage").then(m => ({ default: m.ChangelogPage })));
const PlansPage = lazy(() => import("@/pages/PlansPage").then(m => ({ default: m.PlansPage })));
const PlanNewPage = lazy(() => import("@/pages/PlanNewPage").then(m => ({ default: m.PlanNewPage })));
const PlanCreatePage = lazy(() => import("@/pages/PlanCreatePage").then(m => ({ default: m.PlanCreatePage })));
const FreePlanCreatePage = lazy(() => import("@/pages/FreePlanCreatePage").then(m => ({ default: m.FreePlanCreatePage })));
const PlanViewPage = lazy(() => import("@/pages/PlanViewPage").then(m => ({ default: m.PlanViewPage })));
const NutritionGuidePage = lazy(() => import("@/pages/NutritionGuidePage").then(m => ({ default: m.NutritionGuidePage })));
const GuidesPage = lazy(() => import("@/pages/GuidesPage").then(m => ({ default: m.GuidesPage })));
const CalculateursPage = lazy(() => import("@/pages/CalculateursPage").then(m => ({ default: m.CalculateursPage })));
const ZonesCalculatorPage = lazy(() => import("@/pages/ZonesCalculatorPage").then(m => ({ default: m.ZonesCalculatorPage })));
const PaceCalculatorPage = lazy(() => import("@/pages/PaceCalculatorPage").then(m => ({ default: m.PaceCalculatorPage })));
const TreadmillConverterPage = lazy(() => import("@/pages/TreadmillConverterPage").then(m => ({ default: m.TreadmillConverterPage })));
const SplitGeneratorPage = lazy(() => import("@/pages/SplitGeneratorPage").then(m => ({ default: m.SplitGeneratorPage })));
const VmaCalculatorPage = lazy(() => import("@/pages/VmaCalculatorPage").then(m => ({ default: m.VmaCalculatorPage })));
const RaceEquivalencePage = lazy(() => import("@/pages/RaceEquivalencePage").then(m => ({ default: m.RaceEquivalencePage })));
const RacePrepGuidePage = lazy(() => import("@/pages/RacePrepGuidePage").then(m => ({ default: m.RacePrepGuidePage })));
const WarmupGuidePage = lazy(() => import("@/pages/WarmupGuidePage").then(m => ({ default: m.WarmupGuidePage })));
const PaceConverterPage = lazy(() => import("@/pages/PaceConverterPage").then(m => ({ default: m.PaceConverterPage })));
const PaceTablePage = lazy(() => import("@/pages/PaceTablePage").then(m => ({ default: m.PaceTablePage })));
const AgeGradedPage = lazy(() => import("@/pages/AgeGradedPage").then(m => ({ default: m.AgeGradedPage })));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));

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
  ];
  // Stagger preloads to not block the main thread
  pages.forEach((load, i) => setTimeout(load, 1000 + i * 200));
}

function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  // Preload main pages in background after first render
  useEffect(() => { preloadSidebarPages(); }, []);

  // Track if user has manually set theme preference
  const userHasSetTheme = useRef(
    typeof window !== "undefined" && localStorage.getItem("zoned-theme") !== null
  );

  // Theme state with localStorage persistence
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("zoned-theme");
      if (stored === "dark" || stored === "light") return stored;
      // Check system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      }
    }
    return "light";
  });

  // Apply theme to document (only save to localStorage if user explicitly set it)
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    if (userHasSetTheme.current) {
      localStorage.setItem("zoned-theme", theme);
    }
  }, [theme]);

  // Listen for system theme changes (only when no user preference)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      if (!userHasSetTheme.current) {
        setTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = () => {
    userHasSetTheme.current = true;
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Sidebar state with localStorage persistence
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem("zoned-sidebar-collapsed");
    if (stored !== null) return stored === "true";
    return typeof window !== "undefined" && window.innerWidth < 1024;
  });

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("zoned-sidebar-collapsed", String(next));
      return next;
    });
  }, []);

  return (
    <HelmetProvider>
      <SettingsProvider>
        <FavoritesProvider>
          <BrowserRouter>
          <GlossaryMatcherProvider>
          <CommandPaletteProvider>
            <ScrollToTopOnNavigate />
            <div className="min-h-screen bg-background text-foreground flex">
              {/* Sidebar - fixed left column */}
              <Sidebar
                collapsed={sidebarCollapsed}
                onToggleCollapse={toggleSidebar}
              />

              <MobileSidebar
                open={mobileSidebarOpen}
                onOpenChange={setMobileSidebarOpen}
              />

              {/* Right column: TopBar + content */}
              <div className="flex flex-1 min-w-0 flex-col">
                <TopBar
                  theme={theme}
                  onThemeToggle={toggleTheme}
                  onMobileMenuOpen={() => setMobileSidebarOpen(true)}
                  sidebarCollapsed={sidebarCollapsed}
                />

                <main className="flex-1 px-4 md:px-6 lg:px-8 py-4">
                  <div className="mx-auto max-w-6xl">
                    <ErrorBoundary>
                      <Suspense fallback={<div className="min-h-screen" />}>
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/library" element={<LibraryPage />} />
                          <Route path="/workout/:id" element={<WorkoutDetailPage />} />
                          <Route path="/my-zones" element={<MyZonesPage />} />
                          <Route path="/calculateurs" element={<CalculateursPage />} />
                          <Route path="/calculateurs/zones" element={<ZonesCalculatorPage />} />
                          <Route path="/calculateurs/allures" element={<PaceCalculatorPage />} />
                          <Route path="/calculateurs/convertisseur" element={<PaceConverterPage />} />
                          <Route path="/calculateurs/table-allures" element={<PaceTablePage />} />
                          <Route path="/calculateurs/tapis-roulant" element={<TreadmillConverterPage />} />
                          <Route path="/calculateurs/splits" element={<SplitGeneratorPage />} />
                          <Route path="/calculateurs/vma" element={<VmaCalculatorPage />} />
                          <Route path="/calculateurs/equivalence" element={<RaceEquivalencePage />} />
                          <Route path="/calculateurs/age-graded" element={<AgeGradedPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/favorites" element={<FavoritesPage />} />
                          <Route path="/quiz" element={<QuizPage />} />
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
                          <Route path="/nutrition" element={<NutritionGuidePage />} />
                          <Route path="/plans" element={<PlansPage />} />
                          <Route path="/plan/new" element={<PlanNewPage />} />
                          <Route path="/plan/new/assisted" element={<PlanCreatePage />} />
                          <Route path="/plan/new/free" element={<FreePlanCreatePage />} />
                          <Route path="/plan/:id" element={<PlanViewPage />} />
                          <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                </main>

                <Footer />
              </div>
            </div>
            <CommandPalette />
          </CommandPaletteProvider>
          </GlossaryMatcherProvider>
          <Analytics />
          <Toaster richColors position="bottom-right" />
          </BrowserRouter>
        </FavoritesProvider>
      </SettingsProvider>
    </HelmetProvider>
  );
}

export default App;
