import { useEffect, useRef, useState } from "react";
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
  ChevronDown,
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
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTheme } from "@/hooks/useTheme";
import { isMac } from "@/lib/platform";
import { cn } from "@/lib/utils";

interface TopBarProps {
  onMobileMenuOpen: () => void;
}

const touchTarget =
  "relative after:absolute after:inset-[-6px] after:content-['']";

// ────────────────────────────────────────────────────────────────────────────
// Menu tree — five top-level sections, each with the sub-pages that used to
// live in the old sidebar. The same tree is consumed by the desktop hover
// dropdowns and the mobile sheet menu, so adding a route in one place
// propagates everywhere.
// ────────────────────────────────────────────────────────────────────────────

export interface NavChild {
  to: string;
  labelKey: string;
  /** Short caption shown under the label in the dropdown. Optional. */
  descKey?: string;
}

export interface NavSection {
  to: string;
  labelKey: string;
  /** Pathname prefixes that should mark this top-level link as active. */
  prefix: string[];
  children?: NavChild[];
}

export const PRIMARY_NAV: NavSection[] = [
  {
    to: "/library",
    labelKey: "nav.library",
    prefix: ["/library", "/workout", "/collections", "/weeks"],
    children: [
      { to: "/library", labelKey: "topnav.libraryAll", descKey: "topnav.libraryAllDesc" },
      { to: "/library/draw", labelKey: "topnav.drawSession", descKey: "topnav.drawSessionDesc" },
      { to: "/weeks", labelKey: "topnav.weeks", descKey: "topnav.weeksDesc" },
      { to: "/collections", labelKey: "topnav.collections", descKey: "topnav.collectionsDesc" },
      { to: "/workout/builder", labelKey: "topnav.builder", descKey: "topnav.builderDesc" },
    ],
  },
  {
    to: "/plans",
    labelKey: "nav.plans",
    prefix: ["/plan", "/plans", "/race-simulator", "/routes"],
    children: [
      { to: "/plans", labelKey: "topnav.plansMine", descKey: "topnav.plansMineDesc" },
      { to: "/plan/new", labelKey: "topnav.plansNew", descKey: "topnav.plansNewDesc" },
      { to: "/race-simulator", labelKey: "topnav.raceSim", descKey: "topnav.raceSimDesc" },
      { to: "/routes", labelKey: "topnav.routes", descKey: "topnav.routesDesc" },
    ],
  },
  {
    to: "/calculators",
    labelKey: "nav.calculators",
    prefix: ["/calculators"],
    children: [
      { to: "/calculators", labelKey: "topnav.calculatorsAll", descKey: "topnav.calculatorsAllDesc" },
      { to: "/calculators/zones", labelKey: "topnav.calcZones" },
      { to: "/calculators/vma", labelKey: "topnav.calcVma" },
      { to: "/calculators/ftp", labelKey: "topnav.calcFtp" },
      { to: "/calculators/css", labelKey: "topnav.calcCss" },
      { to: "/calculators/equivalence", labelKey: "topnav.calcEquivalence" },
    ],
  },
  {
    to: "/methodology",
    labelKey: "nav.methodology",
    prefix: ["/methodology", "/plans/methodology"],
    children: [
      { to: "/methodology", labelKey: "topnav.methodScience", descKey: "topnav.methodScienceDesc" },
      { to: "/plans/methodology", labelKey: "topnav.methodPlans", descKey: "topnav.methodPlansDesc" },
    ],
  },
  {
    to: "/learn",
    labelKey: "nav.learn",
    prefix: ["/learn", "/guides", "/nutrition", "/glossary"],
    children: [
      { to: "/learn", labelKey: "topnav.learnArticles", descKey: "topnav.learnArticlesDesc" },
      { to: "/nutrition", labelKey: "topnav.learnNutrition", descKey: "topnav.learnNutritionDesc" },
      { to: "/guides", labelKey: "topnav.learnGuides", descKey: "topnav.learnGuidesDesc" },
      { to: "/glossary", labelKey: "topnav.learnGlossary", descKey: "topnav.learnGlossaryDesc" },
    ],
  },
];

