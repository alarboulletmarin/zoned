import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Search,
  Moon,
  Sun,
  UserRound,
  Heart,
  Settings,
  Send,
  Sparkles,
  Info,
  Gauge,
  Plus,
  ChevronDown,
} from "@/components/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCommandPalette } from "@/components/search";
import { changeLanguage, getCurrentLanguage } from "@/i18n";
import { Wordmark } from "./Wordmark";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTheme } from "@/hooks/useTheme";
import { isMac } from "@/lib/platform";

// ────────────────────────────────────────────────────────────────────────────
// The five doors.
//
// The redesign replaces the old six-section bar with five: Aujourd'hui,
// Séances, Mon plan, Comprendre, Mes chiffres. A sixth door would mean
// something belongs inside another one — settings and the personal pages live
// behind the account button instead.
//
// Nothing was dropped: the same tree feeds the desktop dropdowns and the
// mobile full-screen menu, and every route that used to have an entry point
// still has one. See the redesign report for the full route -> door table.
// ────────────────────────────────────────────────────────────────────────────

export interface NavChild {
  to: string;
  labelKey: string;
  /** Short caption shown under the label in the dropdown. Optional. */
  descKey?: string;
}

export interface NavSection {
  /** Stable id — the door's name in the design kit. */
  id: string;
  to: string;
  labelKey: string;
  /** Pathname prefixes that should mark this door as active. */
  prefix: string[];
  children?: NavChild[];
}

