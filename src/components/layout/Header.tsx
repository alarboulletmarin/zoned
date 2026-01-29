import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Moon, Sun, Languages, Menu, X, Target, Heart, Dices, Home, BookOpen, GraduationCap, Book } from "@/components/icons";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/logo.svg?react";
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
    { href: "/learn", label: t("nav.learn") },
    { href: "/glossary", label: t("nav.glossary") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Logo className="w-16 h-8" />
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

          {/* My Zones */}
          <Button
            variant="ghost"
            size="icon-sm"
            asChild
            aria-label={t("myZones.title")}
          >
            <Link to="/my-zones">
              <Target className="size-4" />
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
            size="icon"
            onClick={onThemeToggle}
            aria-label={theme === "light" ? t("theme.dark") : t("theme.light")}
          >
            {theme === "light" ? (
              <Moon className="size-5" />
            ) : (
              <Sun className="size-5" />
            )}
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
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

            {/* Learn */}
            <Link
              to="/learn"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 py-2 text-sm font-medium transition-colors",
                location.pathname === "/learn" || location.pathname.startsWith("/learn/")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <GraduationCap className="size-4" />
              {t("nav.learn")}
            </Link>

            {/* Glossary */}
            <Link
              to="/glossary"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 py-2 text-sm font-medium transition-colors",
                location.pathname === "/glossary" || location.pathname.startsWith("/glossary/")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Book className="size-4" />
              {t("nav.glossary")}
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

            {/* My Zones */}
            <Link
              to="/my-zones"
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 py-2 text-sm font-medium transition-colors",
                location.pathname === "/my-zones"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Target className="size-4" />
              {t("myZones.title")}
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
