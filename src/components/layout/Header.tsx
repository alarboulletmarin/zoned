import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Moon, Sun, Languages, Menu, X, Settings, Heart, Dices, Home, BookOpen } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supportedLanguages, changeLanguage, getCurrentLanguage } from "@/i18n";

interface HeaderProps {
  theme: "light" | "dark";
  onThemeToggle: () => void;
}

export function Header({ theme, onThemeToggle }: HeaderProps) {
  const { t } = useTranslation("common");
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentLang = getCurrentLanguage();

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/library", label: t("nav.library") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="intensity-bar w-6 h-6 rounded-full" />
          <span className="font-bold text-lg">{t("app.name")}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions Desktop - tous les boutons */}
        <div className="hidden md:flex items-center gap-2">
          {/* Language Selector */}
          <Select
            value={currentLang}
            onValueChange={(value) => changeLanguage(value as "fr" | "en")}
          >
            <SelectTrigger className="w-auto h-8 gap-1 border-none shadow-none">
              <Languages className="size-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Quiz */}
          <Button
            variant="ghost"
            size="icon-sm"
            asChild
            aria-label={t("quiz.title")}
          >
            <Link to="/quiz">
              <Dices className="size-4" />
            </Link>
          </Button>

          {/* Favorites */}
          <Button
            variant="ghost"
            size="icon-sm"
            asChild
            aria-label={t("nav.favorites")}
          >
            <Link to="/favorites">
              <Heart className="size-4" />
            </Link>
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon-sm"
            asChild
            aria-label={t("settings.title")}
          >
            <Link to="/settings">
              <Settings className="size-4" />
            </Link>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onThemeToggle}
            aria-label={theme === "light" ? t("theme.dark") : t("theme.light")}
          >
            {theme === "light" ? (
              <Moon className="size-4" />
            ) : (
              <Sun className="size-4" />
            )}
          </Button>
        </div>

        {/* Actions Mobile - minimal */}
        <div className="flex md:hidden items-center gap-1">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onThemeToggle}
            aria-label={theme === "light" ? t("theme.dark") : t("theme.light")}
          >
            {theme === "light" ? (
              <Moon className="size-4" />
            ) : (
              <Sun className="size-4" />
            )}
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t bg-background">
          <div className="container mx-auto px-4 py-3 space-y-1">
            {/* Home */}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 py-2 text-sm font-medium transition-colors",
                location.pathname === "/"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Home className="size-4" />
              {t("nav.home")}
            </Link>

            {/* Library */}
            <Link
              to="/library"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 py-2 text-sm font-medium transition-colors",
                location.pathname === "/library"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="size-4" />
              {t("nav.library")}
            </Link>

            {/* Quiz */}
            <Link
              to="/quiz"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 py-2 text-sm font-medium transition-colors",
                location.pathname === "/quiz"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Dices className="size-4" />
              {t("quiz.title")}
            </Link>

            {/* Favorites */}
            <Link
              to="/favorites"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 py-2 text-sm font-medium transition-colors",
                location.pathname === "/favorites"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Heart className="size-4" />
              {t("nav.favorites")}
            </Link>

            {/* Settings */}
            <Link
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 py-2 text-sm font-medium transition-colors",
                location.pathname === "/settings"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Settings className="size-4" />
              {t("settings.title")}
            </Link>

            {/* Language Selector */}
            <div className="flex items-center gap-2 py-2">
              <Languages className="size-4 text-muted-foreground" />
              <Select
                value={currentLang}
                onValueChange={(value) => changeLanguage(value as "fr" | "en")}
              >
                <SelectTrigger className="w-auto h-8 gap-1 border-none shadow-none px-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {supportedLanguages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}