export const PRIMARY_NAV: NavSection[] = [
  {
    id: "today",
    to: "/",
    labelKey: "nav.today",
    // Home is one page: it matches its own path and nothing else.
    prefix: [],
  },
  {
    id: "sessions",
    to: "/library",
    labelKey: "nav.sessions",
    prefix: ["/library", "/workout", "/collections", "/favorites", "/routes"],
    children: [
      { to: "/library", labelKey: "topnav.libraryAll", descKey: "topnav.libraryAllDesc" },
      { to: "/library/draw", labelKey: "topnav.drawSession", descKey: "topnav.drawSessionDesc" },
      { to: "/collections", labelKey: "topnav.collections", descKey: "topnav.collectionsDesc" },
      { to: "/workout/builder", labelKey: "topnav.builder", descKey: "topnav.builderDesc" },
      { to: "/favorites", labelKey: "nav.favorites", descKey: "topnav.favoritesDesc" },
      { to: "/routes", labelKey: "topnav.routes", descKey: "topnav.routesDesc" },
    ],
  },
  {
    id: "plan",
    to: "/plans",
    labelKey: "nav.myPlan",
    prefix: ["/plan", "/plans", "/weeks", "/race-simulator"],
    children: [
      { to: "/plans", labelKey: "topnav.plansMine", descKey: "topnav.plansMineDesc" },
      { to: "/plan/new", labelKey: "topnav.plansNew", descKey: "topnav.plansNewDesc" },
      { to: "/weeks", labelKey: "topnav.weeks", descKey: "topnav.weeksDesc" },
      { to: "/race-simulator", labelKey: "topnav.raceSim", descKey: "topnav.raceSimDesc" },
      { to: "/plans/methodology", labelKey: "topnav.methodPlans", descKey: "topnav.methodPlansDesc" },
    ],
  },
  {
    id: "learn",
    to: "/learn",
    labelKey: "nav.understand",
    prefix: ["/learn", "/methodology", "/guides", "/nutrition", "/glossary"],
    children: [
      { to: "/learn", labelKey: "topnav.learnArticles", descKey: "topnav.learnArticlesDesc" },
      { to: "/methodology", labelKey: "topnav.methodScience", descKey: "topnav.methodScienceDesc" },
      { to: "/guides", labelKey: "topnav.learnGuides", descKey: "topnav.learnGuidesDesc" },
      { to: "/nutrition", labelKey: "topnav.learnNutrition", descKey: "topnav.learnNutritionDesc" },
      { to: "/glossary", labelKey: "topnav.learnGlossary", descKey: "topnav.learnGlossaryDesc" },
    ],
  },
  {
    id: "numbers",
    to: "/calculators",
    labelKey: "nav.myNumbers",
    prefix: ["/calculators", "/profile", "/my-zones"],
    children: [
      { to: "/calculators", labelKey: "topnav.calculatorsAll", descKey: "topnav.calculatorsAllDesc" },
      { to: "/my-zones", labelKey: "nav.myZones", descKey: "topnav.myZonesDesc" },
      { to: "/profile", labelKey: "nav.profile", descKey: "topnav.profileDesc" },
      { to: "/calculators/zones", labelKey: "topnav.calcZones" },
      { to: "/calculators/vma", labelKey: "topnav.calcVma" },
      { to: "/calculators/ftp", labelKey: "topnav.calcFtp" },
      { to: "/calculators/css", labelKey: "topnav.calcCss" },
      { to: "/calculators/equivalence", labelKey: "topnav.calcEquivalence" },
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

export function TopBar() {
  const { t } = useTranslation("common");
  const { openPalette } = useCommandPalette();
  const currentLang = getCurrentLanguage();
  // Below lg (1024px) the five doors plus the tool cluster no longer fit, so
  // the doors move to the full-screen MobileMenu and its floating pill.
  const isCompact = useMediaQuery("(max-width: 1023px)");
  // Reading the resolved theme from context is what keeps this icon honest
  // when the OS flips under a `system` preference. The button is a two-state
  // light/dark switch; the third preference lives on /settings.
  const { resolved: theme, toggle: onThemeToggle } = useTheme();
  const { pathname } = useLocation();

  const langLabel = currentLang === "fr" ? "EN" : "FR";
  const langTitle =
    currentLang === "fr" ? "Switch to English" : "Passer en français";

  return (
    <header className="zn-topbar">
      <Link to="/" viewTransition className="zn-topbar__brand" aria-label={t("app.name")}>
        <Wordmark />
      </Link>

      {!isCompact && (
        <nav aria-label={t("nav.primary")} className="zn-topbar__nav">
          {PRIMARY_NAV.map((section) => (
            <NavDoor
              key={section.id}
              section={section}
              active={isNavActive(pathname, section)}
            />
          ))}
        </nav>
      )}

      {/* The tool cluster. No frames and no circles: the controls sit bare on
          the paper, told apart by hairlines. Their 44px target is kept, just
          not drawn.

          Search, language and theme stay on every viewport — they are the
          three things reached without a destination in mind, and burying them
          in the menu cost a tap for each. Only the account door is desktop-
          only: below 1024px its pages are a group of the full-screen menu. */}
      <div className="zn-topbar__tools">
        <button
          type="button"
          onClick={openPalette}
          aria-label={t("actions.search")}
          className="zn-topbar__tool zn-topbar__tool--search"
        >
          <Search />
          <span className="zn-topbar__search-text">{t("actions.search")}</span>
          <span className="zn-topbar__search-hint" aria-hidden>
            {isMac ? "⌘K" : "Ctrl+K"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => changeLanguage(currentLang === "fr" ? "en" : "fr")}
          title={langTitle}
          aria-label={langTitle}
          className="zn-topbar__tool zn-topbar__tool--lang"
        >
          {langLabel}
        </button>

        <button
          type="button"
          onClick={onThemeToggle}
          aria-label={theme === "light" ? t("theme.dark") : t("theme.light")}
          className="zn-topbar__tool"
        >
          {theme === "light" ? <Moon /> : <Sun />}
        </button>

        {!isCompact && <AccountMenu />}
      </div>
    </header>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// NavDoor — one of the five. A door with children is a disclosure, not a
// link: activating it reveals its pages instead of navigating away, and the
// door's own page is the first item of the panel. Hover opens it for pointers;
// click/Enter opens it for everyone else.
// ────────────────────────────────────────────────────────────────────────────

function NavDoor({ section, active }: { section: NavSection; active: boolean }) {
  const { t } = useTranslation("common");
  const { pathname } = useLocation();
  const hasChildren = !!section.children?.length;
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // A click-opened panel has no pointer-leave to close it, so dismiss on
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

  if (!hasChildren) {
    return (
      <Link
        to={section.to}
        viewTransition
        aria-current={active ? "page" : undefined}
        className="zn-topbar__door"
      >
        {t(section.labelKey)}
      </Link>
    );
  }

  const panelId = `topnav-${section.id}`;

  return (
    <div className="zn-topbar__section" ref={wrapRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        data-active={active || undefined}
        onClick={() => setOpen((v) => !v)}
        className="zn-topbar__door"
      >
        {t(section.labelKey)}
        <ChevronDown className="zn-topbar__door-chevron" />
      </button>
      <div id={panelId} data-open={open} className="zn-topbar__panel">
        <div className="zn-topbar__panel-card">
          <ul className="zn-topbar__panel-list">
            {section.children!.map((child) => (
              <li key={child.to}>
                <Link
                  to={child.to}
                  viewTransition
                  onClick={() => setOpen(false)}
                  aria-current={pathname === child.to ? "page" : undefined}
                  className="zn-topbar__panel-link"
                >
                  <p className="zn-topbar__panel-label">{t(child.labelKey)}</p>
                  {child.descKey && (
                    <p className="zn-topbar__panel-desc">{t(child.descKey)}</p>
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

/** The account door — everything personal, plus settings, behind one glyph.
 *  Click-only (no hover) so it does not fight the nav panels. */
function AccountMenu() {
  const { t } = useTranslation("common");
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="zn-topbar__tool" aria-label={t("topnav.account")}>
          <UserRound />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="zn-topbar__account-menu">
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <UserRound />
            {t("nav.profile")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/my-zones">
            <Gauge />
            {t("nav.myZones")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/favorites">
            <Heart />
            {t("nav.favorites")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/workout/builder">
            <Plus />
            {t("nav.builder")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings">
            <Settings />
            {t("nav.settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/contribute">
            <Send />
            {t("nav.contribute")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/changelog">
            <Sparkles />
            {t("nav.changelog")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/about">
            <Info />
            {t("nav.about")}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
