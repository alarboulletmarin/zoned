/**
 * Mobile slide-over navigation. Triggered by the hamburger button in TopBar.
 *
 * Desktop navigation now lives entirely in TopBar (horizontal links with
 * hover dropdowns), so this file only renders the mobile sheet. The legacy
 * `Sidebar` component is kept as an empty re-export so any code still
 * importing it doesn't break at runtime; nothing in the app renders it
 * anymore.
 *
 * Brut spec ("Zoned Brut - Design System.dc.html", section 02 "Navigation"):
 * the burger opens a full-page ink panel descending from the top, listing
 * every destination before language/theme/version — as opposed to a side
 * drawer. `Sheet` already supports `side="top"`, so this reuses that variant
 * rather than introducing a new interaction pattern.
 */

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  Heart,
  Gauge,
  Plus,
  Settings,
  Send,
  Sparkles,
  GithubIcon,
  Moon,
  Sun,
} from "@/components/icons";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { changeLanguage, getCurrentLanguage } from "@/i18n";
import { useTheme } from "@/hooks/useTheme";
import { Wordmark } from "./Wordmark";
import { PRIMARY_NAV, isNavActive, type NavSection } from "./TopBar";

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Account / utility links shown at the bottom of the mobile sheet. */
const ACCOUNT_LINKS = [
  { to: "/me", icon: Gauge, labelKey: "nav.myZones" },
  { to: "/favorites", icon: Heart, labelKey: "nav.favorites" },
  { to: "/workout/builder", icon: Plus, labelKey: "nav.builder" },
];
const SECONDARY_LINKS = [
  { to: "/settings", icon: Settings, labelKey: "nav.settings" },
  { to: "/contribute", icon: Send, labelKey: "nav.contribute" },
  { to: "/changelog", icon: Sparkles, labelKey: "nav.changelog" },
];

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const { t } = useTranslation("common");
  const location = useLocation();
  const currentLang = getCurrentLanguage();
  const { resolved: theme, toggle: onThemeToggle } = useTheme();

  // Close on navigation. Without this the sheet would linger after tapping
  // a link because react-router triggers a re-render but not a re-mount.
  useEffect(() => {
    onOpenChange(false);
  }, [location.pathname, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="top"
        className="h-dvh w-full max-w-none gap-0 rounded-none border-b-2 border-foreground bg-foreground p-0 text-background shadow-none flex flex-col"
      >
        <SheetTitle className="sr-only">
          {t("nav.primary", "Navigation")}
        </SheetTitle>

        <div className="flex items-center justify-between px-5 py-5 border-b border-background/20 shrink-0">
          <Link to="/" className="flex items-center">
            <Wordmark className="text-xl" />
          </Link>
        </div>

        {/* Primary sections — same tree as the desktop top-nav. Each section
            is an expandable disclosure; the section matching the current
            route is open by default. */}
        <nav
          className="flex-1 overflow-y-auto px-5"
          aria-label={t("nav.primary", "Navigation")}
        >
          {PRIMARY_NAV.map((section) => (
            <MobileSection
              key={section.to}
              section={section}
              pathname={location.pathname}
            />
          ))}
        </nav>

        {/* Account block — visually separated, never hidden behind a
            disclosure (these are the most frequently tapped actions). */}
        <div className="shrink-0 border-t border-background/20 px-5 py-4 space-y-3">
          <div>
            <p className="mb-1.5 font-mono text-[10px] tracking-[0.14em] uppercase text-background/60">
              {t("topnav.account", "Compte")}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {ACCOUNT_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium hover:bg-background/10 transition-colors"
                >
                  <item.icon className="size-4 shrink-0 text-background/60" />
                  {/* Wrap rather than truncate so longer labels like
                      "Créer une séance" stay fully readable (#105). */}
                  <span className="leading-tight">{t(item.labelKey)}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-background/20 pt-3 grid grid-cols-2 gap-1">
            {SECONDARY_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="min-w-0 flex items-center gap-2 px-3 py-2 font-mono text-[11px] tracking-wide uppercase text-background/60 hover:text-background hover:bg-background/10 transition-colors"
              >
                <item.icon className="size-3.5 shrink-0" />
                <span className="truncate">{t(item.labelKey)}</span>
              </Link>
            ))}
            <a
              href="https://github.com/alarboulletmarin/zoned"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="min-w-0 flex items-center gap-2 px-3 py-2 font-mono text-[11px] tracking-wide uppercase text-background/60 hover:text-background hover:bg-background/10 transition-colors"
            >
              <GithubIcon className="size-3.5 shrink-0" />
              <span className="truncate">GitHub</span>
            </a>
          </div>

          {/* Language / theme — per the Brut nav spec these controls live in
              the panel, not the compact header. */}
          <div className="border-t border-background/20 pt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeLanguage(currentLang === "fr" ? "en" : "fr")}
              className="flex-1 border border-background/40 px-3 py-2 font-mono text-[11px] tracking-wide uppercase text-background/80 hover:border-background hover:text-background transition-colors"
            >
              {currentLang === "fr" ? "EN" : "FR"}
            </button>
            <button
              type="button"
              onClick={onThemeToggle}
              className="flex-1 inline-flex items-center justify-center gap-1.5 border border-background/40 px-3 py-2 font-mono text-[11px] tracking-wide uppercase text-background/80 hover:border-background hover:text-background transition-colors"
            >
              {theme === "light" ? (
                <Moon className="size-3.5" />
              ) : (
                <Sun className="size-3.5" />
              )}
              {theme === "light" ? t("theme.dark") : t("theme.light")}
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MobileSection({
  section,
  pathname,
}: {
  section: NavSection;
  pathname: string;
}) {
  const { t } = useTranslation("common");
  const isActive = isNavActive(pathname, section);
  const hasChildren = !!section.children?.length;
  const [open, setOpen] = useState(isActive);

  // Re-open the section when the route lands inside it — useful when the
  // user navigates via the user menu and then re-opens the sheet.
  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  if (!hasChildren) {
    return (
      <Link
        to={section.to}
        className="flex items-baseline justify-between py-3 border-t border-background/20 font-sans font-bold text-xl uppercase leading-tight tracking-[-0.03em] hover:text-accent-acid transition-colors"
      >
        {t(section.labelKey)}
      </Link>
    );
  }

  const panelId = `mobile-nav-${section.to.replace(/\W+/g, "-")}`;

  return (
    <div className="border-t border-background/20">
      {/* The whole row is the disclosure control: tapping a section reveals
          its pages instead of navigating away and closing the sheet. The
          section's own page stays reachable — it is the first child of every
          section. */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex w-full min-h-11 items-center justify-between gap-2 py-3 text-left font-sans font-bold text-xl uppercase leading-tight tracking-[-0.03em] transition-colors",
          isActive ? "text-accent-acid" : "hover:text-accent-acid",
        )}
      >
        <span>{t(section.labelKey)}</span>
        <ChevronDown
          className={cn(
            "size-5 shrink-0 text-background/60 transition-transform",
            open ? "rotate-0" : "-rotate-90",
          )}
        />
      </button>
      {open && (
        <ul id={panelId} className="pb-3 space-y-0.5">
          {section.children!.map((child) => {
            const childActive = pathname === child.to;
            return (
              <li key={child.to}>
                <Link
                  to={child.to}
                  className={cn(
                    "block py-2 font-mono text-xs tracking-wide uppercase transition-colors",
                    childActive
                      ? "text-accent-acid"
                      : "text-background/70 hover:text-background",
                  )}
                >
                  {t(child.labelKey)}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Legacy export kept so any leftover desktop sidebar import doesn't crash.
 *  The actual desktop navigation is the horizontal top-bar in TopBar.tsx. */
export function Sidebar(): null {
  return null;
}
