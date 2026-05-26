import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  Moon,
  Sun,
  Menu,
  UserRound,
  Heart,
  Settings,
  Send,
  Sparkles,
  Gauge,
  Plus,
} from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCommandPalette } from "@/components/search";
import { changeLanguage, getCurrentLanguage } from "@/i18n";
import Logo from "@/assets/logo.svg?react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onThemeToggle: () => void;
  onMobileMenuOpen: () => void;
}

/** Hook to track theme without causing parent re-renders */
function useThemeIcon() {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  useEffect(() => {
    const handler = (e: Event) => setIsDark((e as CustomEvent).detail === "dark");
    window.addEventListener("zoned-theme-change", handler);
    return () => window.removeEventListener("zoned-theme-change", handler);
  }, []);
  return isDark;
}

// Ensures 44px minimum touch target without increasing visual size.
const touchTarget =
  "relative after:absolute after:inset-[-6px] after:content-['']";

// ────────────────────────────────────────────────────────────────────────────
// Primary navigation. Five top-level entries — the rest of the app (Routes,
// Race Simulator, Glossary, Nutrition, Builder, Workouts of mine…) lives
// behind those hubs or in the Command Palette (⌘K). Keeping this list short
// is the whole point of the rework.
// ────────────────────────────────────────────────────────────────────────────

const PRIMARY_NAV: Array<{ to: string; key: string; prefix?: string[] }> = [
  { to: "/library", key: "nav.library", prefix: ["/library", "/workout", "/collections"] },
  { to: "/plans", key: "nav.plans", prefix: ["/plan", "/plans", "/race-simulator"] },
  { to: "/calculators", key: "nav.calculators", prefix: ["/calculators"] },
  { to: "/methodology", key: "nav.methodology", prefix: ["/methodology", "/plans/methodology"] },
  { to: "/learn", key: "nav.learn", prefix: ["/learn", "/guides", "/nutrition", "/glossary"] },
];

function isNavActive(pathname: string, item: { to: string; prefix?: string[] }): boolean {
  if (pathname === item.to) return true;
  if (!item.prefix) return false;
  return item.prefix.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function TopBar({ onThemeToggle, onMobileMenuOpen }: TopBarProps) {
  const { t } = useTranslation("common");
  const { openPalette } = useCommandPalette();
  const currentLang = getCurrentLanguage();
  const isMobile = useIsMobile();
  const isDark = useThemeIcon();
  const theme = isDark ? "dark" : "light";
  const { pathname } = useLocation();

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center gap-4 px-4 md:px-6">
        {isMobile ? (
          /* ───── Mobile ─────────────────────────────────────────────────── */
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onMobileMenuOpen}
              aria-label={t("actions.menu")}
              className={touchTarget}
            >
              <Menu className="size-5" />
            </Button>

            <Link
              to="/"
              viewTransition
              className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5"
            >
              <Logo className="w-12 h-6" />
              <span className="font-bold text-sm">{t("app.name")}</span>
            </Link>

            <div className="ml-auto flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={openPalette}
                aria-label={t("actions.search")}
                className={touchTarget}
              >
                <Search className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onThemeToggle}
                aria-label={theme === "light" ? t("theme.dark") : t("theme.light")}
                className={touchTarget}
              >
                {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
              </Button>
            </div>
          </>
        ) : (
          /* ───── Desktop / Tablet ───────────────────────────────────────── */
          <>
            {/* Brand */}
            <Link to="/" viewTransition className="flex items-center gap-2 shrink-0">
              <Logo className="w-12 h-6" />
              <span className="font-bold text-sm whitespace-nowrap">
                {t("app.name")}
              </span>
            </Link>

            {/* Primary nav — flush left after the brand, hairline divider
                separates it from the brand block so the eye lands on the
                links immediately. */}
            <nav
              aria-label={t("nav.primary", "Navigation principale")}
              className="hidden md:flex items-center gap-1 pl-3 ml-1 border-l h-6"
            >
              {PRIMARY_NAV.map((item) => {
                const active = isNavActive(pathname, item);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                      active
                        ? "text-foreground bg-accent/60"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
                    )}
                  >
                    {t(item.key)}
                  </NavLink>
                );
              })}
            </nav>

            {/* Search — pushed to the right edge of the nav block, leaves
                room for the right cluster (user menu + theme + lang). */}
            <Button
              variant="outline"
              size="sm"
              onClick={openPalette}
              className="ml-auto h-8 w-48 lg:w-72 justify-start gap-2 text-muted-foreground"
            >
              <Search className="size-3.5" />
              <span className="text-sm">{t("actions.search")}</span>
              <kbd className="pointer-events-none ml-auto hidden select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground lg:inline-flex">
                <span className="text-xs">&#8984;</span>K
              </kbd>
            </Button>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onThemeToggle}
                aria-label={theme === "light" ? t("theme.dark") : t("theme.light")}
              >
                {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => changeLanguage(currentLang === "fr" ? "en" : "fr")}
                title={currentLang === "fr" ? "Switch to English" : "Passer en français"}
                className="h-8 px-2 text-xs font-semibold"
              >
                {currentLang === "fr" ? "EN" : "FR"}
              </Button>

              <UserMenu />
            </div>
          </>
        )}
      </div>
    </header>
  );
}

/** Personal account menu — gathers every entry that used to clutter the
 *  sidebar (Profile, My Zones, Favorites, Builder, Contribute, Settings,
 *  Changelog). One round chip on the right side of the topbar opens it. */
function UserMenu() {
  const { t } = useTranslation("common");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("nav.profile")}
          className="rounded-full"
        >
          <UserRound className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
            <UserRound className="size-4" />
            {t("nav.profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/my-zones" className="flex items-center gap-2 cursor-pointer">
            <Gauge className="size-4" />
            {t("nav.myZones")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/favorites" className="flex items-center gap-2 cursor-pointer">
            <Heart className="size-4" />
            {t("nav.favorites")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/workout/builder" className="flex items-center gap-2 cursor-pointer">
            <Plus className="size-4" />
            {t("nav.builder")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
            <Settings className="size-4" />
            {t("nav.settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/contribute" className="flex items-center gap-2 cursor-pointer">
            <Send className="size-4" />
            {t("nav.contribute")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/changelog" className="flex items-center gap-2 cursor-pointer">
            <Sparkles className="size-4" />
            {t("nav.changelog")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
