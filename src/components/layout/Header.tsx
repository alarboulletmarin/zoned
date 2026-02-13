import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Moon, Sun, Languages, Menu, X, Target, Heart, Dices, Home, BookOpen, GraduationCap, Book, Search, MoreHorizontal, ClipboardCheck, Settings, Library } from "@/components/icons";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/logo.svg?react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { supportedLanguages, changeLanguage, getCurrentLanguage } from "@/i18n";
import { useCommandPalette } from "@/components/search";
import { getRandomWorkout } from "@/data/workouts";

interface HeaderProps {
  theme: "light" | "dark";
  onThemeToggle: () => void;
}

export function Header({ theme, onThemeToggle }: HeaderProps) {
  const { t } = useTranslation("common");
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const currentLang = getCurrentLanguage();
  const { openPalette } = useCommandPalette();

  const handleRandomWorkout = async () => {
    if (isLoadingRandom) return;
    setIsLoadingRandom(true);
    try {
      const workout = await getRandomWorkout();
      navigate(`/workout/${workout.id}`);
    } finally {
      setIsLoadingRandom(false);
    }
  };

  // Close mobile menu on route change (e.g. when navigating via Command Palette)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/library", label: t("nav.library") },
    { href: "/collections", label: t("collections.title") },
    { href: "/learn", label: t("nav.learn") },
    { href: "/glossary", label: t("nav.glossary") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto grid h-14 grid-cols-[auto_1fr_auto] items-center px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <Logo className="w-16 h-8" />
          <span className="font-bold text-lg hidden lg:inline">{t("app.name")}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center justify-center gap-3 lg:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              viewTransition
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                "nav-link-animated",
                location.pathname === link.href
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
              data-active={location.pathname === link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions Desktop */}
        <div className="hidden md:flex items-center gap-1 lg:gap-2">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={openPalette}
            aria-label={t("actions.search")}
          >
            <Search className="size-4" />
          </Button>

          {/* Favorites - visible lg+ only */}
          <Button
            variant="ghost"
            size="icon-sm"
            asChild
            aria-label={t("nav.favorites")}
            className="hidden lg:inline-flex"
          >
            <Link to="/favorites">
              <Heart className="size-4" />
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

          {/* More Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" aria-label={t("actions.more")}>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t("actions.tools")}</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link to="/quiz" className="flex items-center gap-2">
                    <ClipboardCheck className="size-4" />
                    {t("quiz.title")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleRandomWorkout}
                  disabled={isLoadingRandom}
                  className="flex items-center gap-2"
                >
                  <Dices className="size-4" />
                  {t("randomWorkout.title")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel>{t("actions.navigate")}</DropdownMenuLabel>
                {/* Favorites - in dropdown on md (hidden on lg where it's in the bar) */}
                <DropdownMenuItem asChild className="lg:hidden">
                  <Link to="/favorites" className="flex items-center gap-2">
                    <Heart className="size-4" />
                    {t("nav.favorites")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-zones" className="flex items-center gap-2">
                    <Target className="size-4" />
                    {t("myZones.title")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/settings" className="flex items-center gap-2">
                    <Settings className="size-4" />
                    {t("nav.settings")}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => changeLanguage(currentLang === "fr" ? "en" : "fr")}
                className="flex items-center gap-2"
              >
                <Languages className="size-4" />
                {currentLang === "fr" ? "English" : "Français"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Actions Mobile - minimal */}
        <div className="flex md:hidden items-center gap-1 col-start-3 justify-self-end">
          {/* Search Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={openPalette}
            aria-label={t("actions.search")}
          >
            <Search className="size-5" />
          </Button>

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
            aria-label={t("actions.menu")}
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
              viewTransition
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
              viewTransition
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

            {/* Collections */}
            <Link
              to="/collections"
              viewTransition
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 py-2 text-sm font-medium transition-colors",
                location.pathname === "/collections" || location.pathname.startsWith("/collections/")
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Library className="size-4" />
              {t("collections.title")}
            </Link>

            {/* Learn */}
            <Link
              to="/learn"
              viewTransition
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
              viewTransition
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
              viewTransition
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 py-2 text-sm font-medium transition-colors",
                location.pathname === "/quiz"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <ClipboardCheck className="size-4" />
              {t("quiz.title")}
            </Link>

            {/* Random Workout */}
            <button
              onClick={() => {
                handleRandomWorkout();
                setMobileMenuOpen(false);
              }}
              disabled={isLoadingRandom}
              className="flex items-center gap-2 py-2 text-sm font-medium transition-colors text-muted-foreground hover:text-foreground w-full text-left"
            >
              <Dices className="size-4" />
              {t("randomWorkout.title")}
            </button>

            {/* Favorites */}
            <Link
              to="/favorites"
              viewTransition
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
              viewTransition
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

            {/* Settings */}
            <Link
              to="/settings"
              viewTransition
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                "flex items-center gap-2 py-2 text-sm font-medium transition-colors",
                location.pathname === "/settings"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Settings className="size-4" />
              {t("nav.settings")}
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