export function isNavActive(pathname: string, section: NavSection): boolean {
  if (pathname === section.to) return true;
  return section.prefix.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

// ────────────────────────────────────────────────────────────────────────────
// TopBar
// ────────────────────────────────────────────────────────────────────────────

export function TopBar({ onMobileMenuOpen }: TopBarProps) {
  const { t } = useTranslation("common");
  const { openPalette } = useCommandPalette();
  const currentLang = getCurrentLanguage();
  // Below lg (1024px) the full bar — 5 nav sections (~600px in FR), search
  // field and icon cluster — needs ~1100px and pushes the right-side icons
  // off-screen, so mid-size viewports use the compact hamburger layout.
  const isCompact = useMediaQuery("(max-width: 1023px)");
  // Reading the resolved theme from context is what keeps this icon honest
  // when the OS flips under a `system` preference. The button is a two-state
  // light/dark switch; the third preference lives on /settings.
  const { resolved: theme, toggle: onThemeToggle } = useTheme();
  const { pathname } = useLocation();

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center gap-4 px-4 md:px-6">
        {isCompact ? (
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
                onClick={() => changeLanguage(currentLang === "fr" ? "en" : "fr")}
                title={currentLang === "fr" ? "Switch to English" : "Passer en français"}
                aria-label={currentLang === "fr" ? "Switch to English" : "Passer en français"}
                className={`${touchTarget} text-xs font-semibold`}
              >
                {currentLang === "fr" ? "EN" : "FR"}
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
          /* ───── Desktop ─────────────────────────────────────────────────── */
          <>
            <Link to="/" viewTransition className="flex items-center gap-2 shrink-0">
              <Logo className="w-12 h-6" />
              <span className="font-bold text-sm whitespace-nowrap">
                {t("app.name")}
              </span>
            </Link>

            <nav
              aria-label={t("nav.primary", "Navigation principale")}
              className="hidden md:flex items-center gap-1 pl-3 ml-1 border-l h-6"
            >
              {PRIMARY_NAV.map((section) => (
                <NavSectionTrigger
                  key={section.to}
                  section={section}
                  active={isNavActive(pathname, section)}
                />
              ))}
            </nav>

            {/* Search: full field with the ⌘K hint from xl up; below that the
                bar is too tight for a field, so it collapses into a ghost
                icon matching the theme/lang buttons beside it. */}
            <Button
              variant="outline"
              size="sm"
              onClick={openPalette}
              className="ml-auto hidden xl:inline-flex h-8 w-72 justify-start gap-2 text-muted-foreground"
            >
              <Search className="size-3.5" />
              <span className="text-sm">{t("actions.search")}</span>
              <kbd className="pointer-events-none ml-auto hidden select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground xl:inline-flex">
                {isMac ? (
                  <>
                    <span className="text-xs">&#8984;</span>K
                  </>
                ) : (
                  "Ctrl+K"
                )}
              </kbd>
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={openPalette}
              aria-label={t("actions.search")}
              className="ml-auto xl:hidden"
            >
              <Search className="size-4" />
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

// ────────────────────────────────────────────────────────────────────────────
// NavSectionTrigger — primary nav item with an optional dropdown.
// Opening is hover (CSS group-hover) for pointers, plus an explicit
// click/tap/Enter toggle: a section with children is a disclosure, not a link,
// so activating it reveals the sub-pages instead of navigating away. Each
// section's own page is the first item of its dropdown.
// A small delay-out using opacity transitions feels noticeably smoother than
// instant pop-on/pop-off.
// ────────────────────────────────────────────────────────────────────────────

function NavSectionTrigger({
  section,
  active,
}: {
  section: NavSection;
  active: boolean;
}) {
  const { t } = useTranslation("common");
  const hasChildren = !!section.children?.length;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // A click-opened dropdown has no pointer-leave to close it, so dismiss on
  // outside pointer-down and on Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const triggerClass = cn(
    "px-3 py-1.5 rounded-md text-sm font-medium transition-colors inline-flex items-center gap-1",
    active
      ? "text-foreground bg-accent/60"
      : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
  );

  if (!hasChildren) {
    return (
      <NavLink to={section.to} className={triggerClass}>
        {t(section.labelKey)}
      </NavLink>
    );
  }

  const panelId = `topnav-${section.to.replace(/\W+/g, "-")}`;

  return (
    <div className="relative group" ref={wrapRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={triggerClass}
      >
        {t(section.labelKey)}
        <ChevronDown
          className={cn(
            "size-3 opacity-60 transition-transform group-hover:rotate-180",
            open && "rotate-180",
          )}
        />
      </button>
      {/* Spacer keeps the dropdown contiguous with the trigger so hovering
          between the two doesn't dismiss the menu. */}
      <div
        id={panelId}
        className={cn(
          "absolute left-0 top-full pt-1.5 transition-opacity duration-150 z-50",
          // No group-focus-within here: the trigger keeps focus after a click,
          // which would pin the panel open and make tap-to-close a no-op.
          // Keyboard users open it with Enter/Space on the trigger, and the
          // panel's links are unfocusable (visibility:hidden) while closed.
          open
            ? "visible opacity-100"
            : "invisible opacity-0 group-hover:visible group-hover:opacity-100",
        )}
      >
        <div className="bg-popover text-popover-foreground border rounded-md shadow-lg p-1.5 min-w-[260px]">
          <ul className="space-y-0.5">
            {section.children!.map((child) => (
              <li key={child.to}>
                <Link
                  to={child.to}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded-md hover:bg-accent transition-colors"
                >
                  <p className="text-sm font-medium leading-snug">
                    {t(child.labelKey)}
                  </p>
                  {child.descKey && (
                    <p className="text-xs text-muted-foreground leading-snug mt-0.5">
                      {t(child.descKey)}
                    </p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Personal account menu — round avatar trigger, click-only (no hover) so
 *  it doesn't fight with the primary nav dropdowns. */
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
