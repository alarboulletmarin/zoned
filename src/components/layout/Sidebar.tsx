/**
 * Mobile slide-over navigation. Triggered by the menu button in TopBar.
 *
 * Desktop navigation lives entirely in TopBar (the five doors with their
 * panels), so this file only renders the mobile sheet. The legacy `Sidebar`
 * component is kept as an empty re-export so any code still importing it
 * doesn't break at runtime; nothing in the app renders it anymore.
 *
 * The sheet is paper: groups separated by full-width ink rules, a mono
 * uppercase micro-label per group, 44px rows, and no icons. The design's
 * mobile navigation is typographic for the same reason its tab bar is — the
 * icon set has no unambiguous glyph for "Séances" against "Mon plan", and a
 * guessed pictogram costs more than a read word.
 */

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "@/components/icons";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Wordmark } from "./Wordmark";
import { PRIMARY_NAV, isNavActive, type NavSection } from "./TopBar";

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Everything behind the account button on desktop, which the compact header
 *  has no room for. Settings leads: it is what the button is opened for. */
const ACCOUNT_LINKS = [
  { to: "/settings", labelKey: "nav.settings" },
  { to: "/profile", labelKey: "nav.profile" },
  { to: "/my-zones", labelKey: "nav.myZones" },
  { to: "/favorites", labelKey: "nav.favorites" },
  { to: "/workout/builder", labelKey: "nav.builder" },
  { to: "/contribute", labelKey: "nav.contribute" },
  { to: "/changelog", labelKey: "nav.changelog" },
  { to: "/about", labelKey: "nav.about" },
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
      <SheetContent side="left" className="zn-navsheet">
        <SheetHeader className="zn-navsheet__header">
          <SheetTitle>
            <Wordmark size={22} />
          </SheetTitle>
        </SheetHeader>

        {/* The same five doors as the desktop bar. Each is an accordion; the
            door holding the current route is open on mount. */}
        <nav className="zn-navsheet__nav" aria-label={t("nav.primary")}>
          {PRIMARY_NAV.map((section) => (
            <MobileDoor
              key={section.id}
              section={section}
              pathname={location.pathname}
            />
          ))}

          <div className="zn-navsheet__group">
            <span className="zn-kicker zn-navsheet__group-label">
              {t("topnav.account")}
            </span>
            <ul className="zn-navsheet__sub">
              {ACCOUNT_LINKS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    aria-current={
                      location.pathname === item.to ? "page" : undefined
                    }
                    className="zn-navsheet__row"
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://github.com/alarboulletmarin/zoned"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="zn-navsheet__row"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function MobileDoor({
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

  // Re-open the door when the route lands inside it — useful when the user
  // navigates from elsewhere and then re-opens the sheet.
  useEffect(() => {
    if (isActive) setOpen(true);
  }, [isActive]);

  if (!hasChildren) {
    return (
      <div className="zn-navsheet__group">
        <Link
          to={section.to}
          aria-current={isActive ? "page" : undefined}
          className="zn-navsheet__row"
        >
          {t(section.labelKey)}
        </Link>
      </div>
    );
  }

  const panelId = `mobile-nav-${section.id}`;

  return (
    <div className="zn-navsheet__group">
      {/* The whole row is the disclosure: tapping a door reveals its pages
          instead of navigating away and closing the sheet. The door's own
          page stays reachable — it is the first child of every door. */}
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        data-active={isActive || undefined}
        onClick={() => setOpen((v) => !v)}
        className="zn-navsheet__row"
      >
        {t(section.labelKey)}
        <ChevronDown className="zn-navsheet__row-chevron" />
      </button>
      {open && (
        <ul id={panelId} className="zn-navsheet__sub">
          {section.children!.map((child) => (
            <li key={child.to}>
              <Link
                to={child.to}
                aria-current={pathname === child.to ? "page" : undefined}
                className="zn-navsheet__row"
              >
                {t(child.labelKey)}
              </Link>
            </li>
          ))}
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
