import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Header, Footer } from "@/components/layout";
import { HomePage, LibraryPage, WorkoutDetailPage, SettingsPage, FavoritesPage, QuizPage } from "@/pages";

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
    <BrowserRouter>
      <ScrollToTopOnNavigate />
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <Header theme={theme} onThemeToggle={toggleTheme} />

        <main className="flex-1 container mx-auto px-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/workout/:id" element={<WorkoutDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/quiz" element={<QuizPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
      <Analytics />
    </BrowserRouter>
  );
}

export default App;
