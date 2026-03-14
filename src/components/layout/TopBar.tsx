import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Search, Moon, Sun, Menu } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useCommandPalette } from "@/components/search";
import { changeLanguage, getCurrentLanguage } from "@/i18n";
import Logo from "@/assets/logo.svg?react";
import { useIsMobile } from "@/hooks/useIsMobile";

interface TopBarProps {
  theme: "light" | "dark";
  onThemeToggle: () => void;
  onMobileMenuOpen: () => void;
}

export function TopBar({ theme, onThemeToggle, onMobileMenuOpen }: TopBarProps) {
  const { t } = useTranslation("common");
  const { openPalette } = useCommandPalette();
  const currentLang = getCurrentLanguage();
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-50 h-12 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center px-4">
        {isMobile ? (
          /* Mobile: hamburger + logo center + actions right */
          <>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onMobileMenuOpen}
              aria-label={t("actions.menu")}
            >
              <Menu className="size-5" />
            </Button>

            <Link
              to="/"
              viewTransition
              className="flex flex-1 items-center justify-center gap-1.5"
            >
              <Logo className="w-16 h-8" />
              <span className="font-bold text-sm">{t("app.name")}</span>
            </Link>

            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={openPalette}
                aria-label={t("actions.search")}
              >
                <Search className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => changeLanguage(currentLang === "fr" ? "en" : "fr")}
                aria-label={currentLang === "fr" ? "English" : "Français"}
              >
                <span className="text-xs font-semibold">{currentLang.toUpperCase()}</span>
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onThemeToggle}
                aria-label={theme === "light" ? t("theme.dark") : t("theme.light")}
              >
                {theme === "light" ? <Moon className="size-4" /> : <Sun className="size-4" />}
              </Button>
            </div>
          </>
        ) : (
          /* Desktop / Tablet */
          <>
            {/* Logo left */}
            <Link
              to="/"
              viewTransition
              className="flex items-center gap-2 mr-4"
            >
              <Logo className="w-20 h-10" />
              <span className="font-bold text-lg whitespace-nowrap">{t("app.name")}</span>
            </Link>

            {/* Centered search */}
            <div className="flex flex-1 justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={openPalette}
                className="h-8 w-72 justify-start gap-2 text-muted-foreground"
              >
                <Search className="size-3.5" />
                <span className="text-sm">{t("actions.search")}</span>
                <kbd className="pointer-events-none ml-auto hidden select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
                  <span className="text-xs">&#8984;</span>K
                </kbd>
              </Button>
            </div>

            {/* Right actions */}
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
                aria-label={currentLang === "fr" ? "English" : "Français"}
                className="h-8 px-2 text-xs font-semibold"
              >
                {currentLang === "fr" ? "EN" : "FR"}
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
