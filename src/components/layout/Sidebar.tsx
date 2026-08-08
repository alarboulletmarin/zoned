/**
 * Mobile slide-over navigation. Triggered by the hamburger button in TopBar.
 *
 * Desktop navigation now lives entirely in TopBar (horizontal links with
 * hover dropdowns), so this file only renders the mobile sheet. The legacy
 * `Sidebar` component is kept as an empty re-export so any code still
 * importing it doesn't break at runtime; nothing in the app renders it
 * anymore.
 */

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  UserRound,
  Heart,
  Gauge,
  Plus,
  Settings,
  Send,
  Sparkles,
  GithubIcon,
} from "@/components/icons";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Logo from "@/assets/logo.svg?react";
import { PRIMARY_NAV, isNavActive, type NavSection } from "./TopBar";

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Account / utility links shown at the bottom of the mobile sheet. */
const ACCOUNT_LINKS = [
  { to: "/profile", icon: UserRound, labelKey: "nav.profile" },
  { to: "/my-zones", icon: Gauge, labelKey: "nav.myZones" },
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

  // Close on navigation. Without this the sheet would linger after tapping
  // a link because react-router triggers a re-render but not a re-mount.
  useEffect(() => {
    onOpenChange(false);
  }, [location.pathname, onOpenChange]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[320px] max-w-[88vw] p-0 flex flex-col bg-background"
      >
        <SheetHeader className="px-5 py-5 border-b border-border/60">
          <SheetTitle className="flex items-center gap-2 text-left">
            <Logo className="w-10 h-5" />
            <span className="font-bold text-base">Zoned</span>
          </SheetTitle>
        </SheetHeader>

        {/* Primary sections — same tree as the desktop top-nav. Each section
            is an expandable accordion ; the section matching the current
            route is open by default. */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" aria-label={t("nav.primary", "Navigation")}>
          {PRIMARY_NAV.map((section) => (
            <MobileSection
              key={section.to}
              section={section}
              pathname={location.pathname}
            />
          ))}
        </nav>

        {/* Account block — visually separated, never hidden behind an
            accordion (these are the most frequently tapped actions). */}
        <div className="border-t border-border/60 px-3 py-4 space-y-3">
          <div>
            <p className="px-2 mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {t("topnav.account", "Compte")}
            </p>
            <div className="grid grid-cols-2 gap-1">
              {ACCOUNT_LINKS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-foreground/85 hover:bg-accent/50 transition-colors"
                >
                  <item.icon className="size-4 shrink-0 text-muted-foreground" />
                  {/* Wrap rather than truncate so longer labels like
                      "Créer une séance" stay fully readable (#105). */}
                  <span className="leading-tight">{t(item.labelKey)}</span>
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-border/60 pt-3 grid grid-cols-2 gap-1">
            {SECONDARY_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="min-w-0 flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
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
              className="min-w-0 flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              <GithubIcon className="size-3.5 shrink-0" />
              <span className="truncate">GitHub</span>
            </a>
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
        className={cn(
          "block px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "bg-accent text-foreground"
            : "text-foreground/85 hover:bg-accent/50",
        )}
      >
        {t(section.labelKey)}
      </Link>
    );
  }

  const panelId = `mobile-nav-${section.to.replace(/\W+/g, "-")}`;

  return (
    <div>
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
          "flex w-full min-h-11 items-center gap-2 px-3 py-2.5 rounded-md text-left text-sm font-semibold transition-colors",
          isActive
            ? "text-foreground"
            : "text-foreground/85 hover:bg-accent/50",
        )}
      >
        <span className="flex-1">{t(section.labelKey)}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open ? "rotate-0" : "-rotate-90",
          )}
        />
      </button>
      {open && (
        <ul
          id={panelId}
          className="ml-3 mt-0.5 mb-1 border-l border-border/60 pl-3 space-y-0.5"
        >
          {section.children!.map((child) => {
            const childActive = pathname === child.to;
            return (
              <li key={child.to}>
                <Link
                  to={child.to}
                  className={cn(
                    "block px-3 py-2 rounded-md text-sm transition-colors",
                    childActive
                      ? "bg-accent/70 text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
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
