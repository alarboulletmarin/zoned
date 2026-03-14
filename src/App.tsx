import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "sonner";
import { Sidebar, MobileSidebar, TopBar, Footer } from "@/components/layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PageLoader } from "@/components/ui/page-loader";
import { FavoritesProvider } from "@/hooks";
import { SettingsProvider } from "@/hooks/useSettings";
import { CommandPaletteProvider, CommandPalette } from "@/components/search";

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
const ArticlePage = lazy(() => import("@/pages/ArticlePage").then(m => ({ default: m.ArticlePage })));
const GlossaryPage = lazy(() => import("@/pages/GlossaryPage").then(m => ({ default: m.GlossaryPage })));
const GlossaryTermPage = lazy(() => import("@/pages/GlossaryTermPage").then(m => ({ default: m.GlossaryTermPage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then(m => ({ default: m.SettingsPage })));
const CollectionsPage = lazy(() => import("@/pages/CollectionsPage").then(m => ({ default: m.CollectionsPage })));
const CollectionDetailPage = lazy(() => import("@/pages/CollectionDetailPage").then(m => ({ default: m.CollectionDetailPage })));
const ChangelogPage = lazy(() => import("@/pages/ChangelogPage").then(m => ({ default: m.ChangelogPage })));
const PlansPage = lazy(() => import("@/pages/PlansPage").then(m => ({ default: m.PlansPage })));
const PlanCreatePage = lazy(() => import("@/pages/PlanCreatePage").then(m => ({ default: m.PlanCreatePage })));
const PlanViewPage = lazy(() => import("@/pages/PlanViewPage").then(m => ({ default: m.PlanViewPage })));
const NutritionGuidePage = lazy(() => import("@/pages/NutritionGuidePage").then(m => ({ default: m.NutritionGuidePage })));
const GuidesPage = lazy(() => import("@/pages/GuidesPage").then(m => ({ default: m.GuidesPage })));
const RacePrepGuidePage = lazy(() => import("@/pages/RacePrepGuidePage").then(m => ({ default: m.RacePrepGuidePage })));
const WarmupGuidePage = lazy(() => import("@/pages/WarmupGuidePage").then(m => ({ default: m.WarmupGuidePage })));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage").then(m => ({ default: m.NotFoundPage })));

function ScrollToTopOnNavigate() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
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
          <CommandPaletteProvider>
            <ScrollToTopOnNavigate />
            <div className="min-h-screen bg-background text-foreground flex flex-col">
              <TopBar
                theme={theme}
                onThemeToggle={toggleTheme}
                onMobileMenuOpen={() => setMobileSidebarOpen(true)}
              />

              <div className="flex flex-1">
                <Sidebar
                  collapsed={sidebarCollapsed}
                  onToggleCollapse={toggleSidebar}
                  theme={theme}
                  onThemeToggle={toggleTheme}
                />

                <MobileSidebar
                  open={mobileSidebarOpen}
                  onOpenChange={setMobileSidebarOpen}
                  theme={theme}
                  onThemeToggle={toggleTheme}
                />

                <main className="flex-1 min-w-0 px-4 md:px-6 lg:px-8 py-4">
                  <div className="mx-auto max-w-6xl">
                    <ErrorBoundary>
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/library" element={<LibraryPage />} />
                          <Route path="/workout/:id" element={<WorkoutDetailPage />} />
                          <Route path="/my-zones" element={<MyZonesPage />} />
                          <Route path="/settings" element={<SettingsPage />} />
                          <Route path="/favorites" element={<FavoritesPage />} />
                          <Route path="/quiz" element={<QuizPage />} />
                          <Route path="/contribute" element={<ContributePage />} />
                          <Route path="/about" element={<AboutPage />} />
                          <Route path="/learn" element={<LearnPage />} />
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
                          <Route path="/plan/new" element={<PlanCreatePage />} />
                          <Route path="/plan/:id" element={<PlanViewPage />} />
                          <Route path="*" element={<NotFoundPage />} />
                        </Routes>
                      </Suspense>
                    </ErrorBoundary>
                  </div>
                </main>
              </div>

              <Footer />
            </div>
            <CommandPalette />
          </CommandPaletteProvider>
          <Analytics />
          <Toaster richColors position="bottom-right" />
          </BrowserRouter>
        </FavoritesProvider>
      </SettingsProvider>
    </HelmetProvider>
  );
}

export default App;
