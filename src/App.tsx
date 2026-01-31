import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Analytics } from "@vercel/analytics/react";
import { Header, Footer } from "@/components/layout";
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
const AboutPage = lazy(() => import("@/pages/AboutPage").then(m => ({ default: m.AboutPage })));
const LearnPage = lazy(() => import("@/pages/LearnPage").then(m => ({ default: m.LearnPage })));
const ArticlePage = lazy(() => import("@/pages/ArticlePage").then(m => ({ default: m.ArticlePage })));
const GlossaryPage = lazy(() => import("@/pages/GlossaryPage").then(m => ({ default: m.GlossaryPage })));
const GlossaryTermPage = lazy(() => import("@/pages/GlossaryTermPage").then(m => ({ default: m.GlossaryTermPage })));
const SettingsPage = lazy(() => import("@/pages/SettingsPage").then(m => ({ default: m.SettingsPage })));

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

  return (
    <HelmetProvider>
      <SettingsProvider>
        <FavoritesProvider>
          <BrowserRouter>
          <CommandPaletteProvider>
            <ScrollToTopOnNavigate />
            <div className="min-h-screen bg-background text-foreground flex flex-col">
              <Header theme={theme} onThemeToggle={toggleTheme} />

              <main className="flex-1 container mx-auto px-4">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/library" element={<LibraryPage />} />
                    <Route path="/workout/:id" element={<WorkoutDetailPage />} />
                    <Route path="/my-zones" element={<MyZonesPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/favorites" element={<FavoritesPage />} />
                    <Route path="/quiz" element={<QuizPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/learn" element={<LearnPage />} />
                    <Route path="/learn/:slug" element={<ArticlePage />} />
                    <Route path="/glossary" element={<GlossaryPage />} />
                    <Route path="/glossary/:id" element={<GlossaryTermPage />} />
                  </Routes>
                </Suspense>
              </main>

              <Footer />
            </div>
            <CommandPalette />
          </CommandPaletteProvider>
          <Analytics />
          </BrowserRouter>
        </FavoritesProvider>
      </SettingsProvider>
    </HelmetProvider>
  );
}

export default App;
