/**
 * Mobile menu — the five doors as a full-screen ink panel.
 *
 * Below 1024px the header has no room for the doors, so navigation becomes one
 * floating pill in the bottom-right corner ("where the thumb already is") and a
 * panel that takes the whole screen.
 *
 * It is a native <dialog> driven by showModal(), not a Radix Sheet: the top
 * layer, the focus trap, Escape and the focus returning to the trigger all come
 * from the platform. The one thing the platform does not give is the scroll
 * lock, so this file writes it.
 *
 * The trigger and the panel live in the same component on purpose — the browser
 * hands focus back to whatever was focused before showModal(), and keeping the
 * two together is what makes that "whatever" be the pill.
 *
 * Nothing is lost against the old drawer: the five doors are the screen, and
 * every child page and account page they used to list is printed in mono at the
 * floor of the panel.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, Search } from "@/components/icons";
import { useCommandPalette } from "@/components/search";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useTheme } from "@/hooks/useTheme";
import { changeLanguage, getCurrentLanguage } from "@/i18n";
import { PRIMARY_NAV, isNavActive } from "./TopBar";

/** Everything behind the account button on desktop, which the compact header
 *  has no room for. Settings leads: it is what the menu is opened for. */
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

/**
 * The pages under the doors. Built from PRIMARY_NAV rather than copied, so a
 * door that gains a child gains it here too.
 *
 * Deduped by path — a route already reachable as a door, or listed twice
 * across two doors, is printed once. Nothing is dropped: every path that had a
 * mobile entry point still has one.
 */
const SECONDARY_LINKS: { to: string; labelKey: string }[] = (() => {
  const seen = new Set(PRIMARY_NAV.map((section) => section.to));
  const links: { to: string; labelKey: string }[] = [];
  for (const section of PRIMARY_NAV) {
    for (const child of section.children ?? []) {
      if (seen.has(child.to)) continue;
      seen.add(child.to);
      links.push({ to: child.to, labelKey: child.labelKey });
    }
  }
  for (const item of ACCOUNT_LINKS) {
    if (seen.has(item.to)) continue;
    seen.add(item.to);
    links.push(item);
  }
  return links;
})();

export function MobileMenu() {
  const { t } = useTranslation("common");
  const { pathname } = useLocation();
  const { openPalette } = useCommandPalette();
  const { resolved: theme, toggle: toggleTheme } = useTheme();
  // The same 1024px line the header uses to decide it cannot show the doors.
  const isCompact = useMediaQuery("(max-width: 1023px)");
  const currentLang = getCurrentLanguage();

  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // A mirror of the dialog's own state, kept only so aria-expanded can be
  // honest. The dialog element remains the source of truth.
  const [open, setOpen] = useState(false);

  const close = useCallback(() => dialogRef.current?.close(), []);

  // Raised for the one close that hands the user on rather than dismisses
  // them: the search button closes the panel to open the command palette, and
  // the `close` event fires as a task — after the palette has taken focus.
  // Pulling focus back to the pill there would rip it out of the palette.
  const handoff = useRef(false);

  // Escape, the close pill and a navigation all end up firing `close` on the
  // element, so this is the single place the mirror is updated and the focus
  // handed back to the pill that opened the panel.
  useEffect(() => {
    const dialog = dialogRef.current;
    // Above 1024px nothing is rendered, so no `close` event will ever come.
    // The mirror has to be reset by hand or it stays true: aria-expanded would
    // lie, and the scroll lock below would never run its cleanup — leaving the
    // desktop page permanently unscrollable after a resize with the panel open.
    if (!dialog) {
      setOpen(false);
      return;
    }
    const onClose = () => {
      setOpen(false);
      if (handoff.current) {
        handoff.current = false;
        return;
      }
      triggerRef.current?.focus();
    };
    dialog.addEventListener("close", onClose);
    return () => dialog.removeEventListener("close", onClose);
  }, [isCompact]);

  // The scroll lock, the one modal behaviour <dialog> does not provide.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Close on navigation. `close()` on an already-closed dialog is a no-op and
  // fires nothing, so the run on mount costs nothing.
  useEffect(() => {
    close();
  }, [pathname, close]);

  if (!isCompact) return null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="zn-menu-fab"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => {
          dialogRef.current?.showModal();
          setOpen(true);
        }}
      >
        <Menu />
        {t("actions.menu")}
      </button>

      <dialog
        id="mobile-menu"
        ref={dialogRef}
        className="zn-menu"
        aria-label={t("actions.menu")}
      >
        <div className="zn-menu__inner">
          <p className="zn-kicker zn-menu__eyebrow">{t("mobileMenu.goTo")}</p>

          <nav aria-label={t("nav.primary")}>
            <ul className="zn-menu__doors">
              {PRIMARY_NAV.map((section) => (
                <li key={section.id}>
                  <Link
                    to={section.to}
                    viewTransition
                    className="zn-display zn-menu__door"
                    data-level="2"
                    aria-current={pathname === section.to ? "page" : undefined}
                  >
                    {t(section.labelKey)}
                    {isNavActive(pathname, section) && (
                      <span className="zn-menu__dot" aria-hidden="true" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="zn-menu__foot">
            {/* Search is the command palette, opened from here rather than
                re-implemented. The panel closes first: the palette is a modal
                of its own and would otherwise open under this one's top
                layer. */}
            <button
              type="button"
              className="zn-menu__search"
              onClick={() => {
                handoff.current = true;
                close();
                openPalette();
              }}
            >
              <Search />
              {t("mobileMenu.searchPlaceholder")}
            </button>

            <div className="zn-menu__pills">
              <button
                type="button"
                className="zn-menu__pill"
                aria-label={t("mobileMenu.language")}
                onClick={() => changeLanguage(currentLang === "fr" ? "en" : "fr")}
              >
                <span className="zn-menu__lang" data-on={currentLang === "fr" || undefined}>
                  FR
                </span>
                /
                <span className="zn-menu__lang" data-on={currentLang === "en" || undefined}>
                  EN
                </span>
              </button>

              <button type="button" className="zn-menu__pill" onClick={toggleTheme}>
                {theme === "light" ? t("mobileMenu.themeDark") : t("mobileMenu.themeLight")}
              </button>
            </div>

            <div className="zn-menu__rest">
              <p className="zn-kicker zn-menu__eyebrow">{t("mobileMenu.more")}</p>
              <nav aria-label={t("mobileMenu.more")}>
                <ul className="zn-menu__more">
                  {SECONDARY_LINKS.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        viewTransition
                        className="zn-menu__more-link"
                        aria-current={pathname === item.to ? "page" : undefined}
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
                      className="zn-menu__more-link"
                    >
                      GitHub
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>

        <button type="button" className="zn-menu__close" onClick={close}>
          {t("actions.close")}
        </button>
      </dialog>
    </>
  );
}
